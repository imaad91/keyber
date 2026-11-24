/**
 * Clear Campus Phase 4 — Hub Production (kanban Atelier).
 * Colonnes = statut de chaîne, sans inventer de métier.
 */

import type { AtelierCreation } from "@/lib/atelierCreationStore";
import {
  countCampusPackRows,
  countProductionPackRows,
} from "@/lib/atelierMondeExcel";
import type { BookEntry } from "@/lib/bookStore";

export type ProductionHubColumnId =
  | "brouillon"
  | "assemblage"
  | "test"
  | "live";

export type ProductionHubColumn = {
  id: ProductionHubColumnId;
  label: string;
  hint: string;
};

export const PRODUCTION_HUB_COLUMNS: ProductionHubColumn[] = [
  {
    id: "brouillon",
    label: "Brouillon",
    hint: "Contexte créé — Campus / Prod pas encore importés",
  },
  {
    id: "assemblage",
    label: "Assemblage",
    hint: "Monde (Campus ou Vue Prod) en staging — prêt à Book",
  },
  {
    id: "test",
    label: "Book · Test",
    hint: "Envoyé au Book — En cours de test",
  },
  {
    id: "live",
    label: "Live",
    hint: "Visible joueurs",
  },
];

export type ProductionHubCard = {
  id: string;
  creationId: string | null;
  bookEntryId: string | null;
  title: string;
  secteur: string;
  version: number;
  column: ProductionHubColumnId;
  campusRows: number;
  productionRows: number;
  readinessPct: number;
};

function readinessPct(campusRows: number, productionRows: number): number {
  const campusOk = campusRows > 0 ? 50 : 0;
  const prodOk = productionRows > 0 ? 50 : 0;
  return campusOk + prodOk;
}

/**
 * Cartes hub : priorise les entrées Book (test/live), sinon Créations Atelier.
 */
export function buildProductionHubCards(
  creations: AtelierCreation[],
  bookEntries: BookEntry[]
): ProductionHubCard[] {
  const cards: ProductionHubCard[] = [];
  const creationIdsInBook = new Set<string>();

  for (const entry of bookEntries) {
    const source = creations.find(
      (c) =>
        c.id === entry.sourceCreationId ||
        (c.familyId === entry.creationFamilyId &&
          c.version === entry.version)
    );
    const campusRows = source
      ? countCampusPackRows(source.mondePack ?? {})
      : 0;
    const productionRows = source
      ? countProductionPackRows(source.mondePack ?? {})
      : 0;
    if (source) creationIdsInBook.add(source.id);

    cards.push({
      id: `book-${entry.id}`,
      creationId: source?.id ?? null,
      bookEntryId: entry.id,
      title: `${entry.entrepriseNom || entry.nom} V${entry.version}`,
      secteur: entry.secteur || "—",
      version: entry.version,
      column: entry.status === "live" ? "live" : "test",
      campusRows,
      productionRows,
      readinessPct: readinessPct(campusRows, productionRows),
    });
  }

  for (const c of creations) {
    if (c.dansBook || creationIdsInBook.has(c.id)) continue;
    const campusRows = countCampusPackRows(c.mondePack ?? {});
    const productionRows = countProductionPackRows(c.mondePack ?? {});
    const hasMonde = campusRows > 0 || productionRows > 0;
    cards.push({
      id: `crea-${c.id}`,
      creationId: c.id,
      bookEntryId: null,
      title: `${c.nom} V${c.version}`,
      secteur: c.secteur || "—",
      version: c.version,
      column: hasMonde ? "assemblage" : "brouillon",
      campusRows,
      productionRows,
      readinessPct: readinessPct(campusRows, productionRows),
    });
  }

  return cards;
}

export function groupHubCardsByColumn(
  cards: ProductionHubCard[]
): Record<ProductionHubColumnId, ProductionHubCard[]> {
  const out: Record<ProductionHubColumnId, ProductionHubCard[]> = {
    brouillon: [],
    assemblage: [],
    test: [],
    live: [],
  };
  for (const card of cards) {
    out[card.column].push(card);
  }
  return out;
}
