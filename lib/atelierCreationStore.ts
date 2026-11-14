/**
 * Atelier — Création (pipeline Excel → validation → Book plus tard).
 * Storage Studio : keyber-studio-creation-v1. Pas de contenu inventé.
 */

"use client";

import { useSyncExternalStore } from "react";
import { uid } from "@/lib/adminTypes";
import {
  emptyContexteFields,
  type ContexteExcelFields,
} from "@/lib/atelierCreationExcel";

const STORAGE_KEY = "keyber-studio-creation-v1";

/** Jalons du fil chronologique — ordre fixe. */
export const CREATION_MILESTONES = [
  {
    id: "excel_valide",
    label: "Excel Contexte importé, validé.",
  },
  {
    id: "roles_selectionnes",
    label: "Rôles sélectionnés.",
  },
  {
    id: "competences_selectionnees",
    label: "Compétences sélectionnées.",
  },
  {
    id: "scenarios_provisoires",
    label: "Scénarios provisoires générés par l'IA.",
  },
  {
    id: "scenarios_valides",
    label: "Scénarios validés.",
  },
  {
    id: "prototype_test",
    label: "Prototype en cours de test.",
  },
  {
    id: "prototype_book",
    label: "Prototype validé, envoyé dans le Book.",
  },
] as const;

export type CreationMilestoneId = (typeof CREATION_MILESTONES)[number]["id"];

export type CreationTimelineEvent = {
  id: string;
  milestoneId: CreationMilestoneId;
  label: string;
  at: string;
};

export type AtelierCreation = {
  id: string;
  /** Nom entreprise (depuis Excel). */
  nom: string;
  secteur: string;
  fields: ContexteExcelFields;
  /** true une fois envoyé dans le Book — plus de suppression. */
  dansBook: boolean;
  timeline: CreationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

type CreationState = {
  creations: AtelierCreation[];
  toast: string | null;
};

function now() {
  return new Date().toISOString();
}

function emptyState(): CreationState {
  return { creations: [], toast: null };
}

function normalizeCreation(
  c: Partial<AtelierCreation> & { id: string }
): AtelierCreation {
  const fields = { ...emptyContexteFields(), ...(c.fields ?? {}) };
  return {
    id: c.id,
    nom: c.nom ?? fields["Nom de l'entreprise"] ?? "",
    secteur: c.secteur ?? fields["Secteur d'activité"] ?? "",
    fields,
    dansBook: Boolean(c.dansBook),
    timeline: Array.isArray(c.timeline) ? c.timeline : [],
    createdAt: c.createdAt ?? now(),
    updatedAt: c.updatedAt ?? now(),
  };
}

function load(): CreationState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<CreationState>;
    return {
      creations: Array.isArray(parsed.creations)
        ? parsed.creations.map((x) =>
            normalizeCreation(x as AtelierCreation)
          )
        : [],
      toast: null,
    };
  } catch {
    return emptyState();
  }
}

let state: CreationState = emptyState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: CreationState) {
  state = next;
  if (typeof window !== "undefined") {
    const { toast, ...rest } = next;
    void toast;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }
  emit();
}

function ensure() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = load();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  ensure();
  return state;
}

function getServerSnapshot() {
  return emptyState();
}

export function milestoneDone(
  c: AtelierCreation,
  milestoneId: CreationMilestoneId
): boolean {
  return c.timeline.some((e) => e.milestoneId === milestoneId);
}

export function creationProgress(c: AtelierCreation): {
  done: number;
  total: number;
} {
  const done = CREATION_MILESTONES.filter((m) =>
    milestoneDone(c, m.id)
  ).length;
  return { done, total: CREATION_MILESTONES.length };
}

/** Ce qui reste à faire — phrases simples pour l'utilisateur. */
export function creationPendingItems(c: AtelierCreation): string[] {
  const pending: string[] = [];
  if (!milestoneDone(c, "roles_selectionnes")) {
    pending.push("Sélectionner les rôles");
  }
  if (!milestoneDone(c, "competences_selectionnees")) {
    pending.push("Sélectionner les compétences");
  }
  if (
    milestoneDone(c, "roles_selectionnes") &&
    milestoneDone(c, "competences_selectionnees") &&
    !milestoneDone(c, "scenarios_provisoires")
  ) {
    pending.push("Générer les scénarios provisoires");
  }
  if (
    milestoneDone(c, "scenarios_provisoires") &&
    !milestoneDone(c, "scenarios_valides")
  ) {
    pending.push("Valider les scénarios provisoires");
  }
  if (
    milestoneDone(c, "scenarios_valides") &&
    !milestoneDone(c, "prototype_test")
  ) {
    pending.push("Tester le prototype");
  }
  if (
    milestoneDone(c, "prototype_test") &&
    !milestoneDone(c, "prototype_book")
  ) {
    pending.push("Valider le prototype et l'envoyer dans le Book");
  }
  if (pending.length === 0 && !c.dansBook) {
    pending.push("En attente d'envoi dans le Book");
  }
  return pending;
}

export function useAtelierCreationStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    getCreation(id: string) {
      return state.creations.find((c) => c.id === id);
    },
    /** Valide l'aperçu Excel → crée la fiche Création (pas Book). */
    validateExcelSubmission(fields: ContexteExcelFields): AtelierCreation | { error: string } {
      ensure();
      const nom = fields["Nom de l'entreprise"]?.trim();
      if (!nom) return { error: "Nom de l'entreprise obligatoire" };
      const at = now();
      const c: AtelierCreation = {
        id: uid("crea"),
        nom,
        secteur: fields["Secteur d'activité"]?.trim() ?? "",
        fields: { ...emptyContexteFields(), ...fields },
        dansBook: false,
        timeline: [
          {
            id: uid("evt"),
            milestoneId: "excel_valide",
            label: "Excel Contexte importé, validé.",
            at,
          },
        ],
        createdAt: at,
        updatedAt: at,
      };
      persist({
        ...state,
        creations: [c, ...state.creations],
        toast: `Création « ${nom} » enregistrée`,
      });
      return c;
    },
    deleteCreation(id: string): { error?: string } {
      ensure();
      const c = state.creations.find((x) => x.id === id);
      if (!c) return { error: "Création introuvable" };
      if (c.dansBook || milestoneDone(c, "prototype_book")) {
        return {
          error: "Impossible de supprimer : déjà validée / envoyée dans le Book",
        };
      }
      persist({
        ...state,
        creations: state.creations.filter((x) => x.id !== id),
        toast: "Création supprimée",
      });
      return {};
    },
    clearToast() {
      ensure();
      if (!state.toast) return;
      persist({ ...state, toast: null });
    },
  };
}
