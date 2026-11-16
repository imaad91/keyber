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
  OsFinance,
  OsHumain,
  OsInterview,
  OsKpiDef,
  OsMeta,
  OsModuleId,
  OsObjective,
  OsPhase,
  OsPlayState,
  OsPlayerAction,
  OsProgressionBlock,
  OsVisibiliteBlock,
  OsWorld,
} from "@/lib/keyberOs/types";

export {
  OS_STATE_FIELD_FAMILIES,
  osStateSchemaFamilyCount,
  osStateSchemaFieldCount,
} from "@/lib/keyberOs/stateSchema";

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
