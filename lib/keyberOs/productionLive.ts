/**
 * Keyber OS — Vue Live Production (Clear Campus Phase 2).
 * Sol opérationnel data-driven depuis param.ProductionLive.
 * Fallback machines ERP si le bloc prod est vide (packs legacy).
 */

import { normalizeProductionLive } from "@/lib/clearCampus/schema";
import type {
  ProductionNode,
  ProductionValueType,
  ScenarioParamProductionLive,
} from "@/lib/clearCampus/types";
import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";
import type { ScenarioParamFileExtended } from "@/lib/scenarioParamSchema";

export type OsProductionLiveRuntime = {
  nodeStatus: Record<string, string>;
  vehicleZone: Record<string, string>;
  tick: number;
};

export type OsProductionLiveViewNode = ProductionNode & {
  status: string;
  x: number;
  y: number;
};

export type OsProductionLiveView = {
  source: "param" | "erp-fallback" | "empty";
  valueType: ProductionValueType;
  label: string;
  zones: ScenarioParamProductionLive["zones"];
  nodes: OsProductionLiveViewNode[];
  flows: ScenarioParamProductionLive["flows"];
  vehicles: ScenarioParamProductionLive["vehicles"];
  operators: ScenarioParamProductionLive["operators"];
  kpis: { id: string; label: string; value: string }[];
};

export function emptyOsProductionLiveRuntime(): OsProductionLiveRuntime {
  return {
    nodeStatus: {},
    vehicleZone: {},
    tick: 0,
  };
}

function asExtended(state: OsPlayState): ScenarioParamFileExtended {
  return state.param as ScenarioParamFileExtended;
}

const LAYOUT: { x: number; y: number }[] = [
  { x: 14, y: 22 },
  { x: 52, y: 18 },
  { x: 78, y: 28 },
  { x: 20, y: 58 },
  { x: 48, y: 52 },
  { x: 74, y: 62 },
  { x: 36, y: 78 },
];

function layoutAt(i: number) {
  return LAYOUT[i % LAYOUT.length]!;
}

/** Sync léger des statuts nœuds depuis ERP machines / alarmes. */
export function osProductionLiveSync(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("production-live")) return state;
  const runtime = state.productionLiveRuntime ?? emptyOsProductionLiveRuntime();
  const prod = normalizeProductionLive(asExtended(state).ProductionLive);
  const nodeStatus = { ...runtime.nodeStatus };

  if (prod.nodes.length > 0) {
    prod.nodes.forEach((n, i) => {
      if (nodeStatus[n.id]) return;
      const machine = state.computer.machines[i];
      if (machine) {
        nodeStatus[n.id] = machine.etat || n.status || "OK";
      } else {
        nodeStatus[n.id] = n.status || "OK";
      }
    });
  } else {
    state.computer.machines.forEach((m, i) => {
      const id = `erp-machine-${i}`;
      nodeStatus[id] = m.etat || "OK";
    });
  }

  if (state.world?.alarmActive) {
    const first = Object.keys(nodeStatus)[0];
    if (first) nodeStatus[first] = "ALERTE";
  }

  return {
    ...state,
    productionLiveRuntime: {
      ...runtime,
      nodeStatus,
      tick: runtime.tick + 1,
    },
  };
}

function kpiValue(state: OsPlayState, path?: string): string {
  if (!path) return "—";
  if (path.includes("tresorerie")) {
    return String(Math.round(state.finance?.tresorerie ?? state.tresorerieBrute));
  }
  if (path.includes("stock")) {
    return String(Math.round(state.finance?.stockKg ?? state.stock));
  }
  if (path.includes("production")) {
    return String(
      Math.round(state.finance?.productionParJour ?? state.production)
    );
  }
  if (path.includes("commandes")) {
    return String(Math.round(state.finance?.commandes ?? state.commandes));
  }
  return "—";
}

/**
 * Vue joueur Vue Live Production — param d'abord, sinon machines ERP.
 */
export function osProductionLiveViewModel(
  state: OsPlayState
): OsProductionLiveView {
  const runtime = state.productionLiveRuntime ?? emptyOsProductionLiveRuntime();
  const prod = normalizeProductionLive(asExtended(state).ProductionLive);
  const hasParam =
    prod.zones.length > 0 ||
    prod.nodes.length > 0 ||
    prod.flows.length > 0;

  if (hasParam) {
    const nodes: OsProductionLiveViewNode[] = prod.nodes.map((n, i) => {
      const pos = layoutAt(i);
      return {
        ...n,
        status: runtime.nodeStatus[n.id] || n.status || "OK",
        x: pos.x,
        y: pos.y,
      };
    });
    return {
      source: "param",
      valueType: prod.valueType,
      label: prod.label || "Vue Live Production",
      zones: prod.zones,
      nodes,
      flows: prod.flows,
      vehicles: prod.vehicles.map((v) => ({
        ...v,
        zoneId: runtime.vehicleZone[v.id] || v.zoneId,
      })),
      operators: prod.operators,
      kpis: prod.kpis.map((k) => ({
        id: k.id,
        label: k.label,
        value: kpiValue(state, k.path),
      })),
    };
  }

  if (state.computer.machines.length > 0) {
    const nodes: OsProductionLiveViewNode[] = state.computer.machines.map(
      (m, i) => {
        const id = `erp-machine-${i}`;
        const pos = layoutAt(i);
        return {
          id,
          zoneId: "zone-atelier",
          label: m.nom,
          kind: "machine",
          status: runtime.nodeStatus[id] || m.etat || "OK",
          x: pos.x,
          y: pos.y,
        };
      }
    );
    return {
      source: "erp-fallback",
      valueType: "manufactured",
      label: "Vue Live Production (ERP)",
      zones: [{ id: "zone-atelier", label: "Atelier", kind: "production" }],
      nodes,
      flows: [],
      vehicles: [],
      operators: [],
      kpis: [
        {
          id: "prod",
          label: "Prod / jour",
          value: String(
            Math.round(state.finance?.productionParJour ?? state.production)
          ),
        },
        {
          id: "stock",
          label: "Stock",
          value: String(Math.round(state.finance?.stockKg ?? state.stock)),
        },
      ],
    };
  }

  return {
    source: "empty",
    valueType: prod.valueType,
    label: "Vue Live Production",
    zones: [],
    nodes: [],
    flows: [],
    vehicles: [],
    operators: [],
    kpis: [],
  };
}
