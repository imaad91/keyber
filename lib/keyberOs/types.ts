/**
 * Types partagés Keyber OS — aucun nom d'entreprise.
 * Étape 1 V1 : schéma riche (équivalent GameState POC), générique et scalable.
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
  MaintenanceRow,
  ProductionRow,
  StockRow,
} from "@/lib/computerTypes";

/* ─── primitives ─── */

export type OsVisibilityTier = 0 | 1 | 2 | 3; // 0 Inconnu · 1 Estimé · 2 Précis · 3 Temps réel

export type OsEndingKind = "VICTOIRE" | "PARTIELLE" | "ECHEC" | null;

export type OsPhase =
  | "INTRO"
  | "ONBOARDING"
  | "JOUR"
  | "DAY_END"
  | "DEBRIEF"
  | "FIN";

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

export type OsChoice = {
  id: string;
  label: string;
};

export type OsDecision = {
  id: string;
  titre: string;
  options: OsChoice[];
};

export type OsDecisionRecord = {
  decisionId: string;
  jour: number;
  choixId: string;
  heure: string;
  label?: string;
};

export type OsCompetenceProgress = {
  niveau: number;
  xp: number;
  indicateursValides?: boolean[];
};

/* ─── blocs riches ─── */

export type OsMeta = {
  scenarioId: string;
  roleId: string | null;
  jourActuel: number;
  heureActuelle: string;
  tempsRestantMinutes: number;
  week: number;
  minutesSinceStart: number;
  dayLengthMinutes: number;
};

export type OsFinance = {
  tresorerie: number;
  stockKg: number;
  productionParJour: number;
  tauxRebut: number;
  qualite: number;
  piecesBrutesSemaine: number;
  piecesAujourdhui: number;
  commandes: number;
};

export type OsHumain = {
  moralEquipe: number;
  ethique: number;
  confianceClient: number;
};

export type OsProgressionBlock = {
  xp: number;
  niveau: number;
  score: number;
  competencesGenerales: Record<string, OsCompetenceProgress>;
  competencesCiblees: Record<string, OsCompetenceProgress>;
};

export type OsVisibiliteBlock = {
  level: number;
  sensorInstalled: boolean;
  /** Tiers par module / kpi id. */
  parModule: Record<string, OsVisibilityTier>;
};

export type OsHistorique = {
  decisionsPrises: OsDecisionRecord[];
  evenementsDeclenches: string[];
};

export type OsFlags = Record<string, number>;

export type OsEmail = {
  id: string;
  from: string;
  subject: string;
  body: string;
  day: number;
  read: boolean;
  preview?: string;
  time?: string;
  urgent?: boolean;
};

export type OsChatThread = {
  contactId: string;
  messages: { from: "me" | "them"; text: string; time?: string; alert?: boolean }[];
};

export type OsChatMessage = {
  id: string;
  from: string;
  role: string;
  text: string;
  time: string;
  alert?: boolean;
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
  type: "JOURNALIER" | "HEBDOMADAIRE" | "ANNUEL" | string;
  status: "EN_COURS" | "COMPLETE" | "ECHOUE";
  cible: string;
  description?: string;
  progression?: number;
  cibleNombre?: number;
  xp?: number;
};

export type OsBadge = {
  id: string;
  titre: string;
  description: string;
  unlocked: boolean;
};

export type OsJournalEntry = {
  id: string;
  day: number;
  titre: string;
  narration: string;
  xp: number;
  at: string;
};

export type OsChapter = {
  id: string;
  numero: number;
  titre: string;
  intro: string;
  objectif: string;
  fin: string;
  status: "VERROUILLE" | "ACTIF" | "TERMINE";
};

export type OsEventNotification = {
  id: string;
  titre: string;
  type: string;
  at: string;
};

export type OsUrgentBanner = {
  eventId: string;
  message: string;
  deadlineHeure: string;
} | null;

export type OsWorld = {
  phase: OsPhase;
  ending: OsEndingKind;
  showDayEnd: boolean;
  showDebrief: boolean;
  alarmActive: boolean;
  introSeen: boolean;
  onboardingStep: 0 | 1 | 2 | 3 | 4 | 5;
  onboardingDone: boolean;
  unlockedActions: OsPlayerAction[];
  dayDecisionId: string | null;
  chapterId: string;
  chapters: OsChapter[];
  journal: OsJournalEntry[];
  badges: OsBadge[];
  messages: OsChatMessage[];
  eventNotifications: OsEventNotification[];
  urgentBanner: OsUrgentBanner;
  lastSkillDebrief: string[];
};

export type OsKpiDef = {
  id: string;
  label: string;
  format: "number" | "percent" | "currency" | "text";
  path: string;
  unit?: string;
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
  maintenance?: MaintenanceRow[];
  emails: OsEmail[];
  chatContacts: ChatContact[];
  chatThreads: OsChatThread[];
  documents: DocItem[];
  browser: BrowserResult[];
  dashboardCards: { label: string; value: string }[];
};

/**
 * État générique de session OS (alimenté par les fichiers de paramétrage).
 * Blocs riches + miroirs plats (compat pipeline existant).
 */
export type OsPlayState = {
  sessionId: string;
  param: ScenarioParamFile;
  stepIndex: number;
  decisions: OsDecision[];
  eventsFired: string[];
  /** @deprecated miroir finance.tresorerie — garder sync */
  tresorerieBrute: number;
  /** @deprecated miroir finance.stockKg */
  stock: number;
  /** @deprecated miroir finance.productionParJour */
  production: number;
  /** @deprecated miroir finance.commandes */
  commandes: number;
  /** @deprecated miroir progression.xp */
  xp: number;
  /** @deprecated miroir progression.niveau */
  niveau: number;
  /** @deprecated miroir progression.score */
  score: number;
  log: string[];
  finished: boolean;
  feedback: string | null;
  /** @deprecated miroir meta.jourActuel */
  day: number;
  /** @deprecated miroir meta.week */
  week: number;
  /** @deprecated miroir meta.minutesSinceStart */
  minutesSinceStart: number;
  /** @deprecated miroir meta.dayLengthMinutes */
  dayLengthMinutes: number;
  /** @deprecated miroir visibilite.level */
  visibilityLevel: number;
  /** @deprecated miroir visibilite.sensorInstalled */
  sensorInstalled: boolean;
  activeAction: OsPlayerAction;
  computerApp: OsComputerAppId | null;
  selectedInterviewId: string | null;
  computer: OsComputerPack;
  interviews: OsInterview[];
  objectives: OsObjective[];
  /** Blocs riches (Étape 1) */
  meta: OsMeta;
  finance: OsFinance;
  humain: OsHumain;
  relations: Record<string, number>;
  progression: OsProgressionBlock;
  visibilite: OsVisibiliteBlock;
  historique: OsHistorique;
  flags: OsFlags;
  world: OsWorld;
  kpis: OsKpiDef[];
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
