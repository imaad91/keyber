import type {
  Chapitre,
  ChatMessage,
  CompanyEvent,
  LegacyDecisionOption,
  Email,
  LivreEntreprise,
  Machine,
  Objective,
  Personnage,
  Rumor,
  VisibilityLevel,
} from "./types";

export const SCENARIO_ID = "novacier-semaine-qui-decide";
export const SCENARIO_TITLE = "NOVACIER — La Semaine Qui Décide De Tout";
export const TARGET_PIECES = 500;
export const DAY_LENGTH = 8 * 60; // 08:00 → 16:00

export const livreNovacier: LivreEntreprise = {
  nom: "Novacier",
  slogan: "La Semaine Qui Décide De Tout",
  histoire: {
    fondation:
      "Fondée en 1987 à Saint-Étienne, Novacier emploie aujourd'hui 120 personnes et fabrique des pièces métalliques pour l'automobile.",
    narratif:
      "Novacier a grandi dans le bruit des presses stéphanoises. Longtemps solide, elle a frôlé la faillite en 2022 : retards clients, rebuts trop élevés, confiance AutoVolt au bord du gouffre. Cette semaine, tu arrives comme Responsable de Production. Cinq jours pour remettre la ligne sur les rails — ou perdre le contrat qui fait 45 % du CA.",
    datesCles: [
      { annee: "1987", fait: "Fondation à Saint-Étienne" },
      { annee: "2005", fait: "Premier contrat AutoVolt" },
      { annee: "2018", fait: "Passage à 4 machines CNC / presse" },
      { annee: "2022", fait: "Quasi-faillite — plan de sauvetage" },
      { annee: "2026", fait: "Semaine critique : livraison AutoVolt" },
    ],
    anecdotes: [
      "L'atelier refuse encore les réunions sans passage terrain.",
      "La Machine 3 a déjà « sauvé » deux trimestres — et en a cassé un.",
      "AutoVolt visite rarement, mais lit chaque taux de rebut.",
    ],
    crisesPassees: [
      "2022 : quasi-faillite, 3 mois de trésorerie critique.",
      "2023 : rappel qualité Bride B-17 (lot limité).",
    ],
  },
  activite: {
    ceQuOnFabrique:
      "Pièces métalliques usinées et embouties pour l'automobile : supports, brides, carters.",
    pourQui:
      "Équipementiers et constructeurs. Client clé : AutoVolt (45 % du CA).",
    produitsPhares: [
      {
        nom: "Support Moteur A-42",
        description: "Support structurel haute tolérance — volume principal.",
      },
      {
        nom: "Bride de Frein B-17",
        description: "Bride critique sécurité — zéro défaut toléré.",
      },
      {
        nom: "Carter C-09",
        description: "Carter usiné petites/moyennes séries.",
      },
    ],
    clientsPrincipaux: ["AutoVolt (45 % CA)", "Nord Méca", "Helio Parts"],
  },
  organigramme: [
    { personnageId: "pers-marie" },
    { personnageId: "pers-karim" },
    { personnageId: "pers-laurent" },
    { personnageId: "pers-henri" },
  ],
  chiffresCles: {
    ca: "12 M€",
    employes: 120,
    machines: 4,
    clients: 18,
    satisfaction: "72 %",
  },
  valeurs: [
    {
      titre: "On ne lâche jamais un client",
      description: "Tenir la promesse, même sous pression — sans tricher sur la qualité.",
    },
    {
      titre: "La qualité avant la quantité",
      description: "Un lot douteux coûte plus cher qu'un délai négocié.",
    },
    {
      titre: "L'atelier sait",
      description: "Écoute le terrain avant les tableaux. Marie et Karim ont souvent raison.",
    },
  ],
  glossaire: [
    {
      terme: "OEE",
      definition:
        "Overall Equipment Effectiveness — rendement global machine (dispo × perf × qualité).",
    },
    {
      terme: "Taux de rebut",
      definition:
        "Pourcentage de pièces non conformes. Chez Novacier, le vrai chiffre est longtemps resté flou.",
    },
    {
      terme: "ERP",
      definition:
        "Progiciel de gestion : stocks, commandes, RH, factures.",
    },
    {
      terme: "Stock de sécurité",
      definition:
        "Réserve minimale d'acier pour absorber retards fournisseurs.",
    },
    {
      terme: "Capteur IoT",
      definition:
        "Capteur connecté qui remonte l'état machine. Sur la Machine 3, le capteur est mort…",
    },
  ],
};

export const scenarioMachines: Machine[] = [
  {
    id: "m1",
    nom: "Presse 1",
    etat: "PRODUCTION",
    production: 22,
    nextMaintenance: "J+4",
    x: 12,
    y: 28,
  },
  {
    id: "m2",
    nom: "CNC 2",
    etat: "PRODUCTION",
    production: 20,
    nextMaintenance: "J+2",
    x: 42,
    y: 22,
  },
  {
    id: "m3",
    nom: "Assembleuse 3",
    etat: "PRODUCTION",
    production: 18,
    nextMaintenance: "Capteur HS",
    x: 72,
    y: 30,
  },
  {
    id: "m4",
    nom: "Contrôle Q4",
    etat: "ARRET",
    production: 0,
    nextMaintenance: "J+6",
    x: 42,
    y: 62,
  },
];

export const scenarioPersonnages: Personnage[] = [
  {
    id: "pers-henri",
    nom: "Henri Vallon",
    role: "Ancien Responsable · Mentor",
    avatar: "HV",
    bio: "Mentor discret. Te rappelle que 2022 n'est pas si loin.",
    phrase: "Cinq jours. Pas une de plus.",
    isMentor: true,
    relationConfiance: 65,
    questions: [
      {
        id: "hq1",
        texte: "Par où commencer cette semaine ?",
        choices: [
          {
            id: "hq1a",
            texte: "Je te fais confiance — guide-moi.",
            reponse:
              "Jour 1 : découvre la vraie cause du retard. Les ??? ne sont pas un hasard. Interroge Karim.",
            confianceDelta: 5,
            unlockInfo: "Piste : capteur Machine 3",
            xp: 10,
          },
          {
            id: "hq1b",
            texte: "Je gère seul.",
            reponse: "Très bien. Mais lis tes mails à 08:15. Laurent n'attend pas.",
            confianceDelta: -2,
            xp: 5,
          },
        ],
      },
    ],
  },
  {
    id: "pers-marie",
    nom: "Marie Dubois",
    role: "Cheffe d'atelier · 52 ans",
    avatar: "MD",
    bio: "Cheffe d'atelier depuis 18 ans. Méfiante envers les nouveaux chefs qui décident sans voir la ligne.",
    phrase: "L'atelier sait. Toi, pas encore.",
    relationConfiance: 30,
    questions: [
      {
        id: "mq1",
        texte: "Pourquoi le retard s'installe ?",
        choices: [
          {
            id: "mq1a",
            texte: "Je te fais confiance — dis-moi tout.",
            reponse:
              "On pousse trop sans voir. Le rebut est pire que ce que Laurent croit. Et les heures sup brûlent l'équipe.",
            confianceDelta: 15,
            unlockInfo: "Marie confirme un rebut sous-estimé",
            xp: 20,
          },
          {
            id: "mq1b",
            texte: "Montre-moi les chiffres.",
            reponse:
              "Quels chiffres ? Tout est en ???. Installez un capteur, après on parle.",
            confianceDelta: 5,
            xp: 10,
          },
          {
            id: "mq1c",
            texte: "Il faut juste produire plus.",
            reponse: "Comme en 2022. On a failli mourir comme ça.",
            confianceDelta: -12,
            xp: 0,
          },
        ],
      },
      {
        id: "mq2",
        texte: "Peut-on gagner des pièces sans casser l'équipe ?",
        choices: [
          {
            id: "mq2a",
            texte: "Je m'en remets à ton expérience.",
            reponse:
              "Si tu me fais vraiment confiance… on peut réorganiser les postes : +2 h/jour sans heures sup. Mais seulement si tu m'écoutes jusqu'au bout.",
            confianceDelta: 18,
            unlockInfo: "SOLUTION_MARIE",
            xp: 25,
          },
          {
            id: "mq2b",
            texte: "Les heures sup, c'est non négociable.",
            reponse: "Alors ne viens pas te plaindre du moral.",
            confianceDelta: -10,
            xp: 5,
          },
        ],
      },
      {
        id: "mq3",
        texte: "La rumeur AutoVolt / Pologne ?",
        choices: [
          {
            id: "mq3a",
            texte: "Tu as entendu quelque chose de concret ?",
            reponse:
              "Des bruits. Karim en sait plus que moi. Le commercial, lui, ment ou se rassure.",
            confianceDelta: 8,
            unlockInfo: "Vérifier via Karim — rumeur plausible",
            xp: 15,
          },
          {
            id: "mq3b",
            texte: "Ce n'est que du bruit de couloir.",
            reponse: "Espérons. AutoVolt ne prévient pas toujours.",
            confianceDelta: 0,
            xp: 5,
          },
        ],
      },
    ],
  },
  {
    id: "pers-karim",
    nom: "Karim Benali",
    role: "Technicien Maintenance · 28 ans",
    avatar: "KB",
    bio: "Technicien maintenance. Connaît chaque capteur. Envoie des messages en douce quand ça chauffe.",
    phrase: "Le capteur de la 3 est mort. 5k€. Personne n'écoute.",
    relationConfiance: 70,
    questions: [
      {
        id: "kq1",
        texte: "Qu'est-ce qui cloche vraiment sur la ligne ?",
        choices: [
          {
            id: "kq1a",
            texte: "Parle franchement.",
            reponse:
              "Capteur Machine 3 mort depuis des semaines. Sans lui, vous naviguez à l'aveugle. 5 000 € et vous voyez le vrai rebut — autour de 18 %.",
            confianceDelta: 10,
            unlockInfo: "CAPTEUR_M3_MORT",
            xp: 25,
          },
          {
            id: "kq1b",
            texte: "C'est grave au point d'investir ?",
            reponse:
              "Oui. Une nouvelle machine à 80k arrivera trop tard pour cette semaine. Le capteur, c'est maintenant.",
            confianceDelta: 5,
            unlockInfo: "Nouvelle machine = trop tard pour la semaine",
            xp: 15,
          },
        ],
      },
      {
        id: "kq2",
        texte: "AutoVolt a contacté un concurrent en Pologne ?",
        choices: [
          {
            id: "kq2a",
            texte: "Dis-moi ce que tu sais.",
            reponse:
              "Oui. Un copain chez AutoVolt m'a parlé d'un devis polonais. Le mail « tout va bien » du commercial… c'est du théâtre.",
            confianceDelta: 8,
            unlockInfo: "RUMEUR_CONFIRMED",
            xp: 20,
          },
          {
            id: "kq2b",
            texte: "Tu es sûr de ta source ?",
            reponse: "Sûr à 80 %. Assez pour ne pas dormir tranquille.",
            confianceDelta: 3,
            unlockInfo: "RUMEUR_PARTIELLE",
            xp: 10,
          },
        ],
      },
    ],
  },
  {
    id: "pers-laurent",
    nom: "Laurent Perrin",
    role: "Directeur · 48 ans",
    avatar: "LP",
    bio: "Directeur. Emails secs, pression AutoVolt, mémoire de 2022.",
    phrase: "Où en est le retard ?",
    relationConfiance: 50,
    questions: [
      {
        id: "lq1",
        texte: "Quelle est ta priorité cette semaine ?",
        choices: [
          {
            id: "lq1a",
            texte: "Livrer AutoVolt sans casser la boîte.",
            reponse:
              "500 pièces conformes avant vendredi 16h. Pas de magouilles qualité. On a déjà frôlé la mort en 2022.",
            confianceDelta: 8,
            xp: 15,
          },
          {
            id: "lq1b",
            texte: "Tu me laisses les mains libres ?",
            reponse:
              "Oui — tant que la trésorerie tient et qu'AutoVolt ne part pas. Rend compte.",
            confianceDelta: 4,
            xp: 10,
          },
        ],
      },
    ],
  },
];

export const scenarioChapters: Chapitre[] = [
  {
    id: "ch-semaine",
    numero: 1,
    titre: "La Semaine Qui Décide De Tout",
    intro: "Cinq jours pour sauver le contrat AutoVolt.",
    objectif: "Livrer 500 pièces qualité avant vendredi 16h.",
    fin: "Débrief à 16h00 — victoire, victoire partielle, ou échec.",
    status: "ACTIF",
  },
];

export const scenarioObjectives: Objective[] = [
  {
    id: "obj-j1-cause",
    type: "JOURNALIER",
    titre: "Découvrir la vraie cause du retard",
    description: "Investis dans le capteur ou obtiens l'aveu de Karim.",
    progression: 0,
    cible: 1,
    xp: 100,
    status: "EN_COURS",
  },
  {
    id: "obj-hebdo-500",
    type: "HEBDOMADAIRE",
    titre: "Livrer 500 pièces avant vendredi 16h",
    description: "Pièces de qualité cumulées sur la semaine.",
    progression: 0,
    cible: 500,
    xp: 500,
    status: "EN_COURS",
  },
];

/** @deprecated Prefer novacierDecisions in /data — legacy shape for admin seed */
export const dayDecisions: Record<number, LegacyDecisionOption[]> = {
  1: [
    {
      id: "d1-machine",
      titre: "Commander une nouvelle machine (80 k€)",
      description:
        "Investissement lourd. Livraison hors délai pour cette semaine critique.",
      categorie: "Jour 1 · 12h — Cause du retard",
      impacts: [
        { label: "Trésorerie", value: "-80 000 €", tone: "neg" },
        { label: "Cette semaine", value: "Aucun gain", tone: "neg" },
        { label: "Visibilité", value: "Inchangée", tone: "neu" },
      ],
      deltas: { tresorerie: -80000 },
      xpReward: 20,
      timeCostMinutes: 30,
      costEuros: 80000,
      journalNarration:
        "Tu as commandé une nouvelle machine à 80 k€. Elle arrivera trop tard. Les ??? restent des ???. Karim secoue la tête.",
    },
    {
      id: "d1-capteur",
      titre: "Installer le capteur Machine 3 (5 k€)",
      description:
        "Remplace le capteur mort. Débloque les KPIs réels : rebut 18 %, prod ~60/jour.",
      categorie: "Jour 1 · 12h — Cause du retard",
      impacts: [
        { label: "Trésorerie", value: "-5 000 €", tone: "neg" },
        { label: "Visibilité", value: "PRÉCIS / LIVE", tone: "pos" },
        { label: "Vérité", value: "Rebut 18 %", tone: "pos" },
      ],
      deltas: { tresorerie: -5000 },
      visibilityUpgrade: 2,
      xpReward: 100,
      timeCostMinutes: 45,
      costEuros: 5000,
      journalNarration:
        "Capteur posé sur la Machine 3. Le brouillard tombe : rebut à 18 %, production autour de 60/jour. Tu as trouvé la vraie cause.",
    },
    {
      id: "d1-rien",
      titre: "Ne rien faire pour l'instant",
      description: "Reporter l'investissement. Rester dans le brouillard.",
      categorie: "Jour 1 · 12h — Cause du retard",
      impacts: [
        { label: "Cash", value: "Préservé", tone: "pos" },
        { label: "Visibilité", value: "Toujours ???", tone: "neg" },
        { label: "Risque", value: "Élevé", tone: "neg" },
      ],
      deltas: {},
      xpReward: 5,
      timeCostMinutes: 10,
      journalNarration:
        "Tu n'as rien investi. Les KPIs restent des ???. Laurent enverra d'autres mails. La semaine sera plus dure.",
    },
  ],
  2: [
    {
      id: "d2-hs",
      titre: "Imposer 3 h supplémentaires",
      description: "+20 pièces/jour, coût 15 k€, moral et Marie en souffrance.",
      categorie: "Jour 2 — Heures sup",
      impacts: [
        { label: "Coût", value: "-15 000 €", tone: "neg" },
        { label: "Pièces / jour", value: "+20", tone: "pos" },
        { label: "Moral", value: "-15", tone: "neg" },
        { label: "Marie", value: "-10 confiance", tone: "neg" },
      ],
      deltas: {
        tresorerie: -15000,
        production: 20,
        moral: -15,
        piecesAujourdhui: 20,
      },
      xpReward: 30,
      timeCostMinutes: 30,
      costEuros: 15000,
      journalNarration:
        "Heures sup décrétées. +20 pièces/jour, -15 moral, Marie -10. L'atelier grince des dents.",
    },
    {
      id: "d2-no-hs",
      titre: "Refuser les heures supplémentaires",
      description: "Préserver le moral. Compter sur l'organisation.",
      categorie: "Jour 2 — Heures sup",
      impacts: [
        { label: "Moral", value: "Stable / +5", tone: "pos" },
        { label: "Marie", value: "+8 confiance", tone: "pos" },
        { label: "Volume", value: "Pas de boost", tone: "neu" },
      ],
      deltas: { moral: 5 },
      xpReward: 40,
      timeCostMinutes: 20,
      journalNarration:
        "Pas d'heures sup. Marie apprécie (+8). Il faudra trouver les pièces autrement — peut-être sa réorganisation.",
    },
    {
      id: "d2-marie-reorg",
      titre: "Réorganisation Marie (+2 h/jour sans HS)",
      description:
        "Débloquée si confiance Marie > 60. Gain de cadence sans brûler l'équipe.",
      categorie: "Jour 2 — Heures sup",
      impacts: [
        { label: "Pièces / jour", value: "+15", tone: "pos" },
        { label: "Moral", value: "+8", tone: "pos" },
        { label: "Coût", value: "0 €", tone: "pos" },
      ],
      deltas: { production: 15, moral: 8, piecesAujourdhui: 15 },
      xpReward: 80,
      timeCostMinutes: 40,
      journalNarration:
        "Réorganisation de Marie activée : +2 h utiles / jour sans heures sup. L'atelier te regarde autrement.",
    },
  ],
  3: [
    {
      id: "d3-repair",
      titre: "Réparer en urgence (12 k€, 1 jour d'arrêt)",
      description: "Machine 3 arrêtée 1 jour, puis saine.",
      categorie: "Jour 3 · 10h — PANNE MACHINE 3",
      impacts: [
        { label: "Coût", value: "-12 000 €", tone: "neg" },
        { label: "Arrêt", value: "1 jour", tone: "neg" },
        { label: "Qualité", value: "Préservée", tone: "pos" },
      ],
      deltas: { tresorerie: -12000, production: -15 },
      machineEffects: [{ machineId: "m3", etat: "ARRET" }],
      xpReward: 50,
      timeCostMinutes: 60,
      costEuros: 12000,
      journalNarration:
        "Réparation urgente lancée. Machine 3 rouge puis grise — un jour d'arrêt. Qualité préservée, volume en berne aujourd'hui.",
    },
    {
      id: "d3-bypass",
      titre: "Contourner sur Machines 1-2 (qualité -10 %)",
      description: "Continuer à produire en reportant la charge. Risque rebut.",
      categorie: "Jour 3 · 10h — PANNE MACHINE 3",
      impacts: [
        { label: "Volume", value: "Maintenu", tone: "pos" },
        { label: "Qualité", value: "-10 %", tone: "neg" },
        { label: "Rebut", value: "+8 pts", tone: "neg" },
      ],
      deltas: { production: 5, moral: -3 },
      machineEffects: [{ machineId: "m3", etat: "PANNE" }],
      xpReward: 25,
      timeCostMinutes: 30,
      journalNarration:
        "Tu contournes sur 1 et 2. La 3 reste rouge. Qualité -10 %, rebut en hausse. AutoVolt risque de le sentir.",
    },
    {
      id: "d3-externe",
      titre: "Prestataire externe (25 k€, réparé en 4 h)",
      description: "Cher, rapide. Machine 3 repart le jour même.",
      categorie: "Jour 3 · 10h — PANNE MACHINE 3",
      impacts: [
        { label: "Coût", value: "-25 000 €", tone: "neg" },
        { label: "Délai", value: "4 h", tone: "pos" },
        { label: "Machine 3", value: "PRODUCTION", tone: "pos" },
      ],
      deltas: { tresorerie: -25000, production: 5 },
      machineEffects: [{ machineId: "m3", etat: "PRODUCTION" }],
      xpReward: 60,
      timeCostMinutes: 45,
      costEuros: 25000,
      journalNarration:
        "Prestataire externe : 25 k€, 4 h. La Machine 3 repasse au vert. L'atelier respire — le cash un peu moins.",
    },
  ],
  4: [
    {
      id: "d4-livrer",
      titre: "Livrer les 40 pièces à micro-défaut",
      description: "Tenir le volume. Risque éthique et contrat.",
      categorie: "Jour 4 — Éthique",
      impacts: [
        { label: "Volume", value: "+40 pièces", tone: "pos" },
        { label: "Éthique", value: "-30", tone: "neg" },
        { label: "AutoVolt", value: "Risque élevé", tone: "neg" },
      ],
      deltas: { piecesAujourdhui: 40 },
      xpReward: 15,
      timeCostMinutes: 25,
      journalNarration:
        "Tu as livré les 40 pièces douteuses. Score éthique -30. Si AutoVolt découvre… le contrat peut sauter.",
    },
    {
      id: "d4-jeter",
      titre: "Jeter les 40 pièces et négocier le délai",
      description: "Éthique +20, confiance AutoVolt +10, volume à rattraper.",
      categorie: "Jour 4 — Éthique",
      impacts: [
        { label: "Éthique", value: "+20", tone: "pos" },
        { label: "AutoVolt", value: "+10 confiance", tone: "pos" },
        { label: "Volume", value: "-40 à refaire", tone: "neg" },
      ],
      deltas: {},
      xpReward: 70,
      timeCostMinutes: 35,
      journalNarration:
        "Tu as jeté les 40 pièces à micro-défaut. Éthique +20, AutoVolt +10. Il faudra négocier le délai — et produire juste.",
    },
  ],
  5: [
    {
      id: "d5-nego-dur",
      titre: "Négociation dure — tenir les 500 sans rabais",
      description: "Exiger le maintien du contrat sur la base de tes choix.",
      categorie: "Jour 5 — Négociation AutoVolt",
      impacts: [
        { label: "AutoVolt", value: "Selon éthique & volume", tone: "neu" },
        { label: "Pression", value: "Maximale", tone: "neg" },
      ],
      deltas: {},
      xpReward: 40,
      timeCostMinutes: 45,
      journalNarration:
        "Négociation dure avec AutoVolt. Tu joues le volume et la franchise. Le débrief tombe à 16h.",
    },
    {
      id: "d5-nego-transparence",
      titre: "Transparence totale + plan qualité",
      description: "Avouer les écarts, promettre capteurs et process.",
      categorie: "Jour 5 — Négociation AutoVolt",
      impacts: [
        { label: "Éthique", value: "+10", tone: "pos" },
        { label: "AutoVolt", value: "+15 si honnête", tone: "pos" },
        { label: "Délai", value: "Possible souplesse", tone: "pos" },
      ],
      deltas: {},
      xpReward: 80,
      timeCostMinutes: 50,
      journalNarration:
        "Tu as mis cartes sur table. AutoVolt écoute le plan qualité. La confiance se joue maintenant sur les faits — et le débrief de 16h.",
    },
    {
      id: "d5-nego-prix",
      titre: "Proposer un geste prix pour sauver le volume",
      description: "Marge en moins, contrat peut-être sauvé.",
      categorie: "Jour 5 — Négociation AutoVolt",
      impacts: [
        { label: "Trésorerie", value: "-20 000 €", tone: "neg" },
        { label: "AutoVolt", value: "+8", tone: "pos" },
      ],
      deltas: { tresorerie: -20000 },
      xpReward: 35,
      timeCostMinutes: 40,
      costEuros: 20000,
      journalNarration:
        "Geste prix de 20 k€. AutoVolt apprécie le signal. Reste à voir si le volume qualité suffit à 16h.",
    },
  ],
};

export function emailsForDay(day: number): Email[] {
  const common: Email[] = [];
  if (day >= 1) {
    common.push({
      id: "em-d1-laurent",
      from: "Laurent Perrin",
      subject: "Où en est le retard ?",
      preview: "Point 08:15. J'attends un statut clair avant midi.",
      body: "Bonjour,\n\nOù en est le retard ?\n\nAutoVolt appelle cet après-midi. Je veux un statut clair avant midi — causes, pas de langue de bois.\n\nLaurent Perrin\nDirecteur",
      time: "08:15",
      read: false,
      urgent: true,
    });
    common.push({
      id: "em-d1-com",
      from: "Commercial AutoVolt (interne)",
      subject: "Tout va bien avec AutoVolt",
      preview: "Relation saine, pas d'inquiétude à remonter…",
      body: "Hello,\n\nPour info : tout va bien avec AutoVolt. Relation saine, pas d'inquiétude à remonter en COMEX.\n\nBonne journée,",
      time: "08:40",
      read: false,
    });
    common.push({
      id: "em-d1-metalpro",
      from: "MétalPro — Logistique",
      subject: "Retard livraison acier",
      preview: "Coil 2mm : retard probable 48–72 h sur votre commande…",
      body: "Bonjour Novacier,\n\nNous accusons un retard sur votre coil acier 2mm (réf. AC-2MM).\nLivraison initiale décalée de 48 à 72 h.\n\nNous vous tiendrons informés.\n\nMétalPro Logistique",
      time: "08:55",
      read: false,
    });
  }
  if (day >= 2) {
    common.push({
      id: "em-d2-com",
      from: "Commercial AutoVolt (interne)",
      subject: "Tout va bien côté AutoVolt",
      preview: "Relation saine, pas d'inquiétude à remonter…",
      body: "Hello,\n\nPour info : tout va bien côté AutoVolt. Relation saine, pas d'inquiétude à remonter en COMEX.\n\nBonne journée,",
      time: "09:10",
      read: false,
    });
    common.push({
      id: "em-d2-laurent",
      from: "Laurent Perrin",
      subject: "Heures sup — décision aujourd'hui",
      preview: "On a besoin de volume. Tranchez avant 14h.",
      body: "On a besoin de volume cette semaine.\nTranchez sur les heures sup avant 14h.\n\nLP",
      time: "08:40",
      read: false,
      urgent: true,
    });
  }
  if (day >= 3) {
    common.push({
      id: "em-d3-alarme",
      from: "Supervision Atelier",
      subject: "ALARME — Machine 3 en panne",
      preview: "Arrêt détecté 10:00. Intervention requise.",
      body: "ALARME AUTOMATIQUE\n\nMachine 3 — panne détectée à 10:00.\nProduction ligne impactée.\nOuvrez l'Atelier Live et décidez.",
      time: "10:00",
      read: false,
      urgent: true,
    });
  }
  if (day >= 4) {
    common.push({
      id: "em-d4-qualite",
      from: "Contrôle Qualité",
      subject: "40 pièces — micro-défaut détecté",
      preview: "Lot A-42 : micro-fissures. Décision livraison requise.",
      body: "40 pièces du lot Support Moteur A-42 présentent un micro-défaut.\nDécision : livrer ou jeter + négocier délai.\n\nQualité",
      time: "09:30",
      read: false,
      urgent: true,
    });
  }
  if (day >= 5) {
    common.push({
      id: "em-d5-autovolt",
      from: "AutoVolt — Achats",
      subject: "Point contrat — aujourd'hui 14h / débrief 16h",
      preview: "Nous attendons vos chiffres et votre position.",
      body: "Bonjour,\n\nPoint négociation aujourd'hui. Nous attendons volume qualité et transparence sur les écarts.\nDébrief interne de votre côté à 16h — nous aussi.\n\nAutoVolt Achats",
      time: "08:20",
      read: false,
      urgent: true,
    });
  }
  return common;
}

export function messagesForDay(day: number): ChatMessage[] {
  const msgs: ChatMessage[] = [
    {
      id: "msg-henri-d1",
      from: "Henri Vallon",
      role: "Mentor",
      text: "Bienvenue dans la semaine. Lis le mail de Laurent à 08:15. Puis parle à Karim — il sait des choses.",
      time: "08:05",
      mentor: true,
    },
  ];
  if (day >= 1) {
    msgs.push({
      id: "msg-karim-d1",
      from: "Karim Benali",
      role: "Maintenance",
      text: "En douce : le capteur de la Machine 3 est mort. 5k€. Si tu n'installes rien, tu resteras en ???.",
      time: "08:35",
      alert: true,
    });
  }
  if (day >= 2) {
    msgs.push({
      id: "msg-karim-d2",
      from: "Karim Benali",
      role: "Maintenance",
      text: "La rumeur Pologne… mon contact chez AutoVolt confirme qu'ils ont un devis. Le mail « tout va bien » est faux.",
      time: "09:25",
      alert: true,
    });
    msgs.push({
      id: "msg-marie-d2",
      from: "Marie Dubois",
      role: "Cheffe atelier",
      text: "Si tu m'écoutes vraiment, on peut réorganiser sans HS. Sinon bon courage avec le moral.",
      time: "10:05",
    });
  }
  if (day >= 3) {
    msgs.push({
      id: "msg-alarme-d3",
      from: "Supervision",
      role: "Système",
      text: "🚨 10:00 — MACHINE 3 EN PANNE. Atelier Live en alarme rouge.",
      time: "10:00",
      alert: true,
    });
  }
  if (day >= 4) {
    msgs.push({
      id: "msg-qualite-d4",
      from: "Léa (Qualité)",
      role: "Qualité",
      text: "40 pièces micro-défaut. Je ne signe pas la conformité si on livre.",
      time: "09:35",
      alert: true,
    });
  }
  if (day >= 5) {
    msgs.push({
      id: "msg-henri-d5",
      from: "Henri Vallon",
      role: "Mentor",
      text: "Dernier jour. Négocie. À 16h, on regarde le score — pièces qualité et éthique.",
      time: "08:10",
      mentor: true,
    });
  }
  return msgs;
}

export function eventsForDay(day: number): CompanyEvent[] {
  const events: CompanyEvent[] = [
    {
      id: "ev-start",
      kind: "AUTRE",
      titre: "Semaine critique AutoVolt",
      description: "Objectif : 500 pièces qualité avant vendredi 16h.",
      timestamp: "08:00",
    },
  ];
  if (day >= 2) {
    events.push({
      id: "ev-rumor-pl",
      kind: "RUMEUR",
      titre: "Rumeur : AutoVolt a contacté un concurrent en Pologne",
      description:
        "À vérifier par interview (Karim). Le commercial dit le contraire.",
      timestamp: "09:00",
      isRumor: true,
      rumorResolved: null,
    });
  }
  if (day >= 3) {
    events.push({
      id: "ev-panne-m3",
      kind: "MACHINE",
      titre: "PANNE MACHINE 3",
      description: "Alarme 10:00 — ouvrir l'Atelier Live.",
      timestamp: "10:00",
    });
  }
  if (day >= 4) {
    events.push({
      id: "ev-defaut",
      kind: "AUTRE",
      titre: "40 pièces à micro-défaut",
      description: "Décision éthique : livrer ou jeter.",
      timestamp: "09:30",
    });
  }
  if (day >= 5) {
    events.push({
      id: "ev-nego",
      kind: "CONTRAT",
      titre: "Négociation AutoVolt",
      description: "Dialogues + décision. Débrief 16h00.",
      timestamp: "14:00",
    });
  }
  return events;
}

export const scenarioRumor: Rumor = {
  id: "rum-autovolt-pl",
  titre: "AutoVolt / concurrent Pologne",
  texte: "AutoVolt aurait demandé un devis en Pologne.",
  verified: null,
  eventId: "ev-rumor-pl",
};

export const dayTitles: Record<number, string> = {
  1: "Jour 1 — Le brouillard",
  2: "Jour 2 — Rumeur & pression",
  3: "Jour 3 — Panne Machine 3",
  4: "Jour 4 — Éthique",
  5: "Jour 5 — Négociation & débrief",
};

export const initialKpiVisibility: Record<string, VisibilityLevel> = {
  tresorerie: "INCONNU",
  production: "INCONNU",
  moral: "INCONNU",
  pieces: "INCONNU",
  panne: "INCONNU",
  rebut: "INCONNU",
  stock: "INCONNU",
  ethique: "PRECIS",
  autovolt: "ESTIME",
};
