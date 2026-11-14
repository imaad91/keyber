/**
 * Book — récapitulatif des versions validées (Studio).
 * Cartes séparées : Scénarios (Mode Compétence) ≠ Histoires (Mode Histoire).
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

/** @deprecated legacy — migré vers une carte = un mode */
export type BookScenarioSnapshot = {
  id: string;
  nom: string;
  mode: AtelierScenarioMode;
};

export type BookEntry = {
  id: string;
  /** Lignée de versions de CE scénario / CETTE histoire (V1, V2…). */
  familyId: string;
  /** Famille entreprise (Création) — contexte partagé. */
  creationFamilyId: string;
  version: number;
  /** Discriminant exclusif — une carte = un seul mode. */
  mode: AtelierScenarioMode;
  /** Nom du scénario (compétence) ou de l'histoire. */
  nom: string;
  /** Entreprise / contexte. */
  entrepriseNom: string;
  secteur: string;
  /** Mode Compétence — compétence travaillée. */
  competenceName: string;
  /** Mode Histoire — rôle joué. */
  roleName: string;
  roleNames: string[];
  competenceNames: string[];
  status: BookStatus;
  fields: ContexteExcelFields;
  sourceCreationId: string;
  sourceScenarioId: string;
  validatedAt: string;
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

export function bookVersionLabel(
  entry: Pick<BookEntry, "nom" | "version" | "entrepriseNom">
) {
  const base = entry.nom?.trim() || entry.entrepriseNom || "Sans titre";
  return `${base} V${entry.version}`;
}

export function bookStatusLabel(status: BookStatus) {
  return status === "live" ? "Live" : "En cours de test";
}

export function isPlayerVisible(entry: BookEntry) {
  return entry.status === "live";
}

export function isScenarioCompetence(entry: BookEntry) {
  return entry.mode === "competence";
}

export function isHistoire(entry: BookEntry) {
  return entry.mode === "histoire";
}

function migrateLegacyRaw(raw: Record<string, unknown>): BookEntry[] {
  // New shape already has mode at top level
  if (raw.mode === "competence" || raw.mode === "histoire") {
    return [
      normalizeEntry(raw as Partial<BookEntry> & { id: string; familyId: string }),
    ];
  }

  // Legacy: one creation card with scenarios[]
  const scenarios = Array.isArray(raw.scenarios)
    ? (raw.scenarios as BookScenarioSnapshot[])
    : [];
  const entrepriseNom = String(raw.nom ?? "");
  const secteur = String(raw.secteur ?? "");
  const creationFamilyId = String(raw.familyId ?? raw.id ?? uid("family"));
  const version = typeof raw.version === "number" ? raw.version : 1;
  const status: BookStatus = raw.status === "live" ? "live" : "en_test";
  const roleNames = Array.isArray(raw.roleNames)
    ? (raw.roleNames as string[])
    : [];
  const competenceNames = Array.isArray(raw.competenceNames)
    ? (raw.competenceNames as string[])
    : [];
  const fields = {
    ...emptyContexteFields(),
    ...((raw.fields as ContexteExcelFields) ?? {}),
  };
  const sourceCreationId = String(raw.sourceCreationId ?? "");
  const validatedAt = String(raw.validatedAt ?? now());
  const createdAt = String(raw.createdAt ?? validatedAt);
  const updatedAt = String(raw.updatedAt ?? validatedAt);

  if (!scenarios.length) {
    // Orphan legacy without scenarios — drop (can't place in a section)
    return [];
  }

  return scenarios.map((s) =>
    normalizeEntry({
      id: uid("book"),
      familyId: `${creationFamilyId}:${s.id}`,
      creationFamilyId,
      version,
      mode: s.mode,
      nom: s.nom,
      entrepriseNom,
      secteur,
      competenceName:
        s.mode === "competence" ? competenceNames[0] ?? "" : "",
      roleName: s.mode === "histoire" ? roleNames[0] ?? "" : "",
      roleNames,
      competenceNames,
      status,
      fields,
      sourceCreationId,
      sourceScenarioId: s.id,
      validatedAt,
      createdAt,
      updatedAt,
    })
  );
}

function normalizeEntry(
  e: Partial<BookEntry> & { id: string; familyId: string }
): BookEntry {
  const mode: AtelierScenarioMode =
    e.mode === "competence" ? "competence" : "histoire";
  return {
    id: e.id,
    familyId: e.familyId,
    creationFamilyId: e.creationFamilyId ?? e.familyId,
    version: typeof e.version === "number" ? e.version : 1,
    mode,
    nom: e.nom ?? "",
    entrepriseNom: e.entrepriseNom ?? "",
    secteur: e.secteur ?? "",
    competenceName: e.competenceName ?? "",
    roleName: e.roleName ?? "",
    roleNames: Array.isArray(e.roleNames) ? e.roleNames : [],
    competenceNames: Array.isArray(e.competenceNames)
      ? e.competenceNames
      : [],
    status: e.status === "live" ? "live" : "en_test",
    fields: { ...emptyContexteFields(), ...(e.fields ?? {}) },
    sourceCreationId: e.sourceCreationId ?? "",
    sourceScenarioId: e.sourceScenarioId ?? "",
    validatedAt: e.validatedAt ?? now(),
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
    const entries: BookEntry[] = [];
    if (Array.isArray(parsed.entries)) {
      for (const item of parsed.entries) {
        entries.push(
          ...migrateLegacyRaw(item as unknown as Record<string, unknown>)
        );
      }
    }
    return { entries, toast: null };
  } catch {
    return emptyState();
  }
}

type BookBag = {
  state: BookState;
  hydrated: boolean;
  listeners: Set<() => void>;
};

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

export type PublishScenarioInput = {
  creationFamilyId: string;
  /** Lignée scénario/histoire — stable across V1/V2. */
  itemFamilyId: string;
  version: number;
  mode: AtelierScenarioMode;
  nom: string;
  entrepriseNom: string;
  secteur: string;
  competenceName: string;
  roleName: string;
  roleNames: string[];
  competenceNames: string[];
  fields: ContexteExcelFields;
  sourceCreationId: string;
  sourceScenarioId: string;
};

export type PublishToBookInput = {
  creationFamilyId: string;
  version: number;
  entrepriseNom: string;
  secteur: string;
  roleNames: string[];
  competenceNames: string[];
  scenarios: BookScenarioSnapshot[];
  fields: ContexteExcelFields;
  sourceCreationId: string;
};

/** Lecture joueur : Live uniquement, toutes sections. */
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
    entriesByStatusAndMode(status: BookStatus, mode: AtelierScenarioMode) {
      return bag()
        .state.entries.filter((e) => e.status === status && e.mode === mode)
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
     * Depuis Création : 1 scénario validé = 1 carte Book dans la bonne section.
     * Mode Compétence → Scénarios. Mode Histoire → Histoires. Jamais mélangés.
     */
    publishFromCreation(
      input: PublishToBookInput
    ): { entries: BookEntry[] } | { error: string } {
      refreshFromStorage();
      const b = bag();
      const entrepriseNom = input.entrepriseNom.trim();
      if (!entrepriseNom) return { error: "Nom d'entreprise obligatoire" };
      if (!input.creationFamilyId) {
        return { error: "Famille de création manquante" };
      }
      if (!input.sourceCreationId) {
        return { error: "Création source manquante" };
      }
      if (!input.scenarios.length) {
        return {
          error:
            "Ajoutez au moins un scénario (Mode Compétence) ou une histoire (Mode Histoire) avant d'envoyer au Book",
        };
      }

      const at = now();
      const created: BookEntry[] = [];

      for (const s of input.scenarios) {
        if (s.mode !== "competence" && s.mode !== "histoire") {
          return { error: `Mode invalide pour « ${s.nom} »` };
        }
        const itemFamilyId = `${input.creationFamilyId}:${s.id}`;
        const duplicate = b.state.entries.find(
          (e) =>
            e.familyId === itemFamilyId && e.version === input.version
        );
        if (duplicate) {
          return {
            error: `${s.nom} V${input.version} est déjà dans le Book`,
          };
        }

        const entry = normalizeEntry({
          id: uid("book"),
          familyId: itemFamilyId,
          creationFamilyId: input.creationFamilyId,
          version: input.version,
          mode: s.mode,
          nom: s.nom.trim(),
          entrepriseNom,
          secteur: input.secteur.trim(),
          competenceName:
            s.mode === "competence"
              ? input.competenceNames[0]?.trim() ?? ""
              : "",
          roleName:
            s.mode === "histoire" ? input.roleNames[0]?.trim() ?? "" : "",
          roleNames: [...input.roleNames],
          competenceNames: [...input.competenceNames],
          status: "en_test",
          fields: { ...emptyContexteFields(), ...input.fields },
          sourceCreationId: input.sourceCreationId,
          sourceScenarioId: s.id,
          validatedAt: at,
          createdAt: at,
          updatedAt: at,
        });
        created.push(entry);
      }

      const nScen = created.filter((e) => e.mode === "competence").length;
      const nHist = created.filter((e) => e.mode === "histoire").length;
      const parts: string[] = [];
      if (nScen) parts.push(`${nScen} scénario(s)`);
      if (nHist) parts.push(`${nHist} histoire(s)`);

      persist({
        ...b.state,
        entries: [...created, ...b.state.entries],
        toast: `${parts.join(" + ")} ajouté(s) au Book (En cours de test)`,
      });
      return { entries: created };
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
            : `${bookVersionLabel(entry)} retourné en En cours de test (Admin uniquement)`,
      });
      return {};
    },
    deleteEntry(id: string): { error?: string } {
      refreshFromStorage();
      const b = bag();
      const entry = b.state.entries.find((e) => e.id === id);
      if (!entry) return { error: "Entrée Book introuvable" };
      persist({
        ...b.state,
        entries: b.state.entries.filter((e) => e.id !== id),
        toast: `${bookVersionLabel(entry)} supprimé du Book`,
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
