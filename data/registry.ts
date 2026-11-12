import type { Decision } from "@/lib/decisions";
import type { GameState } from "@/lib/gameState";
import {
  createNovacierInitialState,
  novacierDecisions,
  SCENARIO_ID,
} from "./scenarioNovacier";

export type ScenarioModule = {
  id: string;
  createInitial: () => GameState;
  decisions: Decision[];
  decisionForDay: (day: number) => Decision | undefined;
};

const modules: Record<string, ScenarioModule> = {
  [SCENARIO_ID]: {
    id: SCENARIO_ID,
    createInitial: createNovacierInitialState,
    decisions: novacierDecisions,
    decisionForDay: (day) => novacierDecisions.find((d) => d.jour === day),
  },
};

export function getScenario(scenarioId: string): ScenarioModule {
  return modules[scenarioId] ?? modules[SCENARIO_ID]!;
}

export function getDefaultScenario(): ScenarioModule {
  return modules[SCENARIO_ID]!;
}
