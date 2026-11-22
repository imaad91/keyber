/**
 * Atelier — Événements aléatoires par entreprise (Excel template + parse).
 * Studio only. Aucune donnée métier inventée.
 */

import * as XLSX from "xlsx";
import { EVENTS_OS_EXCEL_COLUMNS } from "@/lib/atelierEventsToParam";

export const EVENTS_EXCEL_COLUMNS = [
  "Nom",
  "Type (Logistique/Technique/Humain/Client/Fournisseur/Météo/Réglementation)",
  "Description complète",
  "Conditions pour arriver",
  "Probabilité (Rare/Moyenne/Fréquente ou %)",
  "Fréquence",
  "Impact sur (Stock, Trésorerie, Satisfaction client, Confiance de l'équipe, Production)",
  "Gravité (Faible/Moyenne/Forte/Critique)",
  "Durée de l'impact",
  "Ce que le joueur peut faire",
  "Cet événement influence quelle décision plus tard",
  /** Étape 24 — colonnes consommées par le Moteur d'Événements OS. */
  ...EVENTS_OS_EXCEL_COLUMNS,
] as const;

export type EventExcelColumn = (typeof EVENTS_EXCEL_COLUMNS)[number];
export type EventExcelFields = Record<EventExcelColumn, string>;

/** Anciens en-têtes acceptés à l'import (compat templates précédents). */
const COLUMN_ALIASES: Record<string, EventExcelColumn> = {
  nom: "Nom",
  "nom de l'événement": "Nom",
  "nom de l'evenement": "Nom",
  type: "Type (Logistique/Technique/Humain/Client/Fournisseur/Météo/Réglementation)",
  "type (ex : logistique, technique, humain, client, fournisseur, météo, réglementation)":
    "Type (Logistique/Technique/Humain/Client/Fournisseur/Météo/Réglementation)",
  "type (logistique/technique/humain/client/fournisseur/météo/réglementation)":
    "Type (Logistique/Technique/Humain/Client/Fournisseur/Météo/Réglementation)",
  "description complète": "Description complète",
  "conditions pour arriver": "Conditions pour arriver",
  "probabilité (rare / moyenne / fréquente, ou en %)":
    "Probabilité (Rare/Moyenne/Fréquente ou %)",
  "probabilité (rare/moyenne/fréquente ou %)":
    "Probabilité (Rare/Moyenne/Fréquente ou %)",
  fréquence: "Fréquence",
  "impact sur (stock, trésorerie, satisfaction client, confiance de l'équipe, production)":
    "Impact sur (Stock, Trésorerie, Satisfaction client, Confiance de l'équipe, Production)",
  "gravité (faible / moyenne / forte / critique)":
    "Gravité (Faible/Moyenne/Forte/Critique)",
  "gravité (faible/moyenne/forte/critique)":
    "Gravité (Faible/Moyenne/Forte/Critique)",
  "durée de l'impact": "Durée de l'impact",
  "ce que le joueur peut faire": "Ce que le joueur peut faire",
  "cet événement influence quelle décision plus tard":
    "Cet événement influence quelle décision plus tard",
  jour: "Jour (1, 2…)",
  "jour (1, 2…)": "Jour (1, 2…)",
  heure: "Heure (HH:MM)",
  "heure (hh:mm)": "Heure (HH:MM)",
  urgent: "Urgent (oui/non)",
  "urgent (oui/non)": "Urgent (oui/non)",
  "deadline heure": "Deadline heure (HH:MM)",
  "deadline heure (hh:mm)": "Deadline heure (HH:MM)",
  "condition métrique": "Condition métrique (stock/tresorerie/moral/…)",
  "condition metrique": "Condition métrique (stock/tresorerie/moral/…)",
  "condition métrique (stock/tresorerie/moral/…)":
    "Condition métrique (stock/tresorerie/moral/…)",
  "condition opérateur": "Condition opérateur (>/</=)",
  "condition operateur": "Condition opérateur (>/</=)",
  "condition opérateur (>/</=)": "Condition opérateur (>/</=)",
  "condition seuil": "Condition seuil",
  "conséquence cible": "Conséquence cible",
  "consequence cible": "Conséquence cible",
  "conséquence valeur": "Conséquence valeur",
  "consequence valeur": "Conséquence valeur",
  "conséquence deadline cible": "Conséquence deadline cible",
  "consequence deadline cible": "Conséquence deadline cible",
  "conséquence deadline valeur": "Conséquence deadline valeur",
  "consequence deadline valeur": "Conséquence deadline valeur",
};

export function emptyEventFields(): EventExcelFields {
  const o = {} as EventExcelFields;
  for (const col of EVENTS_EXCEL_COLUMNS) o[col] = "";
  return o;
}

export function buildEventsTemplateWorkbook(): XLSX.WorkBook {
  const ws = XLSX.utils.aoa_to_sheet([
    [...EVENTS_EXCEL_COLUMNS],
    EVENTS_EXCEL_COLUMNS.map(() => ""),
  ]);
  ws["!cols"] = EVENTS_EXCEL_COLUMNS.map((c) => ({
    wch: Math.min(48, Math.max(18, c.length + 2)),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Événements");
  return wb;
}

/** Template vide générique (onglet Atelier Événements). */
export function downloadEventsTemplate() {
  XLSX.writeFile(
    buildEventsTemplateWorkbook(),
    "KEYBER_Template_Evenements.xlsx"
  );
}

/** @deprecated préférer downloadEventsTemplate — conservé pour compat. */
export function downloadEventsTemplateForEntreprise(entrepriseNom: string) {
  const safe =
    entrepriseNom.trim().replace(/[^\w\-àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ ]+/gi, "") ||
    "Entreprise";
  XLSX.writeFile(
    buildEventsTemplateWorkbook(),
    `KEYBER_Template_Evenements_${safe}.xlsx`
  );
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim().toLowerCase();
}

function matchColumn(header: string): EventExcelColumn | null {
  const n = normalizeHeader(header);
  for (const col of EVENTS_EXCEL_COLUMNS) {
    if (normalizeHeader(col) === n) return col;
  }
  return COLUMN_ALIASES[n] ?? null;
}

export type ParseEventsExcelResult =
  | { ok: true; rows: EventExcelFields[] }
  | { ok: false; error: string };

export function parseEventsExcel(data: ArrayBuffer): ParseEventsExcelResult {
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
    const colIndex = new Map<EventExcelColumn, number>();
    headerRow.forEach((h, i) => {
      const col = matchColumn(h);
      if (col) colIndex.set(col, i);
    });

    if (!colIndex.has("Nom")) {
      return {
        ok: false,
        error:
          "Colonne « Nom » manquante. Utilisez le Template Événements.",
      };
    }

    const out: EventExcelFields[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      const fields = emptyEventFields();
      for (const col of EVENTS_EXCEL_COLUMNS) {
        const idx = colIndex.get(col);
        if (idx === undefined) continue;
        fields[col] = String(row[idx] ?? "").trim();
      }
      if (!fields["Nom"]) continue;
      out.push(fields);
    }

    if (!out.length) {
      return {
        ok: false,
        error: "Aucune ligne d'événement — remplissez au moins « Nom »",
      };
    }

    return { ok: true, rows: out };
  } catch {
    return { ok: false, error: "Impossible de lire le fichier Excel" };
  }
}

export function eventPreviewEntries(
  fields: EventExcelFields
): { label: string; value: string; filled: boolean }[] {
  return EVENTS_EXCEL_COLUMNS.map((label) => {
    const value = fields[label]?.trim() ?? "";
    return { label, value, filled: value.length > 0 };
  });
}
