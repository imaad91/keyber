/**
 * Keyber OS — Données & Sauvegarde
 * Charge le fichier de paramétrage et persiste la progression (localStorage jeu).
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { emitOsSaveEvent } from "@/lib/osSaveEvents";
import { validateScenarioFileContract } from "@/lib/scenarioFileContract";
import {
  createDefaultOsKpis,
  createEmptyOsFinance,
  createEmptyOsHistorique,
  createEmptyOsHumain,
  createEmptyOsMeta,
  createEmptyOsProgression,
  createEmptyOsVisibilite,
  createEmptyOsWorld,
} from "@/lib/keyberOs/createRichDefaults";
import { formatOsClock } from "@/lib/keyberOs/temps";
import type { OsPlayState } from "@/lib/keyberOs/types";

/** Migre une sauvegarde plate (pré-Étape 1) vers le schéma riche. */
export function ensureOsRichState(state: OsPlayState): OsPlayState {
  if (state.meta && state.finance && state.world && state.kpis) {
    return state;
  }
  const minutes = state.minutesSinceStart ?? 0;
  const dayLen = state.dayLengthMinutes ?? 600;
  return {
    ...state,
    meta:
      state.meta ??
      createEmptyOsMeta({
        scenarioId: state.sessionId,
        jourActuel: state.day ?? 1,
        week: state.week ?? 1,
        minutesSinceStart: minutes,
        dayLengthMinutes: dayLen,
        heureActuelle: formatOsClock(minutes),
        tempsRestantMinutes: Math.max(0, dayLen - minutes),
      }),
    finance:
      state.finance ??
      createEmptyOsFinance({
        tresorerie: state.tresorerieBrute ?? 50_000,
        stockKg: state.stock ?? 100,
        productionParJour: state.production ?? 60,
        commandes: state.commandes ?? 12,
      }),
    humain: state.humain ?? createEmptyOsHumain(),
    relations: state.relations ?? {},
    progression:
      state.progression ??
      createEmptyOsProgression({
        xp: state.xp ?? 0,
        niveau: state.niveau ?? 1,
        score: state.score ?? 0,
      }),
    visibilite:
      state.visibilite ??
      createEmptyOsVisibilite({
        level: state.visibilityLevel ?? 1,
        sensorInstalled: state.sensorInstalled ?? false,
      }),
    historique:
      state.historique ??
      createEmptyOsHistorique(),
    flags: state.flags ?? {},
    world: state.world ?? createEmptyOsWorld(),
    kpis: state.kpis?.length ? state.kpis : createDefaultOsKpis(),
  };
}

const SAVE_KEY = "keyber-os-play-saves-v1";

type SaveBag = Record<string, OsPlayState>;

function readBag(): SaveBag {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SaveBag;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeBag(bag: SaveBag) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(bag));
}

export function osDonneesLoadParam(param: ScenarioParamFile): {
  ok: boolean;
  log: string;
} {
  if (!isOsModuleEnabled("donnees-sauvegarde")) {
    return {
      ok: false,
      log: "Données & Sauvegarde → module désactivé (Admin)",
    };
  }
  /** Étape 35 — refuse si blocs / pointeurs hors fichier unique. */
  const contract = validateScenarioFileContract(param);
  if (!contract.ok) {
    const first = contract.issues.find((i) => i.level === "error");
    return {
      ok: false,
      log: `Données & Sauvegarde → contrat fichier unique ROUGE — ${
        first?.message || "blocs manquants ou hors fichier"
      }`,
    };
  }
  return {
    ok: true,
    log: `Données & Sauvegarde → fichier ${param.fichier || param.Nom}${
      contract.diskRelativePath ? ` (${contract.diskRelativePath})` : ""
    }`,
  };
}

export function osDonneesSaveProgress(state: OsPlayState): OsPlayState {
  const cfg = getOsRuntimeConfig();
  if (!isOsModuleEnabled("donnees-sauvegarde") || !cfg.donneesSauvegarde.autosave) {
    return {
      ...state,
      log: [
        ...state.log,
        "Données & Sauvegarde → autosave off / module off (pas d'écriture)",
      ],
    };
  }
  const bag = readBag();
  bag[state.sessionId] = state;
  writeBag(bag);
  const at = new Date().toISOString();
  emitOsSaveEvent(state.sessionId, at);
  return {
    ...state,
    log: [
      ...state.log,
      state.finished
        ? "Données & Sauvegarde → progression enregistrée (fin de scénario)"
        : "Données & Sauvegarde → progression sauvegardée",
    ],
  };
}

export function osDonneesLoadProgress(sessionId: string): OsPlayState | null {
  if (!isOsModuleEnabled("donnees-sauvegarde")) return null;
  const raw = readBag()[sessionId];
  return raw ? ensureOsRichState(raw) : null;
}

export function osDonneesClearProgress(sessionId: string) {
  const bag = readBag();
  delete bag[sessionId];
  writeBag(bag);
}

/** Entrées Book OS sauvegardées (Accueil « Reprendre »). */
export type OsBookSaveSummary = {
  sessionId: string;
  title: string;
  jourActuel: number;
  finished: boolean;
  niveau: number;
  xp: number;
};

/** Liste les progressions Book OS (clé = bookEntryId / sessionId). */
export function osDonneesListSaves(): OsBookSaveSummary[] {
  const bag = readBag();
  return Object.entries(bag).map(([sessionId, raw]) => {
    const state = ensureOsRichState(raw);
    const nom =
      typeof state.param?.Nom === "string" ? state.param.Nom.trim() : "";
    const entreprise =
      typeof state.param?.Entreprise === "string"
        ? state.param.Entreprise.trim()
        : "";
    return {
      sessionId,
      title: nom || entreprise || sessionId,
      jourActuel: state.meta?.jourActuel ?? state.day ?? 1,
      finished: Boolean(state.finished),
      niveau: state.progression?.niveau ?? state.niveau ?? 1,
      xp: state.progression?.xp ?? state.xp ?? 0,
    };
  });
}

/** Dernière partie Book non terminée, sinon la plus avancée. */
export function osDonneesMostRecentSave(): OsBookSaveSummary | null {
  const list = osDonneesListSaves();
  if (!list.length) return null;
  const open = list.filter((s) => !s.finished);
  const pool = open.length ? open : list;
  return [...pool].sort((a, b) => b.jourActuel - a.jourActuel)[0] ?? null;
}
