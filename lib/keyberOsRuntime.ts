/**
 * Keyber OS — configuration runtime partagée Admin ↔ Front-End.
 * Storage : keyber-os-runtime-v1 (PAS keyber-studio-* ; le jeu peut lire).
 * Aucun nom d'entreprise ici.
 */

"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "keyber-os-runtime-v1";

export type KeyberOsRuntimeConfig = {
  /**
   * Facteur appliqué à la Trésorerie affichée / lue côté ERP & Interface Joueur.
   * Modifiable dans Admin → Keyber OS → ERP ; le Front-End relit immédiatement.
   */
  tresorerieFacteur: number;
  /** Libellé de formule (doc / UI) — purement descriptif. */
  tresorerieFormuleLabel: string;
  updatedAt: string;
};

const DEFAULTS: KeyberOsRuntimeConfig = {
  tresorerieFacteur: 1,
  tresorerieFormuleLabel: "tresorerie_affichee = tresorerie_brute × facteur",
  updatedAt: new Date(0).toISOString(),
};

type Bag = {
  config: KeyberOsRuntimeConfig;
  hydrated: boolean;
  listeners: Set<() => void>;
};

function bag(): Bag {
  if (typeof window === "undefined") {
    return { config: DEFAULTS, hydrated: false, listeners: new Set() };
  }
  const w = window as unknown as { __keyberOsRuntimeV1?: Bag };
  if (!w.__keyberOsRuntimeV1) {
    w.__keyberOsRuntimeV1 = {
      config: { ...DEFAULTS },
      hydrated: false,
      listeners: new Set(),
    };
  }
  return w.__keyberOsRuntimeV1;
}

function load(): KeyberOsRuntimeConfig {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<KeyberOsRuntimeConfig>;
    const facteur =
      typeof parsed.tresorerieFacteur === "number" &&
      Number.isFinite(parsed.tresorerieFacteur)
        ? parsed.tresorerieFacteur
        : 1;
    return {
      tresorerieFacteur: facteur,
      tresorerieFormuleLabel:
        typeof parsed.tresorerieFormuleLabel === "string" &&
        parsed.tresorerieFormuleLabel.trim()
          ? parsed.tresorerieFormuleLabel
          : DEFAULTS.tresorerieFormuleLabel,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : DEFAULTS.updatedAt,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function ensure() {
  const b = bag();
  if (b.hydrated) return;
  b.hydrated = true;
  b.config = load();
}

function emit() {
  bag().listeners.forEach((l) => l());
}

export function getOsRuntimeConfig(): KeyberOsRuntimeConfig {
  ensure();
  return bag().config;
}

export function setOsRuntimeConfig(
  patch: Partial<Pick<KeyberOsRuntimeConfig, "tresorerieFacteur" | "tresorerieFormuleLabel">>
): KeyberOsRuntimeConfig {
  ensure();
  const b = bag();
  const next: KeyberOsRuntimeConfig = {
    ...b.config,
    ...patch,
    tresorerieFacteur:
      typeof patch.tresorerieFacteur === "number" &&
      Number.isFinite(patch.tresorerieFacteur)
        ? Math.max(0, Math.min(10, patch.tresorerieFacteur))
        : b.config.tresorerieFacteur,
    updatedAt: new Date().toISOString(),
  };
  b.config = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  emit();
  return next;
}

/** Trésorerie affichée = brute × facteur OS (ERP / Interface Joueur). */
export function applyOsTresorerie(brut: number): number {
  const f = getOsRuntimeConfig().tresorerieFacteur;
  return Math.round(brut * f);
}

export function useKeyberOsRuntime() {
  const config = useSyncExternalStore(
    (l) => {
      ensure();
      bag().listeners.add(l);
      return () => bag().listeners.delete(l);
    },
    () => {
      ensure();
      return bag().config;
    },
    () => DEFAULTS
  );

  return {
    config,
    setTresorerieFacteur(v: number) {
      return setOsRuntimeConfig({ tresorerieFacteur: v });
    },
    setTresorerieFormuleLabel(v: string) {
      return setOsRuntimeConfig({ tresorerieFormuleLabel: v });
    },
  };
}
