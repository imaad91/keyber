/**
 * Keyber OS — Données & Sauvegarde
 * Charge le fichier de paramétrage et persiste la progression (localStorage jeu).
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

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
  return readBag()[sessionId] ?? null;
}

export function osDonneesClearProgress(sessionId: string) {
  const bag = readBag();
  delete bag[sessionId];
  writeBag(bag);
}
