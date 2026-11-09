"use client";

import { useSyncExternalStore } from "react";
import {
  createAdminSeed,
  emptyDecision,
  emptyEntreprise,
  emptyEvent,
  emptyPersonnage,
  emptyScenario,
} from "./adminSeed";
import type {
  AdminConsultantSubmission,
  AdminDecision,
  AdminEntreprise,
  AdminEvent,
  AdminPersonnage,
  AdminScenario,
  AdminState,
} from "./adminTypes";

const STORAGE_KEY = "keyber-admin-v1";

function loadState(): AdminState {
  if (typeof window === "undefined") return createAdminSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createAdminSeed();
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    const seed = createAdminSeed();
    return {
      scenarios: parsed.scenarios ?? seed.scenarios,
      entreprises: parsed.entreprises ?? seed.entreprises,
      personnages: parsed.personnages ?? seed.personnages,
      decisions: parsed.decisions ?? seed.decisions,
      events: parsed.events ?? seed.events,
      consultants: parsed.consultants ?? [],
      toast: null,
    };
  } catch {
    return createAdminSeed();
  }
}

let state: AdminState = createAdminSeed();
let hydrated = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: AdminState) {
  state = next;
  if (typeof window !== "undefined") {
    const rest = { ...next, toast: null };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }
  emit();
}

function toast(message: string) {
  persist({ ...state, toast: message });
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = loadState();
}

function patch(partial: Partial<AdminState>) {
  persist({ ...state, ...partial });
}

/* —— Scenarios —— */
export function createScenario() {
  ensureHydrated();
  const s = emptyScenario(state.scenarios.length + 1);
  patch({ scenarios: [...state.scenarios, s] });
  toast("Scénario créé");
  return s.id;
}

export function updateScenario(id: string, data: Partial<AdminScenario>) {
  ensureHydrated();
  patch({
    scenarios: state.scenarios.map((s) =>
      s.id === id ? { ...s, ...data } : s
    ),
  });
  toast("Scénario enregistré");
}

export function duplicateScenario(id: string) {
  ensureHydrated();
  const src = state.scenarios.find((s) => s.id === id);
  if (!src) return null;
  const copy: AdminScenario = {
    ...src,
    id: `scn-${Date.now().toString(36)}`,
    titre: `${src.titre} (copie)`,
    statut: "brouillon",
    order: state.scenarios.length + 1,
  };
  const decisions = state.decisions
    .filter((d) => d.scenarioId === id)
    .map((d) => ({
      ...d,
      id: `dec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      scenarioId: copy.id,
    }));
  const events = state.events
    .filter((e) => e.scenarioId === id)
    .map((e) => ({
      ...e,
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      scenarioId: copy.id,
    }));
  patch({
    scenarios: [...state.scenarios, copy],
    decisions: [...state.decisions, ...decisions],
    events: [...state.events, ...events],
  });
  toast("Scénario dupliqué");
  return copy.id;
}

export function archiveScenario(id: string) {
  updateScenario(id, { statut: "archive" });
  toast("Scénario archivé");
}

export function publishScenario(id: string) {
  updateScenario(id, { statut: "publie" });
  toast("Scénario publié");
}

export function reorderScenarios(orderedIds: string[]) {
  ensureHydrated();
  patch({
    scenarios: state.scenarios.map((s) => {
      const idx = orderedIds.indexOf(s.id);
      return idx >= 0 ? { ...s, order: idx + 1 } : s;
    }),
  });
  toast("Ordre de la bibliothèque mis à jour");
}

/* —— Entreprises —— */
export function createEntreprise() {
  ensureHydrated();
  const e = emptyEntreprise();
  patch({ entreprises: [...state.entreprises, e] });
  toast("Entreprise créée");
  return e.id;
}

export function updateEntreprise(id: string, data: Partial<AdminEntreprise>) {
  ensureHydrated();
  patch({
    entreprises: state.entreprises.map((e) =>
      e.id === id ? { ...e, ...data } : e
    ),
  });
  toast("Entreprise enregistrée");
}

/* —— Personnages —— */
export function createPersonnage() {
  ensureHydrated();
  const p = emptyPersonnage();
  patch({ personnages: [...state.personnages, p] });
  toast("Personnage créé");
  return p.id;
}

export function updatePersonnage(id: string, data: Partial<AdminPersonnage>) {
  ensureHydrated();
  patch({
    personnages: state.personnages.map((p) =>
      p.id === id ? { ...p, ...data } : p
    ),
  });
  toast("Personnage enregistré");
}

/* —— Decisions & Events —— */
export function createDecision(scenarioId: string) {
  ensureHydrated();
  const order =
    state.decisions.filter((d) => d.scenarioId === scenarioId).length + 1;
  const d = emptyDecision(scenarioId, order);
  patch({ decisions: [...state.decisions, d] });
  toast("Décision créée");
  return d.id;
}

export function updateDecision(id: string, data: Partial<AdminDecision>) {
  ensureHydrated();
  patch({
    decisions: state.decisions.map((d) =>
      d.id === id ? { ...d, ...data } : d
    ),
  });
  toast("Décision enregistrée");
}

export function deleteDecision(id: string) {
  ensureHydrated();
  patch({ decisions: state.decisions.filter((d) => d.id !== id) });
  toast("Décision supprimée");
}

export function createEvent(scenarioId: string) {
  ensureHydrated();
  const order =
    state.events.filter((e) => e.scenarioId === scenarioId).length + 1;
  const e = emptyEvent(scenarioId, order);
  patch({ events: [...state.events, e] });
  toast("Événement créé");
  return e.id;
}

export function updateEvent(id: string, data: Partial<AdminEvent>) {
  ensureHydrated();
  patch({
    events: state.events.map((e) => (e.id === id ? { ...e, ...data } : e)),
  });
  toast("Événement enregistré");
}

export function deleteEvent(id: string) {
  ensureHydrated();
  patch({ events: state.events.filter((e) => e.id !== id) });
  toast("Événement supprimé");
}

export function reorderTimeline(
  scenarioId: string,
  kind: "decision" | "event",
  orderedIds: string[]
) {
  ensureHydrated();
  if (kind === "decision") {
    patch({
      decisions: state.decisions.map((d) => {
        if (d.scenarioId !== scenarioId) return d;
        const idx = orderedIds.indexOf(d.id);
        return idx >= 0 ? { ...d, order: idx + 1 } : d;
      }),
    });
  } else {
    patch({
      events: state.events.map((e) => {
        if (e.scenarioId !== scenarioId) return e;
        const idx = orderedIds.indexOf(e.id);
        return idx >= 0 ? { ...e, order: idx + 1 } : e;
      }),
    });
  }
  toast("Timeline mise à jour");
}

/* —— Consultants —— */
export function validateConsultant(id: string) {
  ensureHydrated();
  const sub = state.consultants.find((c) => c.id === id);
  if (!sub) return;
  patch({
    consultants: state.consultants.map((c) =>
      c.id === id ? { ...c, status: "valide" as const } : c
    ),
    scenarios: state.scenarios.map((s) =>
      s.id === sub.scenarioId
        ? {
            ...s,
            statut: "publie" as const,
            consultantPercent: sub.percent,
          }
        : s
    ),
  });
  toast("Scénario consultant validé");
}

export function refuseConsultant(id: string) {
  ensureHydrated();
  const sub = state.consultants.find((c) => c.id === id);
  patch({
    consultants: state.consultants.map((c) =>
      c.id === id ? { ...c, status: "refuse" as const } : c
    ),
    scenarios: sub
      ? state.scenarios.map((s) =>
          s.id === sub.scenarioId
            ? { ...s, statut: "archive" as const }
            : s
        )
      : state.scenarios,
  });
  toast("Scénario consultant refusé");
}

export function updateConsultantPercent(id: string, percent: number) {
  ensureHydrated();
  patch({
    consultants: state.consultants.map((c) =>
      c.id === id ? { ...c, percent } : c
    ),
  });
  toast("Pourcentage consultant mis à jour");
}

export function clearAdminToast() {
  ensureHydrated();
  if (!state.toast) return;
  persist({ ...state, toast: null });
}

export function resetAdminData() {
  const seed = createAdminSeed();
  persist(seed);
  toast("Données admin réinitialisées");
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AdminState {
  ensureHydrated();
  return state;
}

function getServerSnapshot(): AdminState {
  return createAdminSeed();
}

export function useAdminStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    createScenario,
    updateScenario,
    duplicateScenario,
    archiveScenario,
    publishScenario,
    reorderScenarios,
    createEntreprise,
    updateEntreprise,
    createPersonnage,
    updatePersonnage,
    createDecision,
    updateDecision,
    deleteDecision,
    createEvent,
    updateEvent,
    deleteEvent,
    reorderTimeline,
    validateConsultant,
    refuseConsultant,
    updateConsultantPercent,
    clearAdminToast,
    resetAdminData,
  };
}

export type { AdminConsultantSubmission };
