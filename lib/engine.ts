import type {
  ActionType,
  Decision,
  DialogueChoice,
  GameState,
  JournalEntry,
  Objective,
  VisibilityLevel,
} from "./types";
import { onboardingStepsMeta } from "./mock";

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
  };

  return checkObjectives(next);
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

  return next;
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
