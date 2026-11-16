/**
 * Keyber OS — Pont Book → Front-End joueur (Étape 20)
 *
 * Chemin officiel du nouveau système : `/jouer/book/[id]`
 * Legacy POC Novacier : `/play` (inchangé, hors ce pont).
 *
 * Book Admin (cartes Test/Live) → catalogue / param → OsPlayShell.
 * Aucune donnée Studio (`keyber-studio-*`) lue par le jeu.
 */

/** Route joueur officielle Keyber OS (Book). */
export const OS_BOOK_PLAY_PATH = "/jouer/book";

/** Legacy POC — ne pas brancher le Book dessus. */
export const OS_LEGACY_PLAY_PATH = "/play";

/** Catalogue Live Front-End. */
export const OS_LIVE_CATALOG_PATH = "/jouer/live";
/** Portes séparées Mode Compétence / Mode Histoire (entonnoir). */
export const OS_LIVE_COMPETENCE_PATH = "/jouer/live/competence";
export const OS_LIVE_HISTOIRE_PATH = "/jouer/live/histoire";

export function osBookPlayHref(bookEntryId: string): string {
  return `${OS_BOOK_PLAY_PATH}/${encodeURIComponent(bookEntryId)}`;
}

export type OsBookBridgeInfo = {
  officialPath: string;
  legacyPath: string;
  liveCatalog: string;
  shell: string;
  pipeline: string;
  runtimeStorage: string;
  catalogStorage: string;
  note: string;
};

/** Fiche Vue Globale / Admin — pont Book. */
export function osBookBridgeInfo(): OsBookBridgeInfo {
  return {
    officialPath: `${OS_BOOK_PLAY_PATH}/[id]`,
    legacyPath: OS_LEGACY_PLAY_PATH,
    liveCatalog: OS_LIVE_CATALOG_PATH,
    shell: "components/osPlay/OsPlayShell.tsx",
    pipeline: "lib/keyberOs/pipeline.ts",
    runtimeStorage: "keyber-os-runtime-v1",
    catalogStorage: "keyber-play-catalog-v1 (Live)",
    note:
      "Tester / Live Admin → `/jouer/book/[id]`. Catalogue joueur : `/jouer/live` → histoire|compétence. /play = POC Novacier.",
  };
}
