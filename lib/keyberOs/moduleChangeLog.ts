/**
 * Fil court des changements runtime OS (ring buffer).
 * Alimenté à chaque setOsRuntimeConfig — pas les parties joueur.
 */

"use client";

import { useSyncExternalStore } from "react";
import type { KeyberOsComposanteId } from "@/lib/keyberOsDocs";
import type { KeyberOsRuntimeConfig } from "@/lib/keyberOsRuntime";

const STORAGE_KEY = "keyber-os-module-changelog-v1";
const MAX_ENTRIES = 40;

export type OsModuleChangeEntry = {
  id: string;
  at: string;
  moduleId: KeyberOsComposanteId;
  summary: string;
};

type Bag = {
  entries: OsModuleChangeEntry[];
  hydrated: boolean;
  listeners: Set<() => void>;
};

const SSR_BAG: Bag = {
  entries: [],
  hydrated: true,
  listeners: new Set(),
};

function bag(): Bag {
  if (typeof window === "undefined") return SSR_BAG;
  const w = window as unknown as { __keyberOsModuleChangeLogV1?: Bag };
  if (!w.__keyberOsModuleChangeLogV1) {
    w.__keyberOsModuleChangeLogV1 = {
      entries: [],
      hydrated: false,
      listeners: new Set(),
    };
  }
  return w.__keyberOsModuleChangeLogV1;
}

function load(): OsModuleChangeEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { entries?: OsModuleChangeEntry[] };
    return Array.isArray(parsed.entries) ? parsed.entries.slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

function ensure() {
  const b = bag();
  if (b.hydrated) return;
  b.hydrated = true;
  b.entries = load();
}

function emit() {
  bag().listeners.forEach((l) => l());
}

function persist(entries: OsModuleChangeEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries }));
}

/** Clés runtime → id composante Admin. */
export const RUNTIME_KEY_TO_MODULE: Record<
  string,
  KeyberOsComposanteId | undefined
> = {
  erp: "erp",
  moteurScenarios: "moteur-scenarios",
  moteurDecisions: "moteur-decisions",
  moteurEvenements: "moteur-evenements",
  progression: "progression",
  interfaceJoueur: "interface-joueur",
  ordinateur: "ordinateur",
  temps: "temps",
  cycleVie: "cycle-vie",
  notifications: "notifications",
  interviews: "interviews",
  relations: "relations",
  objectifs: "objectifs",
  visibilite: "visibilite",
  journal: "journal",
  livre: "livre",
  profil: "profil",
  fins: "fins",
  donneesSauvegarde: "donnees-sauvegarde",
};

function summarizeModulePatch(
  moduleId: KeyberOsComposanteId,
  before: unknown,
  after: unknown
): string {
  if (!before || !after || typeof before !== "object" || typeof after !== "object") {
    return "Paramètres mis à jour";
  }
  const b = before as Record<string, unknown>;
  const a = after as Record<string, unknown>;
  const bits: string[] = [];

  if ("enabled" in a && a.enabled !== b.enabled) {
    bits.push(a.enabled ? "module activé" : "module désactivé");
  }

  if (moduleId === "erp") {
    if (a.tresorerieFacteur !== b.tresorerieFacteur) {
      bits.push(`facteur ×${a.tresorerieFacteur}`);
    }
    if (a.equipeBase !== b.equipeBase) {
      bits.push(`équipe ${a.equipeBase}`);
    }
  }
  if (moduleId === "ordinateur" && a.apps && typeof a.apps === "object") {
    const ba = (b.apps ?? {}) as Record<string, boolean>;
    const aa = a.apps as Record<string, boolean>;
    for (const [k, v] of Object.entries(aa)) {
      if (ba[k] !== v) bits.push(`app ${k} ${v ? "ON" : "OFF"}`);
    }
  }
  if (moduleId === "visibilite") {
    if (a.fogEnabled !== b.fogEnabled) {
      bits.push(a.fogEnabled ? "fog ON" : "fog OFF");
    }
  }
  if (moduleId === "temps") {
    if (a.dayLengthMinutes !== b.dayLengthMinutes) {
      bits.push(`journée ${a.dayLengthMinutes} min`);
    }
  }
  if (moduleId === "notifications") {
    if (a.showUrgentBanner !== b.showUrgentBanner) {
      bits.push(a.showUrgentBanner ? "bannière ON" : "bannière OFF");
    }
  }
  if (moduleId === "donnees-sauvegarde") {
    if (a.autosave !== b.autosave) {
      bits.push(a.autosave ? "autosave ON" : "autosave OFF");
    }
  }

  if (bits.length === 0) return "Paramètres mis à jour";
  return bits.slice(0, 3).join(" · ");
}

/** Compare before/after et pousse 1 entrée par module touché. */
export function recordRuntimeConfigDiff(
  before: KeyberOsRuntimeConfig,
  after: KeyberOsRuntimeConfig
) {
  ensure();
  const b = bag();
  const at = after.updatedAt || new Date().toISOString();
  const next = [...b.entries];

  for (const [key, moduleId] of Object.entries(RUNTIME_KEY_TO_MODULE)) {
    if (!moduleId) continue;
    const prevSec = (before as Record<string, unknown>)[key];
    const nextSec = (after as Record<string, unknown>)[key];
    if (JSON.stringify(prevSec) === JSON.stringify(nextSec)) continue;
    next.unshift({
      id: `${at}-${moduleId}-${Math.random().toString(36).slice(2, 8)}`,
      at,
      moduleId,
      summary: summarizeModulePatch(moduleId, prevSec, nextSec),
    });
  }

  b.entries = next.slice(0, MAX_ENTRIES);
  persist(b.entries);
  emit();
}

export function listOsModuleChanges(
  moduleId?: KeyberOsComposanteId,
  limit = 5
): OsModuleChangeEntry[] {
  ensure();
  const all = bag().entries;
  const filtered = moduleId
    ? all.filter((e) => e.moduleId === moduleId)
    : all;
  return filtered.slice(0, limit);
}

export function useOsModuleChangeLog(moduleId?: KeyberOsComposanteId, limit = 5) {
  const entries = useSyncExternalStore(
    (l) => {
      ensure();
      bag().listeners.add(l);
      return () => bag().listeners.delete(l);
    },
    () => {
      ensure();
      return bag().entries;
    },
    () => []
  );
  const filtered = moduleId
    ? entries.filter((e) => e.moduleId === moduleId)
    : entries;
  return filtered.slice(0, limit);
}
