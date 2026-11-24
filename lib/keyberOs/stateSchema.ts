/**
 * Catalogue du schéma d'état OS (Étape 1 V1).
 * Lecture seule Admin — aucun nom d'entreprise.
 * Scalable : on ajoute une famille ici quand un nouveau bloc d'état apparaît.
 */

export type OsStateFieldFamily = {
  id: string;
  label: string;
  role: string;
  fields: { path: string; meaning: string }[];
};

/**
 * Familles de champs de l'état de session Keyber OS.
 * Miroir générique du GameState POC — sans contenu métier.
 */
export const OS_STATE_FIELD_FAMILIES: OsStateFieldFamily[] = [
  {
    id: "session",
    label: "Session & paramétrage",
    role: "Identifie la partie et le fichier de paramétrage chargé.",
    fields: [
      { path: "sessionId", meaning: "Identifiant de session (souvent id Book)" },
      { path: "param", meaning: "Fichier de paramétrage (ScenarioParamFile)" },
      { path: "stepIndex", meaning: "Index d'étape décisionnelle courante" },
      { path: "decisions", meaning: "Liste des décisions parsées du param" },
      { path: "log", meaning: "Journal technique pipeline OS" },
      { path: "finished", meaning: "Scénario terminé" },
      { path: "feedback", meaning: "Dernier feedback texte joueur" },
    ],
  },
  {
    id: "meta",
    label: "Meta / temps",
    role: "Horloge, jour, semaine, durée de journée (module Temps).",
    fields: [
      { path: "meta.jourActuel", meaning: "Jour courant (0 = intro possible)" },
      { path: "meta.week", meaning: "Semaine courante" },
      { path: "meta.heureActuelle", meaning: "Horloge affichée HH:MM" },
      { path: "meta.minutesSinceStart", meaning: "Minutes écoulées dans la journée" },
      { path: "meta.dayLengthMinutes", meaning: "Longueur d'une journée" },
      { path: "meta.tempsRestantMinutes", meaning: "Minutes restantes avant DayEnd" },
      { path: "meta.roleId", meaning: "Id rôle (Mode Histoire) — générique" },
      { path: "meta.scenarioId", meaning: "Id scénario / session Book" },
      {
        path: "day / week / minutesSinceStart / dayLengthMinutes",
        meaning: "Miroirs plats (compat pipeline actuel)",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance & production",
    role: "Chiffres ERP / KPI (module ERP).",
    fields: [
      { path: "finance.tresorerie", meaning: "Trésorerie brute" },
      { path: "finance.stockKg", meaning: "Stock (unité générique)" },
      { path: "finance.productionParJour", meaning: "Production du jour" },
      { path: "finance.tauxRebut", meaning: "Taux de rebut" },
      { path: "finance.qualite", meaning: "Qualité cumulée" },
      { path: "finance.piecesBrutesSemaine", meaning: "Pièces brutes semaine" },
      { path: "finance.piecesAujourdhui", meaning: "Pièces aujourd'hui" },
      { path: "finance.commandes", meaning: "Compteur commandes" },
      {
        path: "tresorerieBrute / stock / production / commandes",
        meaning: "Miroirs plats (compat)",
      },
    ],
  },
  {
    id: "humain",
    label: "Humain",
    role: "Jauges humaines (KPI bar).",
    fields: [
      { path: "humain.moralEquipe", meaning: "Moral équipe" },
      { path: "humain.ethique", meaning: "Éthique" },
      { path: "humain.confianceClient", meaning: "Confiance client stratégique" },
    ],
  },
  {
    id: "relations",
    label: "Relations PNJ",
    role: "Confiance par slot personnage (ids génériques).",
    fields: [
      {
        path: "relations.<slotId>",
        meaning: "Score relation pour un PNJ (ex. pers-1)",
      },
    ],
  },
  {
    id: "progression",
    label: "Progression",
    role: "XP, niveaux, compétences (module Progression).",
    fields: [
      { path: "progression.xp", meaning: "XP globale" },
      { path: "progression.niveau", meaning: "Niveau global" },
      { path: "progression.score", meaning: "Score de partie" },
      {
        path: "progression.competencesGenerales",
        meaning: "Map id → { niveau, xp }",
      },
      {
        path: "progression.competencesCiblees",
        meaning: "Map id → { niveau, xp, indicateurs }",
      },
      { path: "xp / niveau / score", meaning: "Miroirs plats (compat)" },
    ],
  },
  {
    id: "visibilite",
    label: "Visibilité & capteurs",
    role: "Brouillard ERP / KPI (module Visibilité).",
    fields: [
      { path: "visibilite.level", meaning: "Niveau global 0–3" },
      { path: "visibilite.sensorInstalled", meaning: "Capteur installé" },
      {
        path: "visibilite.parModule",
        meaning: "Tiers par module / KPI (0 Inconnu … 3 Temps réel)",
      },
      {
        path: "visibilityLevel / sensorInstalled",
        meaning: "Miroirs plats (compat)",
      },
    ],
  },
  {
    id: "historique",
    label: "Historique",
    role: "Décisions prises et événements déclenchés.",
    fields: [
      {
        path: "historique.decisionsPrises",
        meaning: "Liste { decisionId, jour, choixId, heure }",
      },
      {
        path: "historique.evenementsDeclenches",
        meaning: "Ids / noms d'événements déjà tirés",
      },
      { path: "eventsFired", meaning: "Miroir plat (compat)" },
    ],
  },
  {
    id: "flags",
    label: "Flags",
    role: "Drapeaux numériques/booléens posés par conséquences (sans nom métier).",
    fields: [
      { path: "flags.<key>", meaning: "Flag générique (nombre)" },
    ],
  },
  {
    id: "world",
    label: "World / cycle de vie",
    role: "Phases, DayEnd, debrief, onboarding, chapitres, notifications.",
    fields: [
      {
        path: "world.phase",
        meaning: "INTRO | ONBOARDING | JOUR | DAY_END | DEBRIEF | FIN",
      },
      { path: "world.showDayEnd", meaning: "Overlay fin de journée" },
      { path: "world.showDebrief", meaning: "Écran debrief" },
      { path: "world.introSeen", meaning: "Intro déjà vue" },
      { path: "world.onboardingStep", meaning: "Étape coach 0–5" },
      { path: "world.onboardingDone", meaning: "Onboarding terminé" },
      { path: "world.unlockedActions", meaning: "Actions débloquées" },
      { path: "world.dayDecisionId", meaning: "Décision du jour (si prise)" },
      { path: "world.ending", meaning: "VICTOIRE | PARTIELLE | ECHEC | null" },
      { path: "world.chapters", meaning: "Chapitres (status VERROUILLE/ACTIF/…)" },
      { path: "world.chapterId", meaning: "Chapitre actif" },
      { path: "world.urgentBanner", meaning: "Bannière urgente ou null" },
      { path: "world.eventNotifications", meaning: "File de toasts events" },
      { path: "world.lastSkillDebrief", meaning: "Lignes debrief compétences" },
      { path: "world.alarmActive", meaning: "Alarme atelier" },
    ],
  },
  {
    id: "ordinateur",
    label: "Ordinateur (pack)",
    role: "Données apps (module Ordinateur) — toujours depuis le param.",
    fields: [
      { path: "computer.stock", meaning: "Lignes stock ERP" },
      { path: "computer.commandes", meaning: "Lignes commandes" },
      { path: "computer.production", meaning: "Lignes production" },
      { path: "computer.employes", meaning: "Employés" },
      { path: "computer.factures", meaning: "Factures" },
      { path: "computer.machines", meaning: "Machines" },
      { path: "computer.clients", meaning: "Clients" },
      { path: "computer.fournisseurs", meaning: "Fournisseurs" },
      { path: "computer.maintenance", meaning: "Maintenance (optionnel)" },
      { path: "computer.emails", meaning: "Boîte mail" },
      { path: "computer.chatContacts", meaning: "Contacts chat" },
      { path: "computer.chatThreads", meaning: "Fils de chat" },
      { path: "computer.documents", meaning: "Documents" },
      { path: "computer.browser", meaning: "Résultats browser" },
      { path: "computer.dashboardCards", meaning: "Cartes dashboard" },
      {
        path: "computer.dashboardSeries",
        meaning: "Séries graphiques dashboard (prod / pannes)",
      },
      { path: "computerApp", meaning: "App ouverte (erp|mail|…)" },
    ],
  },
  {
    id: "social",
    label: "Interviews & objectifs",
    role: "PNJ et objectifs de session.",
    fields: [
      { path: "interviews", meaning: "PNJ + lignes Q/R" },
      { path: "selectedInterviewId", meaning: "PNJ sélectionné" },
      { path: "objectives", meaning: "Objectifs EN_COURS / COMPLETE / ECHOUE" },
      { path: "world.badges", meaning: "Badges débloquables" },
      { path: "world.journal", meaning: "Entrées journal de bord" },
    ],
  },
  {
    id: "ui",
    label: "UI shell",
    role: "Action active du shell joueur (module Interface Joueur).",
    fields: [
      {
        path: "activeAction",
        meaning: "computer | decide | interview | atelier-live | null",
      },
    ],
  },
  {
    id: "clear-campus",
    label: "Clear Campus (param)",
    role: "Monde libre + Vue Live Production — données param Phase 1 (runtime Phase 2+).",
    fields: [
      { path: "param.ClearCampus.theme", meaning: "Toujours light" },
      {
        path: "param.ClearCampus.characterStyle",
        meaning: "vector | none",
      },
      { path: "param.Campus.wings[]", meaning: "Ailes du campus" },
      { path: "param.Campus.rooms[]", meaning: "Salles (wingId)" },
      {
        path: "param.Hotspots[]",
        meaning: "suite | interview | decision | document | productionLive",
      },
      {
        path: "param.ProductionLive",
        meaning: "zones / nodes / flows / vehicles / operators / kpis",
      },
      {
        path: "param.Suite",
        meaning: "Alias Ordinateur (fusion à la normalisation)",
      },
    ],
  },
  {
    id: "kpis",
    label: "KPI définitions",
    role: "Déclaratif : quelles jauges afficher (scalable).",
    fields: [
      { path: "kpis[].id", meaning: "Id jauge" },
      { path: "kpis[].label", meaning: "Libellé affiché" },
      { path: "kpis[].format", meaning: "number | percent | currency…" },
      { path: "kpis[].path", meaning: "Chemin dans l'état (ex. finance.tresorerie)" },
      { path: "kpis[].unit", meaning: "Unité optionnelle" },
    ],
  },
];

export function osStateSchemaFamilyCount(): number {
  return OS_STATE_FIELD_FAMILIES.length;
}

export function osStateSchemaFieldCount(): number {
  return OS_STATE_FIELD_FAMILIES.reduce((n, f) => n + f.fields.length, 0);
}
