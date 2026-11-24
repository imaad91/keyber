/**
 * Clear Campus — types param (Phase 1).
 * Contenu métier = données scénario ; jamais hardcodé dans l'OS.
 */

import type {
  ClearCampusCharacterStyle,
  ClearCampusTheme,
} from "@/lib/clearCampus/charter";

export type ClearCampusUiConfig = {
  /** Toujours light — dark refusé. */
  theme: ClearCampusTheme;
  characterStyle: ClearCampusCharacterStyle;
  /** Vue d'entrée joueur. */
  defaultView?: "map" | "explore" | "productionLive";
};

export type CampusWing = {
  id: string;
  label: string;
  /** Jour de déblocage (optionnel). */
  unlockDay?: number;
};

export type CampusRoom = {
  id: string;
  wingId: string;
  label: string;
  unlockDay?: number;
};

export type CampusMapRef = {
  kind: "floorplan";
  /** Id asset / plan illustratif — pas une photo de personnes. */
  assetId?: string;
};

/** Bloc `Campus` — monde libre par entreprise. */
export type ScenarioParamCampus = {
  wings: CampusWing[];
  rooms: CampusRoom[];
  map?: CampusMapRef;
};

export type HotspotActionType =
  | "suite"
  | "interview"
  | "decision"
  | "document"
  | "productionLive";

/** Point d'action spatial. */
export type ScenarioParamHotspot = {
  id: string;
  roomId: string;
  label: string;
  type: HotspotActionType;
  /** Id cible (app suite, interview, décision…). */
  targetId?: string;
  timeCostMin?: number;
  /** Expression / flag de visibilité (libre V1). */
  visibility?: string;
};

/** Type de création de valeur — Vue Live Production. */
export type ProductionValueType =
  | "manufactured"
  | "logistics"
  | "service"
  | "other";

export type ProductionZone = {
  id: string;
  label: string;
  kind?: string;
};

export type ProductionNode = {
  id: string;
  zoneId: string;
  label: string;
  /** machine | poste | quai | … */
  kind: string;
  status?: string;
};

export type ProductionFlow = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
};

export type ProductionVehicle = {
  id: string;
  label: string;
  kind?: string;
  zoneId?: string;
};

export type ProductionOperator = {
  id: string;
  label: string;
  zoneId?: string;
  /** Toujours vector/none via ClearCampus — pas de photo. */
  role?: string;
};

export type ProductionLiveKpi = {
  id: string;
  label: string;
  path?: string;
  unit?: string;
};

/** Bloc `ProductionLive` — sol opérationnel du contexte. */
export type ScenarioParamProductionLive = {
  valueType: ProductionValueType;
  label?: string;
  zones: ProductionZone[];
  nodes: ProductionNode[];
  flows: ProductionFlow[];
  vehicles: ProductionVehicle[];
  operators: ProductionOperator[];
  kpis: ProductionLiveKpi[];
};

/** Alias produit de `Ordinateur` — mêmes données apps / ERP. */
export type ScenarioParamSuite = Record<string, unknown>;
