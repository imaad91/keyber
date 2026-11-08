import type {
  ActionType,
  Decision,
  DialogueChoice,
  EndingKind,
  GameState,
  JournalEntry,
  Objective,
  VisibilityLevel,
} from "./types";
import { ALL_ACTIONS, createScenarioDayState, onboardingStepsMeta } from "./mock";

const XP_PER_LEVEL = 500;

export function formatGameClock(minutesSinceStart: number): string {
  const startHour = 8;
  const total = startHour * 60 + minutesSinceStart;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function remainingDayMinutes(state: GameState): number {
  return Math.max(0, state.dayLengthMinutes - state.minutesSinceStart);
}

export function canSpendTime(state: GameState, minutes: number): boolean {
  return remainingDayMinutes(state) >= minutes;
}

export function advanceTime(state: GameState, minutes: number): GameState {
  const next = Math.min(
    state.dayLengthMinutes,
    state.minutesSinceStart + minutes
  );
  return {
    ...state,
    minutesSinceStart: next,
    feedbackFlash:
      next >= state.dayLengthMinutes
        ? "Fin de journée — plus de temps disponible."
        : state.feedbackFlash,
  };
}

export function visibilityForLevel(level: 0 | 1 | 2 | 3): VisibilityLevel {
  if (level >= 3) return "TEMPS_REEL";
  if (level >= 2) return "PRECIS";
  if (level >= 1) return "ESTIME";
  return "INCONNU";
}

export function updateVisibility(
  state: GameState,
  level: 1 | 2 | 3
): GameState {
  if (level <= state.visibilityLevel) return state;

  const kpiVisibility = { ...state.kpiVisibility };
  const mapped = visibilityForLevel(level);

  for (const key of Object.keys(kpiVisibility)) {
    kpiVisibility[key] = mapped;
  }

  // At level 0→1 some stay estimated; at start we had mix — force upgrade path
  if (level === 1) {
    kpiVisibility.tresorerie = "ESTIME";
    kpiVisibility.production = "ESTIME";
    kpiVisibility.moral = "ESTIME";
    kpiVisibility.pieces = "ESTIME";
    kpiVisibility.panne = "ESTIME";
  }

  const badges = state.badges.map((b) =>
    b.id === "badge-eye" ? { ...b, unlocked: true } : b
  );

  return {
    ...state,
    visibilityLevel: level,
    kpiVisibility,
    badges,
    feedbackFlash: `Visibilité améliorée → niveau ${level}`,
  };
}

export function addXP(state: GameState, amount: number): GameState {
  let xp = state.xp + amount;
  let level = state.level;
  while (xp >= XP_PER_LEVEL) {
    xp -= XP_PER_LEVEL;
    level += 1;
  }
  return { ...state, xp, level };
}

export function checkObjectives(state: GameState): GameState {
  const objectives: Objective[] = state.objectives.map((obj) => {
    if (obj.status !== "EN_COURS") return obj;

    let progression = obj.progression;

    if (obj.id === "obj-j2") {
      progression = Math.min(
        obj.cible,
        state.emails.filter((e) => e.read && e.urgent).length
      );
    }
    if (obj.id === "obj-h1") {
      progression = state.visibilityLevel >= 1 ? 1 : 0;
    }
    if (obj.id === "obj-a1") {
      progression = Math.min(obj.cible, state.level);
    }
    if (obj.id === "obj-j1") {
      const m3 = state.machines.find((m) => m.id === "m3");
      if (m3?.etat === "PRODUCTION") progression = obj.cible;
    }
    if (obj.id === "obj-j0") {
      progression = Math.min(obj.cible, Math.max(0, state.onboardingStep - 1));
      if (state.onboardingDone) progression = obj.cible;
    }
    if (obj.id === "obj-j1-cause") {
      if (
        state.sensorInstalled ||
        state.unlockedInfos.includes("CAPTEUR_M3_MORT")
      ) {
        progression = 1;
      }
    }
    if (obj.id === "obj-hebdo-500") {
      progression = Math.min(obj.cible, state.piecesQualiteSemaine);
    }

    const status =
      progression >= obj.cible ? ("COMPLETE" as const) : obj.status;
    return { ...obj, progression, status };
  });

  const newlyCompleted = objectives.filter(
    (o, i) =>
      o.status === "COMPLETE" && state.objectives[i]?.status !== "COMPLETE"
  );

  let next = { ...state, objectives };
  for (const obj of newlyCompleted) {
    next = addXP(next, obj.xp);
    next = {
      ...next,
      feedbackFlash: `Objectif atteint : ${obj.titre} (+${obj.xp} XP)`,
    };
  }
  return next;
}

export function applyDecision(
  state: GameState,
  decision: Decision
): GameState {
  let next: GameState = { ...state };

  if (!canSpendTime(next, decision.timeCostMinutes)) {
    return {
      ...next,
      feedbackFlash: "Pas assez de temps restant aujourd'hui.",
    };
  }

  next = advanceTime(next, decision.timeCostMinutes);

  const deltas = decision.deltas ?? {};
  next = {
    ...next,
    tresorerie: next.tresorerie + (deltas.tresorerie ?? 0),
    production: clamp(
      next.production + (deltas.production ?? 0),
      0,
      100
    ),
    moral: clamp(next.moral + (deltas.moral ?? 0), 0, 100),
    piecesAujourdhui:
      next.piecesAujourdhui + (deltas.piecesAujourdhui ?? 0),
    tauxPanne: Math.max(0, next.tauxPanne + (deltas.tauxPanne ?? 0)),
    vitesseProduction:
      next.vitesseProduction + (deltas.vitesseProduction ?? 0),
  };

  if (decision.machineEffects?.length) {
    next = {
      ...next,
      machines: next.machines.map((m) => {
        const effect = decision.machineEffects?.find(
          (e) => e.machineId === m.id
        );
        if (!effect) return m;
        return {
          ...m,
          etat: effect.etat,
          production:
            effect.etat === "PRODUCTION"
              ? Math.max(m.production, 30)
              : 0,
        };
      }),
    };
  }

  if (
    decision.unlockMachine &&
    !next.machines.some((m) => m.id === decision.unlockMachine!.id)
  ) {
    next = {
      ...next,
      machines: [...next.machines, { ...decision.unlockMachine }],
      feedbackFlash: `Nouvelle machine : ${decision.unlockMachine.nom}`,
    };
  }

  if (decision.visibilityUpgrade) {
    next = updateVisibility(next, decision.visibilityUpgrade);
  }

  next = addXP(next, decision.xpReward ?? 0);

  const journalEntry: JournalEntry = {
    id: `j-${decision.id}-${Date.now()}`,
    day: Math.max(1, next.day),
    titre: decision.titre,
    narration:
      decision.journalNarration ??
      `Tu as choisi : ${decision.titre}.`,
    xp: decision.xpReward ?? 0,
    at: formatGameClock(next.minutesSinceStart),
  };

  next = {
    ...next,
    decisionHistory: [
      {
        id: `${decision.id}-${Date.now()}`,
        titre: decision.titre,
        at: formatGameClock(next.minutesSinceStart),
        xp: decision.xpReward ?? 0,
      },
      ...next.decisionHistory,
    ],
    journal: [journalEntry, ...next.journal],
    badges: next.badges.map((b) =>
      b.id === "badge-first" ? { ...b, unlocked: true } : b
    ),
    feedbackFlash:
      next.feedbackFlash ??
      `Décision validée : ${decision.titre}${
        decision.xpReward ? ` (+${decision.xpReward} XP)` : ""
      }`,
    dayDecisionId: decision.id,
    decisionsTaken: [...next.decisionsTaken, decision.id],
  };

  next = applyScenarioDecisionEffects(next, decision);
  return checkObjectives(next);
}

export function applyScenarioDecisionEffects(
  state: GameState,
  decision: Decision
): GameState {
  let next = { ...state };

  if (decision.id === "d1-capteur") {
    next = {
      ...next,
      sensorInstalled: true,
      visibilityLevel: 2,
      kpiVisibility: {
        ...next.kpiVisibility,
        tresorerie: "PRECIS",
        production: "TEMPS_REEL",
        moral: "PRECIS",
        pieces: "TEMPS_REEL",
        panne: "PRECIS",
        rebut: "TEMPS_REEL",
        stock: "PRECIS",
        ethique: "PRECIS",
        autovolt: "PRECIS",
      },
      rebutRate: 18,
      production: next.dailyProductionBase,
      feedbackFlash: "Capteur live — rebut réel 18 %, prod 60/jour",
      badges: next.badges.map((b) =>
        b.id === "badge-eye" ? { ...b, unlocked: true } : b
      ),
    };
  }

  if (decision.id === "d1-machine") {
    next = {
      ...next,
      feedbackFlash:
        "Nouvelle machine commandée — trop tard pour cette semaine",
    };
  }

  if (decision.id === "d2-hs") {
    next = {
      ...next,
      overtimeBonus: 20,
      dailyProductionBase: 60 + 20 + next.marieReorgBonus,
      production: 60 + 20 + next.marieReorgBonus,
      relations: {
        ...next.relations,
        "pers-marie": clamp((next.relations["pers-marie"] ?? 30) - 10, 0, 100),
      },
    };
  }

  if (decision.id === "d2-no-hs") {
    next = {
      ...next,
      relations: {
        ...next.relations,
        "pers-marie": clamp((next.relations["pers-marie"] ?? 30) + 8, 0, 100),
      },
    };
  }

  if (decision.id === "d2-marie-reorg") {
    next = {
      ...next,
      marieReorgBonus: 15,
      dailyProductionBase: 60 + next.overtimeBonus + 15,
      production: 60 + next.overtimeBonus + 15,
    };
  }

  if (decision.id === "d3-repair") {
    next = {
      ...next,
      machine3DownDays: 1,
      alarmActive: false,
      machines: next.machines.map((m) =>
        m.id === "m3"
          ? { ...m, etat: "ARRET", production: 0, nextMaintenance: "Réparation J+1" }
          : m
      ),
      feedbackFlash: "Machine 3 en réparation — atelier mis à jour",
    };
  }

  if (decision.id === "d3-bypass") {
    next = {
      ...next,
      machine3Bypass: true,
      rebutRate: next.rebutRate + 8,
      alarmActive: true,
      feedbackFlash: "Contournement actif — qualité -10 %, Machine 3 rouge",
    };
  }

  if (decision.id === "d3-externe") {
    next = {
      ...next,
      alarmActive: false,
      machine3DownDays: 0,
      machines: next.machines.map((m) =>
        m.id === "m3"
          ? { ...m, etat: "PRODUCTION", production: 18, nextMaintenance: "J+7" }
          : m
      ),
      feedbackFlash: "Machine 3 réparée (prestataire) — retour au vert",
    };
  }

  if (decision.id === "d4-livrer") {
    next = {
      ...next,
      ethique: clamp(next.ethique - 30, 0, 100),
      confianceAutoVolt: clamp(next.confianceAutoVolt - 15, 0, 100),
      piecesBrutesSemaine: next.piecesBrutesSemaine + 40,
      piecesQualiteSemaine: next.piecesQualiteSemaine + 40,
      feedbackFlash: "40 pièces livrées — éthique -30",
    };
  }

  if (decision.id === "d4-jeter") {
    next = {
      ...next,
      ethique: clamp(next.ethique + 20, 0, 100),
      confianceAutoVolt: clamp(next.confianceAutoVolt + 10, 0, 100),
      badges: next.badges.map((b) =>
        b.id === "badge-ethique" ? { ...b, unlocked: true } : b
      ),
      feedbackFlash: "Pièces jetées — éthique +20, AutoVolt +10",
    };
  }

  if (decision.id === "d5-nego-transparence") {
    next = {
      ...next,
      ethique: clamp(next.ethique + 10, 0, 100),
      confianceAutoVolt: clamp(next.confianceAutoVolt + 15, 0, 100),
    };
  }

  if (decision.id === "d5-nego-prix") {
    next = {
      ...next,
      confianceAutoVolt: clamp(next.confianceAutoVolt + 8, 0, 100),
    };
  }

  if (decision.id === "d5-nego-dur") {
    const bonus = next.ethique >= 50 && next.piecesQualiteSemaine >= 400 ? 5 : -5;
    next = {
      ...next,
      confianceAutoVolt: clamp(next.confianceAutoVolt + bonus, 0, 100),
    };
  }

  // After day decision, bank today's production into weekly quality
  if (decision.id.startsWith("d") && decision.id.includes("-")) {
    next = bankDayProduction(next);
  }

  return next;
}

function bankDayProduction(state: GameState): GameState {
  if (state.day < 1 || state.day > 5) return state;
  let daily = state.dailyProductionBase;
  if (state.machine3DownDays > 0 && state.day === 3) {
    daily = Math.round(daily * 0.55);
  }
  if (state.machine3Bypass) {
    daily = Math.round(daily * 0.95);
  }
  const qualityFactor = Math.max(0.4, 1 - state.rebutRate / 100);
  const quality = Math.round(daily * qualityFactor);
  return {
    ...state,
    piecesAujourdhui: daily,
    piecesBrutesSemaine: state.piecesBrutesSemaine + daily,
    piecesQualiteSemaine: state.piecesQualiteSemaine + quality,
    production: daily,
    feedbackFlash:
      (state.feedbackFlash ? state.feedbackFlash + " · " : "") +
      `Journée bancarisée : +${quality} pièces qualité (cumul ${state.piecesQualiteSemaine + quality})`,
  };
}

export function computeEnding(state: GameState): EndingKind {
  const q = state.piecesQualiteSemaine;
  const e = state.ethique;
  if (e < 20 || q < 400) return "ECHEC";
  if (q >= 480 && e > 50) return "VICTOIRE";
  if (q >= 400 && q < 480) return "PARTIELLE";
  if (q >= 480 && e <= 50) return "PARTIELLE";
  return "ECHEC";
}

export function advanceScenarioDay(state: GameState): GameState {
  if (state.showDebrief) return state;

  // End of day 5 → debrief
  if (state.day >= 5 && state.dayDecisionId) {
    const ending = computeEnding(state);
    return {
      ...state,
      showDebrief: true,
      ending,
      minutesSinceStart: state.dayLengthMinutes,
      feedbackFlash:
        ending === "VICTOIRE"
          ? "Victoire — contrat AutoVolt tenu"
          : ending === "PARTIELLE"
            ? "Victoire partielle"
            : "Échec — contrat en danger",
      badges: state.badges.map((b) =>
        b.id === "badge-victoire" && ending === "VICTOIRE"
          ? { ...b, unlocked: true }
          : b
      ),
      journal: [
        {
          id: `j-end-${Date.now()}`,
          day: 5,
          titre: "Débrief 16h00",
          narration: endingNarration(ending, state),
          xp: ending === "VICTOIRE" ? 500 : ending === "PARTIELLE" ? 200 : 50,
          at: "16:00",
        },
        ...state.journal,
      ],
    };
  }

  if (!state.dayDecisionId) {
    return {
      ...state,
      feedbackFlash: "Prends d'abord la décision du jour.",
    };
  }

  const nextDay = state.day + 1;
  const patch = createScenarioDayState(state, nextDay);
  let next: GameState = {
    ...state,
    ...patch,
    feedbackFlash: `Passage au Jour ${nextDay}`,
  };

  // Day 3: force machine 3 panne at 10:00
  if (nextDay === 3) {
    next = {
      ...next,
      minutesSinceStart: 2 * 60,
      alarmActive: true,
      machines: next.machines.map((m) =>
        m.id === "m3"
          ? { ...m, etat: "PANNE", production: 0, nextMaintenance: "URGENTE" }
          : m
      ),
      journal: [
        {
          id: `j-panne-${Date.now()}`,
          day: 3,
          titre: "10h00 — PANNE MACHINE 3",
          narration:
            "Alarme. L'Atelier Live bascule au rouge. Il faut décider : réparer, contourner, ou prestataire.",
          xp: 10,
          at: "10:00",
        },
        ...next.journal,
      ],
    };
  }

  // Heal machine after repair day
  if (state.day === 3 && state.decisionsTaken.includes("d3-repair")) {
    next = {
      ...next,
      machine3DownDays: 0,
      machines: next.machines.map((m) =>
        m.id === "m3"
          ? { ...m, etat: "PRODUCTION", production: 18, nextMaintenance: "J+5" }
          : m
      ),
    };
  }

  return checkObjectives(next);
}

function endingNarration(ending: EndingKind, state: GameState): string {
  const q = state.piecesQualiteSemaine;
  const e = state.ethique;
  if (ending === "VICTOIRE") {
    return `Victoire. ${q} pièces qualité, éthique ${e}. AutoVolt reste. Novacier tient.`;
  }
  if (ending === "PARTIELLE") {
    return `Victoire partielle. ${q} pièces qualité, éthique ${e}. Le contrat est fragile, mais vivant.`;
  }
  return `Échec. ${q} pièces qualité, éthique ${e}. AutoVolt s'éloigne — l'écho de 2022.`;
}

export function startScenarioWeek(state: GameState): GameState {
  const patch = createScenarioDayState(state, 1);
  return {
    ...state,
    ...patch,
    day: 1,
    onboardingDone: true,
    onboardingStep: 5,
    unlockedActions: [...ALL_ACTIONS],
    scenarioActive: true,
    minutesSinceStart: 15, // 08:15 — Laurent's email moment
    feedbackFlash: "Jour 1 — 08:15. Mail de Laurent. Brouillard total.",
    journal: [
      {
        id: `j-week-${Date.now()}`,
        day: 1,
        titre: "Jour 1 — Le brouillard",
        narration:
          "Lundi. Tous les KPIs affichent ???. Laurent demande où en est le retard. Karim murmure qu'un capteur est mort.",
        xp: 10,
        at: "08:15",
      },
      ...state.journal,
    ],
  };
}

export function applyDialogueChoice(
  state: GameState,
  personnageId: string,
  choice: DialogueChoice
): GameState {
  const current = state.relations[personnageId] ?? 50;
  const relations = {
    ...state.relations,
    [personnageId]: clamp(current + choice.confianceDelta, 0, 100),
  };
  const unlockedInfos = choice.unlockInfo
    ? Array.from(new Set([...state.unlockedInfos, choice.unlockInfo]))
    : state.unlockedInfos;

  let next: GameState = {
    ...state,
    relations,
    unlockedInfos,
    feedbackFlash:
      choice.confianceDelta >= 0
        ? `Confiance +${choice.confianceDelta}`
        : `Confiance ${choice.confianceDelta}`,
  };

  if (choice.xp) next = addXP(next, choice.xp);

  if (
    choice.unlockInfo === "RUMEUR_CONFIRMED" ||
    choice.unlockInfo === "RUMEUR_PARTIELLE"
  ) {
    next = {
      ...next,
      rumors: next.rumors.map((r) =>
        r.id === "rum-autovolt-pl" ? { ...r, verified: true } : r
      ),
      events: next.events.map((e) =>
        e.id === "ev-rumor-pl" ? { ...e, rumorResolved: true } : e
      ),
      feedbackFlash: "Rumeur AutoVolt / Pologne confirmée via interview",
    };
  }

  if (choice.unlockInfo === "SOLUTION_MARIE") {
    next = {
      ...next,
      feedbackFlash:
        "Solution Marie débloquée (confiance) — réorganisation sans HS",
    };
  }

  if (choice.unlockInfo === "CAPTEUR_M3_MORT") {
    next = checkObjectives({
      ...next,
      feedbackFlash: "Karim a parlé : capteur Machine 3 mort (5 k€)",
    });
  }

  next = {
    ...next,
    journal: [
      {
        id: `j-dlg-${Date.now()}`,
        day: Math.max(0, next.day),
        titre: "Choix de dialogue",
        narration: `Tu as répondu « ${choice.texte} ». ${choice.reponse}${
          choice.xp ? ` +${choice.xp} XP` : ""
        }`,
        xp: choice.xp ?? 0,
        at: formatGameClock(next.minutesSinceStart),
      },
      ...next.journal,
    ],
  };

  return checkObjectives(next);
}

export function advanceOnboarding(
  state: GameState,
  viaAction: ActionType
): GameState {
  if (state.onboardingDone) return state;

  const meta = onboardingStepsMeta.find((s) => s.step === state.onboardingStep);
  if (!meta) return state;
  if (meta.actionHint !== viaAction && meta.unlock !== "ALL") {
    // allow completing step when the hinted action is used
    if (viaAction !== meta.actionHint) return state;
  }

  const step = state.onboardingStep;
  let unlockedActions = [...state.unlockedActions];
  let messages = [...state.messages];
  let onboardingStep = step;
  let onboardingDone = false;
  let day = state.day;
  let feedbackFlash = state.feedbackFlash;
  let badges = state.badges;
  let journal = state.journal;

  if (step === 1 && viaAction === "VIEW_ATELIER_LIVE") {
    unlockedActions = uniqueActions([...unlockedActions, "INTERVIEW"]);
    onboardingStep = 2;
    messages = [
      {
        id: `msg-m-${Date.now()}`,
        from: "Henri Vallon",
        role: "Mentor",
        text: "Bien. Maintenant va voir Marie — interview.",
        time: formatGameClock(state.minutesSinceStart),
        mentor: true,
      },
      ...messages,
    ];
    feedbackFlash = "Étape 1/4 — Atelier découvert";
    journal = [
      {
        id: `j-ob-1-${Date.now()}`,
        day: 0,
        titre: "Jour 0 — Atelier",
        narration:
          "Henri t'a fait ouvrir l'Atelier Live. Les machines respirent. La 3 clignote déjà rouge.",
        xp: 15,
        at: formatGameClock(state.minutesSinceStart),
      },
      ...journal,
    ];
  } else if (step === 2 && viaAction === "INTERVIEW") {
    unlockedActions = uniqueActions([...unlockedActions, "OPEN_ERP"]);
    onboardingStep = 3;
    messages = [
      {
        id: `msg-m-${Date.now()}`,
        from: "Henri Vallon",
        role: "Mentor",
        text: "Marie t'a parlé. Ouvre maintenant l'ERP.",
        time: formatGameClock(state.minutesSinceStart),
        mentor: true,
      },
      ...messages,
    ];
    feedbackFlash = "Étape 2/4 — Marie rencontrée";
    journal = [
      {
        id: `j-ob-2-${Date.now()}`,
        day: 0,
        titre: "Jour 0 — Marie",
        narration:
          "Tu as rencontré Marie Dupont. La confiance se gagne réponse après réponse.",
        xp: 15,
        at: formatGameClock(state.minutesSinceStart),
      },
      ...journal,
    ];
  } else if (step === 3 && viaAction === "OPEN_ERP") {
    unlockedActions = uniqueActions([
      ...unlockedActions,
      "DECIDE",
      "EMAILS",
      "VIEW_DASHBOARD",
      "ANALYZE_DATA",
    ]);
    onboardingStep = 4;
    messages = [
      {
        id: `msg-m-${Date.now()}`,
        from: "Henri Vallon",
        role: "Mentor",
        text: "Dernière étape : ton premier objectif. Stabilise la machine 3 quand tu seras prêt.",
        time: formatGameClock(state.minutesSinceStart),
        mentor: true,
      },
      ...messages,
    ];
    feedbackFlash = "Étape 3/4 — ERP découvert";
    journal = [
      {
        id: `j-ob-3-${Date.now()}`,
        day: 0,
        titre: "Jour 0 — ERP",
        narration:
          "L'ERP Novacier s'est ouvert. Tables, filtres, réalité administrative.",
        xp: 15,
        at: formatGameClock(state.minutesSinceStart),
      },
      ...journal,
    ];
  } else if (step === 4 && viaAction === "DECIDE") {
    unlockedActions = uniqueActions([
      ...unlockedActions,
      "DECIDE",
      "EMAILS",
      "VIEW_DASHBOARD",
      "ANALYZE_DATA",
      "INTERVIEW",
      "OPEN_ERP",
      "VIEW_ATELIER_LIVE",
      "CHAT",
    ]);
    onboardingStep = 5;
    onboardingDone = true;
    day = Math.max(1, day === 0 ? 1 : day);
    badges = badges.map((b) =>
      b.id === "badge-jour0" ? { ...b, unlocked: true } : b
    );
    feedbackFlash = "Jour 0 terminé — bienvenue dans le quotidien";
    journal = [
      {
        id: `j-ob-4-${Date.now()}`,
        day: 1,
        titre: "Fin du Jour 0",
        narration:
          "Le mentor s'efface un peu. Les outils sont à toi. Chapitre 1 continue.",
        xp: 40,
        at: formatGameClock(state.minutesSinceStart),
      },
      ...journal,
    ];
  } else {
    return state;
  }

  let next: GameState = {
    ...state,
    unlockedActions,
    onboardingStep,
    onboardingDone,
    day,
    messages,
    badges,
    journal,
    feedbackFlash,
  };

  if (onboardingDone || onboardingStep > step) {
    next = addXP(next, 15);
  }
  if (onboardingDone) next = addXP(next, 40);

  return checkObjectives(next);
}

export function completeOnboardingStep4(state: GameState): GameState {
  return advanceOnboarding(state, "DECIDE");
}

function uniqueActions(list: ActionType[]): ActionType[] {
  return Array.from(new Set(list));
}

export function unlockBadge(state: GameState, badgeId: string): GameState {
  return {
    ...state,
    badges: state.badges.map((b) =>
      b.id === badgeId ? { ...b, unlocked: true } : b
    ),
  };
}

export function markEmailRead(state: GameState, emailId: string): GameState {
  const emails = state.emails.map((e) =>
    e.id === emailId ? { ...e, read: true } : e
  );
  return checkObjectives({ ...state, emails });
}

export function resolveRumor(
  state: GameState,
  rumorId: string,
  verified: boolean
): GameState {
  const rumors = state.rumors.map((r) =>
    r.id === rumorId ? { ...r, verified } : r
  );
  const events = state.events.map((e) =>
    e.isRumor && rumors.some((r) => r.eventId === e.id && r.id === rumorId)
      ? { ...e, rumorResolved: verified }
      : e
  );
  return {
    ...state,
    rumors,
    events,
    feedbackFlash: verified
      ? "Rumeur confirmée par les faits."
      : "Rumeur infirmée.",
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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

  if (visibility === "ESTIME" && format === "money") {
    display = `~${display}`;
  }

  return {
    display,
    estimated: visibility === "ESTIME",
    live: visibility === "TEMPS_REEL",
  };
}
