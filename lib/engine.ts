import type {
  Decision,
  GameState,
  Objective,
  VisibilityLevel,
} from "./types";

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
