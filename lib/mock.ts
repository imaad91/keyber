import type {
  Action,
  Badge,
  Chapitre,
  ChatMessage,
  CompanyEvent,
  Decision,
  Email,
  GameState,
  KpiDefinition,
  LivreEntreprise,
  Machine,
  Objective,
  Personnage,
  Role,
  Rumor,
  Skill,
  VisibilityInvestment,
} from "./types";

export const COMPANY_NAME = "Novacier";

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
    icone: "Eye",
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
    introLines: [
      "Lundi 8h00. Tu viens d'être nommé Responsable de Production chez Novacier.",
      "L'atelier tourne. Une machine tousse. Personne ne te connaît encore.",
      "Ton prédécesseur, Henri Vallon, t'attend près de la ligne. Il va te faire découvrir la maison — à sa façon.",
    ],
  },
  {
    id: "commercial",
    titre: "Commercial",
    description: "Négociez contrats, clients et engagements de délai.",
    icone: "Briefcase",
    focus: ["Clients", "Contrats", "Marge"],
    introLines: [
      "Lundi 8h00. Tu prends le poste de Commercial chez Novacier.",
      "Atlas Industries négocie ailleurs. Les délais font grincer des dents.",
      "Henri Vallon, l'ancien Responsable, t'ouvre les portes avant que le téléphone sonne.",
    ],
  },
  {
    id: "dg",
    titre: "Directeur Général",
    description: "Arbitrez la stratégie, les investissements et le moral.",
    icone: "Crown",
    focus: ["Vision", "Cash", "Équipes"],
    introLines: [
      "Lundi 8h00. Tu es le nouveau Directeur Général de Novacier.",
      "Les équipes te regardent. Les chiffres, eux, restent flous.",
      "Henri Vallon te propose une visite — « avant les réunions, vois le terrain ».",
    ],
  },
  {
    id: "logistique",
    titre: "Logistique",
    description: "Orchestrer stocks, fournisseurs et flux entrants.",
    icone: "Truck",
    focus: ["Stock", "Fournisseurs", "Délais"],
    introLines: [
      "Lundi 8h00. Tu arrives comme Responsable Logistique chez Novacier.",
      "Un camion Métalix est en retard. Les stocks de sécurité… personne n'est d'accord.",
      "Henri Vallon, mentor du jour, te prend sous son aile le temps d'un premier tour.",
    ],
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

export const onboardingStepsMeta = [
  {
    step: 1 as const,
    titre: "Visite de l'Atelier Live",
    mentorLine:
      "Commence par le terrain. Ouvre l'Atelier Live — les machines te parlent plus vite que les réunions.",
    unlock: "VIEW_ATELIER_LIVE" as const,
    actionHint: "VIEW_ATELIER_LIVE" as const,
  },
  {
    step: 2 as const,
    titre: "Présentation de Marie",
    mentorLine:
      "Marie Dupont tient l'atelier. Va l'interviewer. Écoute avant de décider.",
    unlock: "INTERVIEW" as const,
    actionHint: "INTERVIEW" as const,
  },
  {
    step: 3 as const,
    titre: "Découverte de l'ERP",
    mentorLine:
      "Maintenant l'outil. L'ERP Novacier — moche, utile, indispensable. Ouvre-le.",
    unlock: "OPEN_ERP" as const,
    actionHint: "OPEN_ERP" as const,
  },
  {
    step: 4 as const,
    titre: "Premier objectif",
    mentorLine:
      "Tu as assez vu. Ton premier objectif du jour : stabiliser la machine 3. Le reste des outils est à toi.",
    unlock: "ALL" as const,
    actionHint: "DECIDE" as const,
  },
];

export const exampleChapters: Chapitre[] = [
  {
    id: "ch1",
    numero: 1,
    titre: "L'arrivée",
    intro: "Premier jour. Découvrir l'atelier, les gens, le brouillard des chiffres.",
    objectif: "Terminer le parcours mentor et ouvrir le Livre de l'Entreprise.",
    fin: "Tu n'es plus un inconnu. Novacier commence à te regarder autrement.",
    status: "ACTIF",
  },
  {
    id: "ch2",
    numero: 2,
    titre: "La crise",
    intro: "Une panne, un client impatient, des rumeurs. Le terrain se durcit.",
    objectif: "Stabiliser la production sans casser le moral.",
    fin: "La crise laisse des traces — et des leçons.",
    status: "VERROUILLE",
  },
  {
    id: "ch3",
    numero: 3,
    titre: "La visibilité",
    intro: "Investir pour y voir clair, ou naviguer à l'aveugle.",
    objectif: "Atteindre au moins le niveau Capteurs IoT.",
    fin: "Les chiffres cessent d'être des rumeurs.",
    status: "VERROUILLE",
  },
];

export const livreNovacier: LivreEntreprise = {
  nom: "Novacier",
  slogan: "Des pièces précises. Des décisions nettes.",
  histoire: {
    fondation:
      "Fondée en 1987 à Saint-Étienne par Claire Novak, Novacier est née d'un atelier de 6 personnes spécialisées dans les pièces métalliques de précision pour l'industrie.",
    narratif:
      "Novacier n'a jamais été la plus grande. Elle a survécu aux années 90 en refusant de sous-traiter la qualité. En 2009, une crise client a failli la couler : retards en cascade, moral en berne. L'équipe a tenu en remettant l'atelier au centre — avant les tableaux Excel. Aujourd'hui, 84 collaborateurs, 4 lignes, un ERP capricieux, et une culture du terrain qui se méfie des chiffres trop beaux.",
    datesCles: [
      { annee: "1987", fait: "Fondation de l'atelier Novak & Fils" },
      { annee: "1998", fait: "Passage à Novacier SA, 1er contrat automobile" },
      { annee: "2009", fait: "Crise Atlas — 3 mois de retards, plan de relance" },
      { annee: "2019", fait: "Ligne Flex expérimentale (jamais finalisée)" },
      { annee: "2024", fait: "Début du chantier IoT (reporté faute de budget)" },
    ],
    anecdotes: [
      "Claire Novak testait chaque pièce à la loupe le soir, « pour dormir tranquille ».",
      "La machine 3 s'appelle encore « La Rebelle » depuis 2011.",
      "Le café de l'atelier est gratuit — règle non écrite, sacrée.",
    ],
    crisesPassees: [
      "2009 : perte temporaire du compte Atlas, 18 % du CA.",
      "2016 : incendie électrique mineur, arrêt 4 jours.",
      "2022 : pénurie d'acier, stocks de sécurité épuisés.",
    ],
  },
  activite: {
    ceQuOnFabrique:
      "Pièces métalliques de précision : usinage, emboutissage, assemblage et contrôle qualité pour l'industrie.",
    pourQui:
      "Équipementiers auto, machines spéciales, et quelques clients aéronautiques de rang 2.",
    produitsPhares: [
      {
        nom: "Bride NV-220",
        description: "Bride haute tolérance pour transmissions.",
      },
      {
        nom: "Carter Compact C7",
        description: "Carter usiné en petites séries.",
      },
      {
        nom: "Kit Joints Pro",
        description: "Ensemble joints + inserts pour maintenance.",
      },
    ],
    clientsPrincipaux: [
      "Atlas Industries",
      "Nord Méca",
      "Helio Parts",
      "Atelier Nord",
    ],
  },
  organigramme: [
    { personnageId: "pers-henri" },
    { personnageId: "pers-marie" },
    { personnageId: "pers-thomas" },
    { personnageId: "pers-samir" },
    { personnageId: "pers-lea" },
  ],
  chiffresCles: {
    ca: "12,4 M€",
    employes: 84,
    machines: 4,
    clients: 27,
    satisfaction: "78 %",
  },
  valeurs: [
    {
      titre: "Le terrain d'abord",
      description: "Une décision sans visite d'atelier est suspecte.",
    },
    {
      titre: "La qualité ne se négocie pas",
      description: "Mieux vaut un retard assumé qu'un lot douteux.",
    },
    {
      titre: "Parler vrai",
      description: "Les mauvaises nouvelles remontent vite — ou trop tard.",
    },
    {
      titre: "Investir pour voir",
      description: "Un chiffre flou coûte plus cher qu'un capteur.",
    },
  ],
  glossaire: [
    {
      terme: "OEE",
      definition:
        "Overall Equipment Effectiveness — taux de rendement global d'une machine (disponibilité × performance × qualité).",
    },
    {
      terme: "Taux de rebut",
      definition:
        "Pourcentage de pièces non conformes par rapport au volume produit.",
    },
    {
      terme: "ERP",
      definition:
        "Progiciel de gestion intégré : stocks, commandes, RH, factures dans un même système.",
    },
    {
      terme: "Stock de sécurité",
      definition:
        "Quantité minimale conservée pour absorber les aléas fournisseurs ou de demande.",
    },
    {
      terme: "Capteurs IoT",
      definition:
        "Capteurs connectés qui remontent l'état machine en temps (quasi) réel.",
    },
  ],
};

export const exampleObjectives: Objective[] = [
  {
    id: "obj-j0",
    type: "JOURNALIER",
    titre: "Terminer la visite mentor",
    description: "Suivre les 4 étapes du Jour 0 avec Henri.",
    progression: 0,
    cible: 4,
    xp: 60,
    status: "EN_COURS",
  },
  {
    id: "obj-j1",
    type: "JOURNALIER",
    titre: "Stabiliser la machine 3",
    description: "Diagnostiquer ou décider une réparation.",
    progression: 0,
    cible: 1,
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
    from: "Henri Vallon",
    subject: "Bienvenue — et un conseil",
    preview: "Ouvre le Livre de l'Entreprise avant de tout décider…",
    body: "Bienvenue.\n\nAvant de tout décider : ouvre le Livre de l'Entreprise. Novacier a une mémoire. Lis-la.\n\nHenri",
    time: "08:02",
    read: false,
  },
];

export const exampleMessages: ChatMessage[] = [
  {
    id: "msg-mentor-1",
    from: "Henri Vallon",
    role: "Ancien Responsable · Mentor",
    text: "Bienvenue. Je suis Henri. Je reste dans ce chat si tu te perds. On commence par l'atelier.",
    time: "08:00",
    mentor: true,
  },
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
    id: "pers-henri",
    nom: "Henri Vallon",
    role: "Ancien Responsable · Mentor",
    avatar: "HV",
    bio: "22 ans chez Novacier. A connu la crise 2009. Parle peu, explique bien.",
    phrase: "Le terrain d'abord. Les tableaux ensuite.",
    isMentor: true,
    relationConfiance: 70,
    questions: [
      {
        id: "hq1",
        texte: "Par où je commence vraiment ?",
        choices: [
          {
            id: "hq1a",
            texte: "Je te fais confiance — guide-moi.",
            reponse:
              "Bien. Atelier, Marie, ERP, puis ton premier objectif. Dans cet ordre.",
            confianceDelta: 8,
            xp: 15,
          },
          {
            id: "hq1b",
            texte: "Montre-moi d'abord les chiffres.",
            reponse:
              "Les chiffres sont flous ici. Tu verras des ???. On investira pour y voir clair — après le terrain.",
            confianceDelta: -2,
            unlockInfo: "Les KPIs démarrent en brouillard volontaire.",
            xp: 10,
          },
        ],
      },
      {
        id: "hq2",
        texte: "Pourquoi tu restes en mentor ?",
        choices: [
          {
            id: "hq2a",
            texte: "Parce que Novacier compte pour toi ?",
            reponse:
              "Oui. Et parce qu'un nouveau chef seul casse des choses sans le vouloir.",
            confianceDelta: 6,
            xp: 10,
          },
          {
            id: "hq2b",
            texte: "Tu surveilles mes décisions ?",
            reponse:
              "Je corrige si tu vas dans le mur. Sinon, tu pilotes.",
            confianceDelta: 2,
            xp: 5,
          },
        ],
      },
    ],
  },
  {
    id: "pers-marie",
    nom: "Marie Dupont",
    role: "Cheffe d'atelier",
    avatar: "MD",
    bio: "15 ans sur le site. Connaît chaque machine par son bruit.",
    phrase: "Si ça vibre mal, on arrête. Point.",
    relationConfiance: 45,
    questions: [
      {
        id: "q1",
        texte: "Que se passe-t-il sur la machine 3 ?",
        choices: [
          {
            id: "q1a",
            texte: "Je te fais confiance — que recommandes-tu ?",
            reponse:
              "Arrêt contrôlé. Vibration sur le palier. Si on force, on casse. Merci d'écouter.",
            confianceDelta: 12,
            unlockInfo: "Marie confirmera un arrêt plutôt qu'un forçage.",
            xp: 20,
          },
          {
            id: "q1b",
            texte: "Montre-moi les chiffres de panne.",
            reponse:
              "Les chiffres sont approximatifs. Mon oreille, elle, est précise. Tu verras ~12 % en ESTIMÉ.",
            confianceDelta: -4,
            unlockInfo: "Taux de panne machine 3 probablement sous-estimé.",
            xp: 15,
          },
          {
            id: "q1c",
            texte: "On force pour Atlas, non ?",
            reponse:
              "Atlas préfère un retard honnête à un lot pourri. Tu le sauras vite.",
            confianceDelta: -10,
            xp: 5,
          },
        ],
      },
      {
        id: "q2",
        texte: "Le moral de l'équipe ?",
        choices: [
          {
            id: "q2a",
            texte: "Dis-moi franchement.",
            reponse:
              "Fatigués mais engagés. Une démission de plus et on bascule.",
            confianceDelta: 8,
            xp: 10,
          },
          {
            id: "q2b",
            texte: "Je veux des solutions, pas des plaintes.",
            reponse:
              "Alors investis dans la maintenance et la visibilité. Les slogans, on connaît.",
            confianceDelta: -6,
            xp: 5,
          },
        ],
      },
      {
        id: "q3",
        texte: "La rumeur Atlas, c'est sérieux ?",
        choices: [
          {
            id: "q3a",
            texte: "Tu as des faits ?",
            reponse:
              "Rien de factuel. Thomas a l'air tendu. Vérifie en interview ou dans les mails.",
            confianceDelta: 4,
            unlockInfo: "Piste : interviewer Thomas Leroy.",
            xp: 12,
          },
          {
            id: "q3b",
            texte: "Ce n'est que du bruit de couloir.",
            reponse:
              "Peut-être. Les rumeurs ici ont parfois raison trop tôt.",
            confianceDelta: 0,
            xp: 5,
          },
        ],
      },
    ],
  },
  {
    id: "pers-thomas",
    nom: "Thomas Leroy",
    role: "Commercial senior",
    avatar: "TL",
    bio: "Gère le compte Atlas et les gros contrats.",
    phrase: "Un délai raté = une porte qui se ferme.",
    relationConfiance: 40,
    questions: [
      {
        id: "tq1",
        texte: "Atlas va-t-il partir ?",
        choices: [
          {
            id: "tq1a",
            texte: "Parle-moi franchement.",
            reponse:
              "Ils comparent. Si on rate encore un délai, oui. Sinon on tient. La rumeur est… à moitié vraie.",
            confianceDelta: 10,
            unlockInfo: "Rumeur Atlas : partiellement fondée.",
            xp: 20,
          },
          {
            id: "tq1b",
            texte: "Montre-moi le pipeline.",
            reponse:
              "Pipeline tendu. Ils veulent aussi plus de transparence production — d'où les capteurs.",
            confianceDelta: 4,
            xp: 12,
          },
        ],
      },
    ],
  },
  {
    id: "pers-samir",
    nom: "Samir Benali",
    role: "Opérateur",
    avatar: "SB",
    bio: "Équipe de matin, ligne presse et assembleuse.",
    phrase: "Chef, écoute la machine 3.",
    relationConfiance: 50,
    questions: [
      {
        id: "sq1",
        texte: "Le bruit sur la 3, depuis quand ?",
        choices: [
          {
            id: "sq1a",
            texte: "Raconte-moi tout.",
            reponse: "Depuis la nuit. Ça grince puis ça claque. Marie a raison.",
            confianceDelta: 6,
            xp: 10,
          },
          {
            id: "sq1b",
            texte: "Tu exagères peut-être ?",
            reponse: "Non. Et si ça casse, ce sera pas moi qui invente.",
            confianceDelta: -8,
            xp: 0,
          },
        ],
      },
    ],
  },
  {
    id: "pers-lea",
    nom: "Léa Martin",
    role: "Qualité",
    avatar: "LM",
    bio: "Contrôle dimensionnel et lots clients sensibles.",
    phrase: "Trois lots borderline. Je surveille.",
    relationConfiance: 55,
    questions: [
      {
        id: "lq1",
        texte: "Les écarts qualité, c'est grave ?",
        choices: [
          {
            id: "lq1a",
            texte: "Je te fais confiance — ton avis ?",
            reponse:
              "Pas encore critique. Mais si on force la 3, ça le devient.",
            confianceDelta: 8,
            xp: 12,
          },
          {
            id: "lq1b",
            texte: "Montre-moi les mesures.",
            reponse:
              "Dans l'ERP onglet qualité… enfin, ce qu'on a. Le reste est encore brouillard.",
            confianceDelta: 2,
            unlockInfo: "Données qualité partielles sans IoT.",
            xp: 10,
          },
        ],
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
    journalNarration:
      "Tu as choisi de réparer la machine 3. Marie a souri du coin des lèvres. L'atelier a respiré.",
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
    journalNarration:
      "Tu as forcé malgré l'alerte. Les pièces sont sorties. La confiance, elle, a reculé.",
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
    journalNarration:
      "Tu as investi dans un suivi Excel. Les ??? deviennent des ~estimations. Marie était sceptique, mais les réunions sont moins aveugles.",
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
    journalNarration:
      "Capteurs IoT installés. L'atelier Live s'est allumé. Pour la première fois, tu vois vraiment.",
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
    journalNarration:
      "ERP + analyste : le brouillard tombe. Les dashboards avancés s'ouvrent. Novacier entre dans une autre époque.",
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
    journalNarration:
      "La Ligne Flex 5 a apparu dans l'atelier. Un rectangle de plus — et un symbole : tu investis pour tenir.",
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
  {
    id: "badge-jour0",
    titre: "Premier jour",
    description: "Terminer le parcours mentor Jour 0.",
    unlocked: false,
  },
  {
    id: "badge-livre",
    titre: "Mémoire de Novacier",
    description: "Ouvrir le Livre de l'Entreprise.",
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

const DAY0_UNLOCKS: GameState["unlockedActions"] = ["CHAT", "VIEW_ATELIER_LIVE"];

export function createInitialGameState(): GameState {
  return {
    mode: null,
    roleId: null,
    day: 0,
    week: 1,
    minutesSinceStart: 0,
    dayLengthMinutes: 8 * 60,
    xp: 40,
    level: 1,
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
    introSeen: false,
    onboardingStep: 1,
    onboardingDone: false,
    unlockedActions: [...DAY0_UNLOCKS],
    chapterId: "ch1",
    chapters: exampleChapters.map((c) => ({ ...c })),
    journal: [],
    relations: Object.fromEntries(
      examplePersonnages.map((p) => [p.id, p.relationConfiance])
    ),
    unlockedInfos: [],
  };
}

export const initialGameState = createInitialGameState();
