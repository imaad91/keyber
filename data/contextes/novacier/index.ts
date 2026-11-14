import type { Decision } from "@/lib/decisions";
import type { Evenement } from "@/lib/evenements";
import type { GameState } from "@/lib/gameState";
import {
  createNovacierInitialState,
  dayTitles,
  novacierDecisions,
  SCENARIO_ID,
  SCENARIO_TITLE,
  TARGET_PIECES,
} from "@/data/scenarioNovacier";
import { novacierComputer } from "./computer";
import { novacierEvenements } from "./evenements";
import { novacierRuntimeCopy } from "./runtimeCopy";
import type { ContexteComputerData } from "@/lib/computerTypes";
import type { ContexteRuntimeCopy } from "./runtimeCopy";

export type ContexteScenario = {
  id: string;
  titre: string;
  createInitial: () => GameState;
  decisions: Decision[];
  decisionForDay: (day: number) => Decision | undefined;
  dayTitles?: Record<number, string>;
  targetPieces?: number;
};

export type ContexteModule = {
  id: string;
  nom: string;
  computer: ContexteComputerData;
  runtime: ContexteRuntimeCopy;
  evenements: Evenement[];
  scenarios: Record<string, ContexteScenario>;
  defaultScenarioId: string;
};

const semaine: ContexteScenario = {
  id: SCENARIO_ID,
  titre: SCENARIO_TITLE,
  createInitial: createNovacierInitialState,
  decisions: novacierDecisions,
  decisionForDay: (day) => novacierDecisions.find((d) => d.jour === day),
  dayTitles,
  targetPieces: TARGET_PIECES,
};

export const contexteNovacier: ContexteModule = {
  id: "novacier",
  nom: "Novacier",
  computer: novacierComputer,
  runtime: novacierRuntimeCopy,
  evenements: novacierEvenements,
  scenarios: { [SCENARIO_ID]: semaine },
  defaultScenarioId: SCENARIO_ID,
};
