/**
 * Types partagés Keyber OS — aucun nom d'entreprise.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import type {
  BrowserResult,
  ChatContact,
  ClientRow,
  CommandeRow,
  DocItem,
  EmployeRow,
  FactureRow,
  FournisseurRow,
  MachineRow,
  ProductionRow,
  StockRow,
} from "@/lib/computerTypes";

export type OsChoice = {
  id: string;
  label: string;
};

export type OsDecision = {
  id: string;
  titre: string;
  options: OsChoice[];
};

export type OsEmail = {
  id: string;
  from: string;
  subject: string;
  body: string;
  day: number;
  read: boolean;
};

export type OsChatThread = {
  contactId: string;
  messages: { from: "me" | "them"; text: string }[];
};

export type OsInterview = {
  id: string;
  nom: string;
  role: string;
  lines: { q: string; a: string }[];
};

export type OsObjective = {
  id: string;
  titre: string;
  type: "JOURNALIER" | "HEBDOMADAIRE" | "ANNUEL";
  status: "EN_COURS" | "COMPLETE" | "ECHOUE";
  cible: string;
};

export type OsComputerPack = {
  stock: StockRow[];
  commandes: CommandeRow[];
  production: ProductionRow[];
  employes: EmployeRow[];
  factures: FactureRow[];
  machines: MachineRow[];
  clients: ClientRow[];
  fournisseurs: FournisseurRow[];
  emails: OsEmail[];
  chatContacts: ChatContact[];
  chatThreads: OsChatThread[];
  documents: DocItem[];
  browser: BrowserResult[];
  dashboardCards: { label: string; value: string }[];
};

export type OsPlayerAction =
  | "computer"
  | "decide"
  | "interview"
  | "atelier-live"
  | null;

export type OsComputerAppId =
  | "erp"
  | "mail"
  | "dashboard"
  | "documents"
  | "chat"
  | "browser";

/** État générique de session OS (alimenté par les fichiers de paramétrage). */
export type OsPlayState = {
  sessionId: string;
  param: ScenarioParamFile;
  stepIndex: number;
  decisions: OsDecision[];
  eventsFired: string[];
  tresorerieBrute: number;
  stock: number;
  production: number;
  commandes: number;
  xp: number;
  niveau: number;
  score: number;
  log: string[];
  finished: boolean;
  feedback: string | null;
  /** Temps */
  day: number;
  week: number;
  minutesSinceStart: number;
  dayLengthMinutes: number;
  /** Visibilité ERP */
  visibilityLevel: number;
  sensorInstalled: boolean;
  /** UI shell */
  activeAction: OsPlayerAction;
  computerApp: OsComputerAppId | null;
  selectedInterviewId: string | null;
  /** Pack Ordinateur + contenu social */
  computer: OsComputerPack;
  interviews: OsInterview[];
  objectives: OsObjective[];
};

export type OsErpSnapshot = {
  tresorerie: number;
  tresorerieBrute: number;
  facteur: number;
  formule: string;
  stock: number;
  production: number;
  commandes: number;
  fournisseurs: number;
  clients: number;
  equipe: number;
  fog: boolean;
};

export type OsModuleId =
  | "donnees-sauvegarde"
  | "moteur-scenarios"
  | "moteur-decisions"
  | "moteur-evenements"
  | "erp"
  | "progression"
  | "interface-joueur"
  | "ordinateur"
  | "temps"
  | "interviews"
  | "objectifs"
  | "visibilite";
