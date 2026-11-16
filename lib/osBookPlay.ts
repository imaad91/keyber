/**
 * Session de jeu Book → Keyber OS (Front-End).
 * Pont officiel Étape 20 : `/jouer/book/[id]` → OsPlayShell.
 * `/play` reste le POC Novacier (hors de ce module).
 * Délègue aux modules runtime lib/keyberOs/*
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import {
  osErpSnapshot,
  osInterfaceViewModel,
  osPipelineApplyChoice,
  osPipelineBoot,
  type OsPlayState,
} from "@/lib/keyberOs";
import type { OsParamLoadSource } from "@/lib/keyberOs/paramLoader";

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
  sessionId = `session-${param.fichier || param.Nom || "play"}`,
  paramSource?: OsParamLoadSource | null
): OsBookPlayState {
  return osPipelineBoot(param, sessionId, paramSource);
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
