/**
 * Étape 32 — Templates Excel satellites Ordinateur (vides).
 * Download multi-onglets + parse / dry-run. Aucun contenu métier inventé.
 */

import * as XLSX from "xlsx";
import type { ScenarioParamOrdinateur } from "@/lib/scenarioParamSchema";

export type OrdinateurSheetId =
  | "stock"
  | "commandes"
  | "production"
  | "employes"
  | "factures"
  | "machines"
  | "clients"
  | "fournisseurs"
  | "maintenance"
  | "emails"
  | "chatContacts"
  | "chatThreads"
  | "documents"
  | "browser"
  | "dashboardCards"
  | "dashboardSeries";

export type OrdinateurSheetDef = {
  id: OrdinateurSheetId;
  /** Nom d'onglet Excel (court). */
  sheetName: string;
  label: string;
  columns: readonly string[];
};

/** Colonnes = structure feeling OS / computerTypes — vides dans le template. */
export const ORDINATEUR_SHEETS: OrdinateurSheetDef[] = [
  {
    id: "stock",
    sheetName: "Stock",
    label: "Stocks",
    columns: [
      "Réf",
      "Nom",
      "Qté",
      "Seuil",
      "Emplacement",
      "Fournisseur",
      "Prix unitaire",
      "Dernière entrée",
      "Statut",
    ],
  },
  {
    id: "commandes",
    sheetName: "Commandes",
    label: "Commandes",
    columns: [
      "Numéro",
      "Client",
      "Pièce",
      "Qté commandée",
      "Qté produite",
      "Date limite",
      "Statut",
      "Montant",
    ],
  },
  {
    id: "production",
    sheetName: "Production",
    label: "Production",
    columns: [
      "Ligne",
      "Pièce",
      "Objectif jour",
      "Produit aujourd'hui",
      "Taux rebut",
      "Vitesse",
      "État",
    ],
  },
  {
    id: "employes",
    sheetName: "Employés",
    label: "Employés",
    columns: [
      "Nom",
      "Poste",
      "Équipe",
      "Ancienneté",
      "Heures sup",
      "Taux absence",
      "Statut",
    ],
  },
  {
    id: "factures",
    sheetName: "Factures",
    label: "Factures",
    columns: [
      "Numéro",
      "Client",
      "Montant",
      "Émission",
      "Échéance",
      "Statut",
    ],
  },
  {
    id: "machines",
    sheetName: "Machines",
    label: "Machines",
    columns: [
      "Nom",
      "Type",
      "État",
      "Vitesse",
      "Taux rebut",
      "Dernière maint",
      "Prochaine maint",
    ],
  },
  {
    id: "clients",
    sheetName: "Clients",
    label: "Clients",
    columns: [
      "Nom",
      "% CA",
      "Dernière commande",
      "Relation",
      "Contact",
    ],
  },
  {
    id: "fournisseurs",
    sheetName: "Fournisseurs",
    label: "Fournisseurs",
    columns: ["Nom", "Pièce", "Délai", "Prix", "Fiabilité"],
  },
  {
    id: "maintenance",
    sheetName: "Maintenance",
    label: "Maintenance",
    columns: [
      "Id",
      "Équipement",
      "Type",
      "Échéance",
      "Technicien",
      "Statut",
      "Priorité",
    ],
  },
  {
    id: "emails",
    sheetName: "Mails",
    label: "Mails",
    columns: [
      "Id",
      "De",
      "À",
      "Objet",
      "Corps",
      "Jour",
      "Heure",
      "Lu",
    ],
  },
  {
    id: "chatContacts",
    sheetName: "Chat contacts",
    label: "Chat — contacts",
    columns: ["Id", "Nom", "Rôle"],
  },
  {
    id: "chatThreads",
    sheetName: "Chat threads",
    label: "Chat — fils",
    columns: ["Contact id", "Auteur", "Texte", "Jour", "Heure"],
  },
  {
    id: "documents",
    sheetName: "Documents",
    label: "Documents",
    columns: ["Id", "Titre", "Type", "Contenu"],
  },
  {
    id: "browser",
    sheetName: "Browser",
    label: "Browser",
    columns: ["Id", "Titre", "URL", "Snippet", "Corps", "Tags"],
  },
  {
    id: "dashboardCards",
    sheetName: "Dashboard cards",
    label: "Dashboard — cartes",
    columns: ["Label", "Valeur"],
  },
  {
    id: "dashboardSeries",
    sheetName: "Dashboard series",
    label: "Dashboard — séries",
    columns: ["Id", "Label", "Points (csv)"],
  },
];

export type OrdinateurExcelRow = Record<string, string>;

export type OrdinateurExcelPack = Partial<
  Record<OrdinateurSheetId, OrdinateurExcelRow[]>
>;

function sheetWithHeader(columns: readonly string[]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet([
    [...columns],
    columns.map(() => ""),
  ]);
  ws["!cols"] = columns.map((c) => ({
    wch: Math.min(40, Math.max(14, c.length + 2)),
  }));
  return ws;
}

/** Workbook multi-onglets — 1 ligne d'en-têtes + 1 ligne vide par feuille. */
export function buildOrdinateurTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  for (const def of ORDINATEUR_SHEETS) {
    XLSX.utils.book_append_sheet(
      wb,
      sheetWithHeader(def.columns),
      def.sheetName.slice(0, 31)
    );
  }
  return wb;
}

export function downloadOrdinateurTemplate() {
  XLSX.writeFile(
    buildOrdinateurTemplateWorkbook(),
    "KEYBER_Template_Ordinateur.xlsx"
  );
}

/** Template d'un seul module (onglet unique). */
export function downloadOrdinateurSheetTemplate(sheetId: OrdinateurSheetId) {
  const def = ORDINATEUR_SHEETS.find((s) => s.id === sheetId);
  if (!def) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    sheetWithHeader(def.columns),
    def.sheetName.slice(0, 31)
  );
  XLSX.writeFile(
    wb,
    `KEYBER_Template_Ordinateur_${def.sheetName.replace(/\s+/g, "_")}.xlsx`
  );
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim().toLowerCase();
}

function matchSheetByName(name: string): OrdinateurSheetDef | null {
  const n = normalizeHeader(name);
  for (const def of ORDINATEUR_SHEETS) {
    if (normalizeHeader(def.sheetName) === n) return def;
    if (normalizeHeader(def.id) === n) return def;
    if (normalizeHeader(def.label) === n) return def;
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

export type OrdinateurSheetParseSummary = {
  sheetId: OrdinateurSheetId;
  sheetName: string;
  label: string;
  recognizedColumns: number;
  expectedColumns: number;
  rowCount: number;
  rows: OrdinateurExcelRow[];
  warnings: string[];
};

export type ParseOrdinateurExcelResult =
  | {
      ok: true;
      dryRun: true;
      sheets: OrdinateurSheetParseSummary[];
      totalRows: number;
      pack: OrdinateurExcelPack;
    }
  | { ok: false; error: string };

/**
 * Dry-run : reconnaît les onglets / colonnes, compte les lignes non vides.
 * N'invente aucune cellule.
 */
export function parseOrdinateurExcelDryRun(
  data: ArrayBuffer
): ParseOrdinateurExcelResult {
  try {
    const wb = XLSX.read(data, { type: "array" });
    if (!wb.SheetNames.length) {
      return { ok: false, error: "Fichier Excel vide (aucun onglet)" };
    }

    const sheets: OrdinateurSheetParseSummary[] = [];
    const pack: OrdinateurExcelPack = {};

    for (const sheetName of wb.SheetNames) {
      const def = matchSheetByName(sheetName);
      if (!def) {
        continue;
      }
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

      const rows: OrdinateurExcelRow[] = [];
      for (let r = 1; r < rawRows.length; r++) {
        const line = rawRows[r] ?? [];
        const obj: OrdinateurExcelRow = {};
        let any = false;
        for (const col of def.columns) {
          const idx = colIndex.get(col);
          const val =
            idx == null ? "" : String(line[idx] ?? "").trim();
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
          "Aucun onglet Ordinateur reconnu. Télécharge KEYBER_Template_Ordinateur.xlsx.",
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

function num(raw: string, fallback = 0): number {
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Convertit le pack Excel staging → coquille Ordinateur param (types souples).
 * Cellules vides restent vides / 0 — pas d'invention métier.
 */
export function ordinateurPackToParam(
  pack: OrdinateurExcelPack
): ScenarioParamOrdinateur {
  const out: ScenarioParamOrdinateur = {
    stock: (pack.stock ?? []).map((r) => ({
      ref: r["Réf"] || "",
      nom: r["Nom"] || "",
      qte: num(r["Qté"]),
      seuil: num(r["Seuil"]),
      emplacement: r["Emplacement"] || "",
      fournisseur: r["Fournisseur"] || "",
      prixUnitaire: num(r["Prix unitaire"]),
      derniereEntree: r["Dernière entrée"] || "",
      statut: r["Statut"] || "OK",
    })),
    commandes: (pack.commandes ?? []).map((r) => ({
      numero: r["Numéro"] || "",
      client: r["Client"] || "",
      piece: r["Pièce"] || "",
      qteCommandee: num(r["Qté commandée"]),
      qteProduite: num(r["Qté produite"]),
      dateLimite: r["Date limite"] || "",
      statut: r["Statut"] || "En cours",
      montant: num(r["Montant"]),
    })),
    production: (pack.production ?? []).map((r) => ({
      ligne: r["Ligne"] || "",
      piece: r["Pièce"] || "",
      objectifJour: num(r["Objectif jour"]),
      produitAujourdhui: num(r["Produit aujourd'hui"]),
      tauxRebut: r["Taux rebut"] || "",
      vitesse: r["Vitesse"] || "",
      etat: r["État"] || "En marche",
    })),
    employes: (pack.employes ?? []).map((r) => ({
      nom: r["Nom"] || "",
      poste: r["Poste"] || "",
      equipe: r["Équipe"] || "",
      anciennete: r["Ancienneté"] || "",
      heuresSup: r["Heures sup"] || "",
      tauxAbsence: r["Taux absence"] || "",
      statut: r["Statut"] || "Présent",
    })),
    factures: (pack.factures ?? []).map((r) => ({
      numero: r["Numéro"] || "",
      client: r["Client"] || "",
      montant: num(r["Montant"]),
      emission: r["Émission"] || "",
      echeance: r["Échéance"] || "",
      statut: r["Statut"] || "En attente",
    })),
    machines: (pack.machines ?? []).map((r) => ({
      nom: r["Nom"] || "",
      type: r["Type"] || "",
      etat: r["État"] || "",
      vitesse: r["Vitesse"] || "",
      tauxRebut: r["Taux rebut"] || "",
      derniereMaint: r["Dernière maint"] || "",
      prochaineMaint: r["Prochaine maint"] || "",
    })),
    clients: (pack.clients ?? []).map((r) => ({
      nom: r["Nom"] || "",
      pctCa: r["% CA"] || "",
      derniereCommande: r["Dernière commande"] || "",
      relation: r["Relation"] || "Bon",
      contact: r["Contact"] || "",
    })),
    fournisseurs: (pack.fournisseurs ?? []).map((r) => ({
      nom: r["Nom"] || "",
      piece: r["Pièce"] || "",
      delai: r["Délai"] || "",
      prix: r["Prix"] || "",
      fiabilite: r["Fiabilité"] || "",
    })),
    maintenance: (pack.maintenance ?? []).map((r) => ({
      id: r["Id"] || "",
      equipement: r["Équipement"] || "",
      type: r["Type"] || "",
      echeance: r["Échéance"] || "",
      technicien: r["Technicien"] || "",
      statut: r["Statut"] || "Planifiée",
      priorite: r["Priorité"] || "Normale",
    })),
    emails: (pack.emails ?? []).map((r) => ({
      id: r["Id"] || "",
      from: r["De"] || "",
      to: r["À"] || "",
      subject: r["Objet"] || "",
      body: r["Corps"] || "",
      day: num(r["Jour"], 1),
      at: r["Heure"] || "",
      read: /^(1|true|oui|yes)$/i.test(r["Lu"] || ""),
    })),
    chatContacts: (pack.chatContacts ?? []).map((r) => ({
      id: r["Id"] || "",
      name: r["Nom"] || "",
      role: r["Rôle"] || "",
    })),
    chatThreads: (pack.chatThreads ?? []).map((r) => ({
      contactId: r["Contact id"] || "",
      author: r["Auteur"] || "",
      text: r["Texte"] || "",
      day: num(r["Jour"], 1),
      at: r["Heure"] || "",
    })),
    documents: (pack.documents ?? []).map((r) => ({
      id: r["Id"] || "",
      titre: r["Titre"] || "",
      type: r["Type"] || "",
      contenu: r["Contenu"] || "",
    })),
    browser: (pack.browser ?? []).map((r) => ({
      id: r["Id"] || "",
      title: r["Titre"] || "",
      url: r["URL"] || "",
      snippet: r["Snippet"] || "",
      body: r["Corps"] || "",
      tags: (r["Tags"] || "")
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean),
    })),
    dashboardCards: (pack.dashboardCards ?? []).map((r) => ({
      label: r["Label"] || "",
      value: r["Valeur"] || "",
    })),
    dashboardSeries: (pack.dashboardSeries ?? []).map((r) => ({
      id: r["Id"] || "",
      label: r["Label"] || "",
      points: (r["Points (csv)"] || "")
        .split(/[,;]/)
        .map((p) => num(p.trim()))
        .filter((n) => Number.isFinite(n)),
    })),
  };
  return out;
}

export function countOrdinateurPackRows(pack: OrdinateurExcelPack): number {
  return ORDINATEUR_SHEETS.reduce(
    (n, s) => n + (pack[s.id]?.length ?? 0),
    0
  );
}
