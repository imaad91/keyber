/**
 * Keyber OS — Données & Sauvegarde
 * Charge le fichier de paramétrage et persiste la progression (localStorage jeu).
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import {
  createDefaultOsKpis,
  createEmptyOsFinance,
  createEmptyOsHistorique,
  createEmptyOsHumain,
  createEmptyOsMeta,
  createEmptyOsProgression,
  createEmptyOsVisibilite,
  createEmptyOsWorld,
  formatOsHeure,
} from "@/lib/keyberOs/createRichDefaults";
import type { OsPlayState } from "@/lib/keyberOs/types";

/** Migre une sauvegarde plate (pré-Étape 1) vers le schéma riche. */
export function ensureOsRichState(state: OsPlayState): OsPlayState {
  if (state.meta && state.finance && state.world && state.kpis) {
    return state;
  }
  const minutes = state.minutesSinceStart ?? 8 * 60;
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
        heureActuelle: formatOsHeure(minutes),
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
  return {
    ok: true,
    log: `Données & Sauvegarde → fichier ${param.fichier || param.Nom}`,
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
