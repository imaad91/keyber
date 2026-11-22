import {
  createNovacierInitialState,
  dayTitles,
  novacierDecisions,
  SCENARIO_ID,
  TARGET_PIECES,
} from "@/data/scenarioNovacier";
import { novacierRuntimeCopy } from "@/data/contextes/novacier/runtimeCopy";
import type { ContexteModule } from "@/data/contextes/novacier";
import type { GameState } from "@/lib/gameState";
import type {
  LivreEntreprise,
  Machine,
  Personnage,
  Rumor,
} from "@/lib/types";
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
} from "@/data/contextes/novacier/scenarioContent";
import { testEntrepriseComputer } from "./computer";
import { testEntrepriseEvenements } from "./evenements";

function renameDeep(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/Novacier/g, "TestEntreprise")
      .replace(/AutoVolt/g, "ClientAlpha")
      .replace(/Marie Dubois/g, "Anna Morel")
      .replace(/Marie/g, "Anna")
      .replace(/Karim Benali/g, "Samir Haddad")
      .replace(/Karim/g, "Samir")
      .replace(/Laurent Perrin/g, "Paul Girard")
      .replace(/Laurent Moreau/g, "Paul Girard")
      .replace(/Laurent/g, "Paul")
      .replace(/Henri Vallon/g, "Mentor")
      .replace(/Henri/g, "Mentor")
      .replace(/Machine 3/g, "Ligne critique")
      .replace(/machine 3/g, "ligne critique")
      .replace(/500 pièces/g, "400 unités");
  }
  if (Array.isArray(value)) return value.map(renameDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = renameDeep(v);
    return out;
  }
  return value;
}

const runtime = {
  ...novacierRuntimeCopy,
  entrepriseNom: "TestEntreprise",
  endingFlash: {
    victoire: "Victoire — contrat ClientAlpha tenu",
    partielle: "Victoire partielle",
    echec: "Échec — contrat en danger",
  },
  endingNarration: {
    victoire: (q: number, e: number) =>
      `Victoire. ${q} pièces qualité, éthique ${e}. ClientAlpha reste. TestEntreprise tient.`,
    partielle: novacierRuntimeCopy.endingNarration.partielle,
    echec: (q: number, e: number) =>
      `Échec. ${q} pièces qualité, éthique ${e}. ClientAlpha s'éloigne.`,
  },
  eventMailFrom: "direction@test-entreprise.local",
  metaJourLabel: (jour: number) => `TestEntreprise Jour ${Math.max(1, jour)}`,
  arrivalJournal: {
    titre: "Lundi 8h00 — Arrivée",
    narration:
      "Tu franchis la porte de TestEntreprise. Le mentor te salue. La semaine critique commence.",
  },
  livreOpened: {
    titre: "Livre de TestEntreprise",
    narration: "Tu as ouvert le Livre de TestEntreprise. La mémoire du lieu.",
  },
  alarmLabel: "Alarme ligne critique",
  roleDescription: "Semaine critique — contrat ClientAlpha.",
  roleFocus: ["Atelier", "Qualité", "ClientAlpha"],
  roleIntroLines: [
    "Lundi 8h00. Tu es Responsable de Production chez TestEntreprise.",
    "ClientAlpha = client stratégique. Cette semaine décide de tout.",
    "Anna te jauge. Samir sait un secret. Paul écrit déjà.",
  ],
};

const livre = renameDeep(livreNovacier) as LivreEntreprise;
const personnages = renameDeep(scenarioPersonnages) as Personnage[];
const machines = renameDeep(scenarioMachines) as Machine[];
const rumor = renameDeep(scenarioRumor) as Rumor;
const chapters = renameDeep(scenarioChapters) as typeof scenarioChapters;
const objectives = renameDeep(scenarioObjectives) as typeof scenarioObjectives;
const decisions = renameDeep(novacierDecisions) as typeof novacierDecisions;
const titles = renameDeep(dayTitles) as typeof dayTitles;

function createTestEntrepriseInitialState(): GameState {
  return renameDeep(createNovacierInitialState()) as GameState;
}

export const contexteTestEntreprise: ContexteModule = {
  id: "test-entreprise",
  nom: "TestEntreprise",
  computer: testEntrepriseComputer,
  runtime,
  evenements: testEntrepriseEvenements,
  livre,
  personnages,
  machines,
  chapters,
  objectives,
  rumor,
  emailsForDay: (day) =>
    renameDeep(novacierEmailsForDay(day)) as ReturnType<
      typeof novacierEmailsForDay
    >,
  messagesForDay: (day) =>
    renameDeep(novacierMessagesForDay(day)) as ReturnType<
      typeof novacierMessagesForDay
    >,
  eventsForDay: (day) =>
    renameDeep(novacierEventsForDay(day)) as ReturnType<
      typeof novacierEventsForDay
    >,
  scenarios: {
    [SCENARIO_ID]: {
      id: SCENARIO_ID,
      titre: "TEST-ENTREPRISE — Semaine critique",
      createInitial: createTestEntrepriseInitialState,
      decisions,
      decisionForDay: (day) => decisions.find((d) => d.jour === day),
      dayTitles: titles,
      targetPieces: TARGET_PIECES,
    },
  },
  defaultScenarioId: SCENARIO_ID,
};
