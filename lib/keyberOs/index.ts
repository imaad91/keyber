/**
 * Keyber OS — modules runtime (miroir des composantes Admin).
 */

export type {
  OsChoice,
  OsDecision,
  OsErpSnapshot,
  OsModuleId,
  OsPlayState,
} from "@/lib/keyberOs/types";

export {
  osPipelineBoot,
  osPipelineApplyChoice,
  osErpSnapshot,
  osInterfaceViewModel,
} from "@/lib/keyberOs/pipeline";

export { osDonneesLoadProgress, osDonneesClearProgress } from "@/lib/keyberOs/donneesSauvegarde";
