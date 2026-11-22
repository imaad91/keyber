/**
 * Generic decision engine — no scenario / entreprise names.
 * All numbers come from GameState / Decision data.
 */

import type {
  Consequence,
  Decision,
  DecisionChoix,
  DecisionCondition,
} from "./decisions";
import type {
  EndingKind,
  GameState,
  ModeJeu,
  VisibilityTier,
} from "./gameState";
import {
  clamp,
  formatClockFromMinutes,
  getPath,
  maxVisibility,
  setPath,
  syncMetaClock,
  toModeJeu,
} from "./gameState";
import { RELATION_ALIASES } from "./gameState";
import { getContexteActif } from "@/data/registry";
import { applyMissedDecision, checkEvenements } from "./evenements";
import { applyCompetenceImpacts, skillLabel } from "./progression";
import { getCompetenceDef } from "./competences";

const XP_PER_LEVEL = 500;

export function formatGameClock(minutesSinceStart: number): string {
  return formatClockFromMinutes(minutesSinceStart);
}

export function remainingDayMinutes(state: GameState): number {
  return Math.max(0, state.meta.dayLengthMinutes - state.meta.minutesSinceStart);
}

export function canSpendTime(state: GameState, minutes: number): boolean {
  return remainingDayMinutes(state) >= minutes;
}

export function advanceTime(state: GameState, minutes: number): GameState {
  const prevMin = state.meta.minutesSinceStart;
  const nextMin = Math.min(
    state.meta.dayLengthMinutes,
    prevMin + minutes
  );
  let next: GameState = {
    ...state,
    meta: { ...state.meta, minutesSinceStart: nextMin },
  };
  next = syncMetaClock(next);
  next = checkEvenements(next);

  if (
    nextMin >= next.meta.dayLengthMinutes &&
    prevMin < next.meta.dayLengthMinutes &&
    next.meta.jourActuel >= 1
  ) {
    next = applyMissedDecision(next);
    next = {
      ...next,
      world: {
        ...next.world,
        showDayEnd: true,
        feedbackFlash: "Fin de journée — 18:00.",
      },
    };
  }

  return next;
}

function conditionPasses(
  state: GameState,
  cond: Omit<DecisionCondition, "alorsEffetSupplementaire" | "et">
): boolean {
  const raw = getPath(state, cond.si);
  const n = typeof raw === "number" ? raw : Number(raw);
  if (Number.isNaN(n)) return false;
  if (cond.superieurA !== undefined && !(n > cond.superieurA)) return false;
  if (cond.inferieurA !== undefined && !(n < cond.inferieurA)) return false;
  if (cond.egalA !== undefined && n !== cond.egalA) return false;
  return true;
}

function fullConditionPasses(state: GameState, cond: DecisionCondition): boolean {
  if (!conditionPasses(state, cond)) return false;
  if (cond.et) {
    for (const sub of cond.et) {
      if (!conditionPasses(state, sub)) return false;
    }
  }
  return true;
}

export function choixDisponibles(
  state: GameState,
  decision: Decision
): DecisionChoix[] {
  return decision.choix.filter((c) => {
    if (!c.requis || c.requis.length === 0) return true;
    return c.requis.every((r) => conditionPasses(state, r));
  });
}

export type ChoixAnnoté = {
  choix: DecisionChoix;
  unlocked: boolean;
  lockMessage: string | null;
};

/** All choices with lock state — locked ones stay visible (greyed). */
export function annotateChoix(
  state: GameState,
  decision: Decision
): ChoixAnnoté[] {
  return decision.choix.map((choix) => {
    const unlocked =
      !choix.requis ||
      choix.requis.length === 0 ||
      choix.requis.every((r) => conditionPasses(state, r));
    return {
      choix,
      unlocked,
      lockMessage: unlocked
        ? null
        : choix.messageVerrouillage ??
          "Conditions non remplies — entraîne-toi en Mode Compétence",
    };
  });
}

function applyConsequence(state: GameState, c: Consequence): GameState {
  // Machine etat string set
  if (c.cible.startsWith("machine.") && c.cible.endsWith(".etat") && c.setValeur) {
    const machineId = c.cible.split(".")[1]!;
    return {
      ...state,
      world: {
        ...state.world,
        machines: state.world.machines.map((m) =>
          m.id === machineId
            ? {
                ...m,
                etat: c.setValeur as "PRODUCTION" | "PANNE" | "ARRET",
                production:
                  c.setValeur === "PRODUCTION"
                    ? Math.max(m.production, 18)
                    : 0,
                nextMaintenance:
                  c.setValeur === "ARRET"
                    ? "Réparation J+1"
                    : c.setValeur === "PANNE"
                      ? "URGENTE"
                      : m.nextMaintenance,
              }
            : m
        ),
      },
    };
  }

  // Badge unlock
  if (c.cible.startsWith("badge.")) {
    const badgeId = c.cible.slice("badge.".length);
    return {
      ...state,
      world: {
        ...state.world,
        badges: state.world.badges.map((b) =>
          b.id === badgeId ? { ...b, unlocked: true } : b
        ),
      },
    };
  }

  // Alarm mirror
  if (c.cible === "flags.alarmActive") {
    const v = c.mode === "set" ? c.valeur : (state.flags.alarmActive ?? 0) + c.valeur;
    return {
      ...state,
      flags: { ...state.flags, alarmActive: v },
      world: { ...state.world, alarmActive: v >= 1 },
    };
  }

  const path = c.cible.startsWith("confiance.")
    ? (() => {
        const key = c.cible.slice("confiance.".length);
        const canon = RELATION_ALIASES[key] ?? key;
        return `relations.${canon}`;
      })()
    : c.cible;

  if (c.mode === "set" || c.setValeur !== undefined) {
    const value = c.setValeur !== undefined ? c.setValeur : c.valeur;
    let next = setPath(state, path, value);
    // Keep short + long relation keys in sync
    if (path.startsWith("relations.") && typeof value === "number") {
      const id = path.slice("relations.".length);
      const alias = Object.entries(RELATION_ALIASES).find(([, long]) => long === id)?.[0];
      const short = Object.entries(RELATION_ALIASES).find(([k]) => k === id)?.[1];
      if (alias && alias !== id) next = setPath(next, `relations.${alias}`, value);
      if (short && short !== id) next = setPath(next, `relations.${short}`, value);
      // also set aliased relation keys (e.g. marie → pers-marie)
      for (const [shortName, longName] of Object.entries(RELATION_ALIASES)) {
        if (longName === id && shortName !== id) {
          next = setPath(next, `relations.${shortName}`, value);
        }
        if (shortName === id && longName !== id) {
          next = setPath(next, `relations.${longName}`, value);
        }
      }
    }
    // Clamp confidences / morals
    next = clampKnownRanges(next, path);
    return next;
  }

  const current = getPath(state, path);
  const curNum = typeof current === "number" ? current : 0;
  let next = setPath(state, path, curNum + c.valeur);
  if (path.startsWith("relations.")) {
    const id = path.slice("relations.".length);
    for (const [a, b] of Object.entries(RELATION_ALIASES)) {
      if (b === id && a !== id) next = setPath(next, `relations.${a}`, curNum + c.valeur);
      if (a === id && b !== id) next = setPath(next, `relations.${b}`, curNum + c.valeur);
    }
  }
  next = clampKnownRanges(next, path);
  return next;
}

function clampKnownRanges(state: GameState, path: string): GameState {
  const clampPaths = [
    "humain.moralEquipe",
    "humain.ethique",
    "humain.confianceClient",
    "finance.tauxRebut",
  ];
  let next = state;
  for (const p of clampPaths) {
    if (path === p || path.startsWith("relations.")) {
      const v = getPath(next, path.startsWith("relations.") ? path : p);
      if (typeof v === "number") {
        next = setPath(next, path.startsWith("relations.") ? path : p, clamp(v, 0, 100));
      }
    }
  }
  if (path.startsWith("relations.")) {
    const v = getPath(next, path);
    if (typeof v === "number") next = setPath(next, path, clamp(v, 0, 100));
  }
  if (path.startsWith("visibilite.")) {
    const v = getPath(next, path);
    if (typeof v === "number")
      next = setPath(next, path, clamp(v, 0, 3) as VisibilityTier);
  }
  return next;
}

function recomputeProduction(state: GameState): GameState {
  const base = state.flags.dailyProductionBase ?? 60;
  const ot = state.flags.overtimeBonus ?? 0;
  const marie = state.flags.marieReorgBonus ?? 0;
  const productionParJour = base + ot + marie;
  return {
    ...state,
    finance: {
      ...state.finance,
      productionParJour,
    },
  };
}

function bankDailyProduction(state: GameState): GameState {
  if (state.meta.jourActuel < 1 || state.meta.jourActuel > 5) return state;
  let daily = state.finance.productionParJour;
  const rules = state.meta.rules;
  if ((state.flags.machine3DownDays ?? 0) > 0 && state.meta.jourActuel === 3) {
    daily = Math.round(daily * rules.machineDownProductionFactor);
  }
  if ((state.flags.machine3Bypass ?? 0) >= 1) {
    daily = Math.round(daily * rules.bypassProductionFactor);
  }
  const qualityFactor = Math.max(0.4, 1 - state.finance.tauxRebut / 100);
  const quality = Math.round(daily * qualityFactor);
  const flash =
    (state.world.feedbackFlash ? state.world.feedbackFlash + " · " : "") +
    `Journée bancarisée : +${quality} pièces qualité (cumul ${state.finance.qualite + quality})`;
  return {
    ...state,
    finance: {
      ...state.finance,
      piecesAujourdhui: daily,
      piecesBrutesSemaine: state.finance.piecesBrutesSemaine + daily,
      qualite: state.finance.qualite + quality,
      productionParJour: daily,
    },
    world: { ...state.world, feedbackFlash: flash },
  };
}

function normalizeXp(state: GameState): GameState {
  let xp = state.progression.xp;
  let niveau = state.progression.niveau;
  while (xp >= XP_PER_LEVEL) {
    xp -= XP_PER_LEVEL;
    niveau += 1;
  }
  return {
    ...state,
    progression: { ...state.progression, xp, niveau },
  };
}

/**
 * Pure decision applicator.
 * applyDecision(gameState, decision, choixId) => nouveau GameState
 */
export function applyDecision(
  gameState: GameState,
  decision: Decision,
  choixId: string
): GameState {
  if (gameState.world.dayDecisionId) {
    return {
      ...gameState,
      world: {
        ...gameState.world,
        feedbackFlash: "Décision du jour déjà prise — passe au jour suivant.",
      },
    };
  }

  const choix = decision.choix.find((c) => c.id === choixId);
  if (!choix) {
    return {
      ...gameState,
      world: { ...gameState.world, feedbackFlash: "Choix invalide." },
    };
  }

  if (choix.requis && !choix.requis.every((r) => conditionPasses(gameState, r))) {
    return {
      ...gameState,
      world: {
        ...gameState.world,
        feedbackFlash: "Conditions non remplies pour ce choix.",
      },
    };
  }

  // Time cost is embedded as consequence cible "temps" — ensure we can afford max time delta
  const timeDelta = choix.consequences
    .filter((c) => c.cible === "temps" || c.cible === "meta.minutesSinceStart")
    .reduce((s, c) => s + (c.mode === "set" ? 0 : c.valeur), 0);
  if (timeDelta > 0 && !canSpendTime(gameState, timeDelta)) {
    return {
      ...gameState,
      world: {
        ...gameState.world,
        feedbackFlash: "Pas assez de temps restant aujourd'hui.",
      },
    };
  }

  let next = { ...gameState };

  for (const cons of choix.consequences) {
    next = applyConsequence(next, cons);
  }

  // Bonus conditions (e.g. relation trust gates, nego AND clauses)
  if (choix.conditions) {
    for (const cond of choix.conditions) {
      if (fullConditionPasses(next, cond) && cond.alorsEffetSupplementaire) {
        for (const cons of cond.alorsEffetSupplementaire) {
          next = applyConsequence(next, cons);
        }
      }
    }
  }

  next = recomputeProduction(next);
  next = normalizeXp(next);
  next = syncMetaClock(next);

  const heure = next.meta.heureActuelle;
  const alreadyLogged = next.historique.decisionsPrises.some(
    (d) => d.decisionId === decision.id && d.choixId === choixId
  );

  const historique = alreadyLogged
    ? next.historique
    : {
        ...next.historique,
        decisionsPrises: [
          ...next.historique.decisionsPrises,
          {
            decisionId: decision.id,
            jour: decision.jour,
            choixId,
            heure,
          },
        ],
      };

  // Journal: exactly one entry per taken decision (no duplicates)
  const journalHas = next.world.journal.some(
    (j) => j.id === `j-dec-${decision.id}`
  );
  const xpGagne =
    choix.consequences
      .filter((c) => c.cible === "xp" || c.cible === "progression.xp")
      .reduce((s, c) => s + c.valeur, 0) || decision.xpGagne;

  const mode: ModeJeu =
    toModeJeu(next.modeActuel) ??
    toModeJeu(next.world.mode) ??
    "histoire";
  const modeLabel =
    mode === "histoire"
      ? getContexteActif().runtime.metaJourLabel(
          Math.max(1, next.meta.jourActuel)
        )
      : decision.competenceId
        ? skillLabel(decision.competenceId)
        : "Entraînement";

  const journal = journalHas
    ? next.world.journal
    : [
        {
          id: `j-dec-${decision.id}`,
          day: Math.max(1, next.meta.jourActuel),
          titre: choix.label,
          narration: choix.feedbackTexte,
          xp: xpGagne,
          at: heure,
          mode,
          modeLabel,
        },
        ...next.world.journal,
      ];

  const historiqueTagged = {
    ...historique,
    decisionsPrises: historique.decisionsPrises.map((d) =>
      d.decisionId === decision.id && d.choixId === choixId
        ? { ...d, mode, label: choix.label }
        : d
    ),
  };

  const cashLoss = choix.consequences
    .filter((c) => c.cible === "tresorerie" && c.valeur < -5000)
    .reduce((s, c) => s + Math.abs(c.valeur), 0);
  const trustHit = choix.consequences
    .filter(
      (c) =>
        (c.cible === "confianceClient" || c.cible === "ethique") &&
        c.valeur <= -10
    )
    .reduce((s, c) => s + Math.abs(c.valeur), 0);
  const failedHard = cashLoss >= 15000 || trustHit >= 15;
  const failedSkill =
    decision.jour === 5
      ? "negociation"
      : decision.jour === 3
        ? "gestion_crise"
        : decision.jour === 4
          ? "leadership"
          : decision.categorie?.toLowerCase().includes("négociation")
            ? "negociation"
            : "gestion_crise";

  next = {
    ...next,
    historique: historiqueTagged,
    world: {
      ...next.world,
      dayDecisionId: choixId,
      urgentBanner: null,
      feedbackFlash: choix.feedbackTexte,
      journal,
      badges: next.world.badges.map((b) =>
        b.id === "badge-first" ? { ...b, unlocked: true } : b
      ),
      trainingPrompt: failedHard
        ? {
            competenceId: failedSkill,
            competenceNom: skillLabel(failedSkill),
            raison: `Tu as échoué en ${skillLabel(failedSkill)}. Veux-tu t'entraîner ?`,
          }
        : next.world.trainingPrompt,
    },
  };

  if (choix.competencesImpactees?.length) {
    const applied = applyCompetenceImpacts(next, choix.competencesImpactees);
    next = applied.state;
  }

  if (decision.bankProduction) {
    next = bankDailyProduction(next);
  }

  return checkObjectives(next);
}

/**
 * Mode Compétence — apply a training Decision without the story day lock.
 * Awards skill XP on the trained competence (shared progression).
 */
export function applyCompetenceTraining(
  gameState: GameState,
  decision: Decision,
  choixId: string
): GameState {
  const competenceId = decision.competenceId;
  if (!competenceId) {
    return {
      ...gameState,
      world: {
        ...gameState.world,
        feedbackFlash: "Entraînement sans compétence associée.",
      },
    };
  }

  const choix = decision.choix.find((c) => c.id === choixId);
  if (!choix) {
    return {
      ...gameState,
      world: { ...gameState.world, feedbackFlash: "Choix invalide." },
    };
  }

  let next: GameState = {
    ...gameState,
    modeActuel: "competence",
    scenarioCompetenceId: competenceId,
    world: {
      ...gameState.world,
      mode: "skills",
      dayDecisionId: null,
    },
  };

  for (const cons of choix.consequences) {
    if (
      cons.cible === "temps" ||
      cons.cible === "meta.minutesSinceStart" ||
      cons.cible === "xp" ||
      cons.cible === "progression.xp"
    ) {
      continue; // time/xp handled by skill progression, not story clock
    }
    next = applyConsequence(next, cons);
  }

  const impacts =
    choix.competencesImpactees?.length
      ? choix.competencesImpactees
      : [
          {
            competenceId,
            type: (getCompetenceDef(competenceId)?.type ?? "generale") as
              | "generale"
              | "ciblee",
            xp: Math.max(
              60,
              choix.consequences
                .filter((c) => c.cible === "xp" || c.cible === "progression.xp")
                .reduce((s, c) => s + c.valeur, 0) || decision.xpGagne
            ),
            feedback: choix.feedbackTexte,
          },
        ];

  const applied = applyCompetenceImpacts(next, impacts);
  next = applied.state;
  next = normalizeXp(next);

  const skillXpGain = impacts.reduce((s, i) => s + i.xp, 0);
  const heure = next.meta.heureActuelle;
  const modeLabel = skillLabel(competenceId);
  const debriefNarration = applied.debrief.join("\n");

  next = {
    ...next,
    historique: {
      ...next.historique,
      decisionsPrises: [
        ...next.historique.decisionsPrises,
        {
          decisionId: decision.id,
          jour: 0,
          choixId,
          heure,
          mode: "competence",
          competenceId,
          label: choix.label,
        },
      ],
    },
    world: {
      ...next.world,
      feedbackFlash: applied.debrief[0] ?? choix.feedbackTexte,
      lastSkillDebrief: applied.debrief,
      journal: [
        {
          id: `j-train-${decision.id}-${Date.now()}`,
          day: 0,
          titre: choix.label,
          narration: debriefNarration || choix.feedbackTexte,
          xp: skillXpGain,
          at: heure,
          mode: "competence",
          modeLabel,
        },
        ...next.world.journal,
      ],
      trainingsCompleted: [
        {
          competenceId,
          decisionId: decision.id,
          choixId,
          label: choix.label,
          at: new Date().toISOString(),
          xp: skillXpGain,
        },
        ...next.world.trainingsCompleted,
      ],
      trainingPrompt: null,
    },
  };

  return next;
}

export function clearTrainingPrompt(state: GameState): GameState {
  return {
    ...state,
    world: { ...state.world, trainingPrompt: null },
  };
}

export function addXP(state: GameState, amount: number): GameState {
  return normalizeXp({
    ...state,
    progression: {
      ...state.progression,
      xp: state.progression.xp + amount,
    },
  });
}

export function checkObjectives(state: GameState): GameState {
  const objectives = state.world.objectives.map((obj) => {
    if (obj.status !== "EN_COURS") return obj;
    let progression = obj.progression;

    if (obj.id === "obj-j2") {
      progression = Math.min(
        obj.cible,
        state.world.emails.filter((e) => e.read && e.urgent).length
      );
    }
    if (obj.id === "obj-h1") {
      progression = maxVisibility(state) >= 1 ? 1 : 0;
    }
    if (obj.id === "obj-a1") {
      progression = Math.min(obj.cible, state.progression.niveau);
    }
    if (obj.id === "obj-j1") {
      const m3 = state.world.machines.find((m) => m.id === "m3");
      if (m3?.etat === "PRODUCTION") progression = obj.cible;
    }
    if (obj.id === "obj-j0") {
      progression = Math.min(
        obj.cible,
        Math.max(0, state.world.onboardingStep - 1)
      );
      if (state.world.onboardingDone) progression = obj.cible;
    }
    if (obj.id === "obj-j1-cause") {
      if (
        (state.flags.sensorInstalled ?? 0) >= 1 ||
        state.world.unlockedInfos.includes("CAPTEUR_M3_MORT")
      ) {
        progression = 1;
      }
    }
    if (obj.id === "obj-hebdo-500") {
      progression = Math.min(obj.cible, state.finance.qualite);
    }

    const status =
      progression >= obj.cible ? ("COMPLETE" as const) : obj.status;
    return { ...obj, progression, status };
  });

  const newlyCompleted = objectives.filter(
    (o, i) =>
      o.status === "COMPLETE" &&
      state.world.objectives[i]?.status !== "COMPLETE"
  );

  let next: GameState = {
    ...state,
    world: { ...state.world, objectives },
  };
  for (const obj of newlyCompleted) {
    next = addXP(next, obj.xp);
    next = {
      ...next,
      world: {
        ...next.world,
        feedbackFlash: `Objectif atteint : ${obj.titre} (+${obj.xp} XP)`,
      },
    };
  }
  return next;
}

export function computeEnding(state: GameState): EndingKind {
  const q = state.finance.qualite;
  const e = state.humain.ethique;
  // Thresholds come from scenario rules when present
  const failEthique = state.meta.rules.endingBands.find(
    (b) => b.id === "ECHEC" && b.maxEthique < 50
  );
  const ethiqueFloor = failEthique ? failEthique.maxEthique + 1 : 20;
  if (e < ethiqueFloor || q < 400) return "ECHEC";
  if (q >= 480 && e > 50) return "VICTOIRE";
  if (q >= 400 && q < 480) return "PARTIELLE";
  if (q >= 480 && e <= 50) return "PARTIELLE";
  return "ECHEC";
}

export function unlockBadge(state: GameState, badgeId: string): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      badges: state.world.badges.map((b) =>
        b.id === badgeId ? { ...b, unlocked: true } : b
      ),
    },
  };
}

export function markEmailRead(state: GameState, emailId: string): GameState {
  return checkObjectives({
    ...state,
    world: {
      ...state.world,
      emails: state.world.emails.map((e) =>
        e.id === emailId ? { ...e, read: true } : e
      ),
    },
  });
}

export function resolveRumor(
  state: GameState,
  rumorId: string,
  verified: boolean
): GameState {
  const rumors = state.world.rumors.map((r) =>
    r.id === rumorId ? { ...r, verified } : r
  );
  const events = state.world.events.map((e) =>
    e.isRumor && rumors.some((r) => r.eventId === e.id && r.id === rumorId)
      ? { ...e, rumorResolved: verified }
      : e
  );
  return {
    ...state,
    world: {
      ...state.world,
      rumors,
      events,
      feedbackFlash: verified
        ? "Rumeur confirmée par les faits."
        : "Rumeur infirmée.",
    },
  };
}

export type VisibilityLevel = "INCONNU" | "ESTIME" | "PRECIS" | "TEMPS_REEL";

export function visibilityForLevel(level: 0 | 1 | 2 | 3): VisibilityLevel {
  if (level >= 3) return "TEMPS_REEL";
  if (level >= 2) return "PRECIS";
  if (level >= 1) return "ESTIME";
  return "INCONNU";
}

export function formatKpiValue(
  value: number,
  format: "money" | "number" | "percent",
  visibility: VisibilityLevel
): { display: string; live?: boolean; estimated?: boolean; unknown?: boolean } {
  if (visibility === "INCONNU") {
    return { display: "???", unknown: true };
  }
  const rounded =
    visibility === "ESTIME" ? Math.round(value / 10) * 10 : value;
  let display: string;
  if (format === "money") {
    display = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(rounded);
  } else if (format === "percent") {
    display = `${visibility === "ESTIME" ? "~" : ""}${rounded}%`;
  } else {
    display = `${visibility === "ESTIME" ? "~" : ""}${rounded}`;
  }
  if (visibility === "ESTIME" && format === "money") display = `~${display}`;
  return {
    display,
    estimated: visibility === "ESTIME",
    live: visibility === "TEMPS_REEL",
  };
}

export { maxVisibility };
