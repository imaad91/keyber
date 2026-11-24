/**
 * Schémas d'architecture Admin par module Keyber OS.
 * Forme fixe (5–9 nœuds) — seuls les états runtime changent.
 */

import type { KeyberOsComposanteId } from "@/lib/keyberOsDocs";

export type OsArchNodeState = "ok" | "warn" | "missing" | "off" | "optional";

export type OsArchNodeDef = {
  id: string;
  label: string;
  /** Clé de diagnostic pour colorer le nœud (voir moduleDiagnostics). */
  signal?: string;
};

export type OsArchEdgeDef = {
  from: string;
  to: string;
};

export type OsModuleArchitecture = {
  moduleId: KeyberOsComposanteId;
  summary: string;
  nodes: OsArchNodeDef[];
  edges: OsArchEdgeDef[];
};

const ARCH: Record<KeyberOsComposanteId, OsModuleArchitecture> = {
  erp: {
    moduleId: "erp",
    summary:
      "Param Ordinateur → pack computer → tables ERP ; sync décisions ; fog Visibilité ; Analyse.",
    nodes: [
      { id: "param", label: "param.Ordinateur", signal: "live-ordinateur" },
      { id: "pack", label: "Pack computer", signal: "ordinateur-on" },
      { id: "tables", label: "Tables UI", signal: "erp-on" },
      { id: "sync", label: "Sync décisions", signal: "decisions-on" },
      { id: "fog", label: "Fog Visibilité", signal: "visibilite-fog" },
      { id: "analyse", label: "Analyse / KPIs", signal: "erp-on" },
    ],
    edges: [
      { from: "param", to: "pack" },
      { from: "pack", to: "tables" },
      { from: "pack", to: "sync" },
      { from: "tables", to: "fog" },
      { from: "sync", to: "analyse" },
      { from: "param", to: "analyse" },
    ],
  },
  "moteur-scenarios": {
    moduleId: "moteur-scenarios",
    summary: "Fichier param → registry → étape / jour → état initial partie.",
    nodes: [
      { id: "param", label: "Fichier param", signal: "live-param" },
      { id: "registry", label: "Registry scénario", signal: "scenarios-on" },
      { id: "etape", label: "Étape / jour", signal: "scenarios-on" },
      { id: "etat", label: "État initial", signal: "scenarios-on" },
      { id: "shell", label: "Shell joueur", signal: "interface-on" },
    ],
    edges: [
      { from: "param", to: "registry" },
      { from: "registry", to: "etape" },
      { from: "etape", to: "etat" },
      { from: "etat", to: "shell" },
    ],
  },
  "moteur-decisions": {
    moduleId: "moteur-decisions",
    summary: "Décisions param → choix joueur → conséquences → ERP + Progression.",
    nodes: [
      { id: "param", label: "Décisions (param)", signal: "live-param" },
      { id: "choix", label: "Choix joueur", signal: "decisions-on" },
      { id: "cons", label: "Conséquences", signal: "decisions-on" },
      { id: "temps", label: "Temps / Jour", signal: "temps-on" },
      { id: "erp", label: "ERP + Progression", signal: "erp-on" },
    ],
    edges: [
      { from: "param", to: "choix" },
      { from: "choix", to: "cons" },
      { from: "cons", to: "temps" },
      { from: "cons", to: "erp" },
    ],
  },
  "moteur-evenements": {
    moduleId: "moteur-evenements",
    summary: "Catalogue events → horloge → déclenchement → mails / stock.",
    nodes: [
      { id: "catalog", label: "Catalogue events", signal: "live-param" },
      { id: "horloge", label: "Horloge Temps", signal: "temps-on" },
      { id: "trigger", label: "Déclenchement", signal: "evenements-on" },
      { id: "effets", label: "Mails / stock", signal: "evenements-on" },
      { id: "notif", label: "Notifications", signal: "notifications-on" },
    ],
    edges: [
      { from: "catalog", to: "trigger" },
      { from: "horloge", to: "trigger" },
      { from: "trigger", to: "effets" },
      { from: "trigger", to: "notif" },
    ],
  },
  progression: {
    moduleId: "progression",
    summary: "Actions → XP / score → niveaux compétences → Profil.",
    nodes: [
      { id: "actions", label: "Actions joueur", signal: "progression-on" },
      { id: "xp", label: "XP / score", signal: "progression-on" },
      { id: "skills", label: "Niveaux skills", signal: "progression-on" },
      { id: "profil", label: "Profil / badges", signal: "profil-on" },
    ],
    edges: [
      { from: "actions", to: "xp" },
      { from: "xp", to: "skills" },
      { from: "skills", to: "profil" },
    ],
  },
  "interface-joueur": {
    moduleId: "interface-joueur",
    summary: "OsPlayShell : chrome, KPI, horloge, objectifs, workspace.",
    nodes: [
      { id: "shell", label: "OsPlayShell", signal: "interface-on" },
      { id: "kpi", label: "KPI bar", signal: "erp-on" },
      { id: "clock", label: "Horloge", signal: "temps-on" },
      { id: "obj", label: "Objectifs", signal: "objectifs-on" },
      { id: "ws", label: "Workspace", signal: "interface-on" },
    ],
    edges: [
      { from: "shell", to: "kpi" },
      { from: "shell", to: "clock" },
      { from: "shell", to: "obj" },
      { from: "shell", to: "ws" },
    ],
  },
  ordinateur: {
    moduleId: "ordinateur",
    summary: "Desktop 6 apps filtrées par toggles ; pack depuis param.",
    nodes: [
      { id: "param", label: "param.Ordinateur", signal: "live-ordinateur" },
      { id: "desktop", label: "Bureau", signal: "ordinateur-on" },
      { id: "erp", label: "App ERP", signal: "app-erp" },
      { id: "mail", label: "App Mail", signal: "app-mail" },
      { id: "autres", label: "Chat / Docs / …", signal: "ordinateur-on" },
    ],
    edges: [
      { from: "param", to: "desktop" },
      { from: "desktop", to: "erp" },
      { from: "desktop", to: "mail" },
      { from: "desktop", to: "autres" },
    ],
  },
  temps: {
    moduleId: "temps",
    summary: "Action → +minutes → recalcul jour / horloge → UI clock.",
    nodes: [
      { id: "action", label: "Action joueur", signal: "temps-on" },
      { id: "minutes", label: "+minutes", signal: "temps-on" },
      { id: "jour", label: "Jour / horloge", signal: "temps-on" },
      { id: "ui", label: "UI clock", signal: "interface-on" },
      { id: "cycle", label: "Cycle de vie", signal: "cycle-on" },
    ],
    edges: [
      { from: "action", to: "minutes" },
      { from: "minutes", to: "jour" },
      { from: "jour", to: "ui" },
      { from: "jour", to: "cycle" },
    ],
  },
  "cycle-vie": {
    moduleId: "cycle-vie",
    summary: "Intro → coach → jour → DayEnd → débrief / fins.",
    nodes: [
      { id: "intro", label: "Intro / coach", signal: "cycle-onboarding" },
      { id: "jour", label: "Phase JOUR", signal: "cycle-on" },
      { id: "dayend", label: "DayEnd", signal: "cycle-on" },
      { id: "debrief", label: "Débrief", signal: "cycle-on" },
      { id: "fins", label: "Fins", signal: "fins-on" },
    ],
    edges: [
      { from: "intro", to: "jour" },
      { from: "jour", to: "dayend" },
      { from: "dayend", to: "debrief" },
      { from: "debrief", to: "fins" },
    ],
  },
  notifications: {
    moduleId: "notifications",
    summary: "Événements / urgences → toasts + bannière.",
    nodes: [
      { id: "src", label: "Events / urgences", signal: "evenements-on" },
      { id: "toast", label: "Toasts", signal: "notifications-on" },
      { id: "banner", label: "Bannière urgente", signal: "notif-banner" },
      { id: "shell", label: "Shell joueur", signal: "interface-on" },
    ],
    edges: [
      { from: "src", to: "toast" },
      { from: "src", to: "banner" },
      { from: "toast", to: "shell" },
      { from: "banner", to: "shell" },
    ],
  },
  interviews: {
    moduleId: "interviews",
    summary: "PNJ param → dialogue → choix → relations.",
    nodes: [
      { id: "pnj", label: "PNJ (param)", signal: "live-param" },
      { id: "dialog", label: "Dialogue", signal: "interviews-on" },
      { id: "choix", label: "Choix", signal: "interviews-on" },
      { id: "rel", label: "Relations", signal: "relations-on" },
    ],
    edges: [
      { from: "pnj", to: "dialog" },
      { from: "dialog", to: "choix" },
      { from: "choix", to: "rel" },
    ],
  },
  relations: {
    moduleId: "relations",
    summary: "Slots confiance PNJ → jauges shell interview.",
    nodes: [
      { id: "slots", label: "Slots confiance", signal: "relations-on" },
      { id: "interview", label: "Interview", signal: "interviews-on" },
      { id: "jauges", label: "Jauges UI", signal: "relations-gauges" },
      { id: "decisions", label: "Décisions", signal: "decisions-on" },
    ],
    edges: [
      { from: "interview", to: "slots" },
      { from: "slots", to: "jauges" },
      { from: "decisions", to: "slots" },
    ],
  },
  objectifs: {
    moduleId: "objectifs",
    summary: "Objectifs param → suivi → COMPLETE / ECHOUE DayEnd.",
    nodes: [
      { id: "param", label: "Objectifs param", signal: "live-param" },
      { id: "suivi", label: "Suivi session", signal: "objectifs-on" },
      { id: "ui", label: "Panneau UI", signal: "interface-on" },
      { id: "dayend", label: "DayEnd fail", signal: "objectifs-dayend" },
      { id: "xp", label: "XP complétion", signal: "progression-on" },
    ],
    edges: [
      { from: "param", to: "suivi" },
      { from: "suivi", to: "ui" },
      { from: "suivi", to: "dayend" },
      { from: "suivi", to: "xp" },
    ],
  },
  visibilite: {
    moduleId: "visibilite",
    summary: "Niveau / capteurs → fog ??? sur KPI & ERP.",
    nodes: [
      { id: "niveau", label: "Niveau visibilité", signal: "visibilite-on" },
      { id: "capteurs", label: "Capteurs", signal: "visibilite-sensors" },
      { id: "fog", label: "Fog ???", signal: "visibilite-fog" },
      { id: "erp", label: "ERP / KPI", signal: "erp-on" },
      { id: "invest", label: "Investissements", signal: "visibilite-on" },
    ],
    edges: [
      { from: "niveau", to: "fog" },
      { from: "capteurs", to: "fog" },
      { from: "fog", to: "erp" },
      { from: "invest", to: "niveau" },
    ],
  },
  journal: {
    moduleId: "journal",
    summary: "world.journal → pages journal de bord joueur.",
    nodes: [
      { id: "world", label: "world.journal", signal: "journal-on" },
      { id: "events", label: "Événements OS", signal: "evenements-on" },
      { id: "pages", label: "Pages UI", signal: "journal-on" },
    ],
    edges: [
      { from: "events", to: "world" },
      { from: "world", to: "pages" },
    ],
  },
  livre: {
    moduleId: "livre",
    summary: "param.Livre → structure lore → lecteur Book.",
    nodes: [
      { id: "param", label: "param.Livre", signal: "live-livre" },
      { id: "struct", label: "Structure lore", signal: "livre-on" },
      { id: "ui", label: "Lecteur UI", signal: "livre-on" },
    ],
    edges: [
      { from: "param", to: "struct" },
      { from: "struct", to: "ui" },
    ],
  },
  profil: {
    moduleId: "profil",
    summary: "Progression → XP / skills / badges → fiche Profil.",
    nodes: [
      { id: "prog", label: "Progression OS", signal: "progression-on" },
      { id: "xp", label: "XP / skills", signal: "progression-on" },
      { id: "badges", label: "Badges", signal: "profil-on" },
      { id: "fiche", label: "Fiche Profil", signal: "profil-on" },
    ],
    edges: [
      { from: "prog", to: "xp" },
      { from: "xp", to: "badges" },
      { from: "badges", to: "fiche" },
    ],
  },
  fins: {
    moduleId: "fins",
    summary: "param.Fins → conditions → écrans ending.",
    nodes: [
      { id: "param", label: "param.Fins", signal: "live-fins" },
      { id: "cond", label: "Conditions", signal: "fins-on" },
      { id: "cycle", label: "Cycle / débrief", signal: "cycle-on" },
      { id: "ecran", label: "Écran ending", signal: "fins-on" },
    ],
    edges: [
      { from: "param", to: "cond" },
      { from: "cycle", to: "cond" },
      { from: "cond", to: "ecran" },
    ],
  },
  "donnees-sauvegarde": {
    moduleId: "donnees-sauvegarde",
    summary: "Charge param → slots locaux → autosave partie.",
    nodes: [
      { id: "load", label: "Charge param", signal: "live-param" },
      { id: "slots", label: "Slots locaux", signal: "donnees-on" },
      { id: "auto", label: "Autosave", signal: "donnees-autosave" },
      { id: "partie", label: "État partie", signal: "donnees-on" },
    ],
    edges: [
      { from: "load", to: "partie" },
      { from: "partie", to: "slots" },
      { from: "auto", to: "slots" },
    ],
  },
  campus: {
    moduleId: "campus",
    summary:
      "param.Campus / Hotspots → navigation salles → actions shell (Clear Campus).",
    nodes: [
      { id: "param", label: "param.Campus", signal: "live-param" },
      { id: "hotspots", label: "Hotspots", signal: "campus-on" },
      { id: "nav", label: "Salle courante", signal: "campus-on" },
      { id: "action", label: "Action shell", signal: "interface-on" },
    ],
    edges: [
      { from: "param", to: "hotspots" },
      { from: "hotspots", to: "nav" },
      { from: "nav", to: "action" },
    ],
  },
  "production-live": {
    moduleId: "production-live",
    summary:
      "param.ProductionLive → vue sol opérationnel (fallback ERP machines).",
    nodes: [
      { id: "param", label: "param.ProductionLive", signal: "live-param" },
      { id: "sync", label: "Sync statuts", signal: "production-live-on" },
      { id: "view", label: "Vue 2D claire", signal: "production-live-on" },
      { id: "erp", label: "Fallback ERP", signal: "ordinateur-on" },
    ],
    edges: [
      { from: "param", to: "sync" },
      { from: "sync", to: "view" },
      { from: "erp", to: "view" },
    ],
  },
};

export function getModuleArchitecture(
  id: KeyberOsComposanteId
): OsModuleArchitecture {
  return ARCH[id];
}

export function listModuleArchitectures(): OsModuleArchitecture[] {
  return Object.values(ARCH);
}
