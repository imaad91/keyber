import type { Decision } from "@/lib/decisions";
import type { Evenement } from "@/lib/evenements";
import type { GameState } from "@/lib/gameState";
import type {
  Chapitre,
  ChatMessage,
  CompanyEvent,
  Email,
  LivreEntreprise,
  Machine,
  Objective,
  Personnage,
  Rumor,
} from "@/lib/types";
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
import {
  emailsForDay as novacierEmailsForDay,
  eventsForDay as novacierEventsForDay,
  livreNovacier,
  messagesForDay as novacierMessagesForDay,
  scenarioChapters,
  scenarioMachines,
  scenarioObjectives,
  scenarioPersonnages,
  scenarioRumor,
} from "./scenarioContent";

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
  livre: LivreEntreprise;
  personnages: Personnage[];
  machines: Machine[];
  chapters: Chapitre[];
  objectives: Objective[];
  rumor: Rumor;
  emailsForDay: (day: number) => Email[];
  messagesForDay: (day: number) => ChatMessage[];
  eventsForDay: (day: number) => CompanyEvent[];
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
  livre: livreNovacier,
  personnages: scenarioPersonnages,
  machines: scenarioMachines,
  chapters: scenarioChapters,
  objectives: scenarioObjectives,
  rumor: scenarioRumor,
  emailsForDay: novacierEmailsForDay,
  messagesForDay: novacierMessagesForDay,
  eventsForDay: novacierEventsForDay,
  scenarios: { [SCENARIO_ID]: semaine },
  defaultScenarioId: SCENARIO_ID,
};

/** Re-export for Admin seed only — not for OS gameplay. */
export {
  livreNovacier,
  scenarioPersonnages,
  scenarioMachines,
  scenarioChapters,
  scenarioObjectives,
  scenarioRumor,
} from "./scenarioContent";
