/**
 * Étape 33 — Templates Excel narration & décisions (PNJ, Objectifs, Kpis, Jours, Décisions, Fins).
 * Download + dry-run → staging Création. Contenu métier = utilisateur (Lumière exceptionnellement fourni).
 */

import * as XLSX from "xlsx";

export type NarrationSheetId =
  | "interviews"
  | "objectifs"
  | "kpis"
  | "jours"
  | "decisions"
  | "options"
  | "fins";

export type NarrationSheetDef = {
  id: NarrationSheetId;
  sheetName: string;
  label: string;
  columns: readonly string[];
};

export const NARRATION_SHEETS: NarrationSheetDef[] = [
  {
    id: "interviews",
    sheetName: "Interviews",
    label: "PNJ / Interviews",
    columns: [
      "Id",
      "Nom",
      "Rôle",
      "Phrase",
      "Bio",
      "Confiance",
      "Ligne Q",
      "Ligne A",
    ],
  },
  {
    id: "objectifs",
    sheetName: "Objectifs",
    label: "Objectifs",
    columns: [
      "Id",
      "Titre",
      "Type",
      "Statut",
      "Description",
      "Cible",
      "Cible nombre",
      "Métrique",
      "Op",
      "XP",
      "Fail DayEnd",
    ],
  },
  {
    id: "kpis",
    sheetName: "Kpis",
    label: "Kpis",
    columns: ["Id", "Label", "Format", "Path", "Unit"],
  },
  {
    id: "jours",
    sheetName: "Jours",
    label: "Jours",
    columns: [
      "Id",
      "Jour",
      "Label",
      "Phase",
      "Decision ids (csv)",
      "Event ids (csv)",
    ],
  },
  {
    id: "decisions",
    sheetName: "Décisions",
    label: "Décisions",
    columns: ["Id", "Titre", "Dilemme", "Jour", "XP", "Compétence id"],
  },
  {
    id: "options",
    sheetName: "Options",
    label: "Options de décision",
    columns: [
      "Decision id",
      "Option id",
      "Label",
      "Feedback",
      "Conséquence cible",
      "Conséquence valeur",
    ],
  },
  {
    id: "fins",
    sheetName: "Fins",
    label: "Fins",
    columns: [
      "Id",
      "Label",
      "Kind",
      "Narration",
      "XP",
      "Condition métrique",
      "Condition op",
      "Condition valeur",
      "Priority",
    ],
  },
];

export type NarrationExcelRow = Record<string, string>;
export type NarrationExcelPack = Partial<
  Record<NarrationSheetId, NarrationExcelRow[]>
>;

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

export function buildNarrationTemplateWorkbook(
  pack?: NarrationExcelPack
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  for (const def of NARRATION_SHEETS) {
    const rows = pack?.[def.id] ?? [];
    const dataRows = rows.map((r) =>
      def.columns.map((c) => r[c] ?? "")
    );
    XLSX.utils.book_append_sheet(
      wb,
      sheetWithHeader(def.columns, dataRows),
      def.sheetName.slice(0, 31)
    );
  }
  return wb;
}

export function downloadNarrationTemplate() {
  XLSX.writeFile(
    buildNarrationTemplateWorkbook(),
    "KEYBER_Template_Narration_Decisions.xlsx"
  );
}

/** Workbook rempli (ex. démo Lumière) — même structure que le template. */
export function downloadNarrationFilledPack(
  pack: NarrationExcelPack,
  fileName = "KEYBER_Narration_Filled.xlsx"
) {
  XLSX.writeFile(buildNarrationTemplateWorkbook(pack), fileName);
}

export function downloadNarrationSheetTemplate(sheetId: NarrationSheetId) {
  const def = NARRATION_SHEETS.find((s) => s.id === sheetId);
  if (!def) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    sheetWithHeader(def.columns),
    def.sheetName.slice(0, 31)
  );
  XLSX.writeFile(
    wb,
    `KEYBER_Template_Narration_${def.sheetName.replace(/\s+/g, "_")}.xlsx`
  );
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim().toLowerCase();
}

function matchSheetByName(name: string): NarrationSheetDef | null {
  const n = normalizeHeader(name);
  for (const def of NARRATION_SHEETS) {
    if (normalizeHeader(def.sheetName) === n) return def;
    if (normalizeHeader(def.id) === n) return def;
    if (normalizeHeader(def.label) === n) return def;
  }
  // aliases FR
  if (n.includes("pnj") || n.includes("interview")) {
    return NARRATION_SHEETS.find((s) => s.id === "interviews") ?? null;
  }
  if (n.includes("option")) {
    return NARRATION_SHEETS.find((s) => s.id === "options") ?? null;
  }
  if (n.includes("décision") || n.includes("decision")) {
    return NARRATION_SHEETS.find((s) => s.id === "decisions") ?? null;
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

export type NarrationSheetParseSummary = {
  sheetId: NarrationSheetId;
  sheetName: string;
  label: string;
  recognizedColumns: number;
  expectedColumns: number;
  rowCount: number;
  rows: NarrationExcelRow[];
  warnings: string[];
};

export type ParseNarrationExcelResult =
  | {
      ok: true;
      dryRun: true;
      sheets: NarrationSheetParseSummary[];
      totalRows: number;
      pack: NarrationExcelPack;
    }
  | { ok: false; error: string };

export function parseNarrationExcelDryRun(
  data: ArrayBuffer
): ParseNarrationExcelResult {
  try {
    const wb = XLSX.read(data, { type: "array" });
    if (!wb.SheetNames.length) {
      return { ok: false, error: "Fichier Excel vide (aucun onglet)" };
    }

    const sheets: NarrationSheetParseSummary[] = [];
    const pack: NarrationExcelPack = {};

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

      const rows: NarrationExcelRow[] = [];
      for (let r = 1; r < rawRows.length; r++) {
        const line = rawRows[r] ?? [];
        const obj: NarrationExcelRow = {};
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
          "Aucun onglet narration reconnu. Télécharge KEYBER_Template_Narration_Decisions.xlsx.",
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

export function countNarrationPackRows(pack: NarrationExcelPack): number {
  return NARRATION_SHEETS.reduce((n, s) => n + (pack[s.id]?.length ?? 0), 0);
}

/** Convertit staging Excel → blocs param (structure seulement, pas d'invention). */
export function narrationPackToParamBlocks(pack: NarrationExcelPack): {
  Interviews: unknown[];
  Objectifs: unknown[];
  Kpis: unknown[];
  Jours: unknown[];
  Décisions: unknown[];
  Fins: unknown[];
} {
  const interviewsRaw = pack.interviews ?? [];
  const byId = new Map<string, Record<string, unknown>>();
  for (const r of interviewsRaw) {
    const id = r["Id"] || `iv-${byId.size + 1}`;
    const existing = byId.get(id) ?? {
      id,
      nom: r["Nom"] || "",
      role: r["Rôle"] || "",
      phrase: r["Phrase"] || "",
      bio: r["Bio"] || "",
      relationConfiance: Number(r["Confiance"] || 50) || 50,
      lines: [] as { q: string; a: string }[],
    };
    if (r["Ligne Q"] || r["Ligne A"]) {
      (existing.lines as { q: string; a: string }[]).push({
        q: r["Ligne Q"] || "",
        a: r["Ligne A"] || "",
      });
    }
    byId.set(id, existing);
  }

  const optionsByDecision = new Map<string, unknown[]>();
  for (const o of pack.options ?? []) {
    const did = o["Decision id"];
    if (!did) continue;
    const list = optionsByDecision.get(did) ?? [];
    const consequences =
      o["Conséquence cible"] && o["Conséquence valeur"]
        ? [
            {
              cible: o["Conséquence cible"],
              valeur: Number(o["Conséquence valeur"]) || 0,
            },
          ]
        : [];
    list.push({
      id: o["Option id"] || `opt-${list.length}`,
      label: o["Label"] || "",
      feedbackTexte: o["Feedback"] || "",
      consequences,
    });
    optionsByDecision.set(did, list);
  }

  const decisions = (pack.decisions ?? []).map((d) => ({
    id: d["Id"] || "",
    titre: d["Titre"] || "",
    dilemme: d["Dilemme"] || "",
    jour: d["Jour"] ? Number(d["Jour"]) : undefined,
    xpGagne: d["XP"] ? Number(d["XP"]) : undefined,
    competenceId: d["Compétence id"] || undefined,
    options: optionsByDecision.get(d["Id"] || "") ?? [],
  }));

  return {
    Interviews: Array.from(byId.values()),
    Objectifs: (pack.objectifs ?? []).map((r) => ({
      id: r["Id"] || "",
      titre: r["Titre"] || "",
      type: r["Type"] || "JOURNALIER",
      status: r["Statut"] || "EN_COURS",
      description: r["Description"] || "",
      cible: r["Cible"] || "",
      cibleNombre: r["Cible nombre"] ? Number(r["Cible nombre"]) : undefined,
      metric: r["Métrique"] || undefined,
      op: r["Op"] || "gte",
      xp: r["XP"] ? Number(r["XP"]) : undefined,
      failOnDayEnd: /^(1|true|oui|yes)$/i.test(r["Fail DayEnd"] || ""),
      progression: 0,
    })),
    Kpis: (pack.kpis ?? []).map((r) => ({
      id: r["Id"] || "",
      label: r["Label"] || "",
      format: r["Format"] || "number",
      path: r["Path"] || "",
      unit: r["Unit"] || undefined,
    })),
    Jours: (pack.jours ?? []).map((r) => ({
      id: r["Id"] || "",
      jour: Number(r["Jour"] || 1) || 1,
      label: r["Label"] || "",
      phase: r["Phase"] || undefined,
      decisionIds: (r["Decision ids (csv)"] || "")
        .split(/[,;]/)
        .map((x) => x.trim())
        .filter(Boolean),
      eventIds: (r["Event ids (csv)"] || "")
        .split(/[,;]/)
        .map((x) => x.trim())
        .filter(Boolean),
    })),
    Décisions: decisions,
    Fins: (pack.fins ?? []).map((r) => {
      const fin: Record<string, unknown> = {
        id: r["Id"] || "",
        label: r["Label"] || "",
        kind: r["Kind"] || undefined,
        narration: r["Narration"] || undefined,
        xp: r["XP"] ? Number(r["XP"]) : undefined,
        priority: r["Priority"] ? Number(r["Priority"]) : undefined,
      };
      if (r["Condition métrique"]) {
        fin.conditions = [
          {
            metric: r["Condition métrique"],
            op: r["Condition op"] || "gte",
            value: Number(r["Condition valeur"] || 0) || 0,
          },
        ];
      }
      return fin;
    }),
  };
}
