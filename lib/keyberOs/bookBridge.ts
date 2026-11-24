/**
 * Keyber OS — Pont Book → Front-End joueur (Étape 20 + 42)
 *
 * Chemin officiel : `/jouer/live` → `/jouer/book/[id]`
 * `/play` et `/intro` redirigent toujours vers le catalogue Live.
 * POC Novacier joueur : retiré (plus d'archive `?archive=1`).
 *
 * Book Admin (cartes Test/Live) → catalogue / param → OsPlayShell.
 * Aucune donnée Studio (`keyber-studio-*`) lue par le jeu.
 */

/** Route joueur officielle Keyber OS (Book). */
export const OS_BOOK_PLAY_PATH = "/jouer/book";

/** Ancienne route POC — redirigée. */
export const OS_LEGACY_PLAY_PATH = "/play";

/** Catalogue Live Front-End — porte unique joueur. */
export const OS_LIVE_CATALOG_PATH = "/jouer/live";
/** Portes séparées Mode Compétence / Mode Histoire (entonnoir). */
export const OS_LIVE_COMPETENCE_PATH = "/jouer/live/competence";
export const OS_LIVE_HISTOIRE_PATH = "/jouer/live/histoire";

/** /play n'est plus une entrée joueur (ni archive). */
export const OS_LEGACY_PLAY_RETIRED = true;

/** @deprecated Plus d'archive POC — conservé pour docs/Contrôle historiques. */
export const OS_LEGACY_PLAY_ARCHIVE_QUERY = "archive=1";

export function osBookPlayHref(bookEntryId: string): string {
  return `${OS_BOOK_PLAY_PATH}/${encodeURIComponent(bookEntryId)}`;
}

/** Cible de redirection pour tout lien legacy `/play`. */
export function osLegacyPlayRedirectHref(): string {
  return OS_LIVE_CATALOG_PATH;
}

/** @deprecated Archive POC retirée — redirige comme `/play`. */
export function osLegacyPlayArchiveHref(): string {
  return OS_LIVE_CATALOG_PATH;
}

export type OsBookBridgeInfo = {
  officialPath: string;
  legacyPath: string;
  liveCatalog: string;
  /** Étape 39 — porte Mode Compétence. */
  liveCompetence: string;
  /** Étape 39 — porte Mode Histoire (entonnoir rôle→secteur→entreprise). */
  liveHistoire: string;
  shell: string;
  pipeline: string;
  runtimeStorage: string;
  catalogStorage: string;
  note: string;
  /** Étape 42 */
  legacyRetired: boolean;
  /** Toujours = liveCatalog (archive POC retirée). */
  legacyArchiveHref: string;
};

/** Fiche Vue Globale / Admin — pont Book. */
export function osBookBridgeInfo(): OsBookBridgeInfo {
  return {
    officialPath: `${OS_BOOK_PLAY_PATH}/[id]`,
    legacyPath: OS_LEGACY_PLAY_PATH,
    liveCatalog: OS_LIVE_CATALOG_PATH,
    liveCompetence: OS_LIVE_COMPETENCE_PATH,
    liveHistoire: OS_LIVE_HISTOIRE_PATH,
    shell: "components/osPlay/OsPlayShell.tsx",
    pipeline: "lib/keyberOs/pipeline.ts",
    runtimeStorage: "keyber-os-runtime-v1",
    catalogStorage: "keyber-play-catalog-v1 (Live)",
    legacyRetired: OS_LEGACY_PLAY_RETIRED,
    legacyArchiveHref: osLegacyPlayArchiveHref(),
    note:
      "Porte unique joueur : `/jouer/live` → Compétence | Histoire → `/jouer/book/[id]?new=1`. `/play` et `/intro` redirigent vers le Live. POC Novacier joueur retiré.",
  };
}
