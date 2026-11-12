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
  confianceAutoVolt: number;
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
  return {
    raw: state,
    mode: state.world.mode,
    roleId: state.meta.roleId,
    day: state.meta.jourActuel,
    week: state.meta.week,
    minutesSinceStart: state.meta.minutesSinceStart,
    dayLengthMinutes: state.meta.dayLengthMinutes,
    xp: state.progression.xp,
    level: state.progression.niveau,
    tresorerie: state.finance.tresorerie,
    production: state.finance.productionParJour,
    moral: state.humain.moralEquipe,
    piecesAujourdhui: state.finance.piecesAujourdhui,
    tauxPanne: state.flags.tauxPanne ?? 5,
    vitesseProduction: state.finance.productionParJour,
    stockKg: state.finance.stockKg,
    rebutRate: state.finance.tauxRebut,
    ethique: state.humain.ethique,
    confianceAutoVolt: state.humain.confianceClient,
    piecesQualiteSemaine: state.finance.qualite,
    piecesBrutesSemaine: state.finance.piecesBrutesSemaine,
    dailyProductionBase: state.flags.dailyProductionBase ?? 60,
    overtimeBonus: state.flags.overtimeBonus ?? 0,
    marieReorgBonus: state.flags.marieReorgBonus ?? 0,
    sensorInstalled: (state.flags.sensorInstalled ?? 0) >= 1,
    machine3Bypass: (state.flags.machine3Bypass ?? 0) >= 1,
    machine3DownDays: state.flags.machine3DownDays ?? 0,
    dayDecisionId: state.world.dayDecisionId,
    decisionsTaken: state.historique.decisionsPrises.map((d) => d.choixId),
    showDebrief: state.world.showDebrief,
    ending: state.world.ending,
    alarmActive: state.world.alarmActive,
    scenarioActive: state.world.scenarioActive,
    visibilityLevel: vis,
    kpiVisibility: kpiFromVisibility(state),
    machines: state.world.machines,
    objectives: state.world.objectives,
    events: state.world.events,
    emails: state.world.emails,
    messages: state.world.messages,
    rumors: state.world.rumors,
    decisionHistory: state.historique.decisionsPrises.map((d) => ({
      id: `${d.decisionId}-${d.choixId}`,
      titre: d.choixId,
      at: d.heure,
      xp: 0,
    })),
    badges: state.world.badges,
    skillProgress: state.world.skillProgress,
    feedbackFlash: state.world.feedbackFlash,
    introSeen: state.world.introSeen,
    onboardingStep: state.world.onboardingStep,
    onboardingDone: state.world.onboardingDone,
    unlockedActions: state.world.unlockedActions,
    chapterId: state.world.chapterId,
    chapters: state.world.chapters,
    journal: state.world.journal,
    relations: state.relations,
    unlockedInfos: state.world.unlockedInfos,
  };
}
