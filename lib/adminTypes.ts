/** Admin / Studio content model — independent from player GameState. */

export type AdminScenarioStatus =
  | "brouillon"
  | "publie"
  | "archive"
  | "en_attente";

export type AdminNiveau = "debutant" | "intermediaire" | "expert";

export const ADMIN_SECTEURS = [
  "Industrie",
  "Commercial",
  "RH",
  "Logistique",
  "DG",
  "Finance",
] as const;

export type AdminSecteur = (typeof ADMIN_SECTEURS)[number] | string;

export const ADMIN_NIVEAUX: { value: AdminNiveau; label: string }[] = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "expert", label: "Expert" },
];

export const ADMIN_STATUTS: { value: AdminScenarioStatus; label: string }[] = [
  { value: "brouillon", label: "Brouillon" },
  { value: "publie", label: "Publié" },
  { value: "archive", label: "Archivé" },
  { value: "en_attente", label: "En attente de validation" },
];

export const ADMIN_EVENT_TYPES = [
  "Email",
  "Rumeur",
  "Panne",
  "Nouveau client",
  "Chat",
  "Autre",
] as const;

export type AdminEventType = (typeof ADMIN_EVENT_TYPES)[number];

export const AVATAR_STYLES = [
  { id: "pers-marie", label: "Marie (veste bleue)" },
  { id: "pers-karim", label: "Karim (polo gris)" },
  { id: "pers-laurent", label: "Laurent (costume)" },
  { id: "pers-henri", label: "Henri (mentor)" },
  { id: "custom", label: "Autre / à définir" },
] as const;

export type AdminConsequence = {
  metric: string;
  delta: number;
  /** Preserved from engine data so Studio edits keep set vs add semantics. */
  mode?: "add" | "set";
  setValeur?: string;
};

export type AdminChoice = {
  id: string;
  texte: string;
  consequences: AdminConsequence[];
};

export type AdminDecision = {
  id: string;
  scenarioId: string;
  titre: string;
  jour: number;
  heure: string;
  dilemme: string;
  choix: AdminChoice[];
  order: number;
};

export type AdminEvent = {
  id: string;
  scenarioId: string;
  titre: string;
  jour: number;
  heure: string;
  type: AdminEventType;
  texte: string;
  order: number;
};

export type AdminDialogueChoice = {
  id: string;
  texte: string;
  reponse: string;
  consequences: AdminConsequence[];
};

export type AdminDialogue = {
  id: string;
  question: string;
  choices: AdminDialogueChoice[];
};

export type AdminPersonnage = {
  id: string;
  prenom: string;
  nom: string;
  age: number;
  poste: string;
  entrepriseId: string | null;
  scenarioIds: string[];
  caractere: string;
  confianceDepart: number;
  avatarStyle: string;
  description: string;
  dialogues: AdminDialogue[];
};

export type AdminEntreprise = {
  id: string;
  nom: string;
  ville: string;
  secteur: string;
  histoire: string;
  activite: string;
  produitsPhares: [string, string, string];
  chiffresCles: {
    ca: string;
    employes: number;
    machines: number;
    satisfaction: string;
  };
  valeurs: string[];
  glossaire: { terme: string; definition: string }[];
  scenarioIds: string[];
};

export type AdminScenario = {
  id: string;
  titre: string;
  secteur: string;
  competence: string;
  niveau: AdminNiveau;
  dureeJours: number;
  description: string;
  entrepriseId: string | null;
  statut: AdminScenarioStatus;
  order: number;
  consultantPercent?: number;
  submittedBy?: string;
};

export type AdminConsultantSubmission = {
  id: string;
  scenarioId: string;
  titre: string;
  consultantName: string;
  percent: number;
  status: "en_attente" | "valide" | "refuse";
  submittedAt: string;
  notes?: string;
};

/** Per-scenario CŒUR documents (Admin Studio source of truth). */
export type AdminCoeurMap = Record<string, import("./adminCoeur").ScenarioCoeur>;

export type AdminState = {
  scenarios: AdminScenario[];
  entreprises: AdminEntreprise[];
  personnages: AdminPersonnage[];
  decisions: AdminDecision[];
  events: AdminEvent[];
  /** Rich real-world intake sheets (module Fiches). */
  fiches: import("./adminFiches").AdminFiche[];
  /** Single source of truth for decisions & events per scenario. */
  coeurs: AdminCoeurMap;
  /** Versions, audit, highlights per scenario. */
  coeurMeta: import("./coeurHistory").CoeurMetaMap;
  /** Global agent profiles (pilot the CŒUR). */
  agents: import("./agents").AgentProfile[];
  /** Last multi-agent run reports (global). */
  agentReports: import("./agents").AgentRunReport[];
  consultants: AdminConsultantSubmission[];
  toast: string | null;
};

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function statusLabel(s: AdminScenarioStatus) {
  return ADMIN_STATUTS.find((x) => x.value === s)?.label ?? s;
}

export function niveauLabel(n: AdminNiveau) {
  return ADMIN_NIVEAUX.find((x) => x.value === n)?.label ?? n;
}
