/**
 * Atelier — Création : template Excel Contexte + parsing import.
 * Studio only. Aucune donnée métier inventée — colonnes vides pour l'utilisateur.
 */

import * as XLSX from "xlsx";

/** Colonnes du Template Contexte — ordre fixe, hyper complètes. */
export const CONTEXTE_EXCEL_COLUMNS = [
  "Nom de l'entreprise",
  "Secteur d'activité",
  "Sous-secteur",
  "Taille",
  "Nombre d'employés",
  "Chiffre d'affaires",
  "Année de création",
  "Localisation",
  "Nombre de sites",
  "Organigramme détaillé",
  "Qui décide quoi",
  "Qui travaille avec qui",
  "Horaires",
  "Équipes",
  "Postes clés",
  "Description de chaque service (Production, Logistique, Qualité, Maintenance, Achats, Ventes)",
  "Liste des machines (nom, âge, capacité, vitesse, pannes fréquentes, coût de maintenance)",
  "Processus de production étape par étape",
  "Temps de production",
  "Goulots d'étranglement",
  "Liste des produits (nom, description, prix, marge, temps de fabrication, composants, fournisseurs, clients)",
  "Liste des stocks (nom, quantité actuelle, stock minimum, stock maximum, stock de sécurité, délai de réapprovisionnement, coût de stockage, problèmes récurrents)",
  "Liste des fournisseurs (nom, ce qu'il fournit, délai moyen, fiabilité, prix, problèmes, contrats)",
  "Liste des clients (nom, ce qu'il achète, volume, fréquence, exigences, problèmes, contrats)",
  "Liste des problèmes réels (qu'est-ce qui s'est passé, pourquoi, qu'est-ce qu'on a fait, qu'est-ce qu'on aurait dû faire)",
  "Trésorerie actuelle",
  "Coûts fixes",
  "Coûts variables",
  "Objectifs quotidiens / hebdo / annuels",
] as const;

export type ContexteExcelColumn = (typeof CONTEXTE_EXCEL_COLUMNS)[number];

export type ContexteExcelFields = Record<ContexteExcelColumn, string>;

export function emptyContexteFields(): ContexteExcelFields {
  const o = {} as ContexteExcelFields;
  for (const col of CONTEXTE_EXCEL_COLUMNS) o[col] = "";
  return o;
}

/** Génère un .xlsx template (1 ligne d'en-têtes, aucune donnée inventée). */
export function buildContexteTemplateWorkbook(): XLSX.WorkBook {
  const ws = XLSX.utils.aoa_to_sheet([
    [...CONTEXTE_EXCEL_COLUMNS],
    CONTEXTE_EXCEL_COLUMNS.map(() => ""),
  ]);
  ws["!cols"] = CONTEXTE_EXCEL_COLUMNS.map((c) => ({
    wch: Math.min(48, Math.max(18, c.length + 2)),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contexte");
  return wb;
}

export function downloadContexteTemplate() {
  const wb = buildContexteTemplateWorkbook();
  XLSX.writeFile(wb, "KEYBER_Template_Contexte.xlsx");
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim();
}

/** Map Excel header → column canonique (égalité stricte après normalize). */
function matchColumn(header: string): ContexteExcelColumn | null {
  const n = normalizeHeader(header);
  for (const col of CONTEXTE_EXCEL_COLUMNS) {
    if (normalizeHeader(col) === n) return col;
  }
  return null;
}

export type ParseContexteExcelResult =
  | { ok: true; fields: ContexteExcelFields; rowCount: number }
  | { ok: false; error: string };

/**
 * Parse le 1er onglet : ligne 1 = en-têtes, ligne 2 = première fiche.
 * Pas de contenu inventé — cellules vides restent vides.
 */
export function parseContexteExcel(data: ArrayBuffer): ParseContexteExcelResult {
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

    if (!rows.length) {
      return { ok: false, error: "Aucune ligne dans l'Excel" };
    }

    const headerRow = (rows[0] ?? []).map((c) => String(c ?? ""));
    const colIndex = new Map<ContexteExcelColumn, number>();
    headerRow.forEach((h, i) => {
      const col = matchColumn(h);
      if (col) colIndex.set(col, i);
    });

    if (colIndex.size === 0) {
      return {
        ok: false,
        error:
          "Aucune colonne reconnue. Utilisez le Template Contexte téléchargé.",
      };
    }

    // Première ligne de données non totalement vide
    let dataRow: unknown[] | null = null;
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      const hasValue = row.some(
        (c) => String(c ?? "").trim().length > 0
      );
      if (hasValue) {
        dataRow = row;
        break;
      }
    }

    if (!dataRow) {
      return {
        ok: false,
        error: "Aucune ligne de données — remplissez au moins le nom de l'entreprise",
      };
    }

    const fields = emptyContexteFields();
    for (const col of CONTEXTE_EXCEL_COLUMNS) {
      const idx = colIndex.get(col);
      if (idx === undefined) continue;
      fields[col] = String(dataRow[idx] ?? "").trim();
    }

    if (!fields["Nom de l'entreprise"]) {
      return {
        ok: false,
        error: "Le champ « Nom de l'entreprise » est obligatoire",
      };
    }

    return { ok: true, fields, rowCount: 1 };
  } catch {
    return { ok: false, error: "Impossible de lire le fichier Excel" };
  }
}

/** Aperçu lisible pour validation humaine. */
export function fieldsPreviewEntries(
  fields: ContexteExcelFields
): { label: string; value: string; filled: boolean }[] {
  return CONTEXTE_EXCEL_COLUMNS.map((label) => {
    const value = fields[label]?.trim() ?? "";
    return { label, value, filled: value.length > 0 };
  });
}
