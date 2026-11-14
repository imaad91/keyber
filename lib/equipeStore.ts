/**
 * Équipe — the ONLY Admin space where the human edits users / parties.
 * Separate localStorage from game + from Studio content seed.
 */

"use client";

import { useSyncExternalStore } from "react";
import { uid } from "@/lib/adminTypes";

const STORAGE_KEY = "keyber-studio-equipe-v1";

export type EquipeRole = "admin" | "testeur" | "consultant" | "joueur";

export type EquipeUser = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: EquipeRole;
  actif: boolean;
  createdAt: string;
  lastAccessAt: string | null;
  tempPassword?: string;
};

export type EquipePartie = {
  id: string;
  userId: string;
  scenarioId: string;
  scenarioTitre: string;
  contexteNom: string;
  competencesTravaillees: string[];
  progression: number; // 0-100
  score: number;
  bloqueSur: string | null;
  updatedAt: string;
};

type EquipeState = {
  users: EquipeUser[];
  parties: EquipePartie[];
  toast: string | null;
};

export const ROLE_LABELS: Record<EquipeRole, string> = {
  admin: "Admin",
  testeur: "Testeur",
  consultant: "Consultant",
  joueur: "Joueur / Apprenant",
};

function seedOwner(): EquipeUser {
  return {
    id: "user-admin-me",
    prenom: "Admin",
    nom: "KEYBER",
    email: "admin@keyber.local",
    role: "admin",
    actif: true,
    createdAt: "2026-11-08T10:00:00.000Z",
    lastAccessAt: new Date().toISOString(),
  };
}

function emptyState(): EquipeState {
  return { users: [seedOwner()], parties: [], toast: null };
}

function load(): EquipeState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<EquipeState>;
    const users = parsed.users?.length ? parsed.users : [seedOwner()];
    if (!users.some((u) => u.id === "user-admin-me")) {
      users.unshift(seedOwner());
    }
    return {
      users,
      parties: parsed.parties ?? [],
      toast: null,
    };
  } catch {
    return emptyState();
  }
}

let state: EquipeState = emptyState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: EquipeState) {
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
  // First visit: do not write until a mutation — keeps storage clean.
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

export function useEquipeStore() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    ...current,
    addUser(input: {
      prenom: string;
      nom: string;
      email: string;
      role: EquipeRole;
      tempPassword: string;
    }): EquipeUser {
      ensure();
      const u: EquipeUser = {
        id: uid("user"),
        prenom: input.prenom.trim(),
        nom: input.nom.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
        actif: true,
        createdAt: new Date().toISOString(),
        lastAccessAt: null,
        tempPassword: input.tempPassword,
      };
      persist({ ...state, users: [...state.users, u], toast: "Utilisateur ajouté" });
      return u;
    },
    updateUser(id: string, patch: Partial<EquipeUser>) {
      ensure();
      persist({
        ...state,
        users: state.users.map((u) =>
          u.id === id
            ? {
                ...u,
                ...patch,
                id: u.id,
                createdAt: u.createdAt,
              }
            : u
        ),
        toast: "Utilisateur enregistré",
      });
    },
    deactivateUser(id: string) {
      ensure();
      if (id === "user-admin-me") {
        persist({ ...state, toast: "Impossible de désactiver le compte Admin" });
        return;
      }
      persist({
        ...state,
        users: state.users.map((u) =>
          u.id === id ? { ...u, actif: false } : u
        ),
        toast: "Utilisateur désactivé",
      });
    },
    clearToast() {
      ensure();
      if (!state.toast) return;
      persist({ ...state, toast: null });
    },
    partiesForUser(userId: string) {
      return state.parties.filter((p) => p.userId === userId);
    },
  };
}
