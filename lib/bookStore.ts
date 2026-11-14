/**
 * Book — récapitulatif des versions validées (Studio).
 * On ne crée / ne modifie rien ici : tout vient de Création.
 * keyber-studio-book-v1 — pas de contenu inventé.
 */

"use client";

import { useSyncExternalStore } from "react";
import { uid } from "@/lib/adminTypes";
import type { ContexteExcelFields } from "@/lib/atelierCreationExcel";
import { emptyContexteFields } from "@/lib/atelierCreationExcel";
import type { AtelierScenarioMode } from "@/lib/atelierScenarioMode";

const STORAGE_KEY = "keyber-studio-book-v1";

export type BookStatus = "en_test" | "live";

export type BookScenarioSnapshot = {
  id: string;
  nom: string;
  mode: AtelierScenarioMode;
};

export type BookEntry = {
  id: string;
  /** Groupe de versions (AgriBio V1 / V2 / V3). */
  familyId: string;
  version: number;
  nom: string;
  secteur: string;
  validatedAt: string;
  roleNames: string[];
  competenceNames: string[];
  scenarios: BookScenarioSnapshot[];
  status: BookStatus;
  /** Snapshot lecture seule du contexte Excel. */
  fields: ContexteExcelFields;
  sourceCreationId: string;
  createdAt: string;
  updatedAt: string;
};

type BookState = {
  entries: BookEntry[];
  toast: string | null;
};

function now() {
  return new Date().toISOString();
}

function emptyState(): BookState {
  return { entries: [], toast: null };
}

export function bookVersionLabel(entry: Pick<BookEntry, "nom" | "version">) {
  return `${entry.nom} V${entry.version}`;
}

export function bookStatusLabel(status: BookStatus) {
  return status === "live" ? "Live" : "En cours de test";
}

/** Visible joueurs uniquement si Live. */
export function isPlayerVisible(entry: BookEntry) {
  return entry.status === "live";
}

function normalizeEntry(
  e: Partial<BookEntry> & { id: string; familyId: string }
): BookEntry {
  return {
    id: e.id,
    familyId: e.familyId,
    version: typeof e.version === "number" ? e.version : 1,
    nom: e.nom ?? "",
    secteur: e.secteur ?? "",
    validatedAt: e.validatedAt ?? now(),
    roleNames: Array.isArray(e.roleNames) ? e.roleNames : [],
    competenceNames: Array.isArray(e.competenceNames)
      ? e.competenceNames
      : [],
    scenarios: Array.isArray(e.scenarios) ? e.scenarios : [],
    status: e.status === "live" ? "live" : "en_test",
    fields: { ...emptyContexteFields(), ...(e.fields ?? {}) },
    sourceCreationId: e.sourceCreationId ?? "",
    createdAt: e.createdAt ?? now(),
    updatedAt: e.updatedAt ?? now(),
  };
}

function load(): BookState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<BookState>;
    return {
      entries: Array.isArray(parsed.entries)
        ? parsed.entries.map((x) => normalizeEntry(x as BookEntry))
        : [],
      toast: null,
    };
  } catch {
    return emptyState();
  }
}

type BookBag = {
  state: BookState;
  hydrated: boolean;
  listeners: Set<() => void>;
};

/** Singleton window — évite double instance Next.js (chunks) qui écrase le Live. */
function bag(): BookBag {
  if (typeof window === "undefined") {
    return {
      state: emptyState(),
      hydrated: false,
      listeners: new Set(),
    };
  }
  const w = window as unknown as { __keyberBookStoreV1?: BookBag };
  if (!w.__keyberBookStoreV1) {
    w.__keyberBookStoreV1 = {
      state: emptyState(),
      hydrated: false,
      listeners: new Set(),
    };
  }
  return w.__keyberBookStoreV1;
}

function emit() {
  bag().listeners.forEach((l) => l());
}

function persist(next: BookState) {
  const b = bag();
  b.state = next;
  if (typeof window !== "undefined") {
    const { toast, ...rest } = next;
    void toast;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }
  emit();
}

function ensure() {
  if (typeof window === "undefined") return;
  const b = bag();
  if (b.hydrated) return;
  b.hydrated = true;
  b.state = load();
}

/** Recharge depuis localStorage avant mutation (source de vérité). */
function refreshFromStorage() {
  ensure();
  const b = bag();
  const toast = b.state.toast;
  b.state = { ...load(), toast };
}

function subscribe(l: () => void) {
  const b = bag();
  b.listeners.add(l);
  return () => b.listeners.delete(l);
}

function getSnapshot() {
  ensure();
  return bag().state;
}

function getServerSnapshot() {
  return emptyState();
}

export type PublishToBookInput = {
  familyId: string;
  version: number;
  nom: string;
  secteur: string;
  roleNames: string[];
  competenceNames: string[];
  scenarios: BookScenarioSnapshot[];
  fields: ContexteExcelFields;
  sourceCreationId: string;
};

/** Lecture joueur : uniquement les entrées Live. */
export function listLiveBookEntriesForPlayers(): BookEntry[] {
  refreshFromStorage();
  return bag()
    .state.entries.filter((e) => e.status === "live")
    .slice()
    .sort((a, b) => b.validatedAt.localeCompare(a.validatedAt));
}

export function useBookStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    getEntry(id: string) {
      return bag().state.entries.find((e) => e.id === id);
    },
    entriesByStatus(status: BookStatus) {
      return bag()
        .state.entries.filter((e) => e.status === status)
        .slice()
        .sort((a, b) => b.validatedAt.localeCompare(a.validatedAt));
    },
    familyHistory(familyId: string) {
      return bag()
        .state.entries.filter((e) => e.familyId === familyId)
        .slice()
        .sort((a, b) => a.version - b.version);
    },
    nextVersionNumber(familyId: string) {
      refreshFromStorage();
      const versions = bag()
        .state.entries.filter((e) => e.familyId === familyId)
        .map((e) => e.version);
      return versions.length ? Math.max(...versions) + 1 : 1;
    },
    /**
     * Appelé depuis Création uniquement — le Book n'a pas de formulaire.
     * Nouvelle entrée toujours en « En cours de test ».
     */
    publishFromCreation(input: PublishToBookInput): BookEntry | { error: string } {
      refreshFromStorage();
      const b = bag();
      const nom = input.nom.trim();
      if (!nom) return { error: "Nom obligatoire" };
      if (!input.familyId) return { error: "Famille de version manquante" };
      if (!input.sourceCreationId) {
        return { error: "Création source manquante" };
      }

      const duplicate = b.state.entries.find(
        (e) =>
          e.familyId === input.familyId && e.version === input.version
      );
      if (duplicate) {
        return {
          error: `${nom} V${input.version} est déjà dans le Book`,
        };
      }

      const at = now();
      const entry: BookEntry = {
        id: uid("book"),
        familyId: input.familyId,
        version: input.version,
        nom,
        secteur: input.secteur.trim(),
        validatedAt: at,
        roleNames: [...input.roleNames],
        competenceNames: [...input.competenceNames],
        scenarios: input.scenarios.map((s) => ({ ...s })),
        status: "en_test",
        fields: { ...emptyContexteFields(), ...input.fields },
        sourceCreationId: input.sourceCreationId,
        createdAt: at,
        updatedAt: at,
      };

      persist({
        ...b.state,
        entries: [entry, ...b.state.entries],
        toast: `${bookVersionLabel(entry)} ajouté au Book (En cours de test)`,
      });
      return entry;
    },
    setStatus(id: string, status: BookStatus): { error?: string } {
      refreshFromStorage();
      const b = bag();
      const entry = b.state.entries.find((e) => e.id === id);
      if (!entry) return { error: "Entrée Book introuvable" };
      if (entry.status === status) return {};
      persist({
        ...b.state,
        entries: b.state.entries.map((e) =>
          e.id === id ? { ...e, status, updatedAt: now() } : e
        ),
        toast:
          status === "live"
            ? `${bookVersionLabel(entry)} passé en Live (visible joueurs)`
            : `${bookVersionLabel(entry)} retiré du Live (Admin uniquement)`,
      });
      return {};
    },
    clearToast() {
      refreshFromStorage();
      const b = bag();
      if (!b.state.toast) return;
      persist({ ...b.state, toast: null });
    },
  };
}
