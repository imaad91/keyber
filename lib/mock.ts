import type {
  Action,
  Badge,
  Decision,
  Email,
  ChatMessage,
  CompanyEvent,
  GameState,
  KpiDefinition,
  Machine,
  Objective,
  Personnage,
  Role,
  Rumor,
  Skill,
  VisibilityInvestment,
} from "./types";

export const skills: Skill[] = [
  {
    id: "negociation",
    nom: "Négociation",
    description: "Obtenir des accords favorables sous contrainte.",
    niveau: 2,
    xp: 340,
    xpMax: 500,
    scenarioIds: [],
    icone: "Handshake",
  },
  {
    id: "crise",
    nom: "Gestion de crise",
    description: "Stabiliser une situation critique rapidement.",
    niveau: 1,
    xp: 120,
    xpMax: 400,
    scenarioIds: [],
    icone: "Siren",
  },
  {
    id: "leadership",
    nom: "Leadership",
    description: "Aligner équipes et décisions sous pression.",
    niveau: 3,
    xp: 610,
    xpMax: 800,
    scenarioIds: [],
    icone: "Users",
  },
  {
    id: "stock",
    nom: "Gestion de stock",
    description: "Équilibrer stocks, délais et coûts.",
    niveau: 2,
    xp: 280,
    xpMax: 500,
    scenarioIds: [],
    icone: "Package",
  },
  {
    id: "finance",
    nom: "Pilotage financier",
    description: "Lire trésorerie, marges et investissements.",
    niveau: 1,
    xp: 90,
    xpMax: 400,
    scenarioIds: [],
    icone: "Wallet",
  },
  {
    id: "data",
    nom: "Data & visibilité",
    description: "Investir pour voir clair dans les opérations.",
    niveau: 1,
    xp: 40,
    xpMax: 400,
    scenarioIds: [],
    icone: "Eye",
  },
];

export const roles: Role[] = [
  {
    id: "prod",
    titre: "Responsable de Production",
    description: "Pilotez l'atelier, les machines et le rythme de sortie.",
    icone: "Factory",
    focus: ["Atelier", "Machines", "Qualité"],
  },
  {
    id: "commercial",
    titre: "Commercial",
    description: "Négociez contrats, clients et engagements de délai.",
    icone: "Briefcase",
    focus: ["Clients", "Contrats", "Marge"],
  },
  {
    id: "dg",
    titre: "Directeur Général",
    description: "Arbitrez la stratégie, les investissements et le moral.",
    icone: "Crown",
    focus: ["Vision", "Cash", "Équipes"],
  },
  {
    id: "logistique",
    titre: "Logistique",
    description: "Orchestrer stocks, fournisseurs et flux entrants.",
    icone: "Truck",
    focus: ["Stock", "Fournisseurs", "Délais"],
  },
];

export const exampleMachines: Machine[] = [
  {
    id: "m1",
    nom: "Presse A1",
    etat: "PRODUCTION",
    production: 42,
    nextMaintenance: "J+3 14:00",
    x: 12,
    y: 28,
  },
  {
    id: "m2",
    nom: "Tour CNC 2",
    etat: "PRODUCTION",
    production: 38,
    nextMaintenance: "J+1 09:00",
    x: 42,
    y: 22,
  },
  {
    id: "m3",
    nom: "Assembleuse 3",
    etat: "PANNE",
    production: 0,
    nextMaintenance: "URGENTE",
    x: 72,
    y: 30,
  },
  {
    id: "m4",
    nom: "Contrôle Q4",
    etat: "ARRET",
    production: 0,
    nextMaintenance: "J+5 11:00",
    x: 42,
    y: 62,
  },
];

export const exampleNewMachine: Machine = {
  id: "m5",
  nom: "Ligne Flex 5",
  etat: "PRODUCTION",
  production: 28,
  nextMaintenance: "J+10 08:00",
  x: 18,
  y: 62,
};

export const kpiDefinitions: KpiDefinition[] = [
  {
    id: "tresorerie",
    label: "Trésorerie",
    format: "money",
    estimatedValue: 118_000,
    preciseValue: 124_350,
  },
  {
    id: "production",
    label: "Production",
    unit: "/100",
    format: "number",
    estimatedValue: 70,
    preciseValue: 68,
  },
  {
    id: "moral",
    label: "Moral",
    unit: "/100",
    format: "number",
    estimatedValue: 60,
    preciseValue: 57,
  },
  {
    id: "pieces",
    label: "Pièces / jour",
    format: "number",
    estimatedValue: 450,
    preciseValue: 412,
  },
  {
    id: "panne",
    label: "Taux de panne",
    format: "percent",
    estimatedValue: 8,
    preciseValue: 12.4,
  },
];

export const visibilityInvestments: VisibilityInvestment[] = [
  {
    level: 1,
    label: "Suivi Excel",
    cost: 2_000,
    description: "Passe les KPIs en ESTIMÉ, données avec retard.",
  },
  {
    level: 2,
    label: "Capteurs IoT",
    cost: 15_000,
    description: "Passe en PRÉCIS et débloque l'Atelier Live détaillé.",
  },
  {
    level: 3,
    label: "ERP + Analyste",
    cost: 40_000,
    description: "TEMPS RÉEL, dashboards avancés et prédictions.",
  },
];

export const exampleActions: Action[] = [
  {
    id: "act-erp",
    type: "OPEN_ERP",
    titre: "Ouvrir l'ERP",
    icone: "Database",
    description: "Stock, commandes, employés…",
    timeCostMinutes: 30,
  },
  {
    id: "act-dashboard",
    type: "VIEW_DASHBOARD",
    titre: "Dashboard",
    icone: "LayoutDashboard",
    description: "KPIs et graphiques",
    timeCostMinutes: 20,
  },
  {
    id: "act-analyze",
    type: "ANALYZE_DATA",
    titre: "Analyser",
    icone: "Table2",
    description: "Comparer les périodes",
    timeCostMinutes: 45,
  },
  {
    id: "act-interview",
    type: "INTERVIEW",
    titre: "Interview",
    icone: "MessagesSquare",
    description: "Interroger un collaborateur",
    timeCostMinutes: 30,
  },
  {
    id: "act-decide",
    type: "DECIDE",
    titre: "Décider",
    icone: "Scale",
    description: "Valider une décision",
    timeCostMinutes: 15,
  },
  {
    id: "act-atelier",
    type: "VIEW_ATELIER_LIVE",
    titre: "Atelier Live",
    icone: "Factory",
    description: "Vue 2D de l'atelier",
    timeCostMinutes: 10,
  },
  {
    id: "act-emails",
    type: "EMAILS",
    titre: "Emails",
    icone: "Mail",
    description: "Boîte de réception",
    timeCostMinutes: 10,
  },
  {
    id: "act-chat",
    type: "CHAT",
    titre: "Chat interne",
    icone: "MessageCircle",
    description: "Messages d'équipe",
    timeCostMinutes: 5,
  },
];

export const exampleObjectives: Objective[] = [
  {
    id: "obj-j1",
    type: "JOURNALIER",
    titre: "Stabiliser la machine 3",
    description: "Diagnostiquer ou décider une réparation.",
    progression: 1,
    cible: 3,
    xp: 80,
    status: "EN_COURS",
  },
  {
    id: "obj-j2",
    type: "JOURNALIER",
    titre: "Lire 2 emails critiques",
    description: "Traiter les urgences de la boîte.",
    progression: 0,
    cible: 2,
    xp: 40,
    status: "EN_COURS",
  },
  {
    id: "obj-h1",
    type: "HEBDOMADAIRE",
    titre: "Améliorer la visibilité data",
    description: "Investir au moins au niveau Excel.",
    progression: 0,
    cible: 1,
    xp: 150,
    status: "EN_COURS",
  },
  {
    id: "obj-a1",
    type: "ANNUEL",
    titre: "Atteindre niveau 5",
    description: "Progresser via décisions et objectifs.",
    progression: 2,
    cible: 5,
    xp: 500,
    status: "EN_COURS",
  },
];

export const exampleEvents: CompanyEvent[] = [
  {
    id: "ev-1",
    kind: "CLIENT",
    titre: "Nouveau client — Atelier Nord",
    description: "Demande de devis sur 12 000 pièces/mois.",
    timestamp: "07:45",
  },
  {
    id: "ev-2",
    kind: "CONTRAT",
    titre: "Nouveau contrat à signer",
    description: "Clause de pénalité si retard > 48h.",
    timestamp: "08:10",
  },
  {
    id: "ev-3",
    kind: "MACHINE",
    titre: "Machine 3 signalée",
    description: "Bruit anormal rapporté par l'équipe de nuit.",
    timestamp: "08:20",
  },
  {
    id: "ev-4",
    kind: "RH",
    titre: "Démission — technicien Q",
    description: "Préavis de 1 mois reçu ce matin.",
    timestamp: "08:35",
  },
  {
    id: "ev-5",
    kind: "RUMEUR",
    titre: "Rumeur : le gros client partirait",
    description: "Il paraît que le compte Atlas va changer de fournisseur.",
    timestamp: "08:50",
    isRumor: true,
    rumorResolved: null,
  },
];

export const exampleEmails: Email[] = [
  {
    id: "em-1",
    from: "Fournisseur Métalix",
    subject: "URGENT : Fournisseur en retard",
    preview: "La livraison prévue à 10h sera décalée de 36h…",
    body: "Bonjour,\n\nLa livraison prévue à 10h sera décalée de 36h suite à un incident transport.\nPouvez-vous confirmer si vous maintenez la commande ?\n\nCordialement,\nMétalix",
    time: "07:52",
    read: false,
    urgent: true,
  },
  {
    id: "em-2",
    from: "Juridique",
    subject: "Nouveau contrat à signer",
    preview: "Le contrat Atlas V2 est prêt pour validation…",
    body: "Le contrat Atlas V2 est prêt. Points d'attention : pénalités de retard et volume minimum.\nMerci de valider avant 17h.",
    time: "08:05",
    read: false,
    urgent: true,
  },
  {
    id: "em-3",
    from: "RH",
    subject: "Entretien de sortie — technicien Q",
    preview: "Créneau proposé demain 11h…",
    body: "Créneau proposé demain 11h pour l'entretien de sortie. Souhaitez-vous y assister ?",
    time: "08:40",
    read: true,
  },
  {
    id: "em-4",
    from: "Compta",
    subject: "Point trésorerie hebdo",
    preview: "Cash stable mais investissements IoT en attente…",
    body: "Cash stable. Les investissements IoT et ERP restent en attente de validation direction.",
    time: "Hier",
    read: true,
  },
];

export const exampleMessages: ChatMessage[] = [
  {
    id: "msg-1",
    from: "Samir",
    role: "Opérateur",
    text: "Chef, la machine 3 fait un bruit bizarre depuis 20 min.",
    time: "08:18",
    alert: true,
  },
  {
    id: "msg-2",
    from: "Léa",
    role: "Qualité",
    text: "Trois lots ont un écart dimensionnel léger. Je surveille.",
    time: "08:26",
  },
  {
    id: "msg-3",
    from: "Nora",
    role: "Logistique",
    text: "Le camion Métalix n'est pas encore scanné à l'entrée.",
    time: "08:31",
    alert: true,
  },
  {
    id: "msg-4",
    from: "Hugo",
    role: "Maintenance",
    text: "Je peux passer sur A1 cet après-midi si besoin.",
    time: "08:44",
  },
];

export const exampleRumors: Rumor[] = [
  {
    id: "rum-1",
    titre: "Le gros client va partir ?",
    texte: "Il paraît que le compte Atlas négocie ailleurs.",
    verified: null,
    eventId: "ev-5",
  },
];

export const examplePersonnages: Personnage[] = [
  {
    id: "pers-marie",
    nom: "Marie Dupont",
    role: "Cheffe d'atelier",
    avatar: "MD",
    bio: "15 ans sur le site. Connaît chaque machine par son bruit.",
    questions: [
      {
        id: "q1",
        texte: "Que se passe-t-il sur la machine 3 ?",
        reponse:
          "Vibration inhabituelle sur le palier. Si on force, on casse. Je recommande un arrêt contrôlé.",
      },
      {
        id: "q2",
        texte: "Le moral de l'équipe ?",
        reponse:
          "Fatigués mais engagés. Une démission de plus et on bascule.",
      },
      {
        id: "q3",
        texte: "La rumeur Atlas, c'est sérieux ?",
        reponse:
          "Je n'ai rien de factuel. Le commercial a l'air tendu depuis lundi.",
      },
    ],
  },
  {
    id: "pers-thomas",
    nom: "Thomas Leroy",
    role: "Commercial senior",
    avatar: "TL",
    bio: "Gère le compte Atlas et les gros contrats.",
    questions: [
      {
        id: "q1",
        texte: "Atlas va-t-il partir ?",
        reponse:
          "Ils comparent. Si on rate encore un délai, oui. Sinon on tient.",
      },
      {
        id: "q2",
        texte: "Que demande le contrat ?",
        reponse:
          "Volume + pénalités. Ils veulent aussi plus de transparence sur la production.",
      },
    ],
  },
];

export const exampleDecisions: Decision[] = [
  {
    id: "dec-repair",
    titre: "Réparer la machine 3 maintenant",
    description: "Arrêt contrôlé + intervention maintenance immédiate.",
    categorie: "Production",
    impacts: [
      { label: "Trésorerie", value: "-4 500 €", tone: "neg" },
      { label: "Production", value: "+8 pts (demain)", tone: "pos" },
      { label: "Moral", value: "+3", tone: "pos" },
    ],
    deltas: { tresorerie: -4500, production: 4, moral: 3, tauxPanne: -4 },
    machineEffects: [{ machineId: "m3", etat: "PRODUCTION" }],
    xpReward: 60,
    timeCostMinutes: 60,
    costEuros: 4500,
  },
  {
    id: "dec-force",
    titre: "Forcer la production malgré l'alerte",
    description: "Tenir le rythme client au risque d'une panne dure.",
    categorie: "Production",
    impacts: [
      { label: "Pièces aujourd'hui", value: "+40", tone: "pos" },
      { label: "Risque panne", value: "Élevé", tone: "neg" },
      { label: "Moral", value: "-5", tone: "neg" },
    ],
    deltas: {
      piecesAujourdhui: 40,
      moral: -5,
      tauxPanne: 6,
      production: -2,
    },
    machineEffects: [{ machineId: "m3", etat: "PANNE" }],
    xpReward: 25,
    timeCostMinutes: 15,
  },
  {
    id: "dec-vis-1",
    titre: "Investir — Suivi Excel",
    description: "Mettre en place un suivi Excel partagé (niveau 1).",
    categorie: "Investir dans la visibilité",
    impacts: [
      { label: "Coût", value: "-2 000 €", tone: "neg" },
      { label: "Visibilité", value: "ESTIMÉ", tone: "pos" },
    ],
    deltas: { tresorerie: -2000 },
    visibilityUpgrade: 1,
    xpReward: 40,
    timeCostMinutes: 30,
    costEuros: 2000,
  },
  {
    id: "dec-vis-2",
    titre: "Investir — Capteurs IoT",
    description: "Installer des capteurs sur les machines critiques.",
    categorie: "Investir dans la visibilité",
    impacts: [
      { label: "Coût", value: "-15 000 €", tone: "neg" },
      { label: "Visibilité", value: "PRÉCIS", tone: "pos" },
      { label: "Atelier Live", value: "Détaillé", tone: "pos" },
    ],
    deltas: { tresorerie: -15000 },
    visibilityUpgrade: 2,
    xpReward: 90,
    timeCostMinutes: 45,
    costEuros: 15000,
  },
  {
    id: "dec-vis-3",
    titre: "Investir — ERP + Analyste",
    description: "Déployer l'ERP enrichi et un analyste dédié.",
    categorie: "Investir dans la visibilité",
    impacts: [
      { label: "Coût", value: "-40 000 €", tone: "neg" },
      { label: "Visibilité", value: "TEMPS RÉEL", tone: "pos" },
      { label: "Prédictions", value: "Débloquées", tone: "pos" },
    ],
    deltas: { tresorerie: -40000 },
    visibilityUpgrade: 3,
    xpReward: 140,
    timeCostMinutes: 60,
    costEuros: 40000,
  },
  {
    id: "dec-machine",
    titre: "Acheter une nouvelle ligne Flex",
    description: "Investir dans une 5e machine pour absorber le pic.",
    categorie: "Investissement",
    impacts: [
      { label: "Coût", value: "-28 000 €", tone: "neg" },
      { label: "Capacité", value: "+1 machine", tone: "pos" },
    ],
    deltas: { tresorerie: -28000, production: 6, vitesseProduction: 8 },
    unlockMachine: exampleNewMachine,
    xpReward: 100,
    timeCostMinutes: 45,
    costEuros: 28000,
  },
];

export const exampleBadges: Badge[] = [
  {
    id: "badge-first",
    titre: "Première décision",
    description: "Valider une première décision.",
    unlocked: false,
  },
  {
    id: "badge-eye",
    titre: "Œil ouvert",
    description: "Investir dans la visibilité data.",
    unlocked: false,
  },
  {
    id: "badge-atelier",
    titre: "Chef d'atelier",
    description: "Ouvrir la vue Atelier Live.",
    unlocked: false,
  },
];

export const erpStock = [
  { id: "ST-01", article: "Acier 2mm", qty: 420, seuil: 200, statut: "OK" },
  { id: "ST-02", article: "Vis M6", qty: 85, seuil: 150, statut: "BAS" },
  { id: "ST-03", article: "Joints NBR", qty: 310, seuil: 100, statut: "OK" },
  { id: "ST-04", article: "Cartons A", qty: 40, seuil: 80, statut: "CRITIQUE" },
];

export const erpOrders = [
  {
    id: "CMD-1042",
    client: "Atlas Industries",
    montant: 48600,
    statut: "En cours",
    echeance: "J+2",
  },
  {
    id: "CMD-1043",
    client: "Nord Méca",
    montant: 12400,
    statut: "Validée",
    echeance: "J+5",
  },
  {
    id: "CMD-1044",
    client: "Helio Parts",
    montant: 9200,
    statut: "Brouillon",
    echeance: "J+9",
  },
];

export const erpEmployees = [
  { id: "E-12", nom: "Marie Dupont", poste: "Cheffe d'atelier", shift: "Matin" },
  { id: "E-18", nom: "Samir Benali", poste: "Opérateur", shift: "Matin" },
  { id: "E-21", nom: "Léa Martin", poste: "Qualité", shift: "Journée" },
  { id: "E-27", nom: "Hugo Petit", poste: "Maintenance", shift: "Astreinte" },
];

export const erpInvoices = [
  { id: "FAC-880", client: "Atlas", montant: 22000, statut: "Payée" },
  { id: "FAC-881", client: "Nord Méca", montant: 6400, statut: "En retard" },
  { id: "FAC-882", client: "Helio", montant: 3100, statut: "Émise" },
];

export const erpMachinesTable = [
  { id: "m1", nom: "Presse A1", etat: "PRODUCTION", oee: "82%" },
  { id: "m2", nom: "Tour CNC 2", etat: "PRODUCTION", oee: "76%" },
  { id: "m3", nom: "Assembleuse 3", etat: "PANNE", oee: "0%" },
  { id: "m4", nom: "Contrôle Q4", etat: "ARRET", oee: "—" },
];

export const dashboardSeries = [
  { name: "Lun", prod: 380, panne: 6 },
  { name: "Mar", prod: 410, panne: 8 },
  { name: "Mer", prod: 395, panne: 11 },
  { name: "Jeu", prod: 430, panne: 7 },
  { name: "Ven", prod: 412, panne: 12 },
];

export const analyzeSeries = [
  { periode: "S-4", actuel: 52, precedent: 48 },
  { periode: "S-3", actuel: 55, precedent: 50 },
  { periode: "S-2", actuel: 49, precedent: 53 },
  { periode: "S-1", actuel: 61, precedent: 54 },
  { periode: "S", actuel: 58, precedent: 57 },
];

export const skillEvolution = [
  { mois: "Jan", nego: 1, crise: 1, lead: 2, stock: 1 },
  { mois: "Fév", nego: 1, crise: 1, lead: 2, stock: 2 },
  { mois: "Mar", nego: 2, crise: 1, lead: 3, stock: 2 },
  { mois: "Avr", nego: 2, crise: 1, lead: 3, stock: 2 },
];

export function createInitialGameState(): GameState {
  return {
    mode: null,
    roleId: null,
    day: 1,
    week: 1,
    minutesSinceStart: 0,
    dayLengthMinutes: 8 * 60,
    xp: 240,
    level: 2,
    tresorerie: 124_350,
    production: 68,
    moral: 57,
    piecesAujourdhui: 412,
    tauxPanne: 12.4,
    vitesseProduction: 46,
    visibilityLevel: 0,
    kpiVisibility: {
      tresorerie: "ESTIME",
      production: "INCONNU",
      moral: "INCONNU",
      pieces: "INCONNU",
      panne: "ESTIME",
    },
    machines: exampleMachines.map((m) => ({ ...m })),
    objectives: exampleObjectives.map((o) => ({ ...o })),
    events: exampleEvents.map((e) => ({ ...e })),
    emails: exampleEmails.map((e) => ({ ...e })),
    messages: exampleMessages.map((m) => ({ ...m })),
    rumors: exampleRumors.map((r) => ({ ...r })),
    decisionHistory: [],
    badges: exampleBadges.map((b) => ({ ...b })),
    skillProgress: Object.fromEntries(
      skills.map((s) => [s.id, { niveau: s.niveau, xp: s.xp }])
    ),
    feedbackFlash: null,
  };
}

/** @deprecated use createInitialGameState */
export const initialGameState = createInitialGameState();
