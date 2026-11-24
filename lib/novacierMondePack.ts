/**
 * Clear Campus Phase 5 — pack Monde Novacier (usine métallique).
 * Structure dérivée du contenu ERP / POC existant (machines, employes, stock).
 * Aucune invention métier hors de ce qui existe déjà dans le pack.
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
    { id: "presses", wingId: "atelier", label: "Zone presses" },
    { id: "cnc", wingId: "atelier", label: "Usinage CNC" },
    { id: "assemblage", wingId: "atelier", label: "Ligne assemblage" },
    { id: "quai-matieres", wingId: "atelier", label: "Quai matières" },
    { id: "controle", wingId: "support", label: "Contrôle qualité" },
    { id: "maintenance", wingId: "support", label: "Atelier maintenance" },
  ],
};

export const NOVACIER_HOTSPOTS: ScenarioParamHotspot[] = [
  {
    id: "hs-suite",
    roomId: "bureau-dir",
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
    id: "hs-prod-presses",
    roomId: "presses",
    label: "Vue Live Production",
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
    id: "hs-dec",
    roomId: "salle-dec",
    label: "Briefing décision",
    type: "decision",
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
    id: "hs-controle",
    roomId: "controle",
    label: "Banc contrôle Q4",
    type: "productionLive",
    timeCostMin: 10,
  },
];

/**
 * Vue Live Production — manufactured.
 * Nœuds / flux alignés sur machines & lignes ERP Novacier existantes.
 */
export const NOVACIER_PRODUCTION_LIVE: ScenarioParamProductionLive = {
  valueType: "manufactured",
  label: "Atelier Novacier — flux live pièces métal",
  zones: [
    { id: "z-matieres", label: "Quai matières / coils", kind: "dock" },
    { id: "z-presses", label: "Presses", kind: "press" },
    { id: "z-cnc", label: "Usinage CNC", kind: "cnc" },
    { id: "z-assemblage", label: "Assemblage", kind: "assembly" },
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
      id: "f-asm-qc",
      fromNodeId: "n-asm3",
      toNodeId: "n-q4",
      label: "Assemblage → Contrôle",
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
