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
  const nextLevel = Math.max(state.visibilityLevel, 2);
  return {
    ...state,
    sensorInstalled: true,
    visibilityLevel: nextLevel,
    visibilite: {
      ...(state.visibilite ?? {
        level: nextLevel,
        sensorInstalled: true,
        parModule: {},
      }),
      sensorInstalled: true,
      level: Math.max(state.visibilite?.level ?? 0, nextLevel),
    },
    log: [
      ...state.log,
      "Visibilité → capteur installé (brouillard ERP levé)",
    ],
  };
}
