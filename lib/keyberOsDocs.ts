/**
 * Contenu documentaire Keyber OS (Admin) — basé sur le code réel.
 * Aucun scénario / entreprise / exemple métier inventé.
 */

export type KeyberOsComposanteId =
  | "erp"
  | "moteur-scenarios"
  | "moteur-decisions"
  | "moteur-evenements"
  | "progression"
  | "interface-joueur"
  | "donnees-sauvegarde"
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
  | "profil";

export type KeyberOsNavItem = {
  id: KeyberOsComposanteId | "vue-globale";
  href: string;
  label: string;
  /** Une phrase pour la Vue Globale. */
  blurb: string;
};

export const KEYBER_OS_NAV: KeyberOsNavItem[] = [
  {
    id: "vue-globale",
    href: "/admin/systeme/vue-globale",
    label: "Vue Globale",
    blurb:
      "Flux moteur + pont Book → /jouer/book/[id] (officiel) ; /play = POC legacy.",
  },
  {
    id: "erp",
    href: "/admin/systeme/erp",
    label: "ERP",
    blurb: "Lit et affiche les chiffres (stocks, commandes, production…).",
  },
  {
    id: "moteur-scenarios",
    href: "/admin/systeme/moteur-scenarios",
    label: "Moteur de Scénarios",
    blurb: "Lit le fichier de paramétrage et avance l’étape / le jour en cours.",
  },
  {
    id: "moteur-decisions",
    href: "/admin/systeme/moteur-decisions",
    label: "Moteur de Décisions & Branches",
    blurb: "Propose les choix, applique les conséquences sur l’état du jeu.",
  },
  {
    id: "moteur-evenements",
    href: "/admin/systeme/moteur-evenements",
    label: "Moteur d'Événements",
    blurb: "Déclenche les événements du paramétrage selon l’heure et les conditions.",
  },
  {
    id: "progression",
    href: "/admin/systeme/progression",
    label: "Progression, Scores & Niveaux",
    blurb: "Calcule XP, niveaux de compétences et score global.",
  },
  {
    id: "interface-joueur",
    href: "/admin/systeme/interface-joueur",
    label: "Interface Joueur",
    blurb:
      "OsPlayShell sur /jouer/book/[id] : sidebar, horloge, KPI, objectifs, workspace.",
  },
  {
    id: "ordinateur",
    href: "/admin/systeme/ordinateur",
    label: "Ordinateur",
    blurb: "Apps : ERP, mail, chat, dashboard, documents, browser.",
  },
  {
    id: "temps",
    href: "/admin/systeme/temps",
    label: "Temps & Horloge",
    blurb: "Avance les minutes / jours à chaque action.",
  },
  {
    id: "cycle-vie",
    href: "/admin/systeme/cycle-vie",
    label: "Cycle de vie",
    blurb: "Intro, onboarding, DayEnd, passage de jour, débrief.",
  },
  {
    id: "notifications",
    href: "/admin/systeme/notifications",
    label: "Notifications",
    blurb: "Toasts événements et bannière urgente.",
  },
  {
    id: "interviews",
    href: "/admin/systeme/interviews",
    label: "Interviews / PNJ",
    blurb: "Dialogues multi-lignes avec choix (feeling POC).",
  },
  {
    id: "relations",
    href: "/admin/systeme/relations",
    label: "Relations",
    blurb: "Jauges de confiance PNJ (slots génériques).",
  },
  {
    id: "objectifs",
    href: "/admin/systeme/objectifs",
    label: "Objectifs",
    blurb: "Objectifs journaliers / hebdo et statut COMPLETE.",
  },
  {
    id: "visibilite",
    href: "/admin/systeme/visibilite",
    label: "Visibilité",
    blurb: "Brouillard ERP (???) et capteurs.",
  },
  {
    id: "journal",
    href: "/admin/systeme/journal",
    label: "Journal",
    blurb: "Journal de bord joueur = historique OS (world.journal).",
  },
  {
    id: "livre",
    href: "/admin/systeme/livre",
    label: "Livre",
    blurb: "Livre de l'entreprise = param.Livre (structure, lore Phase E).",
  },
  {
    id: "profil",
    href: "/admin/systeme/profil",
    label: "Profil",
    blurb: "Profil joueur = XP, skills, badges (Progression OS).",
  },
  {
    id: "donnees-sauvegarde",
    href: "/admin/systeme/donnees-sauvegarde",
    label: "Données & Sauvegarde",
    blurb: "Charge le paramétrage et sauvegarde la partie (slots locaux).",
  },
];

export type ComposanteDoc = {
  id: KeyberOsComposanteId;
  title: string;
  ceQueCaFait: string[];
  deQuoiCompose: string[];
  commentCaMarche: string[];
  workflowSteps: string[];
  ceQueCaNeFaitPas: string[];
  codeRefs: string[];
};

export const KEYBER_OS_COMPOSANTES: Record<KeyberOsComposanteId, ComposanteDoc> =
  {
    erp: {
      id: "erp",
      title: "ERP",
      ceQueCaFait: [
        "Affiche les modules ERP de l’Ordinateur : stocks, commandes, production, employés / équipe, clients, fournisseurs, factures (selon le paramétrage chargé).",
        "Met à jour la lecture des chiffres quand l’état du jeu change (après une décision ou un événement).",
        "Applique un brouillard (??? ) si le niveau de visibilité est trop bas et qu’aucun capteur n’est installé.",
      ],
      deQuoiCompose: [
        "Types ERP : ErpModuleId, StockRow, CommandeRow, ProductionRow, EmployeRow, ClientRow, FournisseurRow, FactureRow (lib/computerTypes.ts).",
        "Lecteurs : getErpStockRows, getErpCommandes, getErpProduction, getErpEmployes, getErpClients, getErpFournisseurs (lib/computerData.ts).",
        "UI Ordinateur : ComputerErp + route /erp ; finance liée dans GameState (ex. tresorerie, stockKg, productionParJour).",
      ],
      commentCaMarche: [
        "Le joueur ouvre l’Ordinateur / ERP depuis le play.",
        "Le moteur lit getContexteActif().computer pour peupler les tableaux.",
        "Une décision (applyDecision) ou un événement peut modifier GameState → les chiffres ERP se relisent.",
        "Si visibilityLevel < 2 sans sensorInstalled, certaines valeurs restent masquées.",
      ],
      workflowSteps: [
        "Paramétrage computer chargé",
        "Joueur ouvre ERP",
        "Lecture des modules (Stocks, Commandes, Production…)",
        "Décision ou événement → GameState mis à jour",
        "ERP affiche les nouveaux chiffres",
      ],
      ceQueCaNeFaitPas: [
        "Ne connaît aucun scénario ni aucune entreprise en dur.",
        "N’invente pas de stocks, clients ou fournisseurs : tout vient du fichier de paramétrage / GameState.",
        "N’est pas le Studio Admin (pas de keyber-studio-*).",
      ],
      codeRefs: [
        "lib/keyberOs/erp.ts",
        "lib/keyberOsRuntime.ts",
        "app/admin/systeme/erp/page.tsx",
        "app/jouer/book/[id]/page.tsx",
      ],
    },
    "moteur-scenarios": {
      id: "moteur-scenarios",
      title: "Moteur de Scénarios",
      ceQueCaFait: [
        "Charge le contexte / scénario actif via le registry (getContexteActif, getScenarioActif).",
        "Fournit la décision du jour (getPlayDecisionForDay) et avance le temps / le jour (advanceTime, advanceScenarioDay).",
        "Prépare l’état initial de partie (createInitialGameState / createScenarioDayState).",
      ],
      deQuoiCompose: [
        "data/registry.ts — résolution du contexte et du scénario actifs.",
        "lib/playContent.ts — contenu de play (décision du jour).",
        "lib/runtime.ts / lib/mock.ts — avancée de journée et état initial.",
        "lib/engine.ts — advanceTime, enchaînement avec événements et fin de journée.",
      ],
      commentCaMarche: [
        "Au démarrage, le jeu lit le paramétrage du contexte actif.",
        "Pour le jour en cours, getPlayDecisionForDay fournit la carte à jouer.",
        "advanceTime fait progresser l’horloge / le jour et appelle le contrôle des événements.",
        "adminOverridesActive() reste false : le Studio ne pilote pas le jeu.",
      ],
      workflowSteps: [
        "Données & Sauvegarde charge le paramétrage",
        "Registry résout contexte + scénario actifs",
        "Jour / étape en cours",
        "Décision du jour exposée à l’Interface",
        "advanceTime → suite ou fin de journée",
      ],
      ceQueCaNeFaitPas: [
        "Ne hardcode aucun scénario ni aucune entreprise dans le moteur générique.",
        "Ne lit pas le localStorage Studio (keyber-studio-*).",
        "N’écrit pas de contenu métier : il lit des fichiers de paramétrage.",
      ],
      codeRefs: [
        "lib/keyberOs/moteurScenarios.ts",
        "lib/keyberOs/pipeline.ts",
        "app/admin/systeme/moteur-scenarios/page.tsx",
      ],
    },
    "moteur-decisions": {
      id: "moteur-decisions",
      title: "Moteur de Décisions & Branches",
      ceQueCaFait: [
        "Applique le choix joueur sur l’état OS (multi-cibles).",
        "Lit conséquences + feedbackTexte depuis le fichier de paramétrage (Étape 14).",
        "Fallback deltas Admin si le choix n’a pas de conséquences structurées.",
      ],
      deQuoiCompose: [
        "lib/keyberOs/moteurDecisions.ts",
        "lib/keyberOs/consequences.ts",
        "lib/keyberOs/moteurScenarios.ts — parse Décisions riches",
      ],
      commentCaMarche: [
        "Le Moteur de Scénarios expose la décision de l’étape (options riches ou string[]).",
        "Si options[].consequences → osApplyConsequences (trésorerie, stock, moral, xp, temps…).",
        "Sinon deltas Admin opt0/1/2.",
        "Feedback texte + journal + dayDecisionId.",
      ],
      workflowSteps: [
        "Décision de l’étape reçue",
        "Affichage choix (+ impacts)",
        "Choix joueur",
        "Conséquences param ou deltas Admin",
        "ERP sync / Feedback",
      ],
      ceQueCaNeFaitPas: [
        "N’invente pas les textes ni les conséquences métier : param ou deltas test.",
        "Ne hardcode pas Novacier dans le moteur.",
      ],
      codeRefs: [
        "lib/keyberOs/moteurDecisions.ts",
        "lib/keyberOs/consequences.ts",
        "lib/keyberOs/pipeline.ts",
        "app/admin/systeme/moteur-decisions/page.tsx",
      ],
    },
    "moteur-evenements": {
      id: "moteur-evenements",
      title: "Moteur d'Événements",
      ceQueCaFait: [
        "Lit le catalogue « Événements entreprise » du param.",
        "Déclenche selon heure (horloge 08:00+) et conditions numériques.",
        "Applique impact stock + consequences param ; injecte mail / alarme.",
        "Pousse toast + bannière urgente (via module Notifications).",
      ],
      deQuoiCompose: [
        "lib/atelierEventsToParam.ts — pont Excel Atelier → param (Étape 24).",
        "lib/keyberOs/moteurEvenements.ts — osEvenementsTrigger.",
        "Param : heure, jour, urgent, deadlineHeure, condition, consequences.",
        "UI : OsEventNotificationToast, OsUrgentEventBanner (sous-onglet Notifications).",
      ],
      commentCaMarche: [
        "Atelier Événements Excel (colonnes OS) → Book Générer / seed → param.",
        "Après chaque avancée de temps → osEvenementsTrigger.",
        "Heure absente → fallbackHeures Admin (index catalogue).",
        "Urgent + deadlineHeure → bannière ; dépassement → consequencesDeadline.",
      ],
      workflowSteps: [
        "Excel Atelier → mapAtelierEventToParamEventRich",
        "Param « Événements entreprise »",
        "Avance temps → osEvenementsTrigger",
        "Effet ERP / flags / mail",
        "Toast + bannière (Notifications)",
      ],
      ceQueCaNeFaitPas: [
        "N’invente aucun événement métier : la liste vient du paramétrage.",
        "Ne partage pas d’événements « globaux OS » entre entreprises.",
        "Ne remplace pas le Moteur de Décisions.",
      ],
      codeRefs: [
        "lib/atelierEventsToParam.ts",
        "lib/keyberOs/moteurEvenements.ts",
        "lib/keyberOs/pipeline.ts",
        "app/admin/systeme/moteur-evenements/page.tsx",
        "app/admin/atelier/evenements/page.tsx",
      ],
    },
    notifications: {
      id: "notifications",
      title: "Notifications",
      ceQueCaFait: [
        "Affiche le toast « Nouvel évènement » (auto-dismiss).",
        "Affiche la bannière urgente avec deadline.",
        "Permet de forcer le prochain événement catalogue (debug).",
      ],
      deQuoiCompose: [
        "components/osPlay/OsEventNotificationToast.tsx",
        "components/osPlay/OsUrgentEventBanner.tsx",
        "world.eventNotifications / world.urgentBanner",
      ],
      commentCaMarche: [
        "Le moteur pousse dans world.* ; ce module pilote durée toast et show banner.",
        "Admin → Forcer prochain événement → prochain rendu Book.",
      ],
      workflowSteps: [
        "Événement déclenché",
        "Push notification / banner",
        "Toast visible",
        "OK / Voir / Masquer",
      ],
      ceQueCaNeFaitPas: [
        "Ne décide pas quels événements existent (param + Moteur).",
        "Ne hardcode aucun titre d'entreprise.",
      ],
      codeRefs: [
        "app/admin/systeme/notifications/page.tsx",
        "components/osPlay/OsEventNotificationToast.tsx",
        "components/osPlay/OsUrgentEventBanner.tsx",
      ],
    },
    progression: {
      id: "progression",
      title: "Progression, Scores & Niveaux",
      ceQueCaFait: [
        "XP global + score + niveau de partie après chaque décision.",
        "XP compétences ciblées/générales depuis ids du param (Atelier).",
        "Débrief skill : niv. / XP par compétence.",
      ],
      deQuoiCompose: [
        "lib/keyberOs/progression.ts — osProgressionApply, osAddSkillXp.",
        "components/osPlay/OsSkillProgressPanel.tsx",
        "Param : Compétences sélectionnées / Compétence / competenceImpacts.",
      ],
      commentCaMarche: [
        "Boot → catalogue skills depuis le param (slugs).",
        "Décision → XP global + impacts choix ou fallback xpPerSkillChoice.",
        "Seuil skill configurable (Admin) ; niveau skill max 5.",
      ],
      workflowSteps: [
        "Boot catalog param",
        "Décision",
        "XP global + XP skill",
        "Jauge aside / débrief",
      ],
      ceQueCaNeFaitPas: [
        "N’invente pas les compétences : ids = param Atelier.",
        "Ne hardcode pas les noms Novacier.",
        "Ne lit pas keyber-studio-competences-v1 au runtime joueur.",
      ],
      codeRefs: [
        "lib/keyberOs/progression.ts",
        "lib/keyberOs/pipeline.ts",
        "components/osPlay/OsSkillProgressPanel.tsx",
        "app/admin/systeme/progression/page.tsx",
      ],
    },
    "interface-joueur": {
      id: "interface-joueur",
      title: "Interface Joueur",
      ceQueCaFait: [
        "Compose le shell Book OS : horloge, KPI, décisions, Ordinateur, toasts (Étape 20).",
        "Chemin officiel : `/jouer/book/[id]` via OsPlayShell + pipeline.",
        "Relie le joueur au cycle décision → ERP → progression.",
      ],
      deQuoiCompose: [
        "app/jouer/book/[id]/page.tsx — pont Book officiel (OsPlayShell).",
        "components/osPlay/OsPlayShell.tsx — chrome joueur générique.",
        "lib/keyberOs/bookBridge.ts — href / chemins Book vs /play legacy.",
        "app/play/page.tsx — POC Novacier (hors Book, intact).",
      ],
      commentCaMarche: [
        "Admin Tester / Live → `/jouer/book/[id]` charge le param Book.",
        "OsPlayShell affiche l’état (jauges) et la décision en cours.",
        "Après applyDecision / événement, l’UI se rafraîchit.",
        "/play reste séparé (useGameStore) — non branché sur le Book.",
      ],
      workflowSteps: [
        "Carte Book → /jouer/book/[id]",
        "OsPlayShell + pipeline",
        "Choix joueur → moteurs",
        "Mise à jour jauges / cartes / toasts",
        "Nouveau choix ou suite de journée",
      ],
      ceQueCaNeFaitPas: [
        "Ne remplace pas `/play` (POC Novacier).",
        "N’écrit pas dans keyber-studio-*.",
        "N’invente pas le contenu des cartes : il l’affiche.",
      ],
      codeRefs: [
        "lib/keyberOs/bookBridge.ts",
        "lib/keyberOs/interfaceJoueur.ts",
        "lib/keyberOs/shellActions.ts",
        "components/osPlay/OsPlayShell.tsx",
        "app/jouer/book/[id]/page.tsx",
        "app/admin/systeme/interface-joueur/page.tsx",
      ],
    },
    ordinateur: {
      id: "ordinateur",
      title: "Ordinateur",
      ceQueCaFait: [
        "Chrome desktop exact (header session, grille 6 apps, badges) — Étape 3.",
        "Expose les apps ERP, mail, chat, dashboard, documents, browser.",
        "Lit le pack Ordinateur depuis le fichier de paramétrage / synthèse OS.",
      ],
      deQuoiCompose: [
        "components/osPlay/OsComputerDesktop.tsx",
        "lib/keyberOs/ordinateur.ts",
        "lib/keyberOs/ordinateurPack.ts",
      ],
      commentCaMarche: [
        "Le joueur ouvre Accès Ordinateur depuis le shell.",
        "Bureau = grille apps filtrée par toggles Admin.",
        "Chaque app consomme du temps (module Temps).",
      ],
      workflowSteps: [
        "Action Ordinateur",
        "Bureau (grille)",
        "Ouverture app",
        "Quitter → retour shell",
      ],
      ceQueCaNeFaitPas: [
        "N'invente pas de mails métier en dur.",
        "Ne lit pas useGameStore / Novacier.",
        "N'utilise pas ComputerErp legacy / useGameStore.",
      ],
      codeRefs: [
        "components/osPlay/OsComputerDesktop.tsx",
        "components/osPlay/OsComputerErp.tsx",
        "lib/keyberOs/ordinateur.ts",
        "app/admin/systeme/ordinateur/page.tsx",
      ],
    },
    temps: {
      id: "temps",
      title: "Temps & Horloge",
      ceQueCaFait: [
        "Avance minutes / jours / semaines à chaque action joueur.",
      ],
      deQuoiCompose: ["lib/keyberOs/temps.ts"],
      commentCaMarche: [
        "Coûts en minutes par action (ordinateur, décision, interview…).",
        "Configurable : durée de journée, heure de départ.",
      ],
      workflowSteps: ["Action", "+minutes", "Recalcul jour/horloge", "UI clock"],
      ceQueCaNeFaitPas: ["Ne hardcode pas un calendrier d'entreprise."],
      codeRefs: ["lib/keyberOs/temps.ts", "app/admin/systeme/temps/page.tsx"],
    },
    "cycle-vie": {
      id: "cycle-vie",
      title: "Cycle de vie",
      ceQueCaFait: [
        "Affiche l'overlay DayEnd (fin de journée 18:00).",
        "Passe au jour suivant ou ouvre le débrief en fin de semaine.",
        "Marque la décision non prise si le joueur n'a pas décidé.",
        "Intro + coach Jour 0 (Mode Histoire) avec actions gated.",
        "Écran débrief fin de semaine (ending + compétences + XP).",
      ],
      deQuoiCompose: [
        "lib/keyberOs/cycleVie.ts",
        "lib/keyberOs/onboarding.ts",
        "lib/keyberOs/debrief.ts",
        "components/osPlay/OsDayEndScreen.tsx",
        "components/osPlay/OsDebriefView.tsx",
        "components/osPlay/OsIntroNarrative.tsx",
        "components/osPlay/OsOnboardingCoach.tsx",
      ],
      commentCaMarche: [
        "Horloge pleine (Temps) → showDayEnd si auto ON.",
        "Admin peut forcer DayEnd / Débrief.",
        "Dernier jour → osOpenDebrief (ending + XP).",
        "Histoire + onboardingEnabled → intro → coach 1–4 → unlock ALL.",
      ],
      workflowSteps: [
        "Intro (si Histoire)",
        "Coach étapes 1–4",
        "Temps plein / Force Admin",
        "Overlay DayEnd",
        "Passer au jour N+1",
        "Débrief fin de semaine",
      ],
      ceQueCaNeFaitPas: [
        "Ne hardcode pas le contenu narratif Novacier.",
        "Textes entreprise = param / Phase E (Lumière).",
      ],
      codeRefs: [
        "lib/keyberOs/cycleVie.ts",
        "lib/keyberOs/onboarding.ts",
        "lib/keyberOs/debrief.ts",
        "components/osPlay/OsDayEndScreen.tsx",
        "components/osPlay/OsDebriefView.tsx",
        "components/osPlay/OsIntroNarrative.tsx",
        "components/osPlay/OsOnboardingCoach.tsx",
        "app/admin/systeme/cycle-vie/page.tsx",
      ],
    },
    interviews: {
      id: "interviews",
      title: "Interviews / PNJ",
      ceQueCaFait: [
        "Affiche l'InterviewView OS (portrait, questions, choix).",
        "Applique confianceDelta / XP / conséquences sur un choix.",
      ],
      deQuoiCompose: [
        "lib/keyberOs/interviews.ts — osInterviewSelect, osApplyDialogueChoice.",
        "components/osPlay/OsInterviewView.tsx",
        "Pack param Ordinateur.interviews (questions[].choices).",
      ],
      commentCaMarche: [
        "Action Interview → PNJ → question → choix → relation + journal.",
        "Fallback : lines Q/A plates si pas de questions.",
      ],
      workflowSteps: [
        "Interview",
        "Choix PNJ",
        "Question",
        "Réponse",
        "Relation / XP",
      ],
      ceQueCaNeFaitPas: [
        "Ne hardcode pas Karim/Marie Novacier.",
        "Contenu dialogues riches = Phase E / param entreprise.",
      ],
      codeRefs: [
        "lib/keyberOs/interviews.ts",
        "components/osPlay/OsInterviewView.tsx",
        "app/admin/systeme/interviews/page.tsx",
      ],
    },
    relations: {
      id: "relations",
      title: "Relations",
      ceQueCaFait: [
        "Maintient les jauges relations.<slotId> (0–100).",
        "Initialise depuis relationConfiance des interviews.",
        "Affiche le panneau jauges dans Interview.",
      ],
      deQuoiCompose: [
        "lib/keyberOs/relations.ts",
        "components/osPlay/OsRelationsPanel.tsx",
        "state.relations",
      ],
      commentCaMarche: [
        "Boot scénario → osRelationsInitFromInterviews.",
        "Choix dialogue → osRelationApplyDelta.",
      ],
      workflowSteps: [
        "Boot slots",
        "Choix dialogue",
        "Delta confiance",
        "Jauge UI",
      ],
      ceQueCaNeFaitPas: [
        "N'invente pas de PNJ : les slots viennent du param / pack.",
      ],
      codeRefs: [
        "lib/keyberOs/relations.ts",
        "components/osPlay/OsRelationsPanel.tsx",
        "app/admin/systeme/relations/page.tsx",
      ],
    },
    objectifs: {
      id: "objectifs",
      title: "Objectifs",
      ceQueCaFait: [
        "Affiche le panneau Objectifs (types, barre, XP) dans l'aside.",
        "Évalue EN_COURS → COMPLETE via metric/op/cibleNombre.",
        "Marque ECHOUE les journaliers non faits au DayEnd.",
      ],
      deQuoiCompose: [
        "lib/keyberOs/objectifs.ts — osObjectifsEvaluate, osObjectifsOnDayEnd.",
        "components/osPlay/OsObjectivePanel.tsx",
        "Pack Ordinateur.objectifs / synthèse générique.",
      ],
      commentCaMarche: [
        "Après décision, mail lu, dialogue → osObjectifsEvaluate.",
        "DayEnd → osObjectifsOnDayEnd (journaliers).",
        "UI aside = feeling ObjectivePanel /play.",
      ],
      workflowSteps: [
        "Action joueur",
        "Éval métriques",
        "COMPLETE / XP",
        "Aside barre",
        "DayEnd → ECHOUE éventuel",
      ],
      ceQueCaNeFaitPas: [
        "N'invente pas d'objectifs AutoVolt / Novacier.",
        "La liste vient du param / pack entreprise.",
      ],
      codeRefs: [
        "lib/keyberOs/objectifs.ts",
        "components/osPlay/OsObjectivePanel.tsx",
        "app/admin/systeme/objectifs/page.tsx",
      ],
    },
    visibilite: {
      id: "visibilite",
      title: "Visibilité",
      ceQueCaFait: [
        "Applique un brouillard ??? sur ERP / dashboard / KPI si niveau bas.",
        "Panneau investissements + matrice de tiers + inventaire capteurs.",
        "Installer un capteur débite la trésorerie et clarifie les modules.",
      ],
      deQuoiCompose: [
        "lib/keyberOs/visibilite.ts",
        "components/osPlay/OsVisibilityPanel.tsx",
        "Ordinateur.sensors (param) ou défauts OS.",
      ],
      commentCaMarche: [
        "fog = !sensor && level < seuil Admin.",
        "Bouton Visibilité (KPI bar) ou brouillard shell → panneau.",
        "parModule[kpiId] override les pastilles.",
      ],
      workflowSteps: [
        "Fog actif",
        "Ouvrir panneau",
        "Matrice / investissements / capteurs",
        "Installer",
        "KPI/ERP clarifiés",
      ],
      ceQueCaNeFaitPas: [
        "Ne hardcode pas Capteur M3 Novacier.",
        "Coûts / labels = Admin ou param entreprise.",
      ],
      codeRefs: [
        "lib/keyberOs/visibilite.ts",
        "components/osPlay/OsVisibilityPanel.tsx",
        "app/admin/systeme/visibilite/page.tsx",
      ],
    },
    profil: {
      id: "profil",
      title: "Profil & Badges",
      ceQueCaFait: [
        "Affiche le profil joueur (XP, compétences, relations, badges).",
        "Source = Progression OS + world.badges + historique session Book.",
      ],
      deQuoiCompose: [
        "OsProgressionBlock + catalog compétences param.",
        "Page /profil (OS si session Book active, sinon POC).",
        "Lien sidebar OsPlayShell « Mon profil ».",
      ],
      commentCaMarche: [
        "Décisions / objectifs mettent à jour progression via module Progression.",
        "osActivePlayStore conserve la session pour /profil.",
        "Module OFF → message Admin sur /profil (OS).",
      ],
      workflowSteps: [
        "Session Book",
        "Gagner XP / skills",
        "Sidebar Profil",
        "Voir jauges + badges",
        "Retour shell",
      ],
      ceQueCaNeFaitPas: [
        "N'invente pas de catalogue compétences Novacier en mode OS.",
        "Ne remplace pas Admin → Progression (seuils XP).",
      ],
      codeRefs: [
        "components/OsProfilView.tsx",
        "app/profil/page.tsx",
        "lib/keyberOs/progression.ts",
        "app/admin/systeme/profil/page.tsx",
      ],
    },
    livre: {
      id: "livre",
      title: "Livre de l'entreprise",
      ceQueCaFait: [
        "Affiche le Livre sidebar (même feeling que le POC).",
        "Source = param.Livre de la session Book OS (structure même vide).",
        "Résumé lore visible aussi en Book Vue Texte.",
      ],
      deQuoiCompose: [
        "Bloc Livre dans le schéma param (histoire, activité, chiffres…).",
        "Page /livre (OS si session Book active, sinon POC).",
        "Lien sidebar OsPlayShell.",
      ],
      commentCaMarche: [
        "Génération Book crée une coquille Livre vide (nom = Entreprise).",
        "Contenu métier (ex. Lumière) = Phase E — pas inventé ici.",
        "Session active via osActivePlayStore pour la navigation shell → /livre.",
      ],
      workflowSteps: [
        "Session Book",
        "Sidebar Livre",
        "Tabs structure",
        "Retour shell",
      ],
      ceQueCaNeFaitPas: [
        "N'invente pas d'histoire / glossaire entreprise.",
        "Ne réutilise pas l'organigramme Novacier en mode OS.",
      ],
      codeRefs: [
        "lib/osLivre.ts",
        "components/LivreEntrepriseView.tsx",
        "app/livre/page.tsx",
        "app/admin/systeme/livre/page.tsx",
      ],
    },
    journal: {
      id: "journal",
      title: "Journal de bord",
      ceQueCaFait: [
        "Affiche le journal de bord joueur (même feeling que le POC).",
        "Source = world.journal de la session Book OS active.",
        "Rempli par décisions, événements, interviews, onboarding, day-end.",
      ],
      deQuoiCompose: [
        "OsJournalEntry dans world.journal.",
        "Page /journal (OS si session Book active, sinon POC /play).",
        "Lien sidebar OsPlayShell.",
      ],
      commentCaMarche: [
        "Chaque moteur OS pousse une entrée journal (titre, narration, xp, jour).",
        "Session active publiée via osActivePlayStore pour survivre à la navigation.",
        "Module OFF → message Admin sur /journal (OS).",
      ],
      workflowSteps: [
        "Session Book",
        "Décision / événement",
        "Entrée world.journal",
        "Sidebar → /journal",
        "Retour jeu",
      ],
      ceQueCaNeFaitPas: [
        "N'invente pas de narration métier.",
        "Ne remplace pas le Journal des décisions Admin (Workflow).",
        "Ne lit pas useGameStore quand une session Book OS est active.",
      ],
      codeRefs: [
        "lib/osActivePlayStore.ts",
        "components/JournalView.tsx",
        "app/journal/page.tsx",
        "app/admin/systeme/journal/page.tsx",
      ],
    },
    "donnees-sauvegarde": {
      id: "donnees-sauvegarde",
      title: "Données & Sauvegarde",
      ceQueCaFait: [
        "Charge le fichier de paramétrage Book pour démarrer une session OS.",
        "Sauvegarde la progression session dans keyber-os-play-saves-v1.",
        "Expose le schéma d'état OS riche (familles de champs) — Étape 1 V1.",
      ],
      deQuoiCompose: [
        "lib/keyberOs/types.ts — OsPlayState + blocs riches.",
        "lib/keyberOs/stateSchema.ts — catalogue Admin des familles.",
        "lib/keyberOs/donneesSauvegarde.ts — load / autosave.",
        "Clés : keyber-os-play-saves-v1 ; jamais keyber-studio-*.",
      ],
      commentCaMarche: [
        "Au boot Book : ack param → Scénarios initialise l'état riche.",
        "Autosave après chaque choix si activé.",
        "L'Admin liste les familles (meta, finance, world, ordinateur…).",
      ],
      workflowSteps: [
        "Lecture paramétrage",
        "Init schéma d'état riche",
        "Partie en cours",
        "Autosave session",
        "Reprise (étapes ultérieures)",
      ],
      ceQueCaNeFaitPas: [
        "Ne stocke pas l’Atelier / Book (préfixe keyber-studio-*).",
        "N'invente aucun contenu d'entreprise.",
        "Ne remplace pas encore les slots UI legacy /play.",
      ],
      codeRefs: [
        "lib/keyberOs/stateSchema.ts",
        "lib/keyberOs/types.ts",
        "components/admin/OsStateSchemaPanel.tsx",
        "lib/keyberOs/donneesSauvegarde.ts",
        "lib/keyberOs/pipeline.ts",
        "app/admin/systeme/donnees-sauvegarde/page.tsx",
      ],
    },
  };

/** Nœuds du grand flux Vue Globale (lecture seule). */
export type OsFluxNode = {
  id: KeyberOsComposanteId;
  label: string;
  href: string;
};

export type OsFluxEdge = {
  from: KeyberOsComposanteId | "parametrage" | "choix" | "chiffres" | "score" | "jauges";
  to: KeyberOsComposanteId | "parametrage" | "choix" | "chiffres" | "score" | "jauges";
  label: string;
};

export const OS_FLUX_NODES: {
  id: string;
  label: string;
  href?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}[] = [
  {
    id: "donnees-sauvegarde",
    label: "Données & Sauvegarde",
    href: "/admin/systeme/donnees-sauvegarde",
    x: 40,
    y: 40,
    w: 200,
    h: 56,
  },
  {
    id: "parametrage",
    label: "Fichier de paramétrage",
    x: 280,
    y: 40,
    w: 200,
    h: 56,
  },
  {
    id: "moteur-scenarios",
    label: "Moteur de Scénarios",
    href: "/admin/systeme/moteur-scenarios",
    x: 520,
    y: 40,
    w: 200,
    h: 56,
  },
  {
    id: "etape",
    label: "Étape en cours",
    x: 520,
    y: 140,
    w: 200,
    h: 48,
  },
  {
    id: "moteur-decisions",
    label: "Moteur de Décisions & Branches",
    href: "/admin/systeme/moteur-decisions",
    x: 280,
    y: 240,
    w: 220,
    h: 56,
  },
  {
    id: "moteur-evenements",
    label: "Moteur d'Événements",
    href: "/admin/systeme/moteur-evenements",
    x: 560,
    y: 240,
    w: 200,
    h: 56,
  },
  {
    id: "choix",
    label: "Choix joueur",
    x: 280,
    y: 340,
    w: 160,
    h: 48,
  },
  {
    id: "evenement",
    label: "Événement déclenché",
    x: 560,
    y: 340,
    w: 200,
    h: 48,
  },
  {
    id: "erp",
    label: "ERP",
    href: "/admin/systeme/erp",
    x: 420,
    y: 440,
    w: 160,
    h: 56,
  },
  {
    id: "chiffres",
    label: "Chiffres (Stock, Trésorerie, Production…)",
    x: 360,
    y: 540,
    w: 280,
    h: 48,
  },
  {
    id: "progression",
    label: "Progression, Scores & Niveaux",
    href: "/admin/systeme/progression",
    x: 360,
    y: 640,
    w: 280,
    h: 56,
  },
  {
    id: "score",
    label: "Score / XP / Niveau",
    x: 400,
    y: 740,
    w: 200,
    h: 48,
  },
  {
    id: "interface-joueur",
    label: "Interface Joueur",
    href: "/admin/systeme/interface-joueur",
    x: 120,
    y: 740,
    w: 200,
    h: 56,
  },
  {
    id: "jauges",
    label: "Jauges / cartes / événement",
    x: 40,
    y: 340,
    w: 200,
    h: 48,
  },
  {
    id: "save-loop",
    label: "Sauvegarde à chaque étape",
    href: "/admin/systeme/donnees-sauvegarde",
    x: 40,
    y: 140,
    w: 200,
    h: 48,
  },
  {
    id: "book-pont",
    label: "Pont Book → /jouer/book/[id]",
    href: "/admin/book/en-cours-de-test",
    x: 40,
    y: 840,
    w: 260,
    h: 56,
  },
  {
    id: "legacy-play",
    label: "/play (POC Novacier — hors Book)",
    x: 340,
    y: 840,
    w: 260,
    h: 48,
  },
];

/** Arêtes du flux (fromId → toId) avec libellé. */
export const OS_FLUX_EDGES: { from: string; to: string; label: string }[] = [
  { from: "donnees-sauvegarde", to: "parametrage", label: "charge" },
  { from: "parametrage", to: "moteur-scenarios", label: "" },
  { from: "moteur-scenarios", to: "etape", label: "étape en cours" },
  { from: "etape", to: "moteur-decisions", label: "" },
  { from: "etape", to: "moteur-evenements", label: "" },
  { from: "moteur-decisions", to: "choix", label: "choix joueur" },
  { from: "choix", to: "erp", label: "" },
  { from: "moteur-evenements", to: "evenement", label: "événement déclenché" },
  { from: "evenement", to: "erp", label: "" },
  { from: "erp", to: "chiffres", label: "chiffres" },
  { from: "chiffres", to: "progression", label: "" },
  { from: "progression", to: "score", label: "score / XP / niveau" },
  { from: "score", to: "interface-joueur", label: "" },
  { from: "interface-joueur", to: "jauges", label: "jauges / cartes" },
  { from: "jauges", to: "moteur-decisions", label: "nouveau choix (boucle)" },
  { from: "donnees-sauvegarde", to: "save-loop", label: "" },
  { from: "save-loop", to: "etape", label: "sauvegarde" },
  { from: "interface-joueur", to: "book-pont", label: "shell Book" },
  { from: "book-pont", to: "legacy-play", label: "séparé" },
];
