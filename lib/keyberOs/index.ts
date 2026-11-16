/**
 * Keyber OS — modules runtime (miroir des composantes Admin).
 */

export type {
  OsChoice,
  OsComputerAppId,
  OsComputerPack,
  OsDecision,
  OsEmail,
  OsErpSnapshot,
  OsInterview,
  OsModuleId,
  OsObjective,
  OsPlayState,
  OsPlayerAction,
} from "@/lib/keyberOs/types";

export {
  osPipelineBoot,
  osPipelineApplyChoice,
  osErpSnapshot,
  osInterfaceViewModel,
} from "@/lib/keyberOs/pipeline";

export {
  osDonneesLoadProgress,
  osDonneesClearProgress,
} from "@/lib/keyberOs/donneesSauvegarde";

export {
  osOrdinateurSetAction,
  osOrdinateurOpenApp,
  osOrdinateurMarkEmailRead,
} from "@/lib/keyberOs/ordinateur";

export { osInterviewSelect } from "@/lib/keyberOs/interviews";
export { formatOsClock } from "@/lib/keyberOs/temps";
export { osVisibiliteFog, osVisibiliteInstallSensor } from "@/lib/keyberOs/visibilite";
