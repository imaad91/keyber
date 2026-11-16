/**
 * Keyber OS — résolution KPI + tiers de visibilité (Étape 9).
 * Aucun nom d'entreprise.
 */

import {
  formatKpiValue,
  visibilityForLevel,
  type VisibilityLevel,
} from "@/lib/engine";
import type { OsKpiDef, OsPlayState, OsVisibilityTier } from "@/lib/keyberOs/types";
import { createDefaultOsKpis } from "@/lib/keyberOs/createRichDefaults";
import { osVisibiliteFog } from "@/lib/keyberOs/visibilite";

export type OsKpiFormatted = {
  id: string;
  label: string;
  unit?: string;
  visibility: VisibilityLevel;
  display: string;
  live?: boolean;
  estimated?: boolean;
  unknown?: boolean;
};

function readPath(state: OsPlayState, path: string): number | null {
  if (!path) return null;
  let cur: unknown = state;
  for (const part of path.split(".")) {
    if (cur == null || typeof cur !== "object") return null;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (typeof cur === "number" && Number.isFinite(cur)) return cur;
  if (typeof cur === "string") {
    const n = Number(String(cur).replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function fallbackValue(state: OsPlayState, id: string): number {
  switch (id) {
    case "tresorerie":
      return state.finance?.tresorerie ?? state.tresorerieBrute ?? 0;
    case "stock":
      return state.finance?.stockKg ?? state.stock ?? 0;
    case "production":
      return state.finance?.productionParJour ?? state.production ?? 0;
    case "rebut": {
      const r = state.finance?.tauxRebut ?? 0.02;
      return r <= 1 ? r * 100 : r;
    }
    case "moral":
      return state.humain?.moralEquipe ?? 70;
    case "ethique":
      return state.humain?.ethique ?? 70;
    case "confiance":
      return state.humain?.confianceClient ?? 70;
    default:
      return 0;
  }
}

/** Valeur brute pour formatage (percent déjà en %). */
export function osKpiRawValue(state: OsPlayState, kpi: OsKpiDef): number {
  const raw = readPath(state, kpi.path);
  if (raw == null) return fallbackValue(state, kpi.id);
  if (kpi.format === "percent" && raw <= 1) return raw * 100;
  return raw;
}

function tierToLabel(tier: OsVisibilityTier): VisibilityLevel {
  return visibilityForLevel(tier);
}

/**
 * Pastille par KPI : override `visibilite.parModule[id]`, sinon niveau global
 * + règles soft (éthique lisible plus tôt ; fog masque les finance).
 */
export function osKpiVisibility(
  state: OsPlayState,
  kpiId: string
): VisibilityLevel {
  const override = state.visibilite?.parModule?.[kpiId];
  if (override != null) return tierToLabel(override);

  const level = (state.visibilite?.level ??
    state.visibilityLevel ??
    0) as 0 | 1 | 2 | 3;
  const sensor =
    state.visibilite?.sensorInstalled ?? state.sensorInstalled ?? false;
  const fog = osVisibiliteFog(state);

  if (kpiId === "ethique") {
    return level >= 3 || sensor ? "TEMPS_REEL" : "PRECIS";
  }

  if (fog && ["tresorerie", "stock", "production", "rebut"].includes(kpiId)) {
    return "INCONNU";
  }

  if (sensor || level >= 3) return "TEMPS_REEL";
  if (level >= 2) return "PRECIS";
  if (level >= 1) {
    if (["moral", "confiance"].includes(kpiId)) return "ESTIME";
    return "ESTIME";
  }
  if (["moral", "confiance"].includes(kpiId)) return "ESTIME";
  return "INCONNU";
}

function toEngineFormat(
  format: OsKpiDef["format"]
): "money" | "number" | "percent" {
  if (format === "currency") return "money";
  if (format === "percent") return "percent";
  return "number";
}

export function osKpiBarItems(state: OsPlayState): OsKpiFormatted[] {
  const defs =
    state.kpis?.length > 0 ? state.kpis : createDefaultOsKpis();
  return defs.map((kpi) => {
    const visibility = osKpiVisibility(state, kpi.id);
    const raw = osKpiRawValue(state, kpi);
    const formatted = formatKpiValue(raw, toEngineFormat(kpi.format), visibility);
    return {
      id: kpi.id,
      label: kpi.label,
      unit: kpi.unit,
      visibility,
      display: formatted.display,
      live: formatted.live,
      estimated: formatted.estimated,
      unknown: formatted.unknown,
    };
  });
}
