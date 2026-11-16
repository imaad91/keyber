/**
 * Keyber OS — Objectifs
 */

import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

export function osObjectifsAfterChoice(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("objectifs")) {
    return {
      ...state,
      log: [...state.log, "Objectifs → module désactivé (Admin)"],
    };
  }
  const objectives = state.objectives.map((o) => {
    if (o.id === "obj-2" && o.status === "EN_COURS") {
      return { ...o, status: "COMPLETE" as const };
    }
    if (o.id === "obj-1" && state.stock >= 80 && o.status === "EN_COURS") {
      return { ...o, status: "COMPLETE" as const };
    }
    return o;
  });
  const completed = objectives.filter(
    (o, i) => o.status === "COMPLETE" && state.objectives[i]?.status !== "COMPLETE"
  );
  const log = [...state.log];
  for (const o of completed) {
    log.push(`Objectifs → « ${o.titre} » COMPLETE`);
  }
  return { ...state, objectives, log };
}
