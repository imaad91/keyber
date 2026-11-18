/**
 * Keyber OS — modules runtime (miroir des composantes Admin).
 */

export type {
  OsChoice,
  OsChoiceImpact,
  OsComputerAppId,
  OsComputerPack,
  OsConsequence,
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
  OsSkillCatalogEntry,
  OsSkillImpact,
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
  osDonneesListSaves,
  osDonneesMostRecentSave,
} from "@/lib/keyberOs/donneesSauvegarde";
export type { OsBookSaveSummary } from "@/lib/keyberOs/donneesSauvegarde";

export {
  OS_PARAM_LOADER_RULES,
  resolveOsBookParam,
  rememberOsParamSource,
  readRememberedOsParamSource,
} from "@/lib/keyberOs/paramLoader";
export type {
  OsParamLoadSource,
  OsParamSourceKind,
  OsParamResolveResult,
} from "@/lib/keyberOs/paramLoader";

export {
  osOrdinateurSetAction,
  osOrdinateurOpenApp,
  osOrdinateurMarkEmailRead,
} from "@/lib/keyberOs/ordinateur";

export {
  syncErpTablesFromScalars,
  collectErpAlerts,
  ensureErpTablesNonEmpty,
  normalizeCommandeStatut,
} from "@/lib/keyberOs/erpFeeling";

export {
  buildErpAnalyticsSeries,
  buildErpAnalyticsKpis,
  ERP_ANALYTICS_PRESETS,
} from "@/lib/keyberOs/erpAnalytics";

export {
  osApplyDialogueChoice,
  osInterviewSelect,
} from "@/lib/keyberOs/interviews";
export {
  osObjectifMetricValue,
  osObjectifsAfterChoice,
  osObjectifsEvaluate,
  osObjectifsOnDayEnd,
} from "@/lib/keyberOs/objectifs";
export {
  osRelationGet,
  osRelationSlots,
  osRelationsDefaultTrust,
  osRelationsInitFromInterviews,
  osRelationApplyDelta,
} from "@/lib/keyberOs/relations";
export type { OsRelationSlot } from "@/lib/keyberOs/relations";
export type {
  OsDialogueChoice,
  OsDialogueQuestion,
} from "@/lib/keyberOs/types";
export {
  formatOsClock,
  OS_ACTION_TIME_COST,
  OS_WORK_DAY_START_HOUR,
  osTempsAdvance,
  osTempsCanSpend,
  osTempsDayLength,
  osTempsDayProgressPct,
  osTempsElapsed,
  osTempsRemaining,
} from "@/lib/keyberOs/temps";
export {
  osCycleVieCloseAndAdvance,
  osCycleVieForceDayEnd,
} from "@/lib/keyberOs/cycleVie";
export {
  OS_ONBOARDING_STEPS,
  osFinishOnboarding,
  osIntroLines,
  osIsHistoireMode,
  osMarkIntroSeen,
  osOnboardingAdvance,
  osOnboardingBootWorld,
  osOnboardingCurrentMeta,
  osOnboardingNeedsFlow,
} from "@/lib/keyberOs/onboarding";
export {
  OS_DEBRIEF_TARGET_PIECES,
  osBuildSkillDebriefLines,
  osComputeEnding,
  osEndingNarration,
  osOpenDebrief,
  osPiecesQualite,
} from "@/lib/keyberOs/debrief";
export {
  emptyFinsStructure,
  finsFromParam,
  normalizeParamFin,
  normalizeParamFins,
  osApplyMatchedFin,
  osEvaluateFin,
  osFinsModuleEnabled,
} from "@/lib/keyberOs/fins";
export type {
  OsFinCondition,
  OsFinMatch,
  ScenarioParamFin,
} from "@/lib/keyberOs/fins";
export {
  osApplyConsequence,
  osApplyConsequences,
} from "@/lib/keyberOs/consequences";
export {
  OS_XP_PER_SKILL_LEVEL_DEFAULT,
  osAddSkillXp,
  osApplySkillImpacts,
  osProgressionApply,
  osProgressionBootFromParam,
  osSkillProgressList,
  osSkillSlug,
  osSkillsFromParam,
} from "@/lib/keyberOs/progression";
export {
  OS_BOOK_PLAY_PATH,
  OS_LEGACY_PLAY_PATH,
  OS_LEGACY_PLAY_RETIRED,
  OS_LIVE_CATALOG_PATH,
  OS_LIVE_COMPETENCE_PATH,
  OS_LIVE_HISTOIRE_PATH,
  osBookBridgeInfo,
  osBookPlayHref,
  osLegacyPlayArchiveHref,
  osLegacyPlayRedirectHref,
} from "@/lib/keyberOs/bookBridge";
export type { OsBookBridgeInfo } from "@/lib/keyberOs/bookBridge";
export {
  V1_GEL,
  V1_PROOF_ENTREPRISE,
  buildV1LumiereProofReport,
} from "@/lib/keyberOs/v1Gel";
export type {
  V1LumiereProofReport,
  V1ProofCheck,
} from "@/lib/keyberOs/v1Gel";
export {
  osClearUrgentBanner,
  osDismissEventNotification,
  osEvenementsForceNext,
  osEvenementsTrigger,
  osMapEventUiType,
} from "@/lib/keyberOs/moteurEvenements";
export {
  OS_DEFAULT_VISIBILITY_INVESTMENTS,
  OS_VISIBILITY_MATRIX,
  osDefaultSensors,
  osVisibiliteFog,
  osVisibiliteInstallSensor,
  osVisibiliteInvest,
  osVisibiliteInvestments,
  osVisibiliteSensors,
} from "@/lib/keyberOs/visibilite";
export {
  osKpiBarItems,
  osKpiRawValue,
  osKpiVisibility,
} from "@/lib/keyberOs/kpiBar";
export type { OsKpiFormatted } from "@/lib/keyberOs/kpiBar";
export { createDefaultOsKpis } from "@/lib/keyberOs/createRichDefaults";
export type {
  OsSensor,
  OsVisibilityInvestment,
} from "@/lib/keyberOs/types";
