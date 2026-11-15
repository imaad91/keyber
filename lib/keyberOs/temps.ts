/**
 * Keyber OS — Temps & Horloge
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

export function formatOsClock(minutesSinceStart: number): string {
  const m = ((minutesSinceStart % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function osTempsAdvance(
  state: OsPlayState,
  minutes: number
): OsPlayState {
  if (!isOsModuleEnabled("temps")) {
    return {
      ...state,
      log: [...state.log, "Temps & Horloge → module désactivé (Admin)"],
    };
  }
  const cfg = getOsRuntimeConfig().temps;
  let minutesSinceStart = state.minutesSinceStart + Math.max(0, minutes);
  let day = state.day;
  let week = state.week;
  const dayLen = state.dayLengthMinutes || cfg.dayLengthMinutes;
  while (minutesSinceStart >= dayLen) {
    minutesSinceStart -= dayLen;
    day += 1;
    if (day > 5) {
      day = 1;
      week += 1;
    }
  }
  return {
    ...state,
    minutesSinceStart,
    day,
    week,
    log: [
      ...state.log,
      `Temps & Horloge → +${minutes} min (J${day} ${formatOsClock(minutesSinceStart)})`,
    ],
  };
}

export const OS_ACTION_TIME_COST: Record<string, number> = {
  computer: 5,
  erp: 15,
  mail: 5,
  dashboard: 10,
  documents: 8,
  chat: 5,
  browser: 10,
  decide: 20,
  interview: 15,
  "atelier-live": 10,
};
