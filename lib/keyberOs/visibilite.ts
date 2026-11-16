/**
 * Keyber OS — Visibilité / brouillard ERP
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

export function osVisibiliteFog(state: OsPlayState): boolean {
  if (!isOsModuleEnabled("visibilite")) return false;
  const cfg = getOsRuntimeConfig().visibilite;
  if (!cfg.fogEnabled) return false;
  return !state.sensorInstalled && state.visibilityLevel < cfg.fogBelowLevel;
}

export function osVisibiliteInstallSensor(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("visibilite")) return state;
  return {
    ...state,
    sensorInstalled: true,
    visibilityLevel: Math.max(state.visibilityLevel, 2),
    log: [
      ...state.log,
      "Visibilité → capteur installé (brouillard ERP levé)",
    ],
  };
}
