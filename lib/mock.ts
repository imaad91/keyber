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
import { createNovacierInitialState } from "@/data/scenarioNovacier";
import { novacierDecisions } from "@/data/scenarioNovacier";
import {
  emailsForDay,
  eventsForDay,
  livreNovacier as livreFromScenario,
  messagesForDay,
  scenarioChapters,
  scenarioMachines,
  scenarioObjectives,
  scenarioPersonnages,
  scenarioRumor,
  SCENARIO_TITLE,
} from "./scenario";

export const COMPANY_NAME = "Novacier";
export const SCENARIO_NAME = SCENARIO_TITLE;
export const livreNovacier = livreFromScenario;
export const examplePersonnages = scenarioPersonnages;
export const exampleMachines = scenarioMachines;
export const exampleObjectives = scenarioObjectives;
export const exampleChapters = scenarioChapters;
export const exampleNewMachine = {
  id: "m5",
  nom: "Ligne Flex 5",
  etat: "PRODUCTION" as const,
  production: 28,
  nextMaintenance: "J+10",
  x: 18,
  y: 62,
};

export const skills: Skill[] = [
  {
    id: "negociation",
    nom: "Négociation",
    description: "Contrats et clients sous pression.",
    niveau: 1,
    xp: 40,
    xpMax: 400,
    scenarioIds: ["novacier"],
    icone: "Handshake",
  },
  {
    id: "crise",
    nom: "Gestion de crise",
    description: "Pannes, rebuts, délais.",
    niveau: 1,
    xp: 20,
    xpMax: 400,
    scenarioIds: ["novacier"],
    icone: "Siren",
  },
  {
    id: "leadership",
    nom: "Leadership",
    description: "Marie, Karim, l'atelier.",
    niveau: 1,
    xp: 30,
    xpMax: 400,
    scenarioIds: ["novacier"],
    icone: "Users",
  },
  {
    id: "stock",
    nom: "Gestion de stock",
    description: "Acier, sécurité, flux.",
    niveau: 1,
    xp: 10,
    xpMax: 400,
    scenarioIds: ["novacier"],
    icone: "Package",
  },
  {
    id: "data",
    nom: "Data & visibilité",
    description: "Capteurs, KPIs, brouillard.",
    niveau: 1,
    xp: 10,
    xpMax: 400,
    scenarioIds: ["novacier"],
    icone: "Eye",
  },
];

export const roles: Role[] = [
  {
    id: "prod",
    titre: "Responsable de Production",
    description:
      "Scénario POC : La Semaine Qui Décide De Tout — contrat AutoVolt.",
    icone: "Factory",
    focus: ["Atelier", "Qualité", "AutoVolt"],
    introLines: [
      "Lundi 8h00. Tu viens d'être nommé Responsable de Production chez Novacier.",
      "120 employés. Quatre machines. AutoVolt = 45 % du CA. En 2022, l'entreprise a failli mourir.",
      "Cette semaine décide de tout : 500 pièces qualité avant vendredi 16h. Laurent écrit déjà. Karim sait un secret. Marie te jauge.",
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
    label: "Capteur IoT Machine 3",
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
    timeCostMinutes: 5,
  },
  {
    id: "act-interview",
    type: "INTERVIEW",
    titre: "Interview",
    icone: "MessagesSquare",
    description: "Marie, Karim, Laurent…",
    timeCostMinutes: 20,
  },
  {
    id: "act-decide",
    type: "DECIDE",
    titre: "Décider",
    icone: "Scale",
    description: "Décision du jour",
    timeCostMinutes: 0,
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
    titre: "Parler à Marie",
    mentorLine: "Marie Dubois te jauge. Interviewe-la.",
    unlock: "INTERVIEW" as const,
    actionHint: "INTERVIEW" as const,
  },
  {
    step: 3 as const,
    titre: "Accès Ordinateur",
    mentorLine:
      "Ouvre l'ordinateur — ERP Novacier, mails et chat sont dessus.",
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

export const exampleDecisions = novacierDecisions;

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
    titre: "Mémoire de Novacier",
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
    description: "Victoire AutoVolt.",
    unlocked: false,
  },
];

export const exampleEmails = emailsForDay(1);
export const exampleMessages = messagesForDay(1);
export const exampleEvents = eventsForDay(1);
export const exampleRumors = [scenarioRumor];

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
    client: "AutoVolt",
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
    nom: "Marie Dubois",
    poste: "Cheffe d'atelier",
    shift: "Matin",
  },
  {
    id: "E-18",
    nom: "Karim Benali",
    poste: "Technicien Maintenance",
    shift: "Journée",
  },
  {
    id: "E-01",
    nom: "Laurent Perrin",
    poste: "Directeur",
    shift: "—",
  },
];

export const erpInvoices = [
  { id: "FAC-880", client: "AutoVolt", montant: 42000, statut: "En cours" },
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
  const base = createNovacierInitialState();
  return syncMetaClock({
    ...base,
    flags: { ...base.flags, tauxPanne: 5 },
    world: {
      ...base.world,
      machines: scenarioMachines.map((m) => ({ ...m })),
      objectives: scenarioObjectives.map((o) => ({ ...o })),
      events: eventsForDay(1),
      emails: emailsForDay(1),
      messages: messagesForDay(1),
      rumors: [{ ...scenarioRumor }],
      badges: exampleBadges.map((b) => ({ ...b })),
      skillProgress: Object.fromEntries(
        skills.map((s) => [s.id, { niveau: s.niveau, xp: s.xp }])
      ),
      chapters: scenarioChapters.map((c) => ({ ...c })),
      unlockedActions: ["ACCESS_COMPUTER", "VIEW_ATELIER_LIVE"],
    },
  });
}

/** Patch world content when entering a scenario day (keeps finance/relations). */
export function createScenarioDayState(
  from: GameState,
  day: number
): GameState {
  return syncMetaClock({
    ...from,
    meta: {
      ...from.meta,
      jourActuel: day,
      minutesSinceStart: day === 3 ? 2 * 60 : 0,
    },
    finance: {
      ...from.finance,
      piecesAujourdhui: 0,
    },
    world: {
      ...from.world,
      dayDecisionId: null,
      emails: emailsForDay(day),
      messages: messagesForDay(day),
      events: eventsForDay(day),
      rumors:
        day >= 2
          ? [
              {
                ...scenarioRumor,
                verified: from.world.unlockedInfos.includes("RUMEUR_CONFIRMED")
                  ? true
                  : from.world.unlockedInfos.includes("RUMEUR_PARTIELLE")
                    ? true
                    : null,
              },
            ]
          : from.world.rumors,
      alarmActive: day === 3,
      feedbackFlash: from.world.feedbackFlash,
    },
    flags: {
      ...from.flags,
      alarmActive: day === 3 ? 1 : from.flags.alarmActive,
    },
  });
}

export { ALL_ACTIONS, novacierDecisions };
/** @deprecated use novacierDecisions — kept for any leftover imports */
export const dayDecisions = Object.fromEntries(
  novacierDecisions.map((d) => [d.jour, d.choix])
);
export const initialGameState = createInitialGameState();
export { dayTitles } from "@/data/scenarioNovacier";
