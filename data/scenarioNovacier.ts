/**
 * Novacier scenario — all numbers & copy live here.
 * Changing a figure here must change gameplay without touching the engine.
 */

import type { Decision } from "@/lib/decisions";
import {
  emptyCibleesProgress,
  emptyGeneralesProgress,
} from "@/lib/competences";
import type { GameState, ScenarioRules } from "@/lib/gameState";
import { formatClockFromMinutes } from "@/lib/gameState";

export const SCENARIO_ID = "novacier-semaine-qui-decide";
export const ENTREPRISE_ID = "ent-novacier";
export const SCENARIO_TITLE = "NOVACIER — La Semaine Qui Décide De Tout";
export const TARGET_PIECES = 500;

export const NOVACIER_RULES: ScenarioRules = {
  dayLengthMinutes: 10 * 60, // 08:00 → 18:00
  machineDownProductionFactor: 0.55,
  bypassProductionFactor: 0.95,
  endingBands: [
    {
      id: "ECHEC",
      minQualite: 0,
      maxQualite: 399,
      minEthique: 0,
      maxEthique: 100,
    },
    {
      id: "ECHEC",
      minQualite: 0,
      maxQualite: 5000,
      minEthique: 0,
      maxEthique: 19,
    },
    {
      id: "VICTOIRE",
      minQualite: 480,
      maxQualite: 5000,
      minEthique: 51,
      maxEthique: 100,
    },
    {
      id: "PARTIELLE",
      minQualite: 400,
      maxQualite: 479,
      minEthique: 20,
      maxEthique: 100,
    },
    {
      id: "PARTIELLE",
      minQualite: 480,
      maxQualite: 5000,
      minEthique: 20,
      maxEthique: 50,
    },
  ],
  endingXp: { VICTOIRE: 500, PARTIELLE: 200, ECHEC: 50 },
};

export const novacierDecisions: Decision[] = [
  {
    id: "dec-jour-1",
    titre: "Cause du retard",
    jour: 1,
    dilemme:
      "La production stagne et les KPIs affichent ???. Comment lever le brouillard — ou non ?",
    categorie: "Jour 1 · 12h — Cause du retard",
    xpGagne: 0, // per-choice xp via consequences
    bankProduction: true,
    choix: [
      {
        id: "d1-machine",
        label: "Commander une nouvelle machine (80 k€)",
        description:
          "Investissement lourd. Livraison hors délai pour cette semaine critique.",
        feedbackTexte:
          "Nouvelle machine commandée — trop tard pour cette semaine",
        impacts: [
          { label: "Trésorerie", value: "-80 000 €", tone: "neg" },
          { label: "Cette semaine", value: "Aucun gain", tone: "neg" },
          { label: "Visibilité", value: "Inchangée", tone: "neu" },
        ],
        competencesImpactees: [
          {
            competenceId: "priorisation",
            type: "generale",
            xp: 10,
            feedback: "Tu as priorisé un capex long terme alors que l'échéance contrat est cette semaine.",
          },
          {
            competenceId: "planification_mrp",
            type: "ciblee",
            xp: 5,
            indicateurIndex: 2,
            feedback: "Tu n'as pas recalculé le besoin net de la semaine : la machine n'arrive pas à temps.",
          },
        ],
        consequences: [
          { cible: "tresorerie", valeur: -80000 },
          { cible: "temps", valeur: 30 },
          { cible: "xp", valeur: 20 },
        ],
      },
      {
        id: "d1-capteur",
        label: "Installer le capteur Machine 3 (5 k€)",
        description:
          "Remplace le capteur mort. Débloque les KPIs réels : rebut 18 %, prod ~60/jour.",
        feedbackTexte: "Données débloquées — rebut réel 18 %, prod 60/jour",
        impacts: [
          { label: "Trésorerie", value: "-5 000 €", tone: "neg" },
          { label: "Visibilité", value: "PRÉCIS / LIVE", tone: "pos" },
          { label: "Vérité", value: "Rebut 18 %", tone: "pos" },
        ],
        competencesImpactees: [
          {
            competenceId: "decision_incertitude",
            type: "generale",
            xp: 25,
            feedback: "Tu as levé l'incertitude avec une mesure réelle (rebut, cadence) avant d'agir.",
          },
          {
            competenceId: "qualite",
            type: "ciblee",
            xp: 20,
            indicateurIndex: 0,
            feedback: "Tu as mesuré le taux de défaut réel (18 %) au lieu de décider à l'aveugle.",
          },
        ],
        consequences: [
          { cible: "tresorerie", valeur: -5000 },
          { cible: "visibilite.erp", valeur: 2, mode: "set" },
          { cible: "visibilite.stock", valeur: 2, mode: "set" },
          { cible: "visibilite.production", valeur: 3, mode: "set" },
          { cible: "confiance.karim", valeur: 10 },
          { cible: "temps", valeur: 45 },
          { cible: "xp", valeur: 100 },
          { cible: "flags.sensorInstalled", valeur: 1, mode: "set" },
          { cible: "tauxRebut", valeur: 18, mode: "set" },
          { cible: "production", valeur: 60, mode: "set" },
          { cible: "badge.badge-eye", valeur: 1, mode: "set" },
        ],
      },
      {
        id: "d1-rien",
        label: "Ne rien faire pour l'instant",
        description: "Reporter l'investissement. Rester dans le brouillard.",
        feedbackTexte: "Tu n'as rien investi. Les KPIs restent des ???.",
        impacts: [
          { label: "Cash", value: "Préservé", tone: "pos" },
          { label: "Visibilité", value: "Toujours ???", tone: "neg" },
          { label: "Risque", value: "Élevé", tone: "neg" },
        ],
        competencesImpactees: [
          {
            competenceId: "decision_incertitude",
            type: "generale",
            xp: 5,
            feedback: "Tu as maintenu l'incertitude sans critère d'arrêt ni hypothèse explicite.",
          },
          {
            competenceId: "priorisation",
            type: "generale",
            xp: 5,
            feedback: "Tu as reporté l'action critique sans ordonner les risques contrat / rebut.",
          },
        ],
        consequences: [
          { cible: "temps", valeur: 10 },
          { cible: "xp", valeur: 5 },
        ],
      },
    ],
  },
  {
    id: "dec-jour-2",
    titre: "Heures supplémentaires",
    jour: 2,
    dilemme: "Il faut du volume. Brûler l'équipe en HS, refuser, ou écouter Marie ?",
    categorie: "Jour 2 — Heures sup",
    xpGagne: 0,
    bankProduction: true,
    choix: [
      {
        id: "d2-hs",
        label: "Imposer 3 h supplémentaires",
        description: "+20 pièces/jour, coût 15 k€, moral et Marie en souffrance.",
        feedbackTexte: "Heures sup décrétées. +20 pièces/jour, moral et Marie en berne.",
        impacts: [
          { label: "Coût", value: "-15 000 €", tone: "neg" },
          { label: "Pièces / jour", value: "+20", tone: "pos" },
          { label: "Moral", value: "-15", tone: "neg" },
          { label: "Marie", value: "-10 confiance", tone: "neg" },
        ],
        competencesImpactees: [
          {
            competenceId: "leadership",
            type: "generale",
            xp: 15,
            feedback: "Tu as imposé une priorité volume sans sécuriser la confiance de l'équipe.",
          },
          {
            competenceId: "ordonnancement",
            type: "ciblee",
            xp: 15,
            indicateurIndex: 2,
            feedback: "Tu as poussé le volume AutoVolt via HS, sans séquence OF publiée.",
          },
        ],
        consequences: [
          { cible: "tresorerie", valeur: -15000 },
          { cible: "moral", valeur: -15 },
          { cible: "confiance.marie", valeur: -10 },
          { cible: "flags.overtimeBonus", valeur: 20, mode: "set" },
          { cible: "production", valeur: 20 },
          { cible: "temps", valeur: 30 },
          { cible: "xp", valeur: 30 },
        ],
      },
      {
        id: "d2-no-hs",
        label: "Refuser les heures supplémentaires",
        description: "Préserver le moral. Compter sur l'organisation.",
        feedbackTexte: "Pas d'heures sup. Marie apprécie.",
        impacts: [
          { label: "Moral", value: "Stable / +5", tone: "pos" },
          { label: "Marie", value: "+8 confiance", tone: "pos" },
          { label: "Volume", value: "Pas de boost", tone: "neu" },
        ],
        competencesImpactees: [
          {
            competenceId: "leadership",
            type: "generale",
            xp: 20,
            feedback: "Tu as préservé la confiance atelier en refusant de brûler l'équipe.",
          },
          {
            competenceId: "communication",
            type: "generale",
            xp: 15,
            feedback: "Tu as clarifié le non aux HS avec un statut moral / volume compréhensible.",
          },
        ],
        consequences: [
          { cible: "moral", valeur: 5 },
          { cible: "confiance.marie", valeur: 8 },
          { cible: "temps", valeur: 20 },
          { cible: "xp", valeur: 40 },
        ],
      },
      {
        id: "d2-marie-reorg",
        label: "Réorganisation Marie (+2 h/jour sans HS)",
        description:
          "Débloquée si confiance Marie > 60. Gain de cadence sans brûler l'équipe.",
        feedbackTexte:
          "Réorganisation de Marie activée : +2 h utiles / jour sans heures sup.",
        impacts: [
          { label: "Pièces / jour", value: "+15", tone: "pos" },
          { label: "Moral", value: "+8", tone: "pos" },
          { label: "Coût", value: "0 €", tone: "pos" },
        ],
        requis: [{ si: "confiance.marie", superieurA: 60 }],
        competencesImpactees: [
          {
            competenceId: "leadership",
            type: "generale",
            xp: 30,
            feedback: "Tu as aligné l'atelier sur une réorganisation portée par Marie, sans HS.",
          },
          {
            competenceId: "ordonnancement",
            type: "ciblee",
            xp: 25,
            indicateurIndex: 0,
            feedback: "Tu as publié une séquence de journée (+2 h utiles) sans surcharger en HS.",
          },
        ],
        consequences: [
          { cible: "moral", valeur: 8 },
          { cible: "production", valeur: 15 },
          { cible: "flags.marieReorgBonus", valeur: 15, mode: "set" },
          { cible: "temps", valeur: 40 },
          { cible: "xp", valeur: 80 },
        ],
      },
    ],
  },
  {
    id: "dec-jour-3",
    titre: "Panne Machine 3",
    jour: 3,
    dilemme: "10h00 — Machine 3 en panne. Réparer, contourner, ou appeler un prestataire ?",
    categorie: "Jour 3 · 10h — PANNE MACHINE 3",
    xpGagne: 0,
    bankProduction: true,
    choix: [
      {
        id: "d3-repair",
        label: "Réparer en urgence (12 k€, 1 jour d'arrêt)",
        description: "Machine 3 arrêtée 1 jour, puis saine.",
        feedbackTexte: "Machine 3 en réparation — atelier mis à jour",
        impacts: [
          { label: "Coût", value: "-12 000 €", tone: "neg" },
          { label: "Arrêt", value: "1 jour", tone: "neg" },
          { label: "Qualité", value: "Préservée", tone: "pos" },
        ],
        competencesImpactees: [
          {
            competenceId: "gestion_crise",
            type: "generale",
            xp: 25,
            feedback: "Tu as contenu le risque qualité en acceptant un arrêt planifié plutôt qu'un bypass.",
          },
          {
            competenceId: "maintenance",
            type: "ciblee",
            xp: 30,
            indicateurIndex: 1,
            feedback: "Tu as estimé une fenêtre d'arrêt (1 jour) et un coût MTTR avant de relancer.",
          },
        ],
        consequences: [
          { cible: "tresorerie", valeur: -12000 },
          { cible: "production", valeur: -15 },
          { cible: "flags.machine3DownDays", valeur: 1, mode: "set" },
          { cible: "flags.alarmActive", valeur: 0, mode: "set" },
          { cible: "machine.m3.etat", valeur: 0, setValeur: "ARRET" },
          { cible: "temps", valeur: 60 },
          { cible: "xp", valeur: 50 },
        ],
      },
      {
        id: "d3-bypass",
        label: "Contourner sur Machines 1-2 (qualité -10 %)",
        description: "Continuer à produire en reportant la charge. Risque rebut.",
        feedbackTexte: "Contournement actif — qualité -10 %, Machine 3 rouge",
        impacts: [
          { label: "Volume", value: "Maintenu", tone: "pos" },
          { label: "Qualité", value: "-10 %", tone: "neg" },
          { label: "Rebut", value: "+8 pts", tone: "neg" },
        ],
        competencesImpactees: [
          {
            competenceId: "gestion_crise",
            type: "generale",
            xp: 15,
            feedback: "Tu as réagi vite, mais sans isoler la cause avant de contourner.",
          },
          {
            competenceId: "maintenance",
            type: "ciblee",
            xp: 10,
            indicateurIndex: 2,
            feedback: "Tu as documenté un bypass avec risque rebut (+8 pts) — sans plan de réparation.",
          },
        ],
        consequences: [
          { cible: "production", valeur: 5 },
          { cible: "moral", valeur: -3 },
          { cible: "tauxRebut", valeur: 8 },
          { cible: "flags.machine3Bypass", valeur: 1, mode: "set" },
          { cible: "flags.alarmActive", valeur: 1, mode: "set" },
          { cible: "machine.m3.etat", valeur: 0, setValeur: "PANNE" },
          { cible: "temps", valeur: 30 },
          { cible: "xp", valeur: 25 },
        ],
      },
      {
        id: "d3-externe",
        label: "Prestataire externe (25 k€, réparé en 4 h)",
        description: "Cher, rapide. Machine 3 repart le jour même.",
        feedbackTexte: "Machine 3 réparée (prestataire) — retour au vert",
        impacts: [
          { label: "Coût", value: "-25 000 €", tone: "neg" },
          { label: "Délai", value: "4 h", tone: "pos" },
          { label: "Machine 3", value: "PRODUCTION", tone: "pos" },
        ],
        competencesImpactees: [
          {
            competenceId: "gestion_crise",
            type: "generale",
            xp: 30,
            feedback: "Tu as contenu l'arrêt sous 4 h avec un plan prestataire clair.",
          },
          {
            competenceId: "maintenance",
            type: "ciblee",
            xp: 25,
            indicateurIndex: 0,
            feedback: "Tu as nommé la cause et externalisé le diagnostic pour un retour PRODUCTION le jour même.",
          },
        ],
        consequences: [
          { cible: "tresorerie", valeur: -25000 },
          { cible: "production", valeur: 5 },
          { cible: "flags.machine3DownDays", valeur: 0, mode: "set" },
          { cible: "flags.alarmActive", valeur: 0, mode: "set" },
          { cible: "machine.m3.etat", valeur: 0, setValeur: "PRODUCTION" },
          { cible: "temps", valeur: 45 },
          { cible: "xp", valeur: 60 },
        ],
      },
    ],
  },
  {
    id: "dec-jour-4",
    titre: "Éthique",
    jour: 4,
    dilemme: "40 pièces à micro-défaut. Livrer pour le volume, ou jeter et négocier ?",
    categorie: "Jour 4 — Éthique",
    xpGagne: 0,
    bankProduction: true,
    choix: [
      {
        id: "d4-livrer",
        label: "Livrer les 40 pièces à micro-défaut",
        description: "Tenir le volume. Risque éthique et contrat.",
        feedbackTexte: "40 pièces livrées — éthique -30",
        impacts: [
          { label: "Volume", value: "+40 pièces", tone: "pos" },
          { label: "Éthique", value: "-30", tone: "neg" },
          { label: "AutoVolt", value: "Risque élevé", tone: "neg" },
        ],
        competencesImpactees: [
          {
            competenceId: "priorisation",
            type: "generale",
            xp: 10,
            feedback: "Tu as priorisé le volume contrat au détriment du risque client.",
          },
          {
            competenceId: "qualite",
            type: "ciblee",
            xp: 5,
            indicateurIndex: 2,
            feedback: "Tu as chiffré l'impact éthique (−30) mais choisi de livrer sans tri.",
          },
        ],
        consequences: [
          { cible: "ethique", valeur: -30 },
          { cible: "confianceClient", valeur: -15 },
          { cible: "piecesAujourdhui", valeur: 40 },
          { cible: "piecesBrutesSemaine", valeur: 40 },
          { cible: "qualite", valeur: 40 },
          { cible: "temps", valeur: 25 },
          { cible: "xp", valeur: 15 },
        ],
      },
      {
        id: "d4-jeter",
        label: "Jeter les 40 pièces et négocier le délai",
        description: "Éthique +20, confiance AutoVolt +10, volume à rattraper.",
        feedbackTexte: "Pièces jetées — éthique +20, AutoVolt +10",
        impacts: [
          { label: "Éthique", value: "+20", tone: "pos" },
          { label: "AutoVolt", value: "+10 confiance", tone: "pos" },
          { label: "Volume", value: "-40 à refaire", tone: "neg" },
        ],
        competencesImpactees: [
          {
            competenceId: "communication",
            type: "generale",
            xp: 20,
            feedback: "Tu as formulé un statut honnête vers AutoVolt : rebut + négociation de délai.",
          },
          {
            competenceId: "qualite",
            type: "ciblee",
            xp: 30,
            indicateurIndex: 1,
            feedback: "Tu as décidé rebut argumenté plutôt que livraison de micro-défauts.",
          },
        ],
        consequences: [
          { cible: "ethique", valeur: 20 },
          { cible: "confianceClient", valeur: 10 },
          { cible: "badge.badge-ethique", valeur: 1, mode: "set" },
          { cible: "temps", valeur: 35 },
          { cible: "xp", valeur: 70 },
        ],
      },
    ],
  },
  {
    id: "dec-jour-5",
    titre: "Négociation AutoVolt",
    jour: 5,
    dilemme: "Dernier jour. Comment jouer la négociation avec AutoVolt ?",
    categorie: "Jour 5 — Négociation AutoVolt",
    xpGagne: 0,
    bankProduction: true,
    choix: [
      {
        id: "d5-nego-dur",
        label: "Négociation dure — tenir les 500 sans rabais",
        description: "Exiger le maintien du contrat sur la base de tes choix.",
        feedbackTexte:
          "Négociation dure avec AutoVolt. Le débrief tombe à 16h.",
        impacts: [
          { label: "AutoVolt", value: "Selon éthique & volume", tone: "neu" },
          { label: "Pression", value: "Maximale", tone: "neg" },
        ],
        // Base -5; if éthique≥50 AND qualité≥400 → +10 more (net +5)
        competencesImpactees: [
          {
            competenceId: "negociation",
            type: "generale",
            xp: 25,
            feedback: "Tu as tenu le cadre prix/volume sans offrir de contrepartie mesurable.",
          },
          {
            competenceId: "communication",
            type: "generale",
            xp: 15,
            feedback: "Tu as poussé un statut ferme ; la réception AutoVolt dépend de tes chiffres.",
          },
        ],
        consequences: [
          { cible: "confianceClient", valeur: -5 },
          { cible: "temps", valeur: 45 },
          { cible: "xp", valeur: 40 },
        ],
        conditions: [
          {
            si: "humain.ethique",
            superieurA: 49,
            et: [{ si: "finance.qualite", superieurA: 399 }],
            alorsEffetSupplementaire: [
              { cible: "confianceClient", valeur: 10 },
            ],
          },
        ],
      },
      {
        id: "d5-nego-transparence",
        label: "Transparence totale + plan qualité",
        description: "Avouer les écarts, promettre capteurs et process.",
        feedbackTexte: "Tu as mis cartes sur table. AutoVolt écoute le plan qualité.",
        impacts: [
          { label: "Éthique", value: "+10", tone: "pos" },
          { label: "AutoVolt", value: "+15 si honnête", tone: "pos" },
          { label: "Délai", value: "Possible souplesse", tone: "pos" },
        ],
        competencesImpactees: [
          {
            competenceId: "negociation",
            type: "generale",
            xp: 30,
            feedback: "Tu as échangé transparence (écarts + plan) contre écoute client.",
          },
          {
            competenceId: "qualite",
            type: "ciblee",
            xp: 20,
            indicateurIndex: 2,
            feedback: "Tu as chiffré l'impact client et proposé un plan qualité explicite.",
          },
        ],
        consequences: [
          { cible: "ethique", valeur: 10 },
          { cible: "confianceClient", valeur: 15 },
          { cible: "temps", valeur: 50 },
          { cible: "xp", valeur: 80 },
        ],
      },
      {
        id: "d5-nego-agressive",
        label: "Négociation agressive",
        description:
          "Pousser AutoVolt au maximum : volume + prix. Exige Négociation Niveau 2.",
        feedbackTexte:
          "Tu as mené une négociation agressive. AutoVolt cède du terrain — au prix d'une tension nette.",
        messageVerrouillage:
          "Nécessite Négociation Niveau 2 — Va t'entraîner en Mode Compétence",
        requis: [{ si: "competence.negociation", superieurA: 1 }],
        impacts: [
          { label: "AutoVolt", value: "+12", tone: "pos" },
          { label: "Trésorerie", value: "+8 000 €", tone: "pos" },
          { label: "Relation", value: "Tendue", tone: "neg" },
        ],
        competencesImpactees: [
          {
            competenceId: "negociation",
            type: "generale",
            xp: 35,
            feedback: "Tu as obtenu volume + cash (+8 k€) avec une contrepartie relationnelle tendue.",
          },
          {
            competenceId: "priorisation",
            type: "generale",
            xp: 15,
            feedback: "Tu as priorisé le levier commercial immédiat sur la relation long terme.",
          },
        ],
        consequences: [
          { cible: "confianceClient", valeur: 12 },
          { cible: "tresorerie", valeur: 8000 },
          { cible: "moral", valeur: -5 },
          { cible: "temps", valeur: 45 },
          { cible: "xp", valeur: 90 },
        ],
      },
    ],
  },
];

/**
 * Initial GameState for Novacier — single source for starting numbers.
 */
export function createNovacierInitialState(): GameState {
  const dayLength = NOVACIER_RULES.dayLengthMinutes;
  const minutesSinceStart = 0;
  return {
    modeActuel: null,
    scenarioCompetenceId: null,
    scenarioHistoireId: SCENARIO_ID,
    meta: {
      scenarioId: SCENARIO_ID,
      entrepriseId: ENTREPRISE_ID,
      roleId: null,
      jourActuel: 0,
      heureActuelle: formatClockFromMinutes(minutesSinceStart),
      tempsRestantMinutes: dayLength,
      week: 1,
      minutesSinceStart,
      dayLengthMinutes: dayLength,
      rules: NOVACIER_RULES,
    },
    finance: {
      tresorerie: 420_000,
      stockKg: 850,
      productionParJour: 60,
      tauxRebut: 18,
      qualite: 0,
      piecesBrutesSemaine: 0,
      piecesAujourdhui: 0,
    },
    humain: {
      moralEquipe: 55,
      ethique: 80,
      confianceClient: 60,
    },
    relations: {
      "pers-marie": 30,
      "pers-karim": 70,
      "pers-laurent": 50,
      "pers-henri": 65,
      marie: 30,
      karim: 70,
      laurent: 50,
      henri: 65,
    },
    progression: {
      xp: 0,
      niveau: 1,
      competencesGenerales: emptyGeneralesProgress(),
      competencesCiblees: emptyCibleesProgress("prod"),
    },
    visibilite: {
      erp: 0,
      stock: 0,
      production: 0,
    },
    historique: {
      decisionsPrises: [],
      evenementsDeclenches: [],
    },
    flags: {
      sensorInstalled: 0,
      overtimeBonus: 0,
      marieReorgBonus: 0,
      machine3DownDays: 0,
      machine3Bypass: 0,
      alarmActive: 0,
      dailyProductionBase: 60,
    },
    world: {
      mode: null,
      ending: null,
      showDebrief: false,
      alarmActive: false,
      scenarioActive: true,
      dayDecisionId: null,
      feedbackFlash: null,
      introSeen: false,
      onboardingStep: 1,
      onboardingDone: false,
      unlockedActions: ["ACCESS_COMPUTER", "VIEW_ATELIER_LIVE"],
      chapterId: "ch-semaine",
      chapters: [],
      journal: [],
      badges: [],
      objectives: [],
      machines: [],
      emails: [],
      messages: [],
      events: [],
      rumors: [],
      unlockedInfos: [],
      skillProgress: {},
      trainingsCompleted: [],
      histoiresCompleted: [],
      trainingPrompt: null,
      lastSkillDebrief: [],
      eventNotifications: [],
      urgentBanner: null,
      showDayEnd: false,
    },
  };
}

export function decisionForDay(day: number): Decision | undefined {
  return novacierDecisions.find((d) => d.jour === day);
}

export const dayTitles: Record<number, string> = {
  1: "Jour 1 — Le brouillard",
  2: "Jour 2 — Rumeur & pression",
  3: "Jour 3 — Panne Machine 3",
  4: "Jour 4 — Éthique",
  5: "Jour 5 — Négociation & débrief",
};
