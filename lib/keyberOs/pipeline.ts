/**
 * Keyber OS — Pipeline Vue Globale (étendu parité POC)
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
import { osOrdinateurSyncAfterErp } from "@/lib/keyberOs/ordinateur";
import { osObjectifsAfterChoice } from "@/lib/keyberOs/objectifs";
import {
  OS_ACTION_TIME_COST,
  osTempsAdvance,
  osTempsCanSpend,
} from "@/lib/keyberOs/temps";
import { osApplyMatchedFin } from "@/lib/keyberOs/fins";
import type { OsParamLoadSource } from "@/lib/keyberOs/paramLoader";
import type { OsPlayState } from "@/lib/keyberOs/types";

export function osPipelineBoot(
  param: ScenarioParamFile,
  sessionId: string,
  paramSource?: OsParamLoadSource | null
): OsPlayState {
  const load = osDonneesLoadParam(param);
  const bootLogs = [
    paramSource
      ? `Loader OS → ${paramSource.label}${
          paramSource.relativePath ? ` · ${paramSource.relativePath}` : ""
        }`
      : `Loader OS → source = fichier ${param.fichier || param.Nom || "?"} (unspecified)`,
    load.log,
  ];
  if (!load.ok) {
    return {
      ...osScenariosBoot(param, sessionId, bootLogs),
      paramSource: paramSource ?? null,
      finished: true,
      feedback: load.log,
    };
  }
  const state = osScenariosBoot(param, sessionId, bootLogs);
  return osDonneesSaveProgress({
    ...state,
    paramSource: paramSource ?? null,
  });
}

export function osPipelineApplyChoice(
  state: OsPlayState,
  choiceId: string
): OsPlayState {
  if (state.finished) return state;

  const decideCost = OS_ACTION_TIME_COST.decide ?? 20;
  if (!osTempsCanSpend(state, decideCost)) {
    return {
      ...state,
      feedback: "Pas assez de temps restant aujourd'hui.",
      log: [
        ...state.log,
        "Temps → décision refusée (reste insuffisant)",
      ],
    };
  }

  let next = osDecisionsApplyChoice(state, choiceId);
  if (!next) {
    return { ...state, finished: true };
  }

  next = osTempsAdvance(next, decideCost);
  next = osEvenementsTrigger(next);
  next = osErpLogUpdate(next);
  next = osOrdinateurSyncAfterErp(next);
  next = osProgressionApply(next);
  next = osObjectifsAfterChoice(next);

  next = {
    ...next,
    stepIndex: next.stepIndex + 1,
    activeAction: "decide",
  };
  if (next.stepIndex >= next.decisions.length) {
    next = osApplyMatchedFin({ ...next, finished: true });
  }

  if (!next.finished) {
    next = osInterfaceAdvanceLog(next);
  }
  next = osDonneesSaveProgress(next);
  return next;
}

export { osErpSnapshot, osInterfaceViewModel };
