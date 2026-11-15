/**
 * Atelier — Compétences + Cours : template Excel (2 onglets) + parsing.
 * Studio only. Aucune donnée métier inventée.
 */

import * as XLSX from "xlsx";

export const COMPETENCES_EXCEL_COLUMNS = [
  "Nom de la compétence",
  "Catégorie",
  "Type (Transverse ou Ciblée)",
  "Description complète",
  "Pourquoi c'est important",
  "Dans quels métiers on l'utilise",
  "Formules",
  "Indicateurs",
  "Exemple concret chiffré",
  "Erreurs fréquentes",
  "Bonnes pratiques",
  "Étapes pour progresser",
  "Niveau Débutant / Intermédiaire / Expert",
] as const;

export const COURS_EXCEL_COLUMNS = [
  "Nom de la compétence liée",
  "Titre du cours",
  "Description en 1 phrase",
  "Niveau (Débutant / Intermédiaire / Expert)",
  "Durée estimée",
  "Ordre dans la compétence",
  "Contenu complet",
  "Définition précise",
  "Pourquoi c'est important",
  "Comment ça marche étape par étape",
  "Formule",
  "Explication de chaque terme",
  "Indicateurs à surveiller",
  "Valeurs normales / d'alerte",
  "Exemple chiffré complet + Correction détaillée",
  "Erreur 1 + pourquoi c'est une erreur + conséquences",
  "Erreur 2",
  "Erreur 3",
  "Bonnes pratiques",
  "Astuces de pro",
  "Lien avec d'autres compétences",
] as const;

export type CompetenceExcelColumn = (typeof COMPETENCES_EXCEL_COLUMNS)[number];
export type CoursExcelColumn = (typeof COURS_EXCEL_COLUMNS)[number];
export type CompetenceExcelFields = Record<CompetenceExcelColumn, string>;
export type CoursExcelFields = Record<CoursExcelColumn, string>;

export function emptyCompetenceFields(): CompetenceExcelFields {
  const o = {} as CompetenceExcelFields;
  for (const col of COMPETENCES_EXCEL_COLUMNS) o[col] = "";
  return o;
}

export function emptyCoursFields(): CoursExcelFields {
  const o = {} as CoursExcelFields;
  for (const col of COURS_EXCEL_COLUMNS) o[col] = "";
  return o;
}

function sheetWithHeader(cols: readonly string[]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet([[...cols], cols.map(() => "")]);
  ws["!cols"] = cols.map((c) => ({
    wch: Math.min(48, Math.max(18, c.length + 2)),
  }));
  return ws;
}

export function buildCompetencesTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    sheetWithHeader(COMPETENCES_EXCEL_COLUMNS),
    "Compétences"
  );
  XLSX.utils.book_append_sheet(
    wb,
    sheetWithHeader(COURS_EXCEL_COLUMNS),
    "Cours"
  );
  return wb;
}

export function downloadCompetencesTemplate() {
  XLSX.writeFile(
    buildCompetencesTemplateWorkbook(),
    "KEYBER_Template_Competences_Cours.xlsx"
  );
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim();
}

function matchColumn<T extends string>(
  header: string,
  cols: readonly T[]
): T | null {
  const n = normalizeHeader(header);
  for (const col of cols) {
    if (normalizeHeader(col) === n) return col;
  }
  return null;
}

function parseSheetRows<T extends string>(
  ws: XLSX.WorkSheet,
  cols: readonly T[],
  requiredCol: T,
  requiredLabel: string
):
  | { ok: true; rows: Record<T, string>[] }
  | { ok: false; error: string } {
  const raw = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    ws,
    { header: 1, defval: "", raw: false }
  ) as unknown as unknown[][];

  if (!raw.length) {
    return { ok: false, error: `Onglet « ${requiredLabel} » vide` };
  }

  const headerRow = (raw[0] ?? []).map((c) => String(c ?? ""));
  const colIndex = new Map<T, number>();
  headerRow.forEach((h, i) => {
    const col = matchColumn(h, cols);
    if (col) colIndex.set(col, i);
  });

  if (!colIndex.has(requiredCol)) {
    return {
      ok: false,
      error: `Colonne « ${requiredCol} » manquante dans l'onglet ${requiredLabel}. Utilisez le Template Compétences + Cours.`,
    };
  }

  const out: Record<T, string>[] = [];
  for (let r = 1; r < raw.length; r++) {
    const row = raw[r] ?? [];
    const fields = {} as Record<T, string>;
    for (const col of cols) {
      const idx = colIndex.get(col);
      fields[col] = idx === undefined ? "" : String(row[idx] ?? "").trim();
    }
    if (!fields[requiredCol]) continue;
    out.push(fields);
  }

  return { ok: true, rows: out };
}

export type ParseCompetencesExcelResult =
  | {
      ok: true;
      competences: CompetenceExcelFields[];
      cours: CoursExcelFields[];
    }
  | { ok: false; error: string };

/**
 * Parse le fichier Excel Compétences + Cours (2 onglets).
 * Un cours dont la compétence liée n'est pas dans l'onglet Compétences
 * → erreur explicite (la librairie existante est vérifiée au moment de l'aperçu / validation côté UI/store).
 */
export function parseCompetencesExcel(
  data: ArrayBuffer
): ParseCompetencesExcelResult {
  try {
    const wb = XLSX.read(data, { type: "array" });
    if (!wb.SheetNames.length) {
      return { ok: false, error: "Fichier Excel vide (aucun onglet)" };
    }

    const compSheetName =
      wb.SheetNames.find(
        (n) => normalizeHeader(n).toLowerCase() === "compétences"
      ) ??
      wb.SheetNames.find(
        (n) => normalizeHeader(n).toLowerCase() === "competences"
      ) ??
      wb.SheetNames[0];

    const coursSheetName =
      wb.SheetNames.find(
        (n) => normalizeHeader(n).toLowerCase() === "cours"
      ) ??
      (wb.SheetNames.length > 1
        ? wb.SheetNames.find((n) => n !== compSheetName)
        : undefined);

    if (!compSheetName) {
      return { ok: false, error: "Onglet Compétences introuvable" };
    }
    if (!coursSheetName) {
      return {
        ok: false,
        error:
          "Onglet Cours manquant. Le template a 2 onglets : Compétences et Cours.",
      };
    }

    const compWs = wb.Sheets[compSheetName];
    const coursWs = wb.Sheets[coursSheetName];
    if (!compWs || !coursWs) {
      return { ok: false, error: "Impossible de lire les onglets Excel" };
    }

    const compRes = parseSheetRows(
      compWs,
      COMPETENCES_EXCEL_COLUMNS,
      "Nom de la compétence",
      "Compétences"
    );
    if (!compRes.ok) return compRes;

    const coursRes = parseSheetRows(
      coursWs,
      COURS_EXCEL_COLUMNS,
      "Titre du cours",
      "Cours"
    );
    if (!coursRes.ok) return coursRes;

    const competences = compRes.rows as CompetenceExcelFields[];
    const cours = coursRes.rows as CoursExcelFields[];

    if (!competences.length && !cours.length) {
      return {
        ok: false,
        error:
          "Aucune compétence ni cours — remplissez au moins une ligne dans Compétences ou Cours.",
      };
    }

    for (const c of cours) {
      const linked = c["Nom de la compétence liée"]?.trim();
      if (!linked) {
        return {
          ok: false,
          error: `Cours « ${c["Titre du cours"]} » : « Nom de la compétence liée » obligatoire.`,
        };
      }
    }

    return { ok: true, competences, cours };
  } catch {
    return { ok: false, error: "Impossible de lire le fichier Excel" };
  }
}

/**
 * Variante pour l'aperçu / validation : autorise un cours lié à une
 * compétence déjà en bibliothèque (réimport additif de cours seuls),
 * mais refuse si le nom n'existe ni dans l'onglet 1 ni en local.
 */
export function validateCoursLinks(
  competences: CompetenceExcelFields[],
  cours: CoursExcelFields[],
  existingCompetenceNames: string[]
): { ok: true } | { ok: false; error: string } {
  const names = new Set([
    ...competences.map((c) =>
      c["Nom de la compétence"].trim().toLowerCase()
    ),
    ...existingCompetenceNames.map((n) => n.trim().toLowerCase()),
  ]);

  for (const c of cours) {
    const linked = c["Nom de la compétence liée"]?.trim();
    if (!linked) {
      return {
        ok: false,
        error: `Cours « ${c["Titre du cours"]} » : « Nom de la compétence liée » obligatoire.`,
      };
    }
    if (!names.has(linked.toLowerCase())) {
      return {
        ok: false,
        error: "Cette compétence n'existe pas, corrige le nom.",
      };
    }
  }
  return { ok: true };
}

export function competencePreviewEntries(
  fields: CompetenceExcelFields
): { label: string; value: string; filled: boolean }[] {
  return COMPETENCES_EXCEL_COLUMNS.map((label) => {
    const value = fields[label]?.trim() ?? "";
    return { label, value, filled: value.length > 0 };
  });
}

export function coursPreviewEntries(
  fields: CoursExcelFields
): { label: string; value: string; filled: boolean }[] {
  return COURS_EXCEL_COLUMNS.map((label) => {
    const value = fields[label]?.trim() ?? "";
    return { label, value, filled: value.length > 0 };
  });
}
