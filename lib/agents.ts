/**
 * Global AI agent profiles that pilot the CŒUR (not the CŒUR itself).
 * Shared across all scenarios — edit once, applies everywhere.
 */

export type AgentExigence = "tolerant" | "normal" | "strict";

export type AgentProfile = {
  id: string;
  nom: string;
  role: string;
  competences: string[];
  mission: string;
  sortieAttendue: string;
  niveauExigence: AgentExigence;
  actif: boolean;
};

export type AgentReportIssue = {
  priorite: "haute" | "moyenne" | "basse";
  titre: string;
  detail: string;
  solution: string;
  /** Optional proposed patch hint for UI */
  nodeId?: string;
};

export type AgentRunReport = {
  agentId: string;
  score: number;
  issues: AgentReportIssue[];
  ranAt: string;
};

export const DEFAULT_AGENTS: AgentProfile[] = [
  {
    id: "agent-testeur",
    nom: "Testeur Joueur",
    role: "Jouabilité",
    competences: ["parcours", "équilibrage", "friction", "feedback"],
    mission:
      "Simuler un joueur novice et expert. Repérer les dead-ends, les choix trop punitifs, les boucles inutiles, et les moments où le joueur ne comprend pas quoi faire.",
    sortieAttendue:
      "Rapport de jouabilité : score 0-100, liste des frictions par jour, propositions concrètes (réduire coût, clarifier label, ajouter feedback).",
    niveauExigence: "normal",
    actif: true,
  },
  {
    id: "agent-metier",
    nom: "Expert Métier",
    role: "Réalisme industriel",
    competences: ["production", "supply", "qualité", "cash", "management"],
    mission:
      "Vérifier que les chiffres, délais et impacts métier sont crédibles pour une PME industrielle type Novacier (capteurs, rebut, HS, panne machine).",
    sortieAttendue:
      "Rapport réalisme : anomalies chiffrées (ex. machine 80k€ disproportionnée vs capteur), suggestions d'ajustement des conséquences.",
    niveauExigence: "strict",
    actif: true,
  },
  {
    id: "agent-pedagogue",
    nom: "Pédagogue",
    role: "Apprentissage",
    competences: ["compétences", "feedback", "progression", "débrief"],
    mission:
      "S'assurer que chaque décision enseigne quelque chose (data, leadership, éthique, négociation) et que le feedback renforce l'apprentissage.",
    sortieAttendue:
      "Rapport pédagogique : compétences couvertes / manquantes, qualité des feedbackTexte, propositions de renforcement XP ou de dilemmes.",
    niveauExigence: "normal",
    actif: true,
  },
  {
    id: "agent-coherence-erp",
    nom: "Cohérence ERP",
    role: "Mapping / typage / traduction ERP",
    competences: ["cibles", "typage", "visibilité", "ERP", "stock", "production"],
    mission:
      "Contrôler que chaque cible de conséquence existe dans le GameState, que les modes set/add sont cohérents, et que la traduction vers ERP / stock / production est correcte.",
    sortieAttendue:
      "Rapport cohérence : cibles invalides, types faux, mapping ERP manquant, correctifs proposés au format CŒUR.",
    niveauExigence: "strict",
    actif: true,
  },
];

export function cloneDefaultAgents(): AgentProfile[] {
  return DEFAULT_AGENTS.map((a) => ({
    ...a,
    competences: [...a.competences],
  }));
}

export const EXIGENCE_LABELS: Record<AgentExigence, string> = {
  tolerant: "Tolérant",
  normal: "Normal",
  strict: "Strict",
};
