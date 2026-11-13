/**
 * Admin module « Fiches » — rich real-world intake linked to a scenario.
 * Independent from player GameState.
 */

import { SCENARIO_ID, SCENARIO_TITLE } from "@/data/scenarioNovacier";
import { uid } from "./adminTypes";
import {
  makeTransition,
  migrateLegacyFicheStatut,
  type FicheAgentReport,
  type StatutWorkflow,
  type WorkflowTransition,
} from "./adminWorkflow";
import type { CompetencePrecisionRow } from "./competenceLocks";

export type AdminFicheSections = {
  contexteEntreprise: string;
  personnagesRiches: string;
  decisionsRiches: string;
  donneesReelles: string;
};

export type AdminFiche = {
  id: string;
  titre: string;
  scenarioId: string;
  entrepriseNom: string;
  role: string;
  /** Closed validation workflow status (synced with scénario / Cœur). */
  statutWorkflow: StatutWorkflow;
  updatedAt: string;
  /** Last workflow transition timestamp. */
  lastStepAt: string;
  sections: AdminFicheSections;
  /** Set after génération du Scénario Provisoire / Cœur. */
  coeurGenere: boolean;
  historique: WorkflowTransition[];
  commentaireCorrection?: string;
  raisonRejet?: string;
  agentTestReports?: FicheAgentReport[];
  /** Snapshot « Précision des compétences » from last agent test run. */
  competencePrecision?: CompetencePrecisionRow[];
  /** Competences linked to decisions — IDs only, never free text. */
  competenceIds?: string[];
  /** Badge PROVISOIRE when scénario provisoire créé. */
  provisoire?: boolean;
};

export const FICHE_SECTION_META: {
  key: keyof AdminFicheSections;
  titre: string;
  shortMissing: string;
}[] = [
  {
    key: "contexteEntreprise",
    titre: "Contexte Entreprise Riche",
    shortMissing: "Contexte Entreprise",
  },
  {
    key: "personnagesRiches",
    titre: "Personnages Riches",
    shortMissing: "Personnages Riches",
  },
  {
    key: "decisionsRiches",
    titre: "Décisions Riches",
    shortMissing: "Décisions Riches",
  },
  {
    key: "donneesReelles",
    titre: "Données Réelles",
    shortMissing: "Données Réelles",
  },
];

export const FICHE_SECTION_HINT =
  "Raconte le réel, avec des anecdotes, des chiffres, des exemples vrais. Plus c'est riche, plus le scénario sera réel.";

export function emptyFicheSections(): AdminFicheSections {
  return {
    contexteEntreprise: "",
    personnagesRiches: "",
    decisionsRiches: "",
    donneesReelles: "",
  };
}

export function emptyFiche(scenarioId = ""): AdminFiche {
  const now = new Date().toISOString();
  return {
    id: uid("fiche"),
    titre: "Nouvelle fiche",
    scenarioId,
    entrepriseNom: "",
    role: "Responsable de Production",
    statutWorkflow: "brouillon",
    updatedAt: now,
    lastStepAt: now,
    sections: emptyFicheSections(),
    coeurGenere: false,
    historique: [
      makeTransition("brouillon", "brouillon", "Système", "Création de la fiche"),
    ],
  };
}

/** Normalize persisted / partial fiches (legacy statut → statutWorkflow). */
export function normalizeAdminFiche(raw: Partial<AdminFiche> & { statut?: unknown }): AdminFiche {
  const base = emptyFiche(raw.scenarioId ?? "");
  const statutWorkflow =
    raw.statutWorkflow ??
    migrateLegacyFicheStatut(raw.statut ?? "brouillon");
  return {
    ...base,
    ...raw,
    statutWorkflow,
    sections: { ...emptyFicheSections(), ...(raw.sections ?? {}) },
    historique: Array.isArray(raw.historique) ? raw.historique : base.historique,
    updatedAt: raw.updatedAt ?? base.updatedAt,
    lastStepAt: raw.lastStepAt ?? raw.updatedAt ?? base.lastStepAt,
    coeurGenere: Boolean(raw.coeurGenere),
  };
}

export function ficheFillPercent(fiche: AdminFiche): number {
  const filled = FICHE_SECTION_META.filter((s) =>
    fiche.sections[s.key]?.trim()
  ).length;
  return Math.round((filled / FICHE_SECTION_META.length) * 100);
}

export function ficheMissingSections(fiche: AdminFiche): string[] {
  return FICHE_SECTION_META.filter((s) => !fiche.sections[s.key]?.trim()).map(
    (s) => s.shortMissing
  );
}

export function seedNovacierFiche(): AdminFiche {
  const now = new Date().toISOString();
  const hist: WorkflowTransition[] = [
    makeTransition("brouillon", "soumise", "Utilisateur", "Fiche complète soumise"),
    makeTransition("soumise", "fiche_validee", "Utilisateur", "Réel et chiffres OK"),
    makeTransition(
      "fiche_validee",
      "provisoire_cree",
      "Système",
      "Cœur + Scénario Provisoire générés"
    ),
    makeTransition("provisoire_cree", "en_test", "Utilisateur", "Lancement tests Agents"),
    makeTransition(
      "en_test",
      "retenu_publie",
      "Utilisateur",
      "4 Agents validés — scénario publié"
    ),
  ].map((t, i) => ({
    ...t,
    at: new Date(Date.now() - (5 - i) * 86400000).toISOString(),
  }));
  return {
    id: "fiche-novacier",
    titre: "Fiche Novacier",
    scenarioId: SCENARIO_ID,
    entrepriseNom: "Novacier Industrie",
    role: "Responsable de Production",
    statutWorkflow: "retenu_publie",
    updatedAt: now,
    lastStepAt: hist[hist.length - 1]!.at,
    sections: {
      contexteEntreprise: `Novacier Industrie — Saint-Étienne. PME métallurgique (~120 employés), 4 machines, AutoVolt = 45 % du CA. Quasi-faillite 2022. Cette semaine : 500 pièces qualité avant vendredi 16h. ${SCENARIO_TITLE}`,
      personnagesRiches:
        "Marie Dubois (chef d'atelier) jauge le nouveau RP. Karim (maintenance) sait qu'un capteur est mort. Laurent Moreau (direction) presse pour un statut AutoVolt. Henri (mentor) guide l'arrivée.",
      decisionsRiches:
        "J1 cause du retard (capteur vs machine vs rien). J2 heures sup vs réorg Marie. J3 panne Machine 3. J4 éthique micro-défauts. J5 négociation AutoVolt.",
      donneesReelles:
        "Trésorerie ~420 k€, stock acier ~850 kg, prod ~60/j, rebut réel ~18 % une fois le brouillard levé. Objectif : 500 pièces qualité.",
    },
    coeurGenere: true,
    competenceIds: [
      "priorisation",
      "decision_incertitude",
      "ordonnancement",
      "leadership",
      "qualite",
      "maintenance",
      "negociation",
    ],
    historique: hist,
    provisoire: false,
    agentTestReports: [
      {
        agentId: "agent-testeur",
        nom: "Testeur Joueur",
        score: 88,
        statut: "valide",
        issues: [],
        ranAt: hist[3]!.at,
      },
      {
        agentId: "agent-metier",
        nom: "Expert Métier",
        score: 82,
        statut: "valide",
        issues: [],
        ranAt: hist[3]!.at,
      },
      {
        agentId: "agent-pedagogue",
        nom: "Pédagogue",
        score: 85,
        statut: "valide",
        issues: [],
        ranAt: hist[3]!.at,
      },
      {
        agentId: "agent-coherence-erp",
        nom: "Cohérence ERP",
        score: 90,
        statut: "valide",
        issues: [],
        ranAt: hist[3]!.at,
      },
    ],
  };
}

export function seedAtelierNordFiche(scenarioId: string): AdminFiche {
  const now = new Date().toISOString();
  const hist: WorkflowTransition[] = [
    makeTransition("brouillon", "soumise", "Utilisateur"),
    makeTransition("soumise", "fiche_validee", "Utilisateur"),
    makeTransition("fiche_validee", "provisoire_cree", "Système"),
    makeTransition("provisoire_cree", "en_test", "Utilisateur", "Tests Agents lancés"),
  ].map((t, i) => ({
    ...t,
    at: new Date(Date.now() - (4 - i) * 3600000).toISOString(),
  }));
  return {
    id: "fiche-atelier-nord",
    titre: "Fiche Atelier Nord",
    scenarioId,
    entrepriseNom: "Atelier Nord",
    role: "Chef d'atelier",
    statutWorkflow: "en_test",
    updatedAt: now,
    lastStepAt: hist[hist.length - 1]!.at,
    sections: {
      contexteEntreprise:
        "Atelier Nord — Lille. Sous-traitant usinage (80 pers.). Contrat urgent pièces aéronautiques, délai 4 jours.",
      personnagesRiches:
        "Sophie (qualité) exige zéro défaut. Marc (planning) surcharge les postes. Amine (opérateur) connaît la machine 2.",
      decisionsRiches:
        "Prioriser lot A vs B, heures nuit, faire appel à un sous-traitant externe.",
      donneesReelles:
        "OEE 62 %, rebut 4,2 %, stock outillage critique 2 jours.",
    },
    coeurGenere: true,
    historique: hist,
    provisoire: true,
    agentTestReports: [
      {
        agentId: "agent-testeur",
        nom: "Testeur Joueur",
        score: 76,
        statut: "valide",
        issues: [
          {
            priorite: "basse",
            titre: "Feedback J1 faible",
            detail: "Le joueur ne comprend pas le coût du retard.",
          },
        ],
        ranAt: hist[3]!.at,
      },
      {
        agentId: "agent-metier",
        nom: "Expert Métier",
        score: 58,
        statut: "bloque",
        issues: [
          {
            priorite: "haute",
            titre: "Délai aéronautique irréaliste",
            detail: "4 jours pour lot critique sans buffer qualité.",
          },
        ],
        ranAt: hist[3]!.at,
      },
      {
        agentId: "agent-pedagogue",
        nom: "Pédagogue",
        score: 80,
        statut: "valide",
        issues: [],
        ranAt: hist[3]!.at,
      },
      {
        agentId: "agent-coherence-erp",
        nom: "Cohérence ERP",
        score: 84,
        statut: "valide",
        issues: [],
        ranAt: hist[3]!.at,
      },
    ],
  };
}

export function seedNouveauProjetFiche(scenarioId: string): AdminFiche {
  const now = new Date().toISOString();
  return {
    id: "fiche-nouveau-projet",
    titre: "Fiche Nouveau Projet",
    scenarioId,
    entrepriseNom: "À définir",
    role: "Responsable de Production",
    statutWorkflow: "brouillon",
    updatedAt: now,
    lastStepAt: now,
    sections: emptyFicheSections(),
    coeurGenere: false,
    historique: [
      makeTransition("brouillon", "brouillon", "Système", "Création de la fiche"),
    ],
  };
}
