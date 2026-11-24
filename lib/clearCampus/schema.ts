/**
 * Clear Campus — coquilles vides + normalisation (Phase 1).
 * Aucun contenu métier inventé.
 */

import {
  assertClearCampusTheme,
  CLEAR_CAMPUS_CHARACTER_STYLE_DEFAULT,
  CLEAR_CAMPUS_THEME,
  normalizeCharacterStyle,
} from "@/lib/clearCampus/charter";
import type {
  ClearCampusUiConfig,
  ScenarioParamCampus,
  ScenarioParamHotspot,
  ScenarioParamProductionLive,
} from "@/lib/clearCampus/types";

export function emptyClearCampusUi(): ClearCampusUiConfig {
  return {
    theme: CLEAR_CAMPUS_THEME,
    characterStyle: CLEAR_CAMPUS_CHARACTER_STYLE_DEFAULT,
    defaultView: "map",
  };
}

export function emptyCampus(): ScenarioParamCampus {
  return {
    wings: [],
    rooms: [],
  };
}

export function emptyProductionLive(): ScenarioParamProductionLive {
  return {
    valueType: "other",
    zones: [],
    nodes: [],
    flows: [],
    vehicles: [],
    operators: [],
    kpis: [],
  };
}

export function emptyHotspots(): ScenarioParamHotspot[] {
  return [];
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

export function normalizeClearCampusUi(raw: unknown): ClearCampusUiConfig {
  const o = isPlainObject(raw) ? raw : {};
  return {
    theme: assertClearCampusTheme(o.theme),
    characterStyle: normalizeCharacterStyle(o.characterStyle),
    defaultView:
      o.defaultView === "explore" || o.defaultView === "productionLive"
        ? o.defaultView
        : "map",
  };
}

export function normalizeCampus(raw: unknown): ScenarioParamCampus {
  const o = isPlainObject(raw) ? raw : {};
  const wings = Array.isArray(o.wings)
    ? o.wings.filter((w) => isPlainObject(w) && typeof w.id === "string")
    : [];
  const rooms = Array.isArray(o.rooms)
    ? o.rooms.filter((r) => isPlainObject(r) && typeof r.id === "string")
    : [];
  const map = isPlainObject(o.map)
    ? {
        kind: "floorplan" as const,
        assetId:
          typeof o.map.assetId === "string" ? o.map.assetId : undefined,
      }
    : undefined;
  return {
    wings: wings as ScenarioParamCampus["wings"],
    rooms: rooms as ScenarioParamCampus["rooms"],
    ...(map ? { map } : {}),
  };
}

const HOTSPOT_TYPES = new Set([
  "suite",
  "interview",
  "decision",
  "document",
  "productionLive",
]);

export function normalizeHotspots(raw: unknown): ScenarioParamHotspot[] {
  if (!Array.isArray(raw)) return [];
  const out: ScenarioParamHotspot[] = [];
  for (const row of raw) {
    if (!isPlainObject(row)) continue;
    if (typeof row.id !== "string" || typeof row.roomId !== "string") continue;
    const type = String(row.type || "");
    if (!HOTSPOT_TYPES.has(type)) continue;
    out.push({
      id: row.id,
      roomId: row.roomId,
      label: typeof row.label === "string" ? row.label : row.id,
      type: type as ScenarioParamHotspot["type"],
      targetId: typeof row.targetId === "string" ? row.targetId : undefined,
      timeCostMin:
        typeof row.timeCostMin === "number" ? row.timeCostMin : undefined,
      visibility: typeof row.visibility === "string" ? row.visibility : undefined,
    });
  }
  return out;
}

const VALUE_TYPES = new Set([
  "manufactured",
  "logistics",
  "service",
  "other",
]);

export function normalizeProductionLive(
  raw: unknown
): ScenarioParamProductionLive {
  const o = isPlainObject(raw) ? raw : {};
  const valueType = VALUE_TYPES.has(String(o.valueType))
    ? (String(o.valueType) as ScenarioParamProductionLive["valueType"])
    : "other";
  return {
    valueType,
    label: typeof o.label === "string" ? o.label : undefined,
    zones: Array.isArray(o.zones) ? (o.zones as ScenarioParamProductionLive["zones"]) : [],
    nodes: Array.isArray(o.nodes) ? (o.nodes as ScenarioParamProductionLive["nodes"]) : [],
    flows: Array.isArray(o.flows) ? (o.flows as ScenarioParamProductionLive["flows"]) : [],
    vehicles: Array.isArray(o.vehicles)
      ? (o.vehicles as ScenarioParamProductionLive["vehicles"])
      : [],
    operators: Array.isArray(o.operators)
      ? (o.operators as ScenarioParamProductionLive["operators"])
      : [],
    kpis: Array.isArray(o.kpis) ? (o.kpis as ScenarioParamProductionLive["kpis"]) : [],
  };
}

/** Résumé Admin — présence / remplissage Clear Campus. */
export type ClearCampusBlockSummary = {
  key: string;
  label: string;
  filled: boolean;
  detail: string;
};

export function summarizeClearCampusBlocks(param: {
  ClearCampus?: unknown;
  Campus?: unknown;
  Hotspots?: unknown;
  ProductionLive?: unknown;
  Ordinateur?: unknown;
  Suite?: unknown;
}): ClearCampusBlockSummary[] {
  const ui = normalizeClearCampusUi(param.ClearCampus);
  const campus = normalizeCampus(param.Campus);
  const hotspots = normalizeHotspots(param.Hotspots);
  const prod = normalizeProductionLive(param.ProductionLive);
  const hasSuiteAlias = isPlainObject(param.Suite);
  const hasOrdi = isPlainObject(param.Ordinateur);

  return [
    {
      key: "ClearCampus",
      label: "UI Clear Campus",
      filled: true,
      detail: `thème ${ui.theme} · personnages ${ui.characterStyle} · vue ${ui.defaultView}`,
    },
    {
      key: "Campus",
      label: "Campus",
      filled: campus.wings.length > 0 || campus.rooms.length > 0,
      detail:
        campus.wings.length || campus.rooms.length
          ? `${campus.wings.length} aile(s) · ${campus.rooms.length} salle(s)`
          : "vide",
    },
    {
      key: "Hotspots",
      label: "Hotspots",
      filled: hotspots.length > 0,
      detail:
        hotspots.length > 0 ? `${hotspots.length} hotspot(s)` : "vide",
    },
    {
      key: "ProductionLive",
      label: "Vue Live Production",
      filled:
        prod.zones.length > 0 ||
        prod.nodes.length > 0 ||
        prod.flows.length > 0,
      detail:
        prod.zones.length || prod.nodes.length
          ? `type ${prod.valueType} · ${prod.zones.length} zone(s) · ${prod.nodes.length} nœud(s)`
          : `type ${prod.valueType} · vide`,
    },
    {
      key: "Suite",
      label: "Suite outils (alias Ordinateur)",
      filled: hasOrdi || hasSuiteAlias,
      detail: hasSuiteAlias
        ? "clé Suite présente (+ Ordinateur canonique)"
        : hasOrdi
          ? "Ordinateur présent (Suite = alias)"
          : "absent",
    },
  ];
}
