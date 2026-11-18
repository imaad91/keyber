/**
 * Keyber OS — Pont Book → Front-End joueur (Étape 20 + 42)
 *
 * Chemin officiel : `/jouer/live` → `/jouer/book/[id]`
 * Étape 42 : `/play` redirige vers le catalogue Live (code POC archivé derrière ?archive=1).
 *
 * Book Admin (cartes Test/Live) → catalogue / param → OsPlayShell.
 * Aucune donnée Studio (`keyber-studio-*`) lue par le jeu.
 */

/** Route joueur officielle Keyber OS (Book). */
export const OS_BOOK_PLAY_PATH = "/jouer/book";

/** Ancienne route POC — redirigée (Étape 42). */
export const OS_LEGACY_PLAY_PATH = "/play";

/** Catalogue Live Front-End — porte unique joueur. */
export const OS_LIVE_CATALOG_PATH = "/jouer/live";
/** Portes séparées Mode Compétence / Mode Histoire (entonnoir). */
export const OS_LIVE_COMPETENCE_PATH = "/jouer/live/competence";
export const OS_LIVE_HISTOIRE_PATH = "/jouer/live/histoire";

/** Étape 42 — /play n'est plus une entrée joueur. */
export const OS_LEGACY_PLAY_RETIRED = true;

/** Escape hatch debug : `/play?archive=1` montre encore le POC. */
export const OS_LEGACY_PLAY_ARCHIVE_QUERY = "archive=1";

export function osBookPlayHref(bookEntryId: string): string {
  return `${OS_BOOK_PLAY_PATH}/${encodeURIComponent(bookEntryId)}`;
}

/** Cible de redirection pour tout lien legacy `/play`. */
export function osLegacyPlayRedirectHref(): string {
  return OS_LIVE_CATALOG_PATH;
}

/** URL archive POC (hors catalogue joueur). */
export function osLegacyPlayArchiveHref(): string {
  return `${OS_LEGACY_PLAY_PATH}?${OS_LEGACY_PLAY_ARCHIVE_QUERY}`;
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
      "Étape 42 — porte unique joueur : `/jouer/live` → Compétence | Histoire → `/jouer/book/[id]?new=1`. `/play` redirige vers le catalogue (POC archivé : `/play?archive=1`).",
  };
}
