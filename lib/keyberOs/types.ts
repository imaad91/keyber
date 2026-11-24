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
import type { OsParamLoadSource } from "@/lib/keyberOs/paramLoader";

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

/** Conséquence déclarative (fichier de paramétrage) — Étape 14. */
export type OsConsequence = {
  /** Chemin cible : tresorerie, stock, moral, ethique, xp, flags.x, relations.id… */
  cible: string;
  valeur: number;
  mode?: "add" | "set";
  setValeur?: string;
};

export type OsChoiceImpact = {
  label: string;
  value: string;
  tone: "pos" | "neg" | "neu";
};

/** Impact compétence sur un choix (feeling CompetenceImpact POC). */
export type OsSkillImpact = {
  /** Id Atelier / slug param — jamais un nom Novacier hardcodé. */
  competenceId: string;
  type?: "generale" | "ciblee";
  xp: number;
  feedback?: string;
  indicateurIndex?: number;
};

export type OsChoice = {
  id: string;
  label: string;
  description?: string;
  feedbackTexte?: string;
  consequences?: OsConsequence[];
  impacts?: OsChoiceImpact[];
  /** XP compétences précises pour ce choix. */
  competenceImpacts?: OsSkillImpact[];
};

export type OsDecision = {
  id: string;
  titre: string;
  dilemme?: string;
  jour?: number;
  xpGagne?: number;
  /** Compétence scénario (Mode Compétence) — id param. */
  competenceId?: string;
  options: OsChoice[];
};

/** Entrée catalogue compétences session (labels depuis param). */
export type OsSkillCatalogEntry = {
  id: string;
  nom: string;
  type: "generale" | "ciblee";
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
  /** Labels issus du param (pas de catalogue hardcodé). */
  catalog?: OsSkillCatalogEntry[];
};

/** Capteur / investissement Visibilité (inventaire param). */
export type OsSensor = {
  id: string;
  label: string;
  description: string;
  cost: number;
  /** Niveau global atteint à l'installation (1–3). */
  unlockLevel: number;
  /** KPI / modules clarifiés (parModule → PRECIS ou TEMPS_REEL). */
  modules?: string[];
  installed?: boolean;
};

export type OsVisibilityInvestment = {
  level: 1 | 2 | 3;
  label: string;
  description: string;
  cost: number;
};

export type OsVisibiliteBlock = {
  level: number;
  sensorInstalled: boolean;
  /** Tiers par module / kpi id. */
  parModule: Record<string, OsVisibilityTier>;
  /** Inventaire capteurs (param / Admin). */
  sensors: OsSensor[];
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

/** Choix de dialogue interview (feeling POC DialogueChoice). */
export type OsDialogueChoice = {
  id: string;
  texte: string;
  reponse: string;
  confianceDelta: number;
  unlockInfo?: string;
  xp?: number;
  consequences?: OsConsequence[];
};

export type OsDialogueQuestion = {
  id: string;
  texte: string;
  choices: OsDialogueChoice[];
};

export type OsInterview = {
  id: string;
  nom: string;
  role: string;
  /** Phrase d'accroche sous le portrait. */
  phrase?: string;
  bio?: string;
  /** Confiance initiale (slot relations[id]). */
  relationConfiance?: number;
  /** Lignes Q/A plates (compat / chat rapide). */
  lines: { q: string; a: string }[];
  /** Questions à choix (Étape 16). */
  questions?: OsDialogueQuestion[];
};

export type OsObjective = {
  id: string;
  titre: string;
  type: "JOURNALIER" | "HEBDOMADAIRE" | "ANNUEL" | string;
  status: "EN_COURS" | "COMPLETE" | "ECHOUE";
  /** Libellé cible affiché (ex. « Stock ≥ 80 »). */
  cible: string;
  description?: string;
  /** Progression numérique actuelle (barre). */
  progression?: number;
  /** Seuil numérique pour COMPLETE. */
  cibleNombre?: number;
  xp?: number;
  /**
   * Métrique à évaluer : stock, stepIndex, emailsReadUrgent,
   * piecesBrutesSemaine, moral, relations.<id>, flags.<k>…
   */
  metric?: string;
  /** Comparaison vs cibleNombre (défaut gte). */
  op?: "gte" | "lte" | "eq";
  /** Si true, ECHOUE au DayEnd si encore EN_COURS. */
  failOnDayEnd?: boolean;
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
  /** Étape 30 — fin param matchée. */
  matchedFinId?: string | null;
  matchedFinLabel?: string | null;
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
  /** Séries graphiques Dashboard (prod / pannes), génériques. */
  dashboardSeries: { name: string; prod: number; panne: number }[];
};

/**
 * État générique de session OS (alimenté par les fichiers de paramétrage).
 * Blocs riches + miroirs plats (compat pipeline existant).
 */
export type OsPlayState = {
  sessionId: string;
  param: ScenarioParamFile;
  /** Étape 36 — provenance du param (disk | embedded), jamais Novacier. */
  paramSource?: OsParamLoadSource | null;
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
  /** Clear Campus Phase 2 — navigation monde (optionnel sur saves anciens). */
  campus?: {
    currentWingId: string | null;
    currentRoomId: string | null;
    unlockedWingIds: string[];
    unlockedRoomIds: string[];
    selectedHotspotId: string | null;
  };
  /** Clear Campus Phase 2 — runtime Vue Live Production. */
  productionLiveRuntime?: {
    nodeStatus: Record<string, string>;
    vehicleZone: Record<string, string>;
    tick: number;
  };
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
  | "cycle-vie"
  | "notifications"
  | "interviews"
  | "relations"
  | "objectifs"
  | "visibilite"
  | "journal"
  | "livre"
  | "profil"
  | "fins"
  | "campus"
  | "production-live";
