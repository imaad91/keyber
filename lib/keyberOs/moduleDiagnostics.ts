/**
 * Diagnostic santé par module — pastilles + checklist + signaux nœuds.
 */

"use client";

import type { BookEntry } from "@/lib/bookStore";
import type { KeyberOsComposanteId } from "@/lib/keyberOsDocs";
import type { OsArchNodeState } from "@/lib/keyberOs/moduleArchitecture";
import type { KeyberOsRuntimeConfig } from "@/lib/keyberOsRuntime";

export type OsHealthTone = "green" | "yellow" | "red";

export type OsCheckItem = {
  id: string;
  label: string;
  ok: boolean;
  /** true = case manquante mais non bloquante (jaune si seule). */
  soft?: boolean;
};

export type OsModuleDiagnostic = {
  moduleId: KeyberOsComposanteId;
  enabled: boolean;
  tone: OsHealthTone;
  headline: string;
  checks: OsCheckItem[];
  /** États des signaux pour colorer le schéma. */
  signals: Record<string, OsArchNodeState>;
  liveCount: number;
  liveWithOrdinateur: number;
};

function hasOrdinateur(entry: BookEntry): boolean {
  const p = entry.paramFile as { Ordinateur?: unknown } | null;
  return Boolean(p && p.Ordinateur && typeof p.Ordinateur === "object");
}

function hasLivre(entry: BookEntry): boolean {
  const p = entry.paramFile as { Livre?: unknown } | null;
  return Boolean(p && p.Livre);
}

function hasFins(entry: BookEntry): boolean {
  const p = entry.paramFile as { Fins?: unknown } | null;
  return Boolean(p && Array.isArray(p.Fins) ? p.Fins.length : p?.Fins);
}

function liveStats(live: BookEntry[]) {
  return {
    liveCount: live.length,
    withOrdinateur: live.filter(hasOrdinateur).length,
    withLivre: live.filter(hasLivre).length,
    withFins: live.filter(hasFins).length,
    withParam: live.filter((e) => Boolean(e.paramFile || e.paramFileName)).length,
  };
}

function moduleEnabled(
  id: KeyberOsComposanteId,
  cfg: KeyberOsRuntimeConfig
): boolean {
  switch (id) {
    case "erp":
      return cfg.erp.enabled;
    case "moteur-scenarios":
      return cfg.moteurScenarios.enabled;
    case "moteur-decisions":
      return cfg.moteurDecisions.enabled;
    case "moteur-evenements":
      return cfg.moteurEvenements.enabled;
    case "progression":
      return cfg.progression.enabled;
    case "interface-joueur":
      return cfg.interfaceJoueur.enabled;
    case "ordinateur":
      return cfg.ordinateur.enabled;
    case "temps":
      return cfg.temps.enabled;
    case "cycle-vie":
      return cfg.cycleVie.enabled;
    case "notifications":
      return cfg.notifications.enabled;
    case "interviews":
      return cfg.interviews.enabled;
    case "relations":
      return cfg.relations.enabled;
    case "objectifs":
      return cfg.objectifs.enabled;
    case "visibilite":
      return cfg.visibilite.enabled;
    case "journal":
      return cfg.journal.enabled;
    case "livre":
      return cfg.livre.enabled;
    case "profil":
      return cfg.profil.enabled;
    case "fins":
      return cfg.fins.enabled;
    case "donnees-sauvegarde":
      return cfg.donneesSauvegarde.enabled;
    case "campus":
      return cfg.campus.enabled;
    case "production-live":
      return cfg.productionLive.enabled;
    default:
      return true;
  }
}

function toneFromChecks(
  enabled: boolean,
  checks: OsCheckItem[]
): OsHealthTone {
  if (!enabled) return "red";
  const hardFail = checks.some((c) => !c.ok && !c.soft);
  if (hardFail) return "yellow";
  const softFail = checks.some((c) => !c.ok && c.soft);
  if (softFail) return "yellow";
  return "green";
}

function sig(
  on: boolean,
  mode: "hard" | "soft" | "optional" = "hard"
): OsArchNodeState {
  if (!on && mode === "optional") return "optional";
  if (!on && mode === "soft") return "warn";
  if (!on) return "missing";
  return "ok";
}

export function diagnoseOsModule(
  moduleId: KeyberOsComposanteId,
  cfg: KeyberOsRuntimeConfig,
  liveEntries: BookEntry[]
): OsModuleDiagnostic {
  const live = liveEntries.filter((e) => e.status === "live");
  const stats = liveStats(live);
  const enabled = moduleEnabled(moduleId, cfg);
  const checks: OsCheckItem[] = [];
  const signals: Record<string, OsArchNodeState> = {};

  // Signaux transverses
  signals["erp-on"] = sig(cfg.erp.enabled);
  signals["decisions-on"] = sig(cfg.moteurDecisions.enabled);
  signals["scenarios-on"] = sig(cfg.moteurScenarios.enabled);
  signals["evenements-on"] = sig(cfg.moteurEvenements.enabled);
  signals["ordinateur-on"] = sig(cfg.ordinateur.enabled);
  signals["temps-on"] = sig(cfg.temps.enabled);
  signals["cycle-on"] = sig(cfg.cycleVie.enabled);
  signals["notifications-on"] = sig(cfg.notifications.enabled);
  signals["interviews-on"] = sig(cfg.interviews.enabled);
  signals["relations-on"] = sig(cfg.relations.enabled);
  signals["objectifs-on"] = sig(cfg.objectifs.enabled);
  signals["visibilite-on"] = sig(cfg.visibilite.enabled);
  signals["progression-on"] = sig(cfg.progression.enabled);
  signals["interface-on"] = sig(cfg.interfaceJoueur.enabled);
  signals["journal-on"] = sig(cfg.journal.enabled);
  signals["livre-on"] = sig(cfg.livre.enabled);
  signals["profil-on"] = sig(cfg.profil.enabled);
  signals["fins-on"] = sig(cfg.fins.enabled);
  signals["donnees-on"] = sig(cfg.donneesSauvegarde.enabled);
  signals["campus-on"] = sig(cfg.campus.enabled);
  signals["production-live-on"] = sig(cfg.productionLive.enabled);

  signals["live-param"] = sig(stats.withParam > 0 || stats.liveCount === 0, "soft");
  signals["live-ordinateur"] = sig(
    stats.liveCount === 0 || stats.withOrdinateur > 0,
    "soft"
  );
  signals["live-livre"] = sig(
    stats.liveCount === 0 || stats.withLivre > 0,
    "soft"
  );
  signals["live-fins"] = sig(
    stats.liveCount === 0 || stats.withFins > 0,
    "soft"
  );

  signals["visibilite-fog"] = cfg.visibilite.enabled
    ? cfg.visibilite.fogEnabled
      ? "ok"
      : "optional"
    : "warn";
  signals["visibilite-sensors"] = cfg.visibilite.enabled
    ? "optional"
    : "warn";
  signals["notif-banner"] = sig(
    cfg.notifications.enabled && cfg.notifications.showUrgentBanner,
    "optional"
  );
  signals["relations-gauges"] = sig(
    cfg.relations.enabled && cfg.relations.showGauges,
    "soft"
  );
  signals["objectifs-dayend"] = sig(
    cfg.objectifs.enabled && cfg.objectifs.failJournalierOnDayEnd,
    "optional"
  );
  signals["cycle-onboarding"] = sig(
    cfg.cycleVie.enabled && cfg.cycleVie.onboardingEnabled,
    "optional"
  );
  signals["donnees-autosave"] = sig(
    cfg.donneesSauvegarde.enabled && cfg.donneesSauvegarde.autosave,
    "soft"
  );
  signals["app-erp"] = sig(
    cfg.ordinateur.enabled && cfg.ordinateur.apps.erp
  );
  signals["app-mail"] = sig(
    cfg.ordinateur.enabled && cfg.ordinateur.apps.mail,
    "soft"
  );

  checks.push({
    id: "enabled",
    label: "Module runtime ON",
    ok: enabled,
  });

  switch (moduleId) {
    case "erp": {
      checks.push({
        id: "ordinateur",
        label: "Module Ordinateur ON (hôte ERP)",
        ok: cfg.ordinateur.enabled,
      });
      checks.push({
        id: "app-erp",
        label: "App ERP visible sur le bureau",
        ok: cfg.ordinateur.apps.erp,
      });
      checks.push({
        id: "live-ordi",
        label:
          stats.liveCount === 0
            ? "Aucun Live Book (pack Ordinateur N/A)"
            : `Au moins 1 Live avec bloc Ordinateur (${stats.withOrdinateur}/${stats.liveCount})`,
        ok: stats.liveCount === 0 || stats.withOrdinateur > 0,
        soft: true,
      });
      checks.push({
        id: "fog",
        label: cfg.visibilite.enabled
          ? cfg.visibilite.fogEnabled
            ? "Fog Visibilité actif (ERP peut afficher ???)"
            : "Fog OFF — chiffres toujours lisibles"
          : "Visibilité OFF — fog non piloté",
        ok: cfg.visibilite.enabled,
        soft: true,
      });
      break;
    }
    case "ordinateur": {
      const appsOn = Object.values(cfg.ordinateur.apps).filter(Boolean).length;
      checks.push({
        id: "apps",
        label: `Au moins 1 app bureau ON (${appsOn}/6)`,
        ok: appsOn > 0,
      });
      checks.push({
        id: "live-ordi",
        label:
          stats.liveCount === 0
            ? "Aucun Live Book"
            : `Live avec Ordinateur (${stats.withOrdinateur}/${stats.liveCount})`,
        ok: stats.liveCount === 0 || stats.withOrdinateur > 0,
        soft: true,
      });
      break;
    }
    case "moteur-decisions": {
      checks.push({
        id: "erp-sync",
        label: "ERP ON (sync tables après choix)",
        ok: cfg.erp.enabled,
        soft: true,
      });
      checks.push({
        id: "deltas",
        label: "Deltas fallback configurés (3 options)",
        ok: cfg.moteurDecisions.deltas.length === 3,
      });
      break;
    }
    case "visibilite": {
      checks.push({
        id: "fog",
        label: "Fog brouillard activé",
        ok: cfg.visibilite.fogEnabled,
        soft: true,
      });
      checks.push({
        id: "erp",
        label: "ERP ON (cible du fog)",
        ok: cfg.erp.enabled,
        soft: true,
      });
      break;
    }
    case "temps": {
      checks.push({
        id: "day",
        label: `Durée journée > 0 (${cfg.temps.dayLengthMinutes} min)`,
        ok: cfg.temps.dayLengthMinutes > 0,
      });
      checks.push({
        id: "cycle",
        label: "Cycle de vie ON (DayEnd)",
        ok: cfg.cycleVie.enabled,
        soft: true,
      });
      break;
    }
    case "cycle-vie": {
      checks.push({
        id: "maxdays",
        label: `Jours jouables ≥ 1 (${cfg.cycleVie.maxDays})`,
        ok: cfg.cycleVie.maxDays >= 1,
      });
      checks.push({
        id: "temps",
        label: "Temps ON (horloge)",
        ok: cfg.temps.enabled,
      });
      break;
    }
    case "notifications": {
      checks.push({
        id: "events",
        label: "Moteur événements ON (source toasts)",
        ok: cfg.moteurEvenements.enabled,
        soft: true,
      });
      break;
    }
    case "donnees-sauvegarde": {
      checks.push({
        id: "autosave",
        label: "Autosave activé",
        ok: cfg.donneesSauvegarde.autosave,
        soft: true,
      });
      checks.push({
        id: "live-param",
        label:
          stats.liveCount === 0
            ? "Aucun Live (param N/A)"
            : `Live avec fichier param (${stats.withParam}/${stats.liveCount})`,
        ok: stats.liveCount === 0 || stats.withParam > 0,
        soft: true,
      });
      break;
    }
    case "livre": {
      checks.push({
        id: "live-livre",
        label:
          stats.liveCount === 0
            ? "Aucun Live"
            : `Live avec param.Livre (${stats.withLivre}/${stats.liveCount})`,
        ok: stats.liveCount === 0 || stats.withLivre > 0,
        soft: true,
      });
      break;
    }
    case "fins": {
      checks.push({
        id: "live-fins",
        label:
          stats.liveCount === 0
            ? "Aucun Live"
            : `Live avec param.Fins (${stats.withFins}/${stats.liveCount})`,
        ok: stats.liveCount === 0 || stats.withFins > 0,
        soft: true,
      });
      break;
    }
    case "profil": {
      checks.push({
        id: "prog",
        label: "Progression ON (source XP / badges)",
        ok: cfg.progression.enabled,
      });
      break;
    }
    case "interface-joueur": {
      checks.push({
        id: "shell",
        label: "Chrome shell affiché",
        ok: cfg.interfaceJoueur.showShell,
      });
      checks.push({
        id: "force-light",
        label: "Thème clair forcé (Clear Campus)",
        ok: cfg.interfaceJoueur.forceLightTheme === true,
      });
      break;
    }
    case "campus": {
      checks.push({
        id: "campus-on",
        label: "Campus ON",
        ok: cfg.campus.enabled,
      });
      checks.push({
        id: "light",
        label: "Interface light forcée",
        ok: cfg.interfaceJoueur.forceLightTheme,
        soft: true,
      });
      break;
    }
    case "production-live": {
      checks.push({
        id: "production-live-on",
        label: "Vue Live Production ON",
        ok: cfg.productionLive.enabled,
      });
      break;
    }
    default: {
      checks.push({
        id: "live",
        label:
          stats.liveCount === 0
            ? "Aucun scénario Live (checks Book N/A)"
            : `${stats.liveCount} scénario(s) Live`,
        ok: true,
        soft: true,
      });
    }
  }

  const tone = toneFromChecks(enabled, checks);
  let headline: string;
  if (!enabled) {
    headline = "Module désactivé — le Front ignore ce runtime.";
  } else if (tone === "yellow") {
    const miss = checks.find((c) => !c.ok);
    headline = miss
      ? `Attention : ${miss.label.toLowerCase()}.`
      : "Module actif avec alertes.";
  } else {
    headline = "Module sain — architecture branchée.";
  }

  return {
    moduleId,
    enabled,
    tone,
    headline,
    checks,
    signals,
    liveCount: stats.liveCount,
    liveWithOrdinateur: stats.withOrdinateur,
  };
}

export function diagnoseAllOsModules(
  cfg: KeyberOsRuntimeConfig,
  liveEntries: BookEntry[],
  ids: KeyberOsComposanteId[]
): OsModuleDiagnostic[] {
  return ids.map((id) => diagnoseOsModule(id, cfg, liveEntries));
}

export function formatRelativeFr(iso: string, nowMs = Date.now()): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t) || t <= 0) return "jamais";
  const diff = Math.max(0, nowMs - t);
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "hier";
  if (d < 7) return `il y a ${d} j`;
  return new Date(t).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}
