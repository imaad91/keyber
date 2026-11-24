/**
 * Exception démo Lumière — pack Monde Clear Campus rempli (entrepôt logistique).
 * Source de vérité pour seed Book + Excel Monde + JSON scénarios.
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
    { id: "reception", wingId: "log", label: "Quai réception" },
    { id: "packing", wingId: "log", label: "Zone packing" },
    { id: "ops-hub", wingId: "ops", label: "Hub opérations" },
    { id: "planning", wingId: "ops", label: "Bureau planning MRP" },
  ],
  map: { kind: "floorplan", assetId: "lumiere-entrepot-v1" },
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
    id: "hs-chat",
    roomId: "ops-hub",
    label: "Chat interne",
    type: "suite",
    targetId: "chat",
    timeCostMin: 5,
  },
  {
    id: "hs-dashboard",
    roomId: "planning",
    label: "Dashboard logistique",
    type: "suite",
    targetId: "dashboard",
    timeCostMin: 10,
  },
  {
    id: "hs-prod",
    roomId: "entrepot",
    label: "Vue Live Production",
    type: "productionLive",
    timeCostMin: 10,
  },
  {
    id: "hs-quai",
    roomId: "quai",
    label: "Live quais expédition",
    type: "productionLive",
    timeCostMin: 10,
  },
  {
    id: "hs-reception",
    roomId: "reception",
    label: "Live réception",
    type: "productionLive",
    timeCostMin: 10,
  },
  {
    id: "hs-dec",
    roomId: "salle-dec",
    label: "Briefing décision",
    type: "decision",
    targetId: "h1",
    timeCostMin: 20,
  },
  {
    id: "hs-iv-samir",
    roomId: "accueil",
    label: "Interview Samir",
    type: "interview",
    targetId: "iv-samir",
    timeCostMin: 15,
  },
  {
    id: "hs-iv-lea",
    roomId: "packing",
    label: "Interview Léa",
    type: "interview",
    targetId: "iv-lea",
    timeCostMin: 15,
  },
  {
    id: "hs-doc-picking",
    roomId: "entrepot",
    label: "Procédure picking Halo",
    type: "document",
    targetId: "Procédure picking Halo",
    timeCostMin: 5,
  },
  {
    id: "hs-doc-sav",
    roomId: "ops-hub",
    label: "Grille SAV colis perdu",
    type: "document",
    targetId: "Grille SAV colis perdu",
    timeCostMin: 5,
  },
];

const LUMIERE_PRODUCTION: ScenarioParamProductionLive = {
  valueType: "logistics",
  label: "Entrepôt Lumière & Co — flux live",
  zones: [
    { id: "z-rec", label: "Réception", kind: "dock" },
    { id: "z-stock", label: "Stockage", kind: "storage" },
    { id: "z-pick", label: "Picking", kind: "pick" },
    { id: "z-pack", label: "Packing", kind: "pack" },
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
      id: "n-gerbeur",
      zoneId: "z-rec",
      label: "Gerbeur A",
      kind: "machine",
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
      id: "n-a2",
      zoneId: "z-stock",
      label: "Allée B — Halo / MingLight",
      kind: "stock",
      status: "Stock bas",
    },
    {
      id: "n-p1",
      zoneId: "z-pick",
      label: "Poste picking 1",
      kind: "poste",
      status: "OK",
    },
    {
      id: "n-p2",
      zoneId: "z-pick",
      label: "Poste picking 2",
      kind: "poste",
      status: "OK",
    },
    {
      id: "n-pack",
      zoneId: "z-pack",
      label: "Table packing",
      kind: "poste",
      status: "OK",
    },
    {
      id: "n-label",
      zoneId: "z-pack",
      label: "Imprimante étiquettes",
      kind: "machine",
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
      label: "Réception → Stock A",
    },
    {
      id: "f1b",
      fromNodeId: "n-r1",
      toNodeId: "n-a2",
      label: "Réception → Stock B",
    },
    {
      id: "f2",
      fromNodeId: "n-a1",
      toNodeId: "n-p1",
      label: "Stock → Picking 1",
    },
    {
      id: "f2b",
      fromNodeId: "n-a2",
      toNodeId: "n-p2",
      label: "Stock → Picking 2",
    },
    {
      id: "f3",
      fromNodeId: "n-p1",
      toNodeId: "n-pack",
      label: "Picking → Packing",
    },
    {
      id: "f3b",
      fromNodeId: "n-p2",
      toNodeId: "n-pack",
      label: "Picking 2 → Packing",
    },
    {
      id: "f4",
      fromNodeId: "n-pack",
      toNodeId: "n-e1",
      label: "Packing → Expédition",
    },
  ],
  vehicles: [
    {
      id: "v-in",
      label: "Camion inbound MingLight",
      kind: "truck",
      zoneId: "z-rec",
    },
    {
      id: "v-out",
      label: "Camion outbound",
      kind: "truck",
      zoneId: "z-exp",
    },
    {
      id: "v-fork",
      label: "Chariot gerbeur",
      kind: "forklift",
      zoneId: "z-stock",
    },
  ],
  operators: [
    {
      id: "op-samir",
      label: "Samir",
      zoneId: "z-rec",
      role: "Réception",
    },
    {
      id: "op-nora",
      label: "Nora",
      zoneId: "z-pick",
      role: "Picker",
    },
    {
      id: "op-yanis",
      label: "Yanis",
      zoneId: "z-stock",
      role: "Magasinier",
    },
    {
      id: "op-lea",
      label: "Léa",
      zoneId: "z-pack",
      role: "Packing / SAV",
    },
  ],
  kpis: [
    { id: "cmd", label: "Commandes", path: "finance.commandes", unit: "" },
    { id: "stk", label: "Stock", path: "finance.stock", unit: "u" },
    { id: "otif", label: "OTIF", path: "kpis.otif", unit: "%" },
    {
      id: "pick",
      label: "Lignes pick / h",
      path: "kpis.pickRate",
      unit: "/h",
    },
  ],
};

export function lumiereClearCampusBlocks() {
  return {
    ClearCampus: LUMIERE_CLEAR_CAMPUS,
    Campus: LUMIERE_CAMPUS,
    Hotspots: LUMIERE_HOTSPOTS,
    ProductionLive: LUMIERE_PRODUCTION,
  };
}

/** Pack Excel Monde rempli (démo Lumière). */
export function buildLumiereMondePack(): MondeExcelPack {
  return paramBlocksToMondePack(lumiereClearCampusBlocks());
}
