/**
 * Atelier — Création (pipeline Excel → validation → Book).
 * Storage Studio : keyber-studio-creation-v1. Pas de contenu inventé.
 */

"use client";

import { useSyncExternalStore } from "react";
import { uid } from "@/lib/adminTypes";
import {
  emptyContexteFields,
  type ContexteExcelFields,
} from "@/lib/atelierCreationExcel";
import type { AtelierScenarioMode } from "@/lib/atelierScenarioMode";
import {
  useBookStore,
  type BookEntry,
  type BookScenarioSnapshot,
} from "@/lib/bookStore";

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

export type CreationScenarioDraft = {
  id: string;
  nom: string;
  mode: AtelierScenarioMode;
};

export type AtelierCreation = {
  id: string;
  /** Famille de versions Book (même entreprise). */
  familyId: string;
  /** Numéro de version cible (V1, V2…). */
  version: number;
  /** Nom entreprise (depuis Excel). */
  nom: string;
  secteur: string;
  fields: ContexteExcelFields;
  roleNames: string[];
  competenceNames: string[];
  scenarios: CreationScenarioDraft[];
  /** true une fois envoyé dans le Book — plus de suppression. */
  dansBook: boolean;
  bookEntryId: string | null;
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
    familyId: c.familyId ?? c.id,
    version: typeof c.version === "number" ? c.version : 1,
    nom: c.nom ?? fields["Nom de l'entreprise"] ?? "",
    secteur: c.secteur ?? fields["Secteur d'activité"] ?? "",
    fields,
    roleNames: Array.isArray(c.roleNames) ? c.roleNames : [],
    competenceNames: Array.isArray(c.competenceNames)
      ? c.competenceNames
      : [],
    scenarios: Array.isArray(c.scenarios) ? c.scenarios : [],
    dansBook: Boolean(c.dansBook),
    bookEntryId: c.bookEntryId ?? null,
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

function pushMilestone(
  c: AtelierCreation,
  milestoneId: CreationMilestoneId
): AtelierCreation {
  if (c.timeline.some((e) => e.milestoneId === milestoneId)) return c;
  const meta = CREATION_MILESTONES.find((m) => m.id === milestoneId);
  if (!meta) return c;
  const at = now();
  return {
    ...c,
    timeline: [
      ...c.timeline,
      {
        id: uid("evt"),
        milestoneId,
        label: meta.label,
        at,
      },
    ],
    updatedAt: at,
  };
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

export function creationVersionLabel(c: Pick<AtelierCreation, "nom" | "version">) {
  return `${c.nom} V${c.version}`;
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

/**
 * Hook Création. publishToBook utilise le store Book (côté appelant
 * via actions ci-dessous qui appellent publishFromCreation).
 */
export function useAtelierCreationStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const book = useBookStore();

  return {
    ...current,
    getCreation(id: string) {
      return state.creations.find((c) => c.id === id);
    },
    /** Valide l'aperçu Excel → crée la fiche Création (pas Book). */
    validateExcelSubmission(
      fields: ContexteExcelFields
    ): AtelierCreation | { error: string } {
      ensure();
      const nom = fields["Nom de l'entreprise"]?.trim();
      if (!nom) return { error: "Nom de l'entreprise obligatoire" };
      const at = now();
      const id = uid("crea");
      const c: AtelierCreation = {
        id,
        familyId: uid("family"),
        version: 1,
        nom,
        secteur: fields["Secteur d'activité"]?.trim() ?? "",
        fields: { ...emptyContexteFields(), ...fields },
        roleNames: [],
        competenceNames: [],
        scenarios: [],
        dansBook: false,
        bookEntryId: null,
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
        toast: `Création « ${nom} » V1 enregistrée`,
      });
      return c;
    },
    setRoleNames(id: string, roleNames: string[]): { error?: string } {
      ensure();
      const c = state.creations.find((x) => x.id === id);
      if (!c) return { error: "Création introuvable" };
      if (c.dansBook) return { error: "Déjà dans le Book — lecture seule" };
      let next = {
        ...c,
        roleNames: [...roleNames],
        updatedAt: now(),
      };
      if (roleNames.length > 0) {
        next = pushMilestone(next, "roles_selectionnes");
      }
      persist({
        ...state,
        creations: state.creations.map((x) => (x.id === id ? next : x)),
        toast: null,
      });
      return {};
    },
    setCompetenceNames(
      id: string,
      competenceNames: string[]
    ): { error?: string } {
      ensure();
      const c = state.creations.find((x) => x.id === id);
      if (!c) return { error: "Création introuvable" };
      if (c.dansBook) return { error: "Déjà dans le Book — lecture seule" };
      let next = {
        ...c,
        competenceNames: [...competenceNames],
        updatedAt: now(),
      };
      if (competenceNames.length > 0) {
        next = pushMilestone(next, "competences_selectionnees");
      }
      persist({
        ...state,
        creations: state.creations.map((x) => (x.id === id ? next : x)),
        toast: null,
      });
      return {};
    },
    /**
     * Ajoute un scénario (nom fourni par l'Admin, mode XOR).
     * Ne génère aucun contenu métier.
     */
    addScenario(
      id: string,
      nom: string,
      mode: AtelierScenarioMode
    ): { error?: string } {
      ensure();
      const c = state.creations.find((x) => x.id === id);
      if (!c) return { error: "Création introuvable" };
      if (c.dansBook) return { error: "Déjà dans le Book — lecture seule" };
      const title = nom.trim();
      if (!title) return { error: "Titre du scénario obligatoire" };
      if (mode !== "competence" && mode !== "histoire") {
        return { error: "Mode obligatoire (Compétence ou Histoire)" };
      }
      let next: AtelierCreation = {
        ...c,
        scenarios: [
          ...c.scenarios,
          { id: uid("scen"), nom: title, mode },
        ],
        updatedAt: now(),
      };
      next = pushMilestone(next, "scenarios_provisoires");
      next = pushMilestone(next, "scenarios_valides");
      persist({
        ...state,
        creations: state.creations.map((x) => (x.id === id ? next : x)),
        toast: `Scénario « ${title} » ajouté`,
      });
      return {};
    },
    removeScenario(id: string, scenarioId: string): { error?: string } {
      ensure();
      const c = state.creations.find((x) => x.id === id);
      if (!c) return { error: "Création introuvable" };
      if (c.dansBook) return { error: "Déjà dans le Book — lecture seule" };
      const scenarios = c.scenarios.filter((s) => s.id !== scenarioId);
      persist({
        ...state,
        creations: state.creations.map((x) =>
          x.id === id
            ? { ...x, scenarios, updatedAt: now() }
            : x
        ),
        toast: null,
      });
      return {};
    },
    markPrototypeTested(id: string): { error?: string } {
      ensure();
      const c = state.creations.find((x) => x.id === id);
      if (!c) return { error: "Création introuvable" };
      if (c.dansBook) return { error: "Déjà dans le Book" };
      const next = pushMilestone(c, "prototype_test");
      persist({
        ...state,
        creations: state.creations.map((x) => (x.id === id ? next : x)),
        toast: "Prototype marqué en test",
      });
      return {};
    },
    /**
     * Valide la création et l'envoie dans le Book (En cours de test).
     * Ne crée rien dans le Book sans passer par ici.
     */
    validateAndSendToBook(
      id: string
    ): { entry: BookEntry } | { error: string } {
      ensure();
      const c = state.creations.find((x) => x.id === id);
      if (!c) return { error: "Création introuvable" };
      if (c.dansBook) return { error: "Déjà envoyée dans le Book" };

      let next = c;
      if (next.roleNames.length) {
        next = pushMilestone(next, "roles_selectionnes");
      }
      if (next.competenceNames.length) {
        next = pushMilestone(next, "competences_selectionnees");
      }
      if (next.scenarios.length) {
        next = pushMilestone(next, "scenarios_provisoires");
        next = pushMilestone(next, "scenarios_valides");
      }
      next = pushMilestone(next, "prototype_test");

      const scenarios: BookScenarioSnapshot[] = next.scenarios.map((s) => ({
        id: s.id,
        nom: s.nom,
        mode: s.mode,
      }));

      const published = book.publishFromCreation({
        familyId: next.familyId,
        version: next.version,
        nom: next.nom,
        secteur: next.secteur,
        roleNames: next.roleNames,
        competenceNames: next.competenceNames,
        scenarios,
        fields: next.fields,
        sourceCreationId: next.id,
      });
      if ("error" in published) return published;

      next = pushMilestone(
        {
          ...next,
          dansBook: true,
          bookEntryId: published.id,
        },
        "prototype_book"
      );

      persist({
        ...state,
        creations: state.creations.map((x) => (x.id === id ? next : x)),
        toast: `${creationVersionLabel(next)} envoyé dans le Book (En cours de test)`,
      });
      return { entry: published };
    },
    /**
     * Depuis le Book : crée une nouvelle version dans Création (Vn+1).
     * Ne modifie pas l'entrée Book source.
     */
    returnFromBookToCreation(
      entry: BookEntry
    ): AtelierCreation | { error: string } {
      ensure();
      const nextVersion = book.nextVersionNumber(entry.familyId);
      const at = now();
      const draft: AtelierCreation = {
        id: uid("crea"),
        familyId: entry.familyId,
        version: nextVersion,
        nom: entry.nom,
        secteur: entry.secteur,
        fields: { ...emptyContexteFields(), ...entry.fields },
        roleNames: [...entry.roleNames],
        competenceNames: [...entry.competenceNames],
        scenarios: entry.scenarios.map((s) => ({ ...s, id: uid("scen") })),
        dansBook: false,
        bookEntryId: null,
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

      let next = draft;
      if (next.roleNames.length) next = pushMilestone(next, "roles_selectionnes");
      if (next.competenceNames.length) {
        next = pushMilestone(next, "competences_selectionnees");
      }
      if (next.scenarios.length) {
        next = pushMilestone(next, "scenarios_provisoires");
        next = pushMilestone(next, "scenarios_valides");
      }

      persist({
        ...state,
        creations: [next, ...state.creations],
        toast: `${creationVersionLabel(next)} créé dans Création (à partir de V${entry.version})`,
      });
      return next;
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
