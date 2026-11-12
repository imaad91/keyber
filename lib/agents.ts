/**
 * Global AI agent profiles that pilot the CŒUR (not the CŒUR itself).
 * Shared across all scenarios — edit once, applies everywhere.
 */

export type AgentExigence = "tolerant" | "normal" | "strict";

/** Lucide icon id stored on the agent profile. */
export type AgentIconId =
  | "target"
  | "factory"
  | "graduation-cap"
  | "link"
  | "message-circle"
  | "eye"
  | "shield"
  | "zap"
  | "database"
  | "book-open"
  | "gamepad-2";

export const AGENT_ICON_OPTIONS: AgentIconId[] = [
  "target",
  "factory",
  "graduation-cap",
  "link",
  "message-circle",
  "eye",
  "shield",
  "zap",
  "database",
  "book-open",
  "gamepad-2",
];

export type AgentProfile = {
  id: string;
  nom: string;
  role: string;
  competences: string[];
  mission: string;
  sortieAttendue: string;
  niveauExigence: AgentExigence;
  actif: boolean;
  /** Lucide icon name, e.g. "target" */
  icone: AgentIconId | string;
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

export type AgentIconTheme = {
  box: string;
  icon: string;
};

/** Visual theme for known default agents; others get a neutral square. */
export function agentIconTheme(agent: Pick<AgentProfile, "id" | "icone">): AgentIconTheme {
  if (agent.id === "agent-testeur" || agent.icone === "target") {
    return { box: "bg-black", icon: "text-[#D6F94C]" };
  }
  if (agent.id === "agent-metier" || agent.icone === "factory") {
    return { box: "bg-slate-100", icon: "text-black" };
  }
  if (agent.id === "agent-pedagogue" || agent.icone === "graduation-cap") {
    return { box: "bg-[#D6F94C]", icon: "text-black" };
  }
  if (agent.id === "agent-coherence-erp" || agent.icone === "link") {
    return { box: "border-2 border-black bg-white", icon: "text-black" };
  }
  return { box: "bg-slate-900", icon: "text-[#D6F94C]" };
}

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
    icone: "target",
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
    icone: "factory",
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
    icone: "graduation-cap",
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
    icone: "link",
  },
];

export function cloneDefaultAgents(): AgentProfile[] {
  return DEFAULT_AGENTS.map((a) => ({
    ...a,
    competences: [...a.competences],
  }));
}

/** Ensure legacy localStorage agents without `icone` get a default. */
export function normalizeAgent(a: Partial<AgentProfile> & { id: string }): AgentProfile {
  const seed = DEFAULT_AGENTS.find((d) => d.id === a.id);
  return {
    id: a.id,
    nom: a.nom ?? seed?.nom ?? "Agent",
    role: a.role ?? seed?.role ?? "",
    competences: a.competences ?? seed?.competences ?? [],
    mission: a.mission ?? seed?.mission ?? "",
    sortieAttendue: a.sortieAttendue ?? seed?.sortieAttendue ?? "",
    niveauExigence: a.niveauExigence ?? seed?.niveauExigence ?? "normal",
    actif: a.actif ?? true,
    icone: a.icone ?? seed?.icone ?? "target",
  };
}

export const EXIGENCE_LABELS: Record<AgentExigence, string> = {
  tolerant: "Tolérant",
  normal: "Normal",
  strict: "Strict",
};
