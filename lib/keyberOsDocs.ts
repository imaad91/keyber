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
  | "interviews"
  | "objectifs"
  | "visibilite";

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
    blurb: "L’image entière du moteur et du flux entre les composantes.",
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
    blurb: "Shell play : jauges, décisions, Ordinateur, interviews, live prod.",
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
    id: "interviews",
    href: "/admin/systeme/interviews",
    label: "Interviews / PNJ",
    blurb: "Dialogues avec les personnages du paramétrage.",
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
        "Représente une décision et ses choix (Decision, DecisionChoix) avec conséquences (Consequence).",
        "Filtre les choix disponibles (choixDisponibles) et applique le choix du joueur (applyDecision).",
        "Gère conditions / portes (DecisionCondition, requis) et effets supplémentaires.",
      ],
      deQuoiCompose: [
        "lib/decisions.ts — types Decision, DecisionChoix, Consequence, DecisionCondition.",
        "lib/engine.ts — applyDecision, annotateChoix, choixDisponibles.",
        "components/DecisionCard.tsx — carte Décider côté joueur.",
      ],
      commentCaMarche: [
        "Le Moteur de Scénarios expose la décision de l’étape.",
        "L’Interface montre les choix ; certains peuvent être indisponibles (conditions).",
        "Le joueur choisit → applyDecision met à jour le GameState.",
        "Les conséquences peuvent toucher finance, ERP, compétences / XP.",
      ],
      workflowSteps: [
        "Décision de l’étape reçue",
        "Filtrage des choix disponibles",
        "Affichage dans Interface Joueur",
        "Choix joueur",
        "applyDecision → GameState / ERP / Progression",
      ],
      ceQueCaNeFaitPas: [
        "N’invente pas les textes ni les conséquences : ils viennent du paramétrage.",
        "Ne connaît pas d’entreprise nommée en dur dans le moteur.",
        "Ne remplace pas le Moteur d’Événements (autre pipeline).",
      ],
      codeRefs: [
        "lib/keyberOs/moteurDecisions.ts",
        "lib/keyberOs/pipeline.ts",
        "app/admin/systeme/moteur-decisions/page.tsx",
      ],
    },
    "moteur-evenements": {
      id: "moteur-evenements",
      title: "Moteur d'Événements",
      ceQueCaFait: [
        "Définit le type Evenement / EvenementType et vérifie lesquels se déclenchent (checkEvenements).",
        "Peut appliquer un effet si une décision a été manquée (applyMissedDecision).",
        "Notifie l’interface (toasts, bannières, fil d’événements).",
      ],
      deQuoiCompose: [
        "lib/evenements.ts — Evenement, checkEvenements, applyMissedDecision.",
        "Catalogues sous data/contextes/*/evenements.ts (paramétrage, pas le moteur).",
        "UI : EventNotificationToast, UrgentEventBanner, EventFeed.",
      ],
      commentCaMarche: [
        "À l’avancée du temps, engine appelle checkEvenements.",
        "Un événement se déclenche selon heure + conditions du paramétrage (pas un tirage inventé dans l’OS).",
        "L’effet met à jour le GameState ; l’ERP / les jauges se relisent.",
        "L’Interface affiche la notification.",
      ],
      workflowSteps: [
        "advanceTime",
        "checkEvenements (heure + conditions)",
        "Événement déclenché",
        "Effet sur GameState / ERP",
        "Notification Interface Joueur",
      ],
      ceQueCaNeFaitPas: [
        "N’invente aucun événement métier : la liste vient du paramétrage du contexte.",
        "Ne partage pas d’événements « globaux OS » entre entreprises.",
        "Ne remplace pas le Moteur de Décisions.",
      ],
      codeRefs: [
        "lib/keyberOs/moteurEvenements.ts",
        "lib/keyberOs/pipeline.ts",
        "app/admin/systeme/moteur-evenements/page.tsx",
      ],
    },
    progression: {
      id: "progression",
      title: "Progression, Scores & Niveaux",
      ceQueCaFait: [
        "Ajoute de l’XP de compétence (addSkillXp) et gère les niveaux (XP_PER_SKILL_LEVEL).",
        "Applique les impacts de compétences (applyCompetenceImpacts).",
        "Suit le niveau / XP global de partie (addXP, XP_PER_LEVEL) et les objectifs / ending.",
      ],
      deQuoiCompose: [
        "lib/progression.ts — addSkillXp, applyCompetenceImpacts.",
        "lib/competences.ts — listes de compétences générales / ciblées (structure OS).",
        "lib/engine.ts — addXP, checkObjectives, computeEnding.",
        "lib/sauvegarde.ts — ProgressionGlobale (niveauGlobal, xpTotal).",
      ],
      commentCaMarche: [
        "Une décision ou un objectif atteint peut donner de l’XP.",
        "addSkillXp met à jour la compétence ; le niveau de skill peut monter.",
        "addXP met à jour le score / niveau global de la partie.",
        "La progression locale peut être persistée avec les sauvegardes.",
      ],
      workflowSteps: [
        "Conséquence / objectif",
        "addSkillXp / addXP",
        "Recalcul niveaux",
        "Jauge / Profil mis à jour",
        "Persistance via Données & Sauvegarde",
      ],
      ceQueCaNeFaitPas: [
        "N’invente pas les compétences d’un scénario Studio : le jeu lit sa propre structure.",
        "Ne lit pas keyber-studio-competences-v1.",
        "Ne décide pas à la place du joueur.",
      ],
      codeRefs: [
        "lib/keyberOs/progression.ts",
        "lib/keyberOs/pipeline.ts",
        "app/admin/systeme/progression/page.tsx",
      ],
    },
    "interface-joueur": {
      id: "interface-joueur",
      title: "Interface Joueur",
      ceQueCaFait: [
        "Compose l’écran de play : horloge, KPI / jauges, carte de décision, Ordinateur, actions.",
        "Affiche les notifications d’événements et le parcours Jouer (slots).",
        "Relie le joueur au cycle décision → ERP → progression.",
      ],
      deQuoiCompose: [
        "app/play/page.tsx — shell principal.",
        "components/KpiBar.tsx + kpiDefinitions — jauges (trésorerie, prod, rebut, qualité, moral, éthique…).",
        "DecisionCard, ComputerDesktop, toasts / bannières d’événements.",
        "app/jouer/page.tsx — choix de slot avant partie.",
      ],
      commentCaMarche: [
        "Le joueur voit l’état (jauges) et la décision en cours.",
        "Il choisit une action (Décider, Ordinateur…).",
        "Après applyDecision / événement, l’UI se rafraîchit.",
        "Un nouveau choix peut s’ouvrir → boucle avec le Moteur de Décisions.",
      ],
      workflowSteps: [
        "Affichage jauges + décision",
        "Choix joueur",
        "Moteur de Décisions / Événements",
        "Mise à jour jauges / cartes / toasts",
        "Nouveau choix ou suite de journée",
      ],
      ceQueCaNeFaitPas: [
        "N’embarque pas le bandeau Studio dans Décider / play.",
        "N’écrit pas dans keyber-studio-*.",
        "N’invente pas le contenu des cartes : il l’affiche.",
      ],
      codeRefs: [
        "lib/keyberOs/interfaceJoueur.ts",
        "components/osPlay/OsPlayShell.tsx",
        "app/jouer/book/[id]/page.tsx",
      ],
    },
    ordinateur: {
      id: "ordinateur",
      title: "Ordinateur",
      ceQueCaFait: [
        "Expose les apps ERP, mail, chat, dashboard (live prod), documents, browser.",
        "Lit le pack Ordinateur synthétisé depuis le fichier de paramétrage.",
      ],
      deQuoiCompose: [
        "lib/keyberOs/ordinateur.ts",
        "lib/keyberOs/ordinateurPack.ts",
        "components/osPlay/OsPlayShell.tsx",
      ],
      commentCaMarche: [
        "Le joueur ouvre Ordinateur depuis le shell Interface Joueur.",
        "Chaque app consomme du temps (module Temps).",
        "Les données viennent du param / synthèse OS, pas d'entreprise hardcodée.",
      ],
      workflowSteps: [
        "Action Ordinateur",
        "Choix d'app",
        "Lecture données param",
        "Retour shell / décision",
      ],
      ceQueCaNeFaitPas: [
        "N'invente pas de mails métier Novacier en dur.",
        "Ne lit pas keyber-studio-*.",
      ],
      codeRefs: [
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
    interviews: {
      id: "interviews",
      title: "Interviews / PNJ",
      ceQueCaFait: [
        "Propose des dialogues Q/R issus du paramétrage (ou synthèse générique).",
      ],
      deQuoiCompose: ["lib/keyberOs/interviews.ts"],
      commentCaMarche: [
        "Action Interview → sélection PNJ → lignes de dialogue.",
      ],
      workflowSteps: ["Interview", "Choix PNJ", "Dialogue", "Retour shell"],
      ceQueCaNeFaitPas: ["Ne hardcode pas Karim/Marie Novacier."],
      codeRefs: [
        "lib/keyberOs/interviews.ts",
        "app/admin/systeme/interviews/page.tsx",
      ],
    },
    objectifs: {
      id: "objectifs",
      title: "Objectifs",
      ceQueCaFait: [
        "Suit des objectifs EN_COURS / COMPLETE (stock, décision…).",
      ],
      deQuoiCompose: ["lib/keyberOs/objectifs.ts"],
      commentCaMarche: [
        "Après un choix, recalcule le statut des objectifs.",
      ],
      workflowSteps: ["Choix", "Éval objectifs", "COMPLETE éventuel", "UI sidebar"],
      ceQueCaNeFaitPas: ["N'invente pas d'objectifs AutoVolt."],
      codeRefs: [
        "lib/keyberOs/objectifs.ts",
        "app/admin/systeme/objectifs/page.tsx",
      ],
    },
    visibilite: {
      id: "visibilite",
      title: "Visibilité",
      ceQueCaFait: [
        "Applique un brouillard ??? sur ERP / dashboard si niveau bas sans capteur.",
      ],
      deQuoiCompose: ["lib/keyberOs/visibilite.ts"],
      commentCaMarche: [
        "fog = !sensor && visibilityLevel < seuil Admin.",
        "Le joueur peut installer un capteur depuis le shell.",
      ],
      workflowSteps: ["Lecture chiffres", "Test fog", "??? ou valeur", "Capteur optionnel"],
      ceQueCaNeFaitPas: ["Ne dépend d'aucun scénario nommé."],
      codeRefs: [
        "lib/keyberOs/visibilite.ts",
        "app/admin/systeme/visibilite/page.tsx",
      ],
    },
    "donnees-sauvegarde": {
      id: "donnees-sauvegarde",
      title: "Données & Sauvegarde",
      ceQueCaFait: [
        "Charge le paramétrage du contexte actif pour démarrer une partie.",
        "Sauvegarde les slots de partie et la progression locale (saveSlotAndProgression, loadSavesBundle).",
        "Prépare un nouvel état de jeu (prepareNewGameState).",
      ],
      deQuoiCompose: [
        "lib/saveStore.ts — save / load slots + progression.",
        "Clés jeu : keyber-saves-v1, keyber-progression-v1, keyber-active-slot, keyber-user-id ; contexte actif côté registry.",
        "Séparation stricte d’avec keyber-studio-* (KEYBER_OS_RULES.md).",
      ],
      commentCaMarche: [
        "Au lancement, lecture du paramétrage → Moteur de Scénarios.",
        "À chaque étape importante, sauvegarde auto du slot actif.",
        "La progression des compétences peut être conservée entre parties.",
        "Le Studio Admin n’écrit jamais dans ces clés jeu.",
      ],
      workflowSteps: [
        "Lecture paramétrage",
        "Démarrage / reprise de slot",
        "Partie en cours",
        "Sauvegarde à chaque étape",
        "Reprise ultérieure via Jouer",
      ],
      ceQueCaNeFaitPas: [
        "Ne stocke pas l’Atelier / Book (préfixe keyber-studio-*).",
        "Ne synchronise pas vers un cloud dans ce modèle local.",
        "N’est pas une source de contenu métier inventé.",
      ],
      codeRefs: [
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
];
