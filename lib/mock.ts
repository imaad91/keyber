import type {
  Action,
  Badge,
  KpiDefinition,
  Role,
  Skill,
  VisibilityInvestment,
} from "./types";
import type { GameState } from "./gameState";
import { syncMetaClock } from "./gameState";
import { checkEvenements } from "./evenements";
import {
  COMPETENCES_CIBLEES_PROD,
  COMPETENCES_GENERALES,
  emptyCibleesProgress,
  emptyGeneralesProgress,
} from "./competences";
import { getContexteActif, getScenarioActif } from "@/data/registry";
import {
  emailsForDay,
  eventsForDay,
  getChaptersActifs,
  getLivreActif,
  getMachinesActives,
  getObjectivesActifs,
  getPersonnagesActifs,
  getRumorActif,
  messagesForDay,
} from "./scenario";

/** Prefer getContexteActif().nom — Company label from active contexte. */
export function getCompanyName(): string {
  return getContexteActif().nom;
}
export const COMPANY_NAME = "Entreprise";
export const SCENARIO_NAME = "Scénario actif";
export {
  getLivreActif as getLivre,
  getPersonnagesActifs as getExamplePersonnages,
  getMachinesActives as getExampleMachines,
  getObjectivesActifs as getExampleObjectives,
  getChaptersActifs as getExampleChapters,
};
export const exampleNewMachine = {
  id: "m5",
  nom: "Ligne Flex 5",
  etat: "PRODUCTION" as const,
  production: 28,
  nextMaintenance: "J+10",
  x: 18,
  y: 62,
};

const SKILL_ICONS: Record<string, string> = {
  negociation: "Handshake",
  gestion_crise: "Siren",
  leadership: "Users",
  decision_incertitude: "Eye",
  communication: "MessagesSquare",
  priorisation: "ListOrdered",
  planification_mrp: "CalendarRange",
  gestion_stocks: "Package",
  maintenance: "Wrench",
  qualite: "BadgeCheck",
  ordonnancement: "Factory",
};

/** Flat list for legacy UI — préférer COMPETENCES_GENERALES / CIBLEES. */
export const skills: Skill[] = [
  ...COMPETENCES_GENERALES,
  ...COMPETENCES_CIBLEES_PROD,
].map((c) => ({
  id: c.id,
  nom: c.nom,
  description: c.descriptionPrecise,
  niveau: 1,
  xp: 0,
  xpMax: 500,
  scenarioIds: [],
  icone: SKILL_ICONS[c.id] ?? "Package",
}));

/** Role shells — narrative copy comes from getContexteActif().runtime. */
export const roles: Role[] = [
  {
    id: "prod",
    titre: "Responsable de Production",
    description: "Scénario histoire — production.",
    icone: "Factory",
    focus: ["Atelier", "Qualité", "Client"],
    introLines: [
      "Lundi 8h00. Tu prends les commandes en production.",
      "Cette semaine décide de tout.",
      "Lis tes mails, parle à l'atelier, ouvre l'ERP.",
    ],
  },
  {
    id: "commercial",
    titre: "Commercial",
    description: "Disponible plus tard — POC centré Production.",
    icone: "Briefcase",
    focus: ["Clients", "Contrats"],
    introLines: [
      "Mode non jouable dans ce POC — choisis Responsable de Production.",
    ],
  },
  {
    id: "dg",
    titre: "Directeur Général",
    description: "Disponible plus tard — POC centré Production.",
    icone: "Crown",
    focus: ["Vision", "Cash"],
    introLines: [
      "Mode non jouable dans ce POC — choisis Responsable de Production.",
    ],
  },
  {
    id: "logistique",
    titre: "Logistique",
    description: "Disponible plus tard — POC centré Production.",
    icone: "Truck",
    focus: ["Stock", "Délais"],
    introLines: [
      "Mode non jouable dans ce POC — choisis Responsable de Production.",
    ],
  },
];

export const kpiDefinitions: KpiDefinition[] = [
  {
    id: "tresorerie",
    label: "Trésorerie",
    format: "money",
    estimatedValue: 400_000,
    preciseValue: 420_000,
  },
  {
    id: "production",
    label: "Prod / jour",
    format: "number",
    estimatedValue: 55,
    preciseValue: 60,
  },
  {
    id: "rebut",
    label: "Taux rebut",
    format: "percent",
    estimatedValue: 10,
    preciseValue: 18,
  },
  {
    id: "pieces",
    label: "Qualité sem.",
    format: "number",
    estimatedValue: 0,
    preciseValue: 0,
  },
  {
    id: "moral",
    label: "Moral",
    unit: "/100",
    format: "number",
    estimatedValue: 50,
    preciseValue: 55,
  },
  {
    id: "ethique",
    label: "Éthique",
    unit: "/100",
    format: "number",
    estimatedValue: 80,
    preciseValue: 80,
  },
];

export const visibilityInvestments: VisibilityInvestment[] = [
  {
    level: 1,
    label: "Suivi Excel",
    cost: 2_000,
    description: "Estimations retardées.",
  },
  {
    level: 2,
    label: "Capteur IoT ligne critique",
    cost: 5_000,
    description: "KPIs réels — cœur du Jour 1.",
  },
  {
    level: 3,
    label: "ERP + Analyste",
    cost: 40_000,
    description: "Temps réel + prédictions.",
  },
];

export const exampleActions: Action[] = [
  {
    id: "act-computer",
    type: "ACCESS_COMPUTER",
    titre: "Accès Ordinateur",
    icone: "Monitor",
    description: "ERP, mails, chat…",
    timeCostMinutes: 0,
  },
  {
    id: "act-interview",
    type: "INTERVIEW",
    titre: "Interview",
    icone: "MessagesSquare",
    description: "Équipe atelier & direction…",
    timeCostMinutes: 30,
  },
  {
    id: "act-decide",
    type: "DECIDE",
    titre: "Décider",
    icone: "Scale",
    description: "Décision du jour",
    timeCostMinutes: 30,
  },
  {
    id: "act-atelier",
    type: "VIEW_ATELIER_LIVE",
    titre: "Atelier Live",
    icone: "Factory",
    description: "Vue 2D machines",
    timeCostMinutes: 10,
  },
];

export const onboardingStepsMeta = [
  {
    step: 1 as const,
    titre: "Visite Atelier Live",
    mentorLine: "Ouvre l'Atelier — vois les 4 machines avant de décider.",
    unlock: "VIEW_ATELIER_LIVE" as const,
    actionHint: "VIEW_ATELIER_LIVE" as const,
  },
  {
    step: 2 as const,
    titre: "Parler à l'atelier",
    mentorLine: "La cheffe d'atelier te jauge. Interviewe-la.",
    unlock: "INTERVIEW" as const,
    actionHint: "INTERVIEW" as const,
  },
  {
    step: 3 as const,
    titre: "Accès Ordinateur",
    mentorLine:
      "Ouvre l'ordinateur — ERP, mails et chat sont dessus.",
    unlock: "ACCESS_COMPUTER" as const,
    actionHint: "ACCESS_COMPUTER" as const,
  },
  {
    step: 4 as const,
    titre: "Lancer la semaine",
    mentorLine:
      "Objectif du jour : découvrir la vraie cause du retard. Puis Décider à 12h.",
    unlock: "ALL" as const,
    actionHint: "DECIDE" as const,
  },
];

export function getExampleDecisions() {
  return getScenarioActif().decisions;
}

export const exampleBadges: Badge[] = [
  {
    id: "badge-first",
    titre: "Première décision",
    description: "Valider une décision de la semaine.",
    unlocked: false,
  },
  {
    id: "badge-eye",
    titre: "Œil ouvert",
    description: "Installer le capteur / lever le brouillard.",
    unlocked: false,
  },
  {
    id: "badge-atelier",
    titre: "Chef d'atelier",
    description: "Ouvrir l'Atelier Live.",
    unlocked: false,
  },
  {
    id: "badge-jour0",
    titre: "Brief mentor",
    description: "Terminer le parcours d'arrivée.",
    unlocked: false,
  },
  {
    id: "badge-livre",
    titre: "Mémoire de l'entreprise",
    description: "Ouvrir le Livre.",
    unlocked: false,
  },
  {
    id: "badge-ethique",
    titre: "Ligne rouge",
    description: "Refuser de livrer les pièces défectueuses.",
    unlocked: false,
  },
  {
    id: "badge-victoire",
    titre: "Contrat sauvé",
    description: "Victoire — contrat client tenu.",
    unlocked: false,
  },
];

export const exampleEmails = emailsForDay(1);
export const exampleMessages = messagesForDay(1);
export const exampleEvents = eventsForDay(1);
export const exampleRumors = [getRumorActif()];

export const erpStock = [
  { id: "ST-01", article: "Acier 2mm", qty: 850, seuil: 200, statut: "OK" },
  { id: "ST-02", article: "Vis M6", qty: 85, seuil: 150, statut: "BAS" },
  { id: "ST-03", article: "Joints NBR", qty: 310, seuil: 100, statut: "OK" },
  {
    id: "ST-04",
    article: "Supports A-42 brut",
    qty: 120,
    seuil: 80,
    statut: "OK",
  },
];

export const erpOrders = [
  {
    id: "CMD-AV-500",
    client: "Client stratégique",
    montant: 186000,
    statut: "Critique",
    echeance: "Vendredi 16h",
  },
  {
    id: "CMD-1043",
    client: "Nord Méca",
    montant: 12400,
    statut: "Validée",
    echeance: "J+5",
  },
];

export const erpEmployees = [
  {
    id: "E-12",
    nom: "Cheffe d'atelier",
    poste: "Cheffe d'atelier",
    shift: "Matin",
  },
  {
    id: "E-18",
    nom: "Technicien maintenance",
    poste: "Technicien Maintenance",
    shift: "Journée",
  },
  {
    id: "E-01",
    nom: "Directeur",
    poste: "Directeur",
    shift: "—",
  },
];

export const erpInvoices = [
  { id: "FAC-880", client: "Client stratégique", montant: 42000, statut: "En cours" },
  { id: "FAC-881", client: "Nord Méca", montant: 6400, statut: "Payée" },
];

export const erpMachinesTable = [
  { id: "m1", nom: "Presse 1", etat: "PRODUCTION", oee: "78%" },
  { id: "m2", nom: "CNC 2", etat: "PRODUCTION", oee: "74%" },
  { id: "m3", nom: "Assembleuse 3", etat: "Capteur HS", oee: "???" },
  { id: "m4", nom: "Contrôle Q4", etat: "ARRET", oee: "—" },
];

export const dashboardSeries = [
  { name: "J1", prod: 60, panne: 4 },
  { name: "J2", prod: 60, panne: 5 },
  { name: "J3", prod: 40, panne: 18 },
  { name: "J4", prod: 55, panne: 8 },
  { name: "J5", prod: 70, panne: 6 },
];

export const analyzeSeries = [
  { periode: "S-2", actuel: 48, precedent: 52 },
  { periode: "S-1", actuel: 44, precedent: 48 },
  { periode: "S", actuel: 40, precedent: 44 },
];

export const skillEvolution = [
  { mois: "S0", nego: 1, crise: 1, lead: 1, stock: 1 },
  { mois: "S1", nego: 1, crise: 2, lead: 2, stock: 1 },
];

const ALL_ACTIONS: GameState["world"]["unlockedActions"] = [
  "ACCESS_COMPUTER",
  "INTERVIEW",
  "DECIDE",
  "VIEW_ATELIER_LIVE",
];

export function createInitialGameState(): GameState {
  const scenario = getScenarioActif();
  const base = scenario.createInitial();
  const competencesGenerales = emptyGeneralesProgress();
  const competencesCiblees = emptyCibleesProgress("prod");
  const skillProgress = {
    ...Object.fromEntries(
      Object.entries(competencesGenerales).map(([id, p]) => [
        id,
        { niveau: p.niveau, xp: p.xp },
      ])
    ),
    ...Object.fromEntries(
      Object.entries(competencesCiblees).map(([id, p]) => [
        id,
        { niveau: p.niveau, xp: p.xp },
      ])
    ),
  };
  return syncMetaClock({
    ...base,
    modeActuel: base.modeActuel ?? null,
    scenarioCompetenceId: base.scenarioCompetenceId ?? null,
    scenarioHistoireId: base.scenarioHistoireId ?? scenario.id,
    progression: {
      ...base.progression,
      competencesGenerales,
      competencesCiblees,
    },
    flags: { ...base.flags, tauxPanne: 5 },
    world: {
      ...base.world,
      machines: getMachinesActives().map((m) => ({ ...m })),
      objectives: getObjectivesActifs().map((o) => ({ ...o })),
      events: eventsForDay(1),
      emails: emailsForDay(1),
      messages: messagesForDay(1),
      rumors: [{ ...getRumorActif() }],
      badges: exampleBadges.map((b) => ({ ...b })),
      skillProgress,
      trainingsCompleted: base.world.trainingsCompleted ?? [],
      histoiresCompleted: base.world.histoiresCompleted ?? [],
      trainingPrompt: null,
      lastSkillDebrief: [],
      eventNotifications: base.world.eventNotifications ?? [],
      urgentBanner: base.world.urgentBanner ?? null,
      showDayEnd: false,
      chapters: getChaptersActifs().map((c) => ({ ...c })),
      unlockedActions: ["ACCESS_COMPUTER", "VIEW_ATELIER_LIVE"],
    },
  });
}

/** Patch world content when entering a scenario day (keeps finance/relations). */
export function createScenarioDayState(
  from: GameState,
  day: number
): GameState {
  const base = syncMetaClock({
    ...from,
    meta: {
      ...from.meta,
      jourActuel: day,
      minutesSinceStart: 0,
    },
    finance: {
      ...from.finance,
      piecesAujourdhui: 0,
    },
    world: {
      ...from.world,
      dayDecisionId: null,
      showDayEnd: false,
      urgentBanner: null,
      emails: emailsForDay(day),
      messages: messagesForDay(day),
      events: eventsForDay(day),
      rumors:
        day >= 2
          ? [
              {
                ...getRumorActif(),
                verified: from.world.unlockedInfos.includes("RUMEUR_CONFIRMED")
                  ? true
                  : from.world.unlockedInfos.includes("RUMEUR_PARTIELLE")
                    ? true
                    : null,
              },
            ]
          : from.world.rumors,
      alarmActive: false,
      feedbackFlash: from.world.feedbackFlash,
    },
    flags: {
      ...from.flags,
      alarmActive: 0,
    },
  });
  return checkEvenements(base);
}

export { ALL_ACTIONS };
export function getDayDecisions() {
  return Object.fromEntries(
    getScenarioActif().decisions.map((d) => [d.jour, d.choix])
  );
}
export const initialGameState = createInitialGameState();
