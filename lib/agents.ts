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
  | "gamepad-2"
  | "network"
  | "hand"
  | "play"
  | "briefcase";

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
  "network",
  "hand",
  "play",
  "briefcase",
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

export type AgentIconThemeKey =
  | "testeur"
  | "metier"
  | "pedagogue"
  | "erp"
  | "orchestra"
  | "ergonomie"
  | "default";

/** Theme key for known default agents (styles live in AgentIconBadge). */
export function agentIconThemeKey(
  agent: Pick<AgentProfile, "id" | "icone">
): AgentIconThemeKey {
  if (
    agent.id === "agent-testeur" ||
    agent.icone === "target" ||
    agent.icone === "play"
  )
    return "testeur";
  if (
    agent.id === "agent-metier" ||
    agent.icone === "factory" ||
    agent.icone === "briefcase"
  )
    return "metier";
  if (agent.id === "agent-pedagogue" || agent.icone === "graduation-cap")
    return "pedagogue";
  if (
    agent.id === "agent-coherence-erp" ||
    agent.icone === "link" ||
    agent.icone === "database"
  )
    return "erp";
  if (agent.id === "agent-orchestra" || agent.icone === "network")
    return "orchestra";
  if (agent.id === "agent-ergonomie" || agent.icone === "hand")
    return "ergonomie";
  return "default";
}

/** Agents that audit the application (not a single scenario Cœur). */
export function isAppLevelAgent(agentId: string): boolean {
  return agentId === "agent-orchestra" || agentId === "agent-ergonomie";
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
    icone: "play",
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
    icone: "briefcase",
  },
  {
    id: "agent-pedagogue",
    nom: "Pédagogue",
    role: "Apprentissage",
    competences: ["compétences", "feedback", "progression", "débrief"],
    mission:
      "S'assurer que chaque décision enseigne quelque chose et que le feedback renforce l'apprentissage. Pour chaque décision, vérifie que le dilemme parle bien de l'indicateur testé. Exemple : si la décision dit tester « Calcule correctement le besoin net », le dilemme doit parler de besoin net, de stock, d'en-cours. Si le dilemme ne parle pas de l'indicateur, signale « Incohérence : décision ne teste pas l'indicateur annoncé » et bloque la validation.",
    sortieAttendue:
      "Rapport pédagogique : compétences couvertes / manquantes, cohérence dilemme↔indicateur, qualité des feedbacks précis, propositions de renforcement.",
    niveauExigence: "normal",
    actif: true,
    icone: "graduation-cap",
  },
  {
    id: "agent-coherence-erp",
    nom: "Cohérence ERP",
    role: "Mapping / typage / traduction ERP",
    competences: ["cibles", "typage", "visibilité", "ERP", "stock", "production", "compétences"],
    mission:
      "Contrôler que chaque cible de conséquence existe dans le GameState, que les modes set/add sont cohérents, et que la traduction vers ERP / stock / production est correcte. Vérifie que chaque competenceId dans le Cœur existe dans le module Compétences, que chaque indicateurTeste existe dans la liste des indicateurs de cette compétence, et que chaque feedback est précis et lié à l'indicateur. Si un competenceId est inconnu, ou un indicateur est inconnu, ou un feedback est vague, signale « Utilisation imprécise » et bloque la validation.",
    sortieAttendue:
      "Rapport cohérence : cibles invalides, competenceId / indicateur / feedback imprécis, mapping ERP manquant, correctifs au format CŒUR.",
    niveauExigence: "strict",
    actif: true,
    icone: "database",
  },
  {
    id: "agent-orchestra",
    nom: "Orchestra",
    role: "verifier_architecture_et_coherence_application",
    competences: [
      "architecture",
      "coherence_globale",
      "detection_donnees_en_dur",
      "analyse_dependances",
      "esprit_critique",
    ],
    mission:
      "Vérifie l'architecture et la cohérence de l'application Keyber de façon détaillée et critique. Analyse : est-ce que le Cœur est bien la seule source de vérité ? Est-ce que le Moteur applyDecision lit et écrit uniquement dans le GameState ? Est-ce que le GameState est bien lu par l'ERP, le Dashboard, le Profil, le Journal ? Est-ce qu'il reste des données en dur dans l'UI, dans l'ERP, dans les décisions ? Est-ce que la Fiche génère bien le Cœur sans perdre d'information ? Est-ce que les Compétences sont bien référencées par id et par indicateur précis, et non en texte libre ? Est-ce que la sauvegarde locale et cloud sont bien séparées et ne se mélangent pas ? Est-ce que les modules Workflow, Cœur, Fiches, Compétences respectent bien la séparation lecture / écriture ? Sois très critique, détaillé, sans complaisance. Signale chaque incohérence, chaque donnée en dur, chaque dépendance circulaire, chaque violation du principe 'Une seule vérité = Cœur'.",
    sortieAttendue:
      "rapport_architecture avec score global 0-100, liste des incohérences par gravité (critique / majeure / mineure), liste des données en dur détectées avec leur fichier et leur ligne, liste des dépendances problématiques, propositions de correction précises avec fichier et action à faire",
    niveauExigence: "strict",
    actif: true,
    icone: "network",
  },
  {
    id: "agent-ergonomie",
    nom: "Ergonomie",
    role: "verifier_ergonomie_et_facilite_utilisation",
    competences: [
      "ergonomie",
      "ux",
      "prise_en_main",
      "clarte_interface",
      "accessibilite",
    ],
    mission:
      "Se concentre sur l'aspect ergonomique de Keyber. Vérifie que l'application est très ergonomique, facile d'utilisation et de prise en main par les utilisateurs (joueurs et admins). Analyse : est-ce qu'un joueur qui arrive pour la première fois comprend où cliquer ? Est-ce que l'Ordinateur ressemble à un vrai ordinateur ? Est-ce que l'ERP est lisible sans être surchargé ? Est-ce qu'il y a trop d'informations sur une seule page (règle 1 écran = 1 question / 1 décision) ? Est-ce que les boutons sont assez grands et bien placés ? Est-ce que les textes sont trop longs ou trop techniques ? Est-ce que les icônes aident vraiment à comprendre ? Est-ce que le Glossaire et le Journal des décisions sont trouvables facilement ? Est-ce que le Workflow avec ses 4 sous-onglets est clair ou trop chargé ? Propose des simplifications, des reformulations, des suppressions si nécessaire. Sois très exigeant sur la facilité.",
    sortieAttendue:
      "rapport_ergonomie avec score 0-100, liste des problèmes d'ergonomie par page (ex : 'Page Logique Scénario : schéma trop serré, difficile à lire sur mobile', 'Page Fiche détail : 4 sections trop longues, l'utilisateur doit scroller trop'), propositions concrètes (ex : 'Réduire le texte de 50%', 'Mettre ce bouton en primaire', 'Supprimer cette colonne'), suggestions de tests utilisateurs",
    niveauExigence: "strict",
    actif: true,
    icone: "hand",
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
    // Prefer seed mission for built-in agents so competence locks stay current
    mission: seed?.mission ?? a.mission ?? "",
    sortieAttendue: seed?.sortieAttendue ?? a.sortieAttendue ?? "",
    niveauExigence: a.niveauExigence ?? seed?.niveauExigence ?? "normal",
    actif: a.actif ?? true,
    icone: seed?.icone ?? a.icone ?? "target",
  };
}

export const EXIGENCE_LABELS: Record<AgentExigence, string> = {
  tolerant: "Tolérant",
  normal: "Normal",
  strict: "Strict",
};
