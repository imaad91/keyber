/**
 * Exception démo Lumière — pack Excel Monde Clear Campus rempli
 * (même contenu que data/scenarios/lumiere-co/* ClearCampus blocks).
 */

import {
  paramBlocksToMondePack,
  type MondeExcelPack,
} from "@/lib/atelierMondeExcel";
import type {
  ClearCampusUiConfig,
  ScenarioParamCampus,
  ScenarioParamHotspot,
  ScenarioParamProductionLive,
} from "@/lib/clearCampus/types";

const LUMIERE_CLEAR_CAMPUS: ClearCampusUiConfig = {
  theme: "light",
  characterStyle: "vector",
  defaultView: "map",
};

const LUMIERE_CAMPUS: ScenarioParamCampus = {
  wings: [
    { id: "dir", label: "Direction" },
    { id: "log", label: "Logistique" },
    { id: "ops", label: "Opérations" },
  ],
  rooms: [
    { id: "accueil", wingId: "dir", label: "Accueil" },
    { id: "bureau", wingId: "dir", label: "Bureau direction" },
    { id: "salle-dec", wingId: "dir", label: "Salle de décision" },
    { id: "entrepot", wingId: "log", label: "Entrepôt" },
    { id: "quai", wingId: "log", label: "Quai expédition" },
    { id: "ops-hub", wingId: "ops", label: "Hub opérations" },
  ],
};

const LUMIERE_HOTSPOTS: ScenarioParamHotspot[] = [
  {
    id: "hs-suite",
    roomId: "bureau",
    label: "Poste Suite outils",
    type: "suite",
    targetId: "erp",
    timeCostMin: 0,
  },
  {
    id: "hs-mail",
    roomId: "ops-hub",
    label: "Boîte mail",
    type: "suite",
    targetId: "mail",
    timeCostMin: 5,
  },
  {
    id: "hs-prod",
    roomId: "entrepot",
    label: "Vue Live Production",
    type: "productionLive",
    timeCostMin: 10,
  },
  {
    id: "hs-dec",
    roomId: "salle-dec",
    label: "Briefing décision",
    type: "decision",
    timeCostMin: 20,
  },
  {
    id: "hs-iv",
    roomId: "accueil",
    label: "Interview Samir",
    type: "interview",
    targetId: "iv-samir",
    timeCostMin: 15,
  },
  {
    id: "hs-quai",
    roomId: "quai",
    label: "Live quais",
    type: "productionLive",
    timeCostMin: 10,
  },
];

const LUMIERE_PRODUCTION: ScenarioParamProductionLive = {
  valueType: "logistics",
  label: "Entrepôt Lumière & Co — flux live",
  zones: [
    { id: "z-rec", label: "Réception", kind: "dock" },
    { id: "z-stock", label: "Stockage", kind: "storage" },
    { id: "z-pick", label: "Picking", kind: "pick" },
    { id: "z-exp", label: "Expédition", kind: "dock" },
  ],
  nodes: [
    {
      id: "n-r1",
      zoneId: "z-rec",
      label: "Quai réception",
      kind: "quai",
      status: "OK",
    },
    {
      id: "n-a1",
      zoneId: "z-stock",
      label: "Allée A — luminaires",
      kind: "stock",
      status: "OK",
    },
    {
      id: "n-p1",
      zoneId: "z-pick",
      label: "Poste picking 1",
      kind: "poste",
      status: "OK",
    },
    {
      id: "n-e1",
      zoneId: "z-exp",
      label: "Quai expédition",
      kind: "quai",
      status: "OK",
    },
  ],
  flows: [
    {
      id: "f1",
      fromNodeId: "n-r1",
      toNodeId: "n-a1",
      label: "Réception → Stock",
    },
    {
      id: "f2",
      fromNodeId: "n-a1",
      toNodeId: "n-p1",
      label: "Stock → Picking",
    },
    {
      id: "f3",
      fromNodeId: "n-p1",
      toNodeId: "n-e1",
      label: "Picking → Expédition",
    },
  ],
  vehicles: [
    {
      id: "v-in",
      label: "Camion inbound",
      kind: "truck",
      zoneId: "z-rec",
    },
    {
      id: "v-out",
      label: "Camion outbound",
      kind: "truck",
      zoneId: "z-exp",
    },
  ],
  operators: [
    {
      id: "op-1",
      label: "Réceptionniste",
      zoneId: "z-rec",
      role: "ops",
    },
    {
      id: "op-2",
      label: "Picker",
      zoneId: "z-pick",
      role: "ops",
    },
  ],
  kpis: [
    { id: "kpi-otif", label: "OTIF", path: "kpis.otif", unit: "%" },
    {
      id: "kpi-pick",
      label: "Lignes pick / h",
      path: "kpis.pickRate",
      unit: "/h",
    },
  ],
};

/** Pack Excel Monde rempli (démo Lumière). */
export function buildLumiereMondePack(): MondeExcelPack {
  return paramBlocksToMondePack({
    ClearCampus: LUMIERE_CLEAR_CAMPUS,
    Campus: LUMIERE_CAMPUS,
    Hotspots: LUMIERE_HOTSPOTS,
    ProductionLive: LUMIERE_PRODUCTION,
  });
}
