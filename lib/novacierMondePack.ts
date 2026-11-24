/**
 * Clear Campus Phase 5 — pack Monde Novacier (usine métallique) — démo.
 * Structure dérivée du POC existant + enrichissements démo (hotspots, flux).
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

const NOVACIER_CLEAR_CAMPUS: ClearCampusUiConfig = {
  theme: "light",
  characterStyle: "vector",
  defaultView: "map",
};

/** Campus site Novacier — Direction / Atelier / Support. */
export const NOVACIER_CAMPUS: ScenarioParamCampus = {
  wings: [
    { id: "dir", label: "Direction" },
    { id: "atelier", label: "Atelier" },
    { id: "support", label: "Qualité & Maintenance" },
  ],
  rooms: [
    { id: "accueil", wingId: "dir", label: "Accueil" },
    { id: "bureau-dir", wingId: "dir", label: "Bureau direction" },
    { id: "salle-dec", wingId: "dir", label: "Salle de décision" },
    { id: "bureau-prod", wingId: "dir", label: "Bureau responsable production" },
    { id: "presses", wingId: "atelier", label: "Zone presses" },
    { id: "cnc", wingId: "atelier", label: "Usinage CNC" },
    { id: "assemblage", wingId: "atelier", label: "Ligne assemblage" },
    { id: "quai-matieres", wingId: "atelier", label: "Quai matières" },
    { id: "stock-pieces", wingId: "atelier", label: "Stock pièces / allées" },
    { id: "controle", wingId: "support", label: "Contrôle qualité" },
    { id: "maintenance", wingId: "support", label: "Atelier maintenance" },
  ],
  map: { kind: "floorplan", assetId: "novacier-atelier-v1" },
};

export const NOVACIER_HOTSPOTS: ScenarioParamHotspot[] = [
  {
    id: "hs-suite",
    roomId: "bureau-prod",
    label: "Poste Suite outils",
    type: "suite",
    targetId: "erp",
    timeCostMin: 0,
  },
  {
    id: "hs-mail",
    roomId: "accueil",
    label: "Boîte mail",
    type: "suite",
    targetId: "mail",
    timeCostMin: 5,
  },
  {
    id: "hs-chat",
    roomId: "bureau-prod",
    label: "Chat atelier",
    type: "suite",
    targetId: "chat",
    timeCostMin: 5,
  },
  {
    id: "hs-dashboard",
    roomId: "bureau-prod",
    label: "Dashboard production",
    type: "suite",
    targetId: "dashboard",
    timeCostMin: 10,
  },
  {
    id: "hs-prod-presses",
    roomId: "presses",
    label: "Vue Live Production",
    type: "productionLive",
    timeCostMin: 10,
  },
  {
    id: "hs-prod-cnc",
    roomId: "cnc",
    label: "Live CNC 2",
    type: "productionLive",
    timeCostMin: 10,
  },
  {
    id: "hs-prod-assemblage",
    roomId: "assemblage",
    label: "Live ligne assemblage",
    type: "productionLive",
    timeCostMin: 10,
  },
  {
    id: "hs-prod-matieres",
    roomId: "quai-matieres",
    label: "Live quai coils",
    type: "productionLive",
    timeCostMin: 10,
  },
  {
    id: "hs-controle",
    roomId: "controle",
    label: "Banc contrôle Q4",
    type: "productionLive",
    timeCostMin: 10,
  },
  {
    id: "hs-dec",
    roomId: "salle-dec",
    label: "Briefing décision",
    type: "decision",
    targetId: "dec-jour-1",
    timeCostMin: 20,
  },
  {
    id: "hs-iv-marie",
    roomId: "presses",
    label: "Interview Marie",
    type: "interview",
    targetId: "pers-marie",
    timeCostMin: 15,
  },
  {
    id: "hs-iv-karim",
    roomId: "maintenance",
    label: "Interview Karim",
    type: "interview",
    targetId: "pers-karim",
    timeCostMin: 15,
  },
  {
    id: "hs-iv-henri",
    roomId: "bureau-prod",
    label: "Interview Henri (mentor)",
    type: "interview",
    targetId: "pers-henri",
    timeCostMin: 15,
  },
  {
    id: "hs-iv-laurent",
    roomId: "bureau-dir",
    label: "Interview Laurent",
    type: "interview",
    targetId: "pers-laurent",
    timeCostMin: 15,
  },
  {
    id: "hs-doc-contrat",
    roomId: "bureau-dir",
    label: "Contrat AutoVolt",
    type: "document",
    targetId: "doc-autovolt",
    timeCostMin: 5,
  },
  {
    id: "hs-doc-m3",
    roomId: "assemblage",
    label: "Fiche panne Assembleuse 3",
    type: "document",
    targetId: "doc-m3",
    timeCostMin: 5,
  },
  {
    id: "hs-doc-planning",
    roomId: "bureau-prod",
    label: "Planning semaine",
    type: "document",
    targetId: "doc-planning",
    timeCostMin: 5,
  },
];

/**
 * Vue Live Production — manufactured.
 * Nœuds / flux alignés sur machines & lignes ERP Novacier + stock A-42.
 */
export const NOVACIER_PRODUCTION_LIVE: ScenarioParamProductionLive = {
  valueType: "manufactured",
  label: "Atelier Novacier — flux live pièces métal",
  zones: [
    { id: "z-matieres", label: "Quai matières / coils", kind: "dock" },
    { id: "z-presses", label: "Presses", kind: "press" },
    { id: "z-cnc", label: "Usinage CNC", kind: "cnc" },
    { id: "z-assemblage", label: "Assemblage", kind: "assembly" },
    { id: "z-stock", label: "Stock pièces", kind: "storage" },
    { id: "z-controle", label: "Contrôle qualité", kind: "qc" },
  ],
  nodes: [
    {
      id: "n-coil",
      zoneId: "z-matieres",
      label: "Coil Acier 2mm",
      kind: "stock",
      status: "OK",
    },
    {
      id: "n-presse1",
      zoneId: "z-presses",
      label: "Presse 1",
      kind: "machine",
      status: "PRODUCTION",
    },
    {
      id: "n-cnc2",
      zoneId: "z-cnc",
      label: "CNC 2",
      kind: "machine",
      status: "PRODUCTION",
    },
    {
      id: "n-asm3",
      zoneId: "z-assemblage",
      label: "Assembleuse 3",
      kind: "machine",
      status: "Capteur HS",
    },
    {
      id: "n-stock-a42",
      zoneId: "z-stock",
      label: "Allée B — Support Moteur A-42",
      kind: "stock",
      status: "Stock bas",
    },
    {
      id: "n-stock-b17",
      zoneId: "z-stock",
      label: "Allée A — Bride B-17",
      kind: "stock",
      status: "OK",
    },
    {
      id: "n-q4",
      zoneId: "z-controle",
      label: "Contrôle Q4",
      kind: "machine",
      status: "ARRET",
    },
  ],
  flows: [
    {
      id: "f-coil-presse",
      fromNodeId: "n-coil",
      toNodeId: "n-presse1",
      label: "Coil → Presse",
    },
    {
      id: "f-presse-cnc",
      fromNodeId: "n-presse1",
      toNodeId: "n-cnc2",
      label: "A-42 → CNC",
    },
    {
      id: "f-cnc-asm",
      fromNodeId: "n-cnc2",
      toNodeId: "n-asm3",
      label: "Bride / support → Assemblage",
    },
    {
      id: "f-asm-stock",
      fromNodeId: "n-asm3",
      toNodeId: "n-stock-a42",
      label: "Assemblage → Stock A-42",
    },
    {
      id: "f-stock-qc",
      fromNodeId: "n-stock-a42",
      toNodeId: "n-q4",
      label: "Stock → Contrôle",
    },
  ],
  vehicles: [
    {
      id: "v-chariot",
      label: "Chariot coils",
      kind: "forklift",
      zoneId: "z-matieres",
    },
    {
      id: "v-camion",
      label: "Camion MétalPro",
      kind: "truck",
      zoneId: "z-matieres",
    },
    {
      id: "v-transpalette",
      label: "Transpalette allées",
      kind: "pallet",
      zoneId: "z-stock",
    },
  ],
  operators: [
    {
      id: "op-marie",
      label: "Marie Dubois",
      zoneId: "z-presses",
      role: "Cheffe d'atelier",
    },
    {
      id: "op-tom",
      label: "Tom Rivière",
      zoneId: "z-presses",
      role: "Opérateur Presse",
    },
    {
      id: "op-karim",
      label: "Karim Benali",
      zoneId: "z-assemblage",
      role: "Technicien Maintenance",
    },
    {
      id: "op-lea",
      label: "Léa Moreau",
      zoneId: "z-controle",
      role: "Contrôle Qualité",
    },
  ],
  kpis: [
    {
      id: "kpi-pieces",
      label: "Pièces qualité",
      path: "qualite",
      unit: "pcs",
    },
    {
      id: "kpi-stock",
      label: "Stock A-42",
      path: "stock",
      unit: "u",
    },
    {
      id: "kpi-ethique",
      label: "Éthique",
      path: "ethique",
      unit: "%",
    },
    {
      id: "kpi-cash",
      label: "Trésorerie",
      path: "tresorerie",
      unit: "€",
    },
  ],
};

export function novacierClearCampusBlocks() {
  return {
    ClearCampus: NOVACIER_CLEAR_CAMPUS,
    Campus: NOVACIER_CAMPUS,
    Hotspots: NOVACIER_HOTSPOTS,
    ProductionLive: NOVACIER_PRODUCTION_LIVE,
  };
}

/** Pack Excel Monde rempli (démo Novacier usine). */
export function buildNovacierMondePack(): MondeExcelPack {
  return paramBlocksToMondePack(novacierClearCampusBlocks());
}
