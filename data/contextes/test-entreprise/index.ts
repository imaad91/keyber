import {
  createNovacierInitialState,
  dayTitles,
  novacierDecisions,
  SCENARIO_ID,
  TARGET_PIECES,
} from "@/data/scenarioNovacier";
import { novacierRuntimeCopy } from "@/data/contextes/novacier/runtimeCopy";
import type { ContexteModule } from "@/data/contextes/novacier";
import { testEntrepriseComputer } from "./computer";
import { testEntrepriseEvenements } from "./evenements";

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
    narration:
      "Tu as ouvert le Livre de TestEntreprise. La mémoire du lieu.",
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

export const contexteTestEntreprise: ContexteModule = {
  id: "test-entreprise",
  nom: "TestEntreprise",
  computer: testEntrepriseComputer,
  runtime,
  evenements: testEntrepriseEvenements,
  scenarios: {
    [SCENARIO_ID]: {
      id: SCENARIO_ID,
      titre: "TEST-ENTREPRISE — Semaine critique",
      createInitial: createNovacierInitialState,
      decisions: novacierDecisions,
      decisionForDay: (day) => novacierDecisions.find((d) => d.jour === day),
      dayTitles,
      targetPieces: TARGET_PIECES,
    },
  },
  defaultScenarioId: SCENARIO_ID,
};
