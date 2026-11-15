/**
 * Keyber OS — Interface Joueur
 * Décide quoi exposer à l'UI (flags Admin). N'invente pas de contenu.
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

export type OsInterfaceViewModel = {
  enabled: boolean;
  showErpTiles: boolean;
  showPipelineLog: boolean;
  showProgressionLine: boolean;
  stepLabel: string | null;
};

export function osInterfaceViewModel(state: OsPlayState): OsInterfaceViewModel {
  const cfg = getOsRuntimeConfig().interfaceJoueur;
  const enabled = isOsModuleEnabled("interface-joueur");
  return {
    enabled,
    showErpTiles: enabled && cfg.showErpTiles,
    showPipelineLog: enabled && cfg.showPipelineLog,
    showProgressionLine: enabled && cfg.showProgressionLine,
    stepLabel:
      !state.finished && state.decisions.length
        ? `étape ${state.stepIndex + 1}/${state.decisions.length}`
        : null,
  };
}

export function osInterfaceAdvanceLog(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("interface-joueur")) {
    return {
      ...state,
      log: [...state.log, "Interface Joueur → module désactivé (Admin)"],
    };
  }
  if (state.finished) return state;
  return {
    ...state,
    log: [
      ...state.log,
      `Interface Joueur → étape ${state.stepIndex + 1}/${state.decisions.length}`,
    ],
  };
}
