/**
 * Keyber OS — Interviews / PNJ
 */

import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

export function osInterviewSelect(
  state: OsPlayState,
  interviewId: string | null
): OsPlayState {
  if (!isOsModuleEnabled("interviews")) {
    return {
      ...state,
      feedback: "Module Interviews désactivé dans Keyber OS Admin",
      log: [...state.log, "Interviews → module désactivé (Admin)"],
    };
  }
  return {
    ...state,
    activeAction: "interview",
    selectedInterviewId: interviewId,
    log: interviewId
      ? [...state.log, `Interviews → PNJ « ${interviewId} »`]
      : state.log,
  };
}
