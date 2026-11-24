/**
 * Clear Campus Phase 4 — Templates Excel Monde (Campus / Hotspots) + Vue Live Production.
 * Download + dry-run → staging Création. Contenu métier = utilisateur (Lumière = exception seed).
 */

import * as XLSX from "xlsx";
import {
  emptyCampus,
  emptyClearCampusUi,
  emptyHotspots,
  emptyProductionLive,
  normalizeCampus,
  normalizeClearCampusUi,
  normalizeHotspots,
  normalizeProductionLive,
} from "@/lib/clearCampus/schema";
import type {
  ScenarioParamCampus,
  ScenarioParamHotspot,
  ScenarioParamProductionLive,
  ClearCampusUiConfig,
} from "@/lib/clearCampus/types";

export type MondeSheetId =
  | "meta"
  | "ailes"
  | "salles"
  | "hotspots"
  | "prodMeta"
  | "zones"
  | "nodes"
  | "flows"
  | "vehicles"
  | "operators"
  | "prodKpis";

export type MondeSheetDef = {
  id: MondeSheetId;
  sheetName: string;
  label: string;
  columns: readonly string[];
};

export const MONDE_SHEETS: MondeSheetDef[] = [
  {
    id: "meta",
    sheetName: "ClearCampus",
    label: "UI Clear Campus",
    columns: ["Theme", "CharacterStyle", "DefaultView"],
  },
  {
    id: "ailes",
    sheetName: "Ailes",
    label: "Ailes",
    columns: ["Id", "Label", "UnlockDay"],
  },
  {
    id: "salles",
    sheetName: "Salles",
    label: "Salles",
    columns: ["Id", "WingId", "Label", "UnlockDay"],
  },
  {
    id: "hotspots",
    sheetName: "Hotspots",
    label: "Hotspots",
    columns: [
      "Id",
      "RoomId",
      "Label",
      "Type",
      "TargetId",
      "TimeCostMin",
      "Visibility",
    ],
  },
  {
    id: "prodMeta",
    sheetName: "ProdMeta",
    label: "Production — méta",
    columns: ["ValueType", "Label"],
  },
  {
    id: "zones",
    sheetName: "Zones",
    label: "Zones prod",
    columns: ["Id", "Label", "Kind"],
  },
  {
    id: "nodes",
    sheetName: "Nodes",
    label: "Nœuds / postes",
    columns: ["Id", "ZoneId", "Label", "Kind", "Status"],
  },
  {
    id: "flows",
    sheetName: "Flows",
    label: "Flux",
    columns: ["Id", "FromNodeId", "ToNodeId", "Label"],
  },
  {
    id: "vehicles",
    sheetName: "Vehicles",
    label: "Véhicules",
    columns: ["Id", "Label", "Kind", "ZoneId"],
  },
  {
    id: "operators",
    sheetName: "Operators",
    label: "Opérateurs",
    columns: ["Id", "Label", "ZoneId", "Role"],
  },
  {
    id: "prodKpis",
    sheetName: "ProdKpis",
    label: "KPI prod",
    columns: ["Id", "Label", "Path", "Unit"],
  },
];

export type MondeExcelRow = Record<string, string>;
export type MondeExcelPack = Partial<Record<MondeSheetId, MondeExcelRow[]>>;

function sheetWithHeader(
  columns: readonly string[],
  dataRows: string[][] = []
): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet([
    [...columns],
    ...(dataRows.length ? dataRows : [columns.map(() => "")]),
  ]);
  ws["!cols"] = columns.map((c) => ({
    wch: Math.min(42, Math.max(14, c.length + 2)),
  }));
  return ws;
}

export function buildMondeTemplateWorkbook(
  pack?: MondeExcelPack
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  for (const def of MONDE_SHEETS) {
    const rows = pack?.[def.id] ?? [];
    const dataRows = rows.map((r) => def.columns.map((c) => r[c] ?? ""));
    XLSX.utils.book_append_sheet(
      wb,
      sheetWithHeader(def.columns, dataRows),
      def.sheetName.slice(0, 31)
    );
  }
  return wb;
}

export function downloadMondeTemplate() {
  XLSX.writeFile(
    buildMondeTemplateWorkbook(),
    "KEYBER_Template_Monde_ClearCampus.xlsx"
  );
}

export function downloadMondeFilledPack(
  pack: MondeExcelPack,
  fileName = "KEYBER_Monde_Filled.xlsx"
) {
  XLSX.writeFile(buildMondeTemplateWorkbook(pack), fileName);
}

export function downloadMondeSheetTemplate(sheetId: MondeSheetId) {
  const def = MONDE_SHEETS.find((s) => s.id === sheetId);
  if (!def) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    sheetWithHeader(def.columns),
    def.sheetName.slice(0, 31)
  );
  XLSX.writeFile(
    wb,
    `KEYBER_Template_Monde_${def.sheetName.replace(/\s+/g, "_")}.xlsx`
  );
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim().toLowerCase();
}

function matchSheetByName(name: string): MondeSheetDef | null {
  const n = normalizeHeader(name);
  for (const def of MONDE_SHEETS) {
    if (normalizeHeader(def.sheetName) === n) return def;
    if (normalizeHeader(def.id) === n) return def;
    if (normalizeHeader(def.label) === n) return def;
  }
  if (n.includes("aile") || n.includes("wing")) {
    return MONDE_SHEETS.find((s) => s.id === "ailes") ?? null;
  }
  if (n.includes("salle") || n.includes("room")) {
    return MONDE_SHEETS.find((s) => s.id === "salles") ?? null;
  }
  if (n.includes("hotspot")) {
    return MONDE_SHEETS.find((s) => s.id === "hotspots") ?? null;
  }
  if (n.includes("clear") || n === "ui") {
    return MONDE_SHEETS.find((s) => s.id === "meta") ?? null;
  }
  if (n.includes("prodmeta") || n.includes("value type")) {
    return MONDE_SHEETS.find((s) => s.id === "prodMeta") ?? null;
  }
  if (n.includes("zone")) {
    return MONDE_SHEETS.find((s) => s.id === "zones") ?? null;
  }
  if (n.includes("node") || n.includes("nœud") || n.includes("noeud")) {
    return MONDE_SHEETS.find((s) => s.id === "nodes") ?? null;
  }
  if (n.includes("flow") || n.includes("flux")) {
    return MONDE_SHEETS.find((s) => s.id === "flows") ?? null;
  }
  if (n.includes("vehicle") || n.includes("véhicule") || n.includes("vehicule")) {
    return MONDE_SHEETS.find((s) => s.id === "vehicles") ?? null;
  }
  if (n.includes("operator") || n.includes("opérateur") || n.includes("operateur")) {
    return MONDE_SHEETS.find((s) => s.id === "operators") ?? null;
  }
  if (n.includes("kpi")) {
    return MONDE_SHEETS.find((s) => s.id === "prodKpis") ?? null;
  }
  return null;
}

function matchColumn(
  header: string,
  columns: readonly string[]
): string | null {
  const n = normalizeHeader(header);
  for (const col of columns) {
    if (normalizeHeader(col) === n) return col;
  }
  return null;
}

export type MondeSheetParseSummary = {
  sheetId: MondeSheetId;
  sheetName: string;
  label: string;
  recognizedColumns: number;
  expectedColumns: number;
  rowCount: number;
  rows: MondeExcelRow[];
  warnings: string[];
};

export type ParseMondeExcelResult =
  | {
      ok: true;
      dryRun: true;
      sheets: MondeSheetParseSummary[];
      totalRows: number;
      pack: MondeExcelPack;
    }
  | { ok: false; error: string };

export function parseMondeExcelDryRun(
  data: ArrayBuffer
): ParseMondeExcelResult {
  try {
    const wb = XLSX.read(data, { type: "array" });
    if (!wb.SheetNames.length) {
      return { ok: false, error: "Fichier Excel vide (aucun onglet)" };
    }

    const sheets: MondeSheetParseSummary[] = [];
    const pack: MondeExcelPack = {};

    for (const sheetName of wb.SheetNames) {
      const def = matchSheetByName(sheetName);
      if (!def) continue;
      const ws = wb.Sheets[sheetName];
      if (!ws) continue;
      const rawRows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
        header: 1,
        defval: "",
        raw: false,
      }) as unknown as unknown[][];

      if (!rawRows.length) {
        sheets.push({
          sheetId: def.id,
          sheetName: def.sheetName,
          label: def.label,
          recognizedColumns: 0,
          expectedColumns: def.columns.length,
          rowCount: 0,
          rows: [],
          warnings: ["Onglet sans lignes"],
        });
        continue;
      }

      const headerRow = (rawRows[0] ?? []).map((c) => String(c ?? ""));
      const colIndex = new Map<string, number>();
      headerRow.forEach((h, i) => {
        const col = matchColumn(h, def.columns);
        if (col) colIndex.set(col, i);
      });

      const warnings: string[] = [];
      if (colIndex.size === 0) {
        warnings.push("Aucune colonne reconnue — utilise le template Keyber.");
      } else if (colIndex.size < def.columns.length) {
        warnings.push(
          `${colIndex.size}/${def.columns.length} colonnes reconnues`
        );
      }

      const rows: MondeExcelRow[] = [];
      for (let r = 1; r < rawRows.length; r++) {
        const line = rawRows[r] ?? [];
        const obj: MondeExcelRow = {};
        let any = false;
        for (const col of def.columns) {
          const idx = colIndex.get(col);
          const val = idx == null ? "" : String(line[idx] ?? "").trim();
          obj[col] = val;
          if (val) any = true;
        }
        if (any) rows.push(obj);
      }

      sheets.push({
        sheetId: def.id,
        sheetName: def.sheetName,
        label: def.label,
        recognizedColumns: colIndex.size,
        expectedColumns: def.columns.length,
        rowCount: rows.length,
        rows,
        warnings,
      });
      pack[def.id] = rows;
    }

    if (sheets.length === 0) {
      return {
        ok: false,
        error:
          "Aucun onglet Monde / Production reconnu. Télécharge KEYBER_Template_Monde_ClearCampus.xlsx.",
      };
    }

    const totalRows = sheets.reduce((s, x) => s + x.rowCount, 0);
    return { ok: true, dryRun: true, sheets, totalRows, pack };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Lecture Excel impossible",
    };
  }
}

export function countMondePackRows(pack: MondeExcelPack): number {
  return MONDE_SHEETS.reduce((n, s) => n + (pack[s.id]?.length ?? 0), 0);
}

export function countCampusPackRows(pack: MondeExcelPack): number {
  return (
    (pack.ailes?.length ?? 0) +
    (pack.salles?.length ?? 0) +
    (pack.hotspots?.length ?? 0) +
    (pack.meta?.length ?? 0)
  );
}

export function countProductionPackRows(pack: MondeExcelPack): number {
  return (
    (pack.prodMeta?.length ?? 0) +
    (pack.zones?.length ?? 0) +
    (pack.nodes?.length ?? 0) +
    (pack.flows?.length ?? 0) +
    (pack.vehicles?.length ?? 0) +
    (pack.operators?.length ?? 0) +
    (pack.prodKpis?.length ?? 0)
  );
}

function optNum(s: string | undefined): number | undefined {
  if (!s?.trim()) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/** Staging Excel → blocs param Clear Campus (structure seulement). */
export function mondePackToParamBlocks(pack: MondeExcelPack): {
  ClearCampus: ClearCampusUiConfig;
  Campus: ScenarioParamCampus;
  Hotspots: ScenarioParamHotspot[];
  ProductionLive: ScenarioParamProductionLive;
} {
  const metaRow = pack.meta?.[0];
  const clearRaw = metaRow
    ? {
        theme: metaRow["Theme"] || "light",
        characterStyle: metaRow["CharacterStyle"] || "vector",
        defaultView: metaRow["DefaultView"] || "map",
      }
    : emptyClearCampusUi();

  const campusRaw = {
    wings: (pack.ailes ?? []).map((r) => ({
      id: r["Id"] || "",
      label: r["Label"] || r["Id"] || "",
      unlockDay: optNum(r["UnlockDay"]),
    })),
    rooms: (pack.salles ?? []).map((r) => ({
      id: r["Id"] || "",
      wingId: r["WingId"] || "",
      label: r["Label"] || r["Id"] || "",
      unlockDay: optNum(r["UnlockDay"]),
    })),
  };

  const hotspotsRaw = (pack.hotspots ?? []).map((r) => ({
    id: r["Id"] || "",
    roomId: r["RoomId"] || "",
    label: r["Label"] || r["Id"] || "",
    type: r["Type"] || "suite",
    targetId: r["TargetId"] || undefined,
    timeCostMin: optNum(r["TimeCostMin"]),
    visibility: r["Visibility"] || undefined,
  }));

  const prodMeta = pack.prodMeta?.[0];
  const productionRaw = {
    valueType: prodMeta?.["ValueType"] || "other",
    label: prodMeta?.["Label"] || undefined,
    zones: (pack.zones ?? []).map((r) => ({
      id: r["Id"] || "",
      label: r["Label"] || r["Id"] || "",
      kind: r["Kind"] || undefined,
    })),
    nodes: (pack.nodes ?? []).map((r) => ({
      id: r["Id"] || "",
      zoneId: r["ZoneId"] || "",
      label: r["Label"] || r["Id"] || "",
      kind: r["Kind"] || "poste",
      status: r["Status"] || undefined,
    })),
    flows: (pack.flows ?? []).map((r) => ({
      id: r["Id"] || "",
      fromNodeId: r["FromNodeId"] || "",
      toNodeId: r["ToNodeId"] || "",
      label: r["Label"] || undefined,
    })),
    vehicles: (pack.vehicles ?? []).map((r) => ({
      id: r["Id"] || "",
      label: r["Label"] || r["Id"] || "",
      kind: r["Kind"] || undefined,
      zoneId: r["ZoneId"] || undefined,
    })),
    operators: (pack.operators ?? []).map((r) => ({
      id: r["Id"] || "",
      label: r["Label"] || r["Id"] || "",
      zoneId: r["ZoneId"] || undefined,
      role: r["Role"] || undefined,
    })),
    kpis: (pack.prodKpis ?? []).map((r) => ({
      id: r["Id"] || "",
      label: r["Label"] || r["Id"] || "",
      path: r["Path"] || undefined,
      unit: r["Unit"] || undefined,
    })),
  };

  const hasCampus =
    campusRaw.wings.length > 0 || campusRaw.rooms.length > 0;
  const hasHotspots = hotspotsRaw.length > 0;
  const hasProd =
    (productionRaw.zones?.length ?? 0) > 0 ||
    (productionRaw.nodes?.length ?? 0) > 0 ||
    Boolean(prodMeta);

  return {
    ClearCampus: normalizeClearCampusUi(clearRaw),
    Campus: hasCampus ? normalizeCampus(campusRaw) : emptyCampus(),
    Hotspots: hasHotspots
      ? normalizeHotspots(hotspotsRaw)
      : emptyHotspots(),
    ProductionLive: hasProd
      ? normalizeProductionLive(productionRaw)
      : emptyProductionLive(),
  };
}

/** Construit un pack Excel depuis des blocs param déjà normalisés (ex. seed Lumière). */
export function paramBlocksToMondePack(blocks: {
  ClearCampus?: ClearCampusUiConfig;
  Campus?: ScenarioParamCampus;
  Hotspots?: ScenarioParamHotspot[];
  ProductionLive?: ScenarioParamProductionLive;
}): MondeExcelPack {
  const ui = normalizeClearCampusUi(blocks.ClearCampus);
  const campus = normalizeCampus(blocks.Campus);
  const hotspots = normalizeHotspots(blocks.Hotspots);
  const prod = normalizeProductionLive(blocks.ProductionLive);

  return {
    meta: [
      {
        Theme: ui.theme,
        CharacterStyle: ui.characterStyle,
        DefaultView: ui.defaultView ?? "map",
      },
    ],
    ailes: campus.wings.map((w) => ({
      Id: w.id,
      Label: w.label,
      UnlockDay: w.unlockDay != null ? String(w.unlockDay) : "",
    })),
    salles: campus.rooms.map((r) => ({
      Id: r.id,
      WingId: r.wingId,
      Label: r.label,
      UnlockDay: r.unlockDay != null ? String(r.unlockDay) : "",
    })),
    hotspots: hotspots.map((h) => ({
      Id: h.id,
      RoomId: h.roomId,
      Label: h.label,
      Type: h.type,
      TargetId: h.targetId ?? "",
      TimeCostMin: h.timeCostMin != null ? String(h.timeCostMin) : "",
      Visibility: h.visibility ?? "",
    })),
    prodMeta: [
      {
        ValueType: prod.valueType,
        Label: prod.label ?? "",
      },
    ],
    zones: prod.zones.map((z) => ({
      Id: z.id,
      Label: z.label,
      Kind: z.kind ?? "",
    })),
    nodes: prod.nodes.map((n) => ({
      Id: n.id,
      ZoneId: n.zoneId,
      Label: n.label,
      Kind: n.kind,
      Status: n.status ?? "",
    })),
    flows: prod.flows.map((f) => ({
      Id: f.id,
      FromNodeId: f.fromNodeId,
      ToNodeId: f.toNodeId,
      Label: f.label ?? "",
    })),
    vehicles: prod.vehicles.map((v) => ({
      Id: v.id,
      Label: v.label,
      Kind: v.kind ?? "",
      ZoneId: v.zoneId ?? "",
    })),
    operators: prod.operators.map((o) => ({
      Id: o.id,
      Label: o.label,
      ZoneId: o.zoneId ?? "",
      Role: o.role ?? "",
    })),
    prodKpis: prod.kpis.map((k) => ({
      Id: k.id,
      Label: k.label,
      Path: k.path ?? "",
      Unit: k.unit ?? "",
    })),
  };
}
