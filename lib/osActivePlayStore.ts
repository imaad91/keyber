/**
 * Session OS Book active (mémoire + miroir localStorage).
 * Permet /journal, /livre, /profil de lire la session
 * sans perdre l'état en quittant `/jouer/book/[id]`.
 */

"use client";

import { useSyncExternalStore } from "react";
import { osDonneesLoadProgress } from "@/lib/keyberOs/donneesSauvegarde";
import type { OsPlayState } from "@/lib/keyberOs/types";

const ACTIVE_KEY = "keyber-os-active-play-v1";

export type OsActivePlayMeta = {
  bookEntryId: string;
  title: string;
  subtitle: string;
  returnHref: string;
};

export type OsActivePlayBag = {
  meta: OsActivePlayMeta | null;
  play: OsPlayState | null;
};

type Bag = {
  state: OsActivePlayBag;
  listeners: Set<() => void>;
};

declare global {
  // eslint-disable-next-line no-var
  var __keyberOsActivePlay: Bag | undefined;
}

function empty(): OsActivePlayBag {
  return { meta: null, play: null };
}

function bag(): Bag {
  if (!globalThis.__keyberOsActivePlay) {
    globalThis.__keyberOsActivePlay = {
      state: empty(),
      listeners: new Set(),
    };
  }
  return globalThis.__keyberOsActivePlay;
}

function emit() {
  bag().listeners.forEach((l) => l());
}

function persistPointer(meta: OsActivePlayMeta | null) {
  if (typeof window === "undefined") return;
  if (!meta) {
    window.sessionStorage.removeItem(ACTIVE_KEY);
    return;
  }
  window.sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(meta));
}

function readPointer(): OsActivePlayMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OsActivePlayMeta;
    if (!parsed?.bookEntryId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hydrateFromPointer(): OsActivePlayBag {
  const meta = readPointer();
  if (!meta) return empty();
  const play = osDonneesLoadProgress(meta.bookEntryId);
  return { meta, play };
}

let hydrated = false;

function ensure() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const current = bag().state;
  if (!current.play && !current.meta) {
    bag().state = hydrateFromPointer();
  }
}

export function publishOsActivePlay(
  meta: OsActivePlayMeta,
  play: OsPlayState
): void {
  ensure();
  bag().state = { meta, play };
  persistPointer(meta);
  emit();
}

export function clearOsActivePlay(): void {
  ensure();
  bag().state = empty();
  persistPointer(null);
  emit();
}

export function getOsActivePlay(): OsActivePlayBag {
  ensure();
  return bag().state;
}

export function useOsActivePlay(): OsActivePlayBag {
  return useSyncExternalStore(
    (l) => {
      ensure();
      bag().listeners.add(l);
      return () => bag().listeners.delete(l);
    },
    () => {
      ensure();
      return bag().state;
    },
    () => empty()
  );
}
