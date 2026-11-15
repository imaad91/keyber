/**
 * Catalogue joueur — scénarios Live du Book, hors storage Studio.
 * keyber-play-catalog-v1 (le Front-End lit ceci, pas keyber-studio-*).
 * Entrées filtrées si le fichier de paramétrage est absent.
 */

"use client";

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import type { AtelierScenarioMode } from "@/lib/atelierScenarioMode";
import type { BookEntry, BookStatus } from "@/lib/bookStore";

const STORAGE_KEY = "keyber-play-catalog-v1";
const ADMIN_PLAY_KEY = "keyber-admin-play-session";

export type PlayCatalogEntry = {
  id: string;
  familyId: string;
  version: number;
  mode: AtelierScenarioMode;
  nom: string;
  entrepriseNom: string;
  secteur: string;
  competenceName: string;
  roleName: string;
  paramFileName: string;
  paramFile: ScenarioParamFile | null;
  textContent: string;
  status: BookStatus;
  updatedAt: string;
};

type CatalogState = {
  entries: PlayCatalogEntry[];
};

function empty(): CatalogState {
  return { entries: [] };
}

function load(): CatalogState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<CatalogState>;
    return {
      entries: Array.isArray(parsed.entries)
        ? (parsed.entries as PlayCatalogEntry[])
        : [],
    };
  } catch {
    return empty();
  }
}

function save(state: CatalogState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function bookEntryToPlayCatalog(entry: BookEntry): PlayCatalogEntry {
  return {
    id: entry.id,
    familyId: entry.familyId,
    version: entry.version,
    mode: entry.mode,
    nom: entry.nom,
    entrepriseNom: entry.entrepriseNom,
    secteur: entry.secteur,
    competenceName: entry.competenceName,
    roleName: entry.roleName,
    paramFileName: entry.paramFileName,
    paramFile: entry.paramFile,
    textContent: entry.textContent,
    status: entry.status,
    updatedAt: entry.updatedAt,
  };
}

/** Resync complet : uniquement les Live Book. */
export function syncPlayCatalogFromBook(entries: BookEntry[]) {
  if (typeof window === "undefined") return;
  const live = entries
    .filter((e) => e.status === "live")
    .map(bookEntryToPlayCatalog);
  save({ entries: live });
}

export function listLivePlayCatalog(): PlayCatalogEntry[] {
  return load()
    .entries.filter((e) => e.status === "live")
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPlayCatalogEntry(id: string): PlayCatalogEntry | null {
  return load().entries.find((e) => e.id === id) ?? null;
}

/**
 * Après setStatus Book :
 * - Live → upsert (remplace les autres Live de la même lignée)
 * - en_test → retire du catalogue joueur
 */
export function upsertPlayCatalogFromBookEntry(entry: BookEntry) {
  if (typeof window === "undefined") return;
  const state = load();
  if (entry.status === "live") {
    const others = state.entries.filter(
      (e) => e.familyId !== entry.familyId && e.id !== entry.id
    );
    save({ entries: [bookEntryToPlayCatalog(entry), ...others] });
    return;
  }
  save({
    entries: state.entries.filter(
      (e) => e.id !== entry.id && e.familyId !== entry.familyId
    ),
  });
}

export function removePlayCatalogEntry(id: string) {
  const state = load();
  save({ entries: state.entries.filter((e) => e.id !== id) });
}

export type AdminPlaySession = {
  bookEntryId: string;
  status: BookStatus;
  returnHref: string;
};

export function setAdminPlaySession(session: AdminPlaySession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.sessionStorage.removeItem(ADMIN_PLAY_KEY);
    return;
  }
  window.sessionStorage.setItem(ADMIN_PLAY_KEY, JSON.stringify(session));
}

export function getAdminPlaySession(): AdminPlaySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_PLAY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminPlaySession;
  } catch {
    return null;
  }
}

/** Vérifie si le fichier de paramétrage existe côté serveur. */
export async function paramFileExists(paramFileName: string): Promise<boolean> {
  if (!paramFileName.trim()) return false;
  try {
    const res = await fetch(
      `/api/scenarios/${encodeURIComponent(paramFileName)}`,
      { method: "HEAD" }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchParamFile(
  paramFileName: string
): Promise<ScenarioParamFile | null> {
  try {
    const res = await fetch(
      `/api/scenarios/${encodeURIComponent(paramFileName)}`
    );
    if (!res.ok) return null;
    return (await res.json()) as ScenarioParamFile;
  } catch {
    return null;
  }
}

/** Catalogue joueur : Live + fichier de paramétrage présent sur disque. */
export async function listVisibleLivePlayCatalog(): Promise<PlayCatalogEntry[]> {
  const live = listLivePlayCatalog();
  const out: PlayCatalogEntry[] = [];
  for (const e of live) {
    if (!e.paramFileName) continue;
    const ok = await paramFileExists(e.paramFileName);
    if (ok) out.push(e);
  }
  return out;
}
