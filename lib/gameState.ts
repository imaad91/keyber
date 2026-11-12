/**
 * Unique in-session enterprise state.
 * Scenario numbers live in /data — never in the engine.
 */

export type VisibilityTier = 0 | 1 | 2 | 3; // 0 Inconnu · 1 Estimé · 2 Précis · 3 Temps réel

export type EndingKind = "VICTOIRE" | "PARTIELLE" | "ECHEC" | null;

export type DecisionRecord = {
  decisionId: string;
  jour: number;
  choixId: string;
  heure: string;
};

export type EndingRuleBand = {
  id: EndingKind;
  minQualite: number;
  maxQualite: number;
  minEthique: number;
  maxEthique: number;
};

export type ScenarioRules = {
  dayLengthMinutes: number;
  machineDownProductionFactor: number;
  bypassProductionFactor: number;
  endingBands: EndingRuleBand[];
  endingXp: Record<"VICTOIRE" | "PARTIELLE" | "ECHEC", number>;
};

export type GameMeta = {
  scenarioId: string;
  entrepriseId: string;
  roleId: string | null;
  jourActuel: number;
  heureActuelle: string;
  tempsRestantMinutes: number;
  week: number;
  minutesSinceStart: number;
  dayLengthMinutes: number;
  rules: ScenarioRules;
};

export type GameFinance = {
  tresorerie: number;
  stockKg: number;
  productionParJour: number;
  tauxRebut: number;
  qualite: number; // pièces qualité cumul semaine
  piecesBrutesSemaine: number;
  piecesAujourdhui: number;
};

export type GameHumain = {
  moralEquipe: number;
  ethique: number;
  confianceClient: number; // AutoVolt-like client trust (generic)
};

export type GameProgression = {
  xp: number;
  niveau: number;
  competences: Record<string, number>;
};

export type GameHistorique = {
  decisionsPrises: DecisionRecord[];
  evenementsDeclenches: string[];
};

/** Generic numeric/boolean flags set by declarative consequences (no scenario names in engine). */
export type GameFlags = Record<string, number>;

export type MachineEtat = "PRODUCTION" | "PANNE" | "ARRET";

export type MachineState = {
  id: string;
  nom: string;
  etat: MachineEtat;
  production: number;
  nextMaintenance: string;
  x: number;
  y: number;
};

export type EmailState = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  urgent?: boolean;
};

export type ChatMessageState = {
  id: string;
  from: string;
  role: string;
  text: string;
  time: string;
  alert?: boolean;
  mentor?: boolean;
};

export type CompanyEventState = {
  id: string;
  kind: string;
  titre: string;
  description: string;
  timestamp: string;
  isRumor?: boolean;
  rumorResolved?: boolean | null;
};

export type RumorState = {
  id: string;
  titre: string;
  texte: string;
  verified: boolean | null;
  eventId: string;
};

export type ObjectiveState = {
  id: string;
  type: string;
  titre: string;
  description: string;
  progression: number;
  cible: number;
  xp: number;
  status: "EN_COURS" | "COMPLETE" | "ECHOUE";
};

export type BadgeState = {
  id: string;
  titre: string;
  description: string;
  unlocked: boolean;
};

export type JournalEntryState = {
  id: string;
  day: number;
  titre: string;
  narration: string;
  xp: number;
  at: string;
};

export type ChapitreState = {
  id: string;
  numero: number;
  titre: string;
  intro: string;
  objectif: string;
  fin: string;
  status: "VERROUILLE" | "ACTIF" | "TERMINE";
};

export type GameMode = "skills" | "story" | null;

export type ActionType =
  | "ACCESS_COMPUTER"
  | "INTERVIEW"
  | "DECIDE"
  | "VIEW_ATELIER_LIVE";

/**
 * Single source of truth for a play session.
 * Core blocks match the decision-engine charter; `world` holds runtime content.
 */
export type GameState = {
  meta: GameMeta;
  finance: GameFinance;
  humain: GameHumain;
  /** confiance keyed by personnage id (marie, karim, … or pers-marie) */
  relations: Record<string, number>;
  progression: GameProgression;
  visibilite: Record<string, VisibilityTier>;
  historique: GameHistorique;
  flags: GameFlags;
  world: {
    mode: GameMode;
    ending: EndingKind;
    showDebrief: boolean;
    alarmActive: boolean;
    scenarioActive: boolean;
    dayDecisionId: string | null;
    feedbackFlash: string | null;
    introSeen: boolean;
    onboardingStep: 0 | 1 | 2 | 3 | 4 | 5;
    onboardingDone: boolean;
    unlockedActions: ActionType[];
    chapterId: string;
    chapters: ChapitreState[];
    journal: JournalEntryState[];
    badges: BadgeState[];
    objectives: ObjectiveState[];
    machines: MachineState[];
    emails: EmailState[];
    messages: ChatMessageState[];
    events: CompanyEventState[];
    rumors: RumorState[];
    unlockedInfos: string[];
    skillProgress: Record<string, { niveau: number; xp: number }>;
  };
};

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function formatClockFromMinutes(minutesSinceStart: number): string {
  const startHour = 8;
  const total = startHour * 60 + minutesSinceStart;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function syncMetaClock(state: GameState): GameState {
  const heureActuelle = formatClockFromMinutes(state.meta.minutesSinceStart);
  const tempsRestantMinutes = Math.max(
    0,
    state.meta.dayLengthMinutes - state.meta.minutesSinceStart
  );
  return {
    ...state,
    meta: {
      ...state.meta,
      heureActuelle,
      tempsRestantMinutes,
      jourActuel: state.meta.jourActuel,
    },
  };
}

/** Resolve dotted path on GameState (finance.tresorerie, confiance.marie → relations.marie, etc.) */
export function getPath(state: GameState, cible: string): number | string | undefined {
  const path = normalizeCible(cible);
  const parts = path.split(".");
  let cur: unknown = state;
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur as number | string | undefined;
}

export function setPath(
  state: GameState,
  cible: string,
  value: number | string
): GameState {
  const path = normalizeCible(cible);
  const parts = path.split(".");
  const root = { ...state } as GameState & Record<string, unknown>;

  // Deep clone along the path
  let cursor: Record<string, unknown> = root;
  const clones: { obj: Record<string, unknown>; key: string }[] = [];

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const next = {
      ...((cursor[key] as Record<string, unknown>) ?? {}),
    };
    clones.push({ obj: cursor, key });
    cursor[key] = next;
    cursor = next;
  }

  const last = parts[parts.length - 1]!;
  cursor[last] = value;
  return root as GameState;
}

/** Short cast names ↔ personnage ids used in UI */
export const RELATION_ALIASES: Record<string, string> = {
  marie: "pers-marie",
  karim: "pers-karim",
  laurent: "pers-laurent",
  henri: "pers-henri",
  "pers-marie": "pers-marie",
  "pers-karim": "pers-karim",
  "pers-laurent": "pers-laurent",
  "pers-henri": "pers-henri",
};

/** Map short cibles used in scenario data onto GameState paths. */
export function normalizeCible(cible: string): string {
  if (cible.startsWith("confiance.")) {
    const key = cible.slice("confiance.".length);
    const canon = RELATION_ALIASES[key] ?? key;
    return `relations.${canon}`;
  }
  if (cible.startsWith("visibilite.")) {
    return `visibilite.${cible.slice("visibilite.".length)}`;
  }
  if (cible === "tresorerie") return "finance.tresorerie";
  if (cible === "stock" || cible === "stockKg") return "finance.stockKg";
  if (cible === "production" || cible === "productionParJour")
    return "finance.productionParJour";
  if (cible === "rebut" || cible === "tauxRebut") return "finance.tauxRebut";
  if (cible === "qualite") return "finance.qualite";
  if (cible === "piecesAujourdhui") return "finance.piecesAujourdhui";
  if (cible === "piecesBrutesSemaine") return "finance.piecesBrutesSemaine";
  if (cible === "moral" || cible === "moralEquipe") return "humain.moralEquipe";
  if (cible === "ethique") return "humain.ethique";
  if (cible === "confianceClient" || cible === "autovolt")
    return "humain.confianceClient";
  if (cible === "xp") return "progression.xp";
  if (cible === "niveau") return "progression.niveau";
  if (cible === "temps") return "meta.minutesSinceStart";
  if (cible.startsWith("flags.")) return cible;
  if (cible.startsWith("finance.") || cible.startsWith("humain.") || cible.startsWith("relations.") || cible.startsWith("progression.") || cible.startsWith("meta.") || cible.startsWith("world."))
    return cible;
  if (cible.startsWith("competence.")) {
    return `progression.competences.${cible.slice("competence.".length)}`;
  }
  // bare flag name
  if (!cible.includes(".")) return `flags.${cible}`;
  return cible;
}

/** Aggregate visibility for ERP fog helpers (max of module tiers). */
export function maxVisibility(state: GameState): VisibilityTier {
  const vals = Object.values(state.visibilite);
  if (vals.length === 0) return 0;
  return Math.max(...vals) as VisibilityTier;
}
