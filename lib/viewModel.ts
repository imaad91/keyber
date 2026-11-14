/**
 * Derived flat view of GameState for existing UI components.
 * Not a second store — computed from the single nested GameState.
 */

import type { GameState } from "./gameState";
import { maxVisibility } from "./gameState";
import {
  visibilityForLevel,
  type VisibilityLevel,
} from "./engine";

export type GameView = {
  // nested passthrough
  raw: GameState;
  // flat compat fields (old GameState shape)
  mode: GameState["world"]["mode"];
  modeActuel: GameState["modeActuel"];
  roleId: string | null;
  day: number;
  week: number;
  minutesSinceStart: number;
  dayLengthMinutes: number;
  xp: number;
  level: number;
  tresorerie: number;
  production: number;
  moral: number;
  piecesAujourdhui: number;
  tauxPanne: number;
  vitesseProduction: number;
  stockKg: number;
  rebutRate: number;
  ethique: number;
  confianceClient: number;
  piecesQualiteSemaine: number;
  piecesBrutesSemaine: number;
  dailyProductionBase: number;
  overtimeBonus: number;
  marieReorgBonus: number;
  sensorInstalled: boolean;
  machine3Bypass: boolean;
  machine3DownDays: number;
  dayDecisionId: string | null;
  decisionsTaken: string[];
  showDebrief: boolean;
  ending: GameState["world"]["ending"];
  alarmActive: boolean;
  scenarioActive: boolean;
  visibilityLevel: 0 | 1 | 2 | 3;
  kpiVisibility: Record<string, VisibilityLevel>;
  machines: GameState["world"]["machines"];
  objectives: GameState["world"]["objectives"];
  events: GameState["world"]["events"];
  emails: GameState["world"]["emails"];
  messages: GameState["world"]["messages"];
  rumors: GameState["world"]["rumors"];
  decisionHistory: {
    id: string;
    titre: string;
    at: string;
    xp: number;
  }[];
  badges: GameState["world"]["badges"];
  skillProgress: GameState["world"]["skillProgress"];
  trainingsCompleted: GameState["world"]["trainingsCompleted"];
  histoiresCompleted: GameState["world"]["histoiresCompleted"];
  trainingPrompt: GameState["world"]["trainingPrompt"];
  lastSkillDebrief: string[];
  competencesGenerales: GameState["progression"]["competencesGenerales"];
  competencesCiblees: GameState["progression"]["competencesCiblees"];
  eventNotifications: GameState["world"]["eventNotifications"];
  urgentBanner: GameState["world"]["urgentBanner"];
  showDayEnd: boolean;
  heureActuelle: string;
  tempsRestantMinutes: number;
  evenementsDeclenches: string[];
  dashboardAlert: boolean;
  feedbackFlash: string | null;
  introSeen: boolean;
  onboardingStep: GameState["world"]["onboardingStep"];
  onboardingDone: boolean;
  unlockedActions: GameState["world"]["unlockedActions"];
  chapterId: string;
  chapters: GameState["world"]["chapters"];
  journal: GameState["world"]["journal"];
  relations: Record<string, number>;
  unlockedInfos: string[];
};

function kpiFromVisibility(state: GameState): Record<string, VisibilityLevel> {
  const tier = maxVisibility(state);
  const mapped = visibilityForLevel(tier);
  const keys = [
    "tresorerie",
    "production",
    "moral",
    "pieces",
    "panne",
    "rebut",
    "stock",
    "ethique",
    "autovolt",
  ];
  const out: Record<string, VisibilityLevel> = {};
  for (const k of keys) {
    if (tier === 0) out[k] = k === "ethique" ? "PRECIS" : k === "autovolt" ? "ESTIME" : "INCONNU";
    else out[k] = mapped;
  }
  if ((state.flags.sensorInstalled ?? 0) >= 1) {
    out.tresorerie = "PRECIS";
    out.production = "TEMPS_REEL";
    out.moral = "PRECIS";
    out.pieces = "TEMPS_REEL";
    out.panne = "PRECIS";
    out.rebut = "TEMPS_REEL";
    out.stock = "PRECIS";
    out.ethique = "PRECIS";
    out.autovolt = "PRECIS";
  }
  return out;
}

export function toGameView(state: GameState): GameView {
  const vis = maxVisibility(state);
  const decisions = state.historique?.decisionsPrises ?? [];
  return {
    raw: state,
    mode: state.world?.mode ?? null,
    modeActuel: state.modeActuel ?? null,
    roleId: state.meta?.roleId ?? null,
    day: state.meta?.jourActuel ?? 0,
    week: state.meta?.week ?? 1,
    minutesSinceStart: state.meta?.minutesSinceStart ?? 0,
    dayLengthMinutes: state.meta?.dayLengthMinutes ?? 600,
    xp: state.progression?.xp ?? 0,
    level: state.progression?.niveau ?? 1,
    tresorerie: state.finance?.tresorerie ?? 0,
    production: state.finance?.productionParJour ?? 0,
    moral: state.humain?.moralEquipe ?? 0,
    piecesAujourdhui: state.finance?.piecesAujourdhui ?? 0,
    tauxPanne: state.flags?.tauxPanne ?? 5,
    vitesseProduction: state.finance?.productionParJour ?? 0,
    stockKg: state.finance?.stockKg ?? 0,
    rebutRate: state.finance?.tauxRebut ?? 0,
    ethique: state.humain?.ethique ?? 0,
    confianceClient: state.humain?.confianceClient ?? 0,
    piecesQualiteSemaine: state.finance?.qualite ?? 0,
    piecesBrutesSemaine: state.finance?.piecesBrutesSemaine ?? 0,
    dailyProductionBase: state.flags?.dailyProductionBase ?? 60,
    overtimeBonus: state.flags?.overtimeBonus ?? 0,
    marieReorgBonus: state.flags?.marieReorgBonus ?? 0,
    sensorInstalled: (state.flags?.sensorInstalled ?? 0) >= 1,
    machine3Bypass: (state.flags?.machine3Bypass ?? 0) >= 1,
    machine3DownDays: state.flags?.machine3DownDays ?? 0,
    dayDecisionId: state.world?.dayDecisionId ?? null,
    decisionsTaken: decisions.map((d) => d.choixId),
    showDebrief: Boolean(state.world?.showDebrief),
    ending: state.world?.ending ?? null,
    alarmActive: Boolean(state.world?.alarmActive),
    scenarioActive: Boolean(state.world?.scenarioActive),
    visibilityLevel: vis,
    kpiVisibility: kpiFromVisibility(state),
    machines: state.world?.machines ?? [],
    objectives: state.world?.objectives ?? [],
    events: state.world?.events ?? [],
    emails: state.world?.emails ?? [],
    messages: state.world?.messages ?? [],
    rumors: state.world?.rumors ?? [],
    decisionHistory: decisions.map((d) => ({
      id: `${d.decisionId}-${d.choixId}`,
      titre: d.label ?? d.choixId,
      at: d.heure,
      xp: 0,
    })),
    badges: state.world?.badges ?? [],
    skillProgress: state.world?.skillProgress ?? {},
    trainingsCompleted: state.world?.trainingsCompleted ?? [],
    histoiresCompleted: state.world?.histoiresCompleted ?? [],
    trainingPrompt: state.world?.trainingPrompt ?? null,
    lastSkillDebrief: state.world?.lastSkillDebrief ?? [],
    competencesGenerales: state.progression?.competencesGenerales ?? {},
    competencesCiblees: state.progression?.competencesCiblees ?? {},
    eventNotifications: state.world?.eventNotifications ?? [],
    urgentBanner: state.world?.urgentBanner ?? null,
    showDayEnd: Boolean(state.world?.showDayEnd),
    heureActuelle: state.meta?.heureActuelle ?? "08:00",
    tempsRestantMinutes: state.meta?.tempsRestantMinutes ?? 0,
    evenementsDeclenches: state.historique?.evenementsDeclenches ?? [],
    dashboardAlert: (state.flags?.dashboardAlert ?? 0) >= 1,
    feedbackFlash: state.world?.feedbackFlash ?? null,
    introSeen: Boolean(state.world?.introSeen),
    onboardingStep: state.world?.onboardingStep ?? 1,
    onboardingDone: Boolean(state.world?.onboardingDone),
    unlockedActions: state.world?.unlockedActions ?? [],
    chapterId: state.world?.chapterId ?? "",
    chapters: state.world?.chapters ?? [],
    journal: state.world?.journal ?? [],
    relations: state.relations ?? {},
    unlockedInfos: state.world?.unlockedInfos ?? [],
  };
}
