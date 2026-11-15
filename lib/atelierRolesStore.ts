/**
 * Atelier — bibliothèque globale de Rôles (Excel → localStorage).
 * Créés une fois ici, sélectionnés ensuite dans Création.
 * keyber-studio-roles-v1 — pas de contenu inventé.
 */

"use client";

import { useSyncExternalStore } from "react";
import { uid } from "@/lib/adminTypes";
import {
  emptyRoleFields,
  type RoleExcelFields,
} from "@/lib/atelierRolesExcel";

const STORAGE_KEY = "keyber-studio-roles-v1";

export type AtelierBibliothequeRole = {
  id: string;
  nom: string;
  description: string;
  mission: string;
  fields: RoleExcelFields;
  createdAt: string;
  updatedAt: string;
};

type RolesState = {
  roles: AtelierBibliothequeRole[];
  toast: string | null;
};

function now() {
  return new Date().toISOString();
}

function emptyState(): RolesState {
  return { roles: [], toast: null };
}

function normalizeRole(
  r: Partial<AtelierBibliothequeRole> & { id: string }
): AtelierBibliothequeRole {
  const fields = { ...emptyRoleFields(), ...(r.fields ?? {}) };
  return {
    id: r.id,
    nom: r.nom ?? fields["Nom du rôle"] ?? "",
    description: r.description ?? fields["Description complète"] ?? "",
    mission: r.mission ?? fields["Mission principale"] ?? "",
    fields,
    createdAt: r.createdAt ?? now(),
    updatedAt: r.updatedAt ?? now(),
  };
}

function load(): RolesState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<RolesState>;
    return {
      roles: Array.isArray(parsed.roles)
        ? parsed.roles.map((x) =>
            normalizeRole(x as AtelierBibliothequeRole)
          )
        : [],
      toast: null,
    };
  } catch {
    return emptyState();
  }
}

let state: RolesState = emptyState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: RolesState) {
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

function fromFields(fields: RoleExcelFields): AtelierBibliothequeRole {
  const at = now();
  return {
    id: uid("rolelib"),
    nom: fields["Nom du rôle"].trim(),
    description: fields["Description complète"].trim(),
    mission: fields["Mission principale"].trim(),
    fields: { ...emptyRoleFields(), ...fields },
    createdAt: at,
    updatedAt: at,
  };
}

export function useAtelierRolesStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    getRole(id: string) {
      return state.roles.find((r) => r.id === id);
    },
    /**
     * Import additif : ajoute les nouveaux rôles sans modifier / supprimer
     * les existants. Homonymes (même nom, insensible à la casse) ignorés.
     */
    validateRolesSubmission(rows: RoleExcelFields[]): {
      added: number;
      skipped: number;
      error?: string;
    } {
      ensure();
      if (!rows.length) return { added: 0, skipped: 0, error: "Aucun rôle" };

      const existingNames = new Set(
        state.roles.map((r) => r.nom.trim().toLowerCase())
      );
      const toAdd: AtelierBibliothequeRole[] = [];
      let skipped = 0;

      for (const fields of rows) {
        const nom = fields["Nom du rôle"]?.trim();
        if (!nom) {
          skipped += 1;
          continue;
        }
        const key = nom.toLowerCase();
        if (existingNames.has(key)) {
          skipped += 1;
          continue;
        }
        existingNames.add(key);
        toAdd.push(fromFields(fields));
      }

      if (!toAdd.length) {
        return {
          added: 0,
          skipped,
          error:
            skipped > 0
              ? "Aucun nouveau rôle : tous existaient déjà ou étaient vides"
              : "Aucun rôle à ajouter",
        };
      }

      persist({
        ...state,
        roles: [...toAdd, ...state.roles],
        toast:
          skipped > 0
            ? `${toAdd.length} rôle(s) ajouté(s), ${skipped} ignoré(s)`
            : `${toAdd.length} rôle(s) ajouté(s)`,
      });
      return { added: toAdd.length, skipped };
    },
    deleteRole(id: string): { error?: string } {
      ensure();
      if (!state.roles.some((r) => r.id === id)) {
        return { error: "Rôle introuvable" };
      }
      persist({
        ...state,
        roles: state.roles.filter((r) => r.id !== id),
        toast: "Rôle supprimé",
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
