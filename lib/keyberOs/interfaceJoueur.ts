/**
 * Keyber OS — Interface Joueur
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

export type OsInterfaceViewModel = {
  enabled: boolean;
  showErpTiles: boolean;
  showPipelineLog: boolean;
  showProgressionLine: boolean;
  showShell: boolean;
  showClock: boolean;
  showObjectives: boolean;
  showRightAside: boolean;
  showSidebarLinks: boolean;
  fullBleedShell: boolean;
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
    showShell: enabled && cfg.showShell,
    showClock: enabled && cfg.showClock,
    showObjectives: enabled && cfg.showObjectives,
    showRightAside: enabled && cfg.showRightAside,
    showSidebarLinks: enabled && cfg.showSidebarLinks,
    fullBleedShell: enabled && cfg.fullBleedShell,
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
