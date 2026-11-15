/**
 * Keyber OS — Pipeline Vue Globale
 * Enchaîne les composantes dans l'ordre Admin :
 * Données → Scénarios → Décisions + Événements → ERP → Progression → Interface → Sauvegarde
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { osDonneesLoadParam, osDonneesSaveProgress } from "@/lib/keyberOs/donneesSauvegarde";
import { osScenariosBoot } from "@/lib/keyberOs/moteurScenarios";
import { osDecisionsApplyChoice } from "@/lib/keyberOs/moteurDecisions";
import { osEvenementsTrigger } from "@/lib/keyberOs/moteurEvenements";
import { osErpLogUpdate, osErpSnapshot } from "@/lib/keyberOs/erp";
import { osProgressionApply } from "@/lib/keyberOs/progression";
import {
  osInterfaceAdvanceLog,
  osInterfaceViewModel,
} from "@/lib/keyberOs/interfaceJoueur";
import type { OsPlayState } from "@/lib/keyberOs/types";

export function osPipelineBoot(
  param: ScenarioParamFile,
  sessionId: string
): OsPlayState {
  const load = osDonneesLoadParam(param);
  const state = osScenariosBoot(param, sessionId, [load.log]);
  return osDonneesSaveProgress(state);
}

/**
 * Choix joueur → Décisions → Événements → ERP → Progression → Interface → Sauvegarde
 */
export function osPipelineApplyChoice(
  state: OsPlayState,
  choiceId: string
): OsPlayState {
  if (state.finished) return state;

  let next = osDecisionsApplyChoice(state, choiceId);
  if (!next) {
    return { ...state, finished: true };
  }

  // Événement sur l'étape courante, puis avance
  next = osEvenementsTrigger(next);
  next = osErpLogUpdate(next);
  next = osProgressionApply(next);

  next = {
    ...next,
    stepIndex: next.stepIndex + 1,
  };
  if (next.stepIndex >= next.decisions.length) {
    next = { ...next, finished: true };
  }

  if (!next.finished) {
    next = osInterfaceAdvanceLog(next);
  }
  next = osDonneesSaveProgress(next);
  return next;
}

export { osErpSnapshot, osInterfaceViewModel };
