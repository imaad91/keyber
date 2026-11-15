/**
 * Atelier — Rôles : template Excel + parsing (bibliothèque globale).
 * Studio only. Aucune donnée métier inventée.
 */

import * as XLSX from "xlsx";

export const ROLES_EXCEL_COLUMNS = [
  "Nom du rôle",
  "Description complète",
  "Mission principale",
  "Missions secondaires",
  "Responsabilités quotidiennes",
  "Responsabilités hebdomadaires",
  "Responsabilités mensuelles",
  "Décisions qu'il peut prendre seul",
  "Décisions qu'il doit valider avec quelqu'un d'autre",
  "Infos auxquelles il a accès dans l'ERP",
  "Infos auxquelles il n'a pas accès",
  "Avec qui il travaille",
  "Ses outils",
  "Ses indicateurs",
  "Ses erreurs fréquentes",
  "Ses difficultés",
  "Exemple d'une journée type heure par heure",
] as const;

export type RoleExcelColumn = (typeof ROLES_EXCEL_COLUMNS)[number];
export type RoleExcelFields = Record<RoleExcelColumn, string>;

export function emptyRoleFields(): RoleExcelFields {
  const o = {} as RoleExcelFields;
  for (const col of ROLES_EXCEL_COLUMNS) o[col] = "";
  return o;
}

export function buildRolesTemplateWorkbook(): XLSX.WorkBook {
  const ws = XLSX.utils.aoa_to_sheet([
    [...ROLES_EXCEL_COLUMNS],
    ROLES_EXCEL_COLUMNS.map(() => ""),
  ]);
  ws["!cols"] = ROLES_EXCEL_COLUMNS.map((c) => ({
    wch: Math.min(48, Math.max(18, c.length + 2)),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rôles");
  return wb;
}

export function downloadRolesTemplate() {
  XLSX.writeFile(buildRolesTemplateWorkbook(), "KEYBER_Template_Roles.xlsx");
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim();
}

function matchColumn(header: string): RoleExcelColumn | null {
  const n = normalizeHeader(header);
  for (const col of ROLES_EXCEL_COLUMNS) {
    if (normalizeHeader(col) === n) return col;
  }
  return null;
}

export type ParseRolesExcelResult =
  | { ok: true; rows: RoleExcelFields[] }
  | { ok: false; error: string };

/** Parse toutes les lignes de données (1 rôle = 1 ligne). */
export function parseRolesExcel(data: ArrayBuffer): ParseRolesExcelResult {
  try {
    const wb = XLSX.read(data, { type: "array" });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return { ok: false, error: "Fichier Excel vide (aucun onglet)" };
    const ws = wb.Sheets[sheetName];
    if (!ws) return { ok: false, error: "Onglet introuvable" };

    const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
      ws,
      { header: 1, defval: "", raw: false }
    ) as unknown as unknown[][];

    if (!rows.length) return { ok: false, error: "Aucune ligne dans l'Excel" };

    const headerRow = (rows[0] ?? []).map((c) => String(c ?? ""));
    const colIndex = new Map<RoleExcelColumn, number>();
    headerRow.forEach((h, i) => {
      const col = matchColumn(h);
      if (col) colIndex.set(col, i);
    });

    if (!colIndex.has("Nom du rôle")) {
      return {
        ok: false,
        error:
          "Colonne « Nom du rôle » manquante. Utilisez le Template Rôles.",
      };
    }

    const out: RoleExcelFields[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      const fields = emptyRoleFields();
      for (const col of ROLES_EXCEL_COLUMNS) {
        const idx = colIndex.get(col);
        if (idx === undefined) continue;
        fields[col] = String(row[idx] ?? "").trim();
      }
      if (!fields["Nom du rôle"]) continue;
      out.push(fields);
    }

    if (!out.length) {
      return {
        ok: false,
        error: "Aucune ligne de rôle — remplissez au moins « Nom du rôle »",
      };
    }

    return { ok: true, rows: out };
  } catch {
    return { ok: false, error: "Impossible de lire le fichier Excel" };
  }
}

export function rolePreviewEntries(
  fields: RoleExcelFields
): { label: string; value: string; filled: boolean }[] {
  return ROLES_EXCEL_COLUMNS.map((label) => {
    const value = fields[label]?.trim() ?? "";
    return { label, value, filled: value.length > 0 };
  });
}
