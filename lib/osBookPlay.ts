/**
 * Session de jeu Book → Keyber OS (Front-End).
 * Délègue aux modules runtime lib/keyberOs/* (mêmes composantes que l'Admin).
 * Aucun nom d'entreprise hardcodé.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import {
  osErpSnapshot,
  osInterfaceViewModel,
  osPipelineApplyChoice,
  osPipelineBoot,
  type OsPlayState,
} from "@/lib/keyberOs";

/** @deprecated alias — préférer OsPlayState */
export type OsBookPlayState = OsPlayState;
export type { OsPlayState };

export type OsBookPlayChoice = {
  id: string;
  label: string;
};

export type OsBookPlayDecision = {
  id: string;
  titre: string;
  options: OsBookPlayChoice[];
};

export function createOsBookPlayState(
  param: ScenarioParamFile,
  sessionId = `session-${param.fichier || param.Nom || "play"}`
): OsBookPlayState {
  return osPipelineBoot(param, sessionId);
}

export function osBookErpSnapshot(state: OsBookPlayState) {
  return osErpSnapshot(state);
}

export function osBookInterfaceView(state: OsBookPlayState) {
  return osInterfaceViewModel(state);
}

export function applyOsBookChoice(
  state: OsBookPlayState,
  choiceId: string
): OsBookPlayState {
  return osPipelineApplyChoice(state, choiceId);
}
