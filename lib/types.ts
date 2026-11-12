export type VisibilityLevel = "INCONNU" | "ESTIME" | "PRECIS" | "TEMPS_REEL";

export type ObjectiveType = "JOURNALIER" | "HEBDOMADAIRE" | "ANNUEL";

export type ObjectiveStatus = "EN_COURS" | "COMPLETE" | "ECHOUE";

export type MachineEtat = "PRODUCTION" | "PANNE" | "ARRET";

export type ActionType =
  | "ACCESS_COMPUTER"
  | "INTERVIEW"
  | "DECIDE"
  | "VIEW_ATELIER_LIVE";

/** Apps inside Accès Ordinateur desktop */
export type ComputerAppId =
  | "erp"
  | "mail"
  | "dashboard"
  | "documents"
  | "chat"
  | "browser";

export type EventKind =
  | "CLIENT"
  | "CONTRAT"
  | "MACHINE"
  | "RH"
  | "RUMEUR"
  | "AUTRE";

export type Skill = {
  id: string;
  nom: string;
  description: string;
  niveau: number;
  xp: number;
  xpMax: number;
  scenarioIds: string[];
  icone: string;
};

export type Role = {
  id: string;
  titre: string;
  description: string;
  icone: string;
  focus: string[];
  introLines: string[];
};

export type Objective = {
  id: string;
  type: ObjectiveType;
  titre: string;
  description: string;
  progression: number;
  cible: number;
  xp: number;
  status: ObjectiveStatus;
};

export type CompanyEvent = {
  id: string;
  kind: EventKind;
  titre: string;
  description: string;
  timestamp: string;
  isRumor?: boolean;
  rumorResolved?: boolean | null;
};

export type Action = {
  id: string;
  type: ActionType;
  titre: string;
  icone: string;
  description: string;
  timeCostMinutes: number;
};

export type DialogueChoice = {
  id: string;
  texte: string;
  reponse: string;
  confianceDelta: number;
  unlockInfo?: string;
  xp?: number;
};

export type DialogueQuestion = {
  id: string;
  texte: string;
  choices: DialogueChoice[];
};

export type Personnage = {
  id: string;
  nom: string;
  role: string;
  avatar: string;
  bio: string;
  phrase: string;
  isMentor?: boolean;
  relationConfiance: number;
  questions: DialogueQuestion[];
};

export type DecisionImpact = {
  label: string;
  value: string;
  tone: "pos" | "neg" | "neu";
};

export type EndingKind = "VICTOIRE" | "PARTIELLE" | "ECHEC" | null;

/** @deprecated Prefer Decision from @/lib/decisions — kept for transitional UI helpers */
export type LegacyDecisionOption = {
  id: string;
  titre: string;
  description: string;
  categorie: string;
  impacts: DecisionImpact[];
  deltas?: Partial<Record<string, number>>;
  visibilityUpgrade?: 1 | 2 | 3;
  machineEffects?: { machineId: string; etat: MachineEtat }[];
  unlockMachine?: Machine;
  xpReward?: number;
  timeCostMinutes: number;
  costEuros?: number;
  journalNarration?: string;
};

export type { Decision, DecisionChoix } from "./decisions";
export type { GameState } from "./gameState";

export type Email = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  urgent?: boolean;
};

export type ChatMessage = {
  id: string;
  from: string;
  role: string;
  text: string;
  time: string;
  alert?: boolean;
  mentor?: boolean;
};

export type Rumor = {
  id: string;
  titre: string;
  texte: string;
  verified: boolean | null;
  eventId: string;
};

export type Machine = {
  id: string;
  nom: string;
  etat: MachineEtat;
  production: number;
  nextMaintenance: string;
  x: number;
  y: number;
};

export type KpiDefinition = {
  id: string;
  label: string;
  unit?: string;
  format: "money" | "number" | "percent";
  estimatedValue: number;
  preciseValue: number;
};

export type VisibilityInvestment = {
  level: 0 | 1 | 2 | 3;
  label: string;
  cost: number;
  description: string;
};

export type Badge = {
  id: string;
  titre: string;
  description: string;
  unlocked: boolean;
};

export type DecisionHistoryItem = {
  id: string;
  titre: string;
  at: string;
  xp: number;
};

export type JournalEntry = {
  id: string;
  day: number;
  titre: string;
  narration: string;
  xp: number;
  at: string;
};

export type Chapitre = {
  id: string;
  numero: number;
  titre: string;
  intro: string;
  objectif: string;
  fin: string;
  status: "VERROUILLE" | "ACTIF" | "TERMINE";
};

export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

export type LivreHistoire = {
  fondation: string;
  datesCles: { annee: string; fait: string }[];
  anecdotes: string[];
  crisesPassees: string[];
  narratif: string;
};

export type LivreActivite = {
  ceQuOnFabrique: string;
  pourQui: string;
  produitsPhares: { nom: string; description: string }[];
  clientsPrincipaux: string[];
};

export type LivreOrganigrammeEntry = {
  personnageId: string;
};

export type LivreChiffresCles = {
  ca: string;
  employes: number;
  machines: number;
  clients: number;
  satisfaction: string;
};

export type LivreValeur = {
  titre: string;
  description: string;
};

export type GlossaireEntry = {
  terme: string;
  definition: string;
};

export type LivreEntreprise = {
  nom: string;
  slogan: string;
  histoire: LivreHistoire;
  activite: LivreActivite;
  organigramme: LivreOrganigrammeEntry[];
  chiffresCles: LivreChiffresCles;
  valeurs: LivreValeur[];
  glossaire: GlossaireEntry[];
};

export type GameMode = "skills" | "story" | null;

export type PlayTab = "workspace" | "emails" | "chat" | "feed";

export type { ActionType as EngineActionType } from "./gameState";
