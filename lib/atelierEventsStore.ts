/**
 * Atelier — événements aléatoires liés à une entreprise (familyId).
 * Pas de partage entre entreprises. keyber-studio-evenements-v1.
 * Studio only — pas de contenu inventé.
 */

"use client";

import { useSyncExternalStore } from "react";
import { uid } from "@/lib/adminTypes";
import {
  emptyEventFields,
  type EventExcelFields,
} from "@/lib/atelierEventsExcel";

const STORAGE_KEY = "keyber-studio-evenements-v1";

export type AtelierEntrepriseEvent = {
  id: string;
  /** Famille de création = entreprise (AgriBio ≠ Novacier). */
  familyId: string;
  entrepriseNom: string;
  nom: string;
  type: string;
  description: string;
  fields: EventExcelFields;
  createdAt: string;
  updatedAt: string;
};

type EventsState = {
  events: AtelierEntrepriseEvent[];
  toast: string | null;
};

function now() {
  return new Date().toISOString();
}

function emptyState(): EventsState {
  return { events: [], toast: null };
}

function normalizeEvent(
  e: Partial<AtelierEntrepriseEvent> & { id: string; familyId: string }
): AtelierEntrepriseEvent {
  const fields = { ...emptyEventFields(), ...(e.fields ?? {}) };
  return {
    id: e.id,
    familyId: e.familyId,
    entrepriseNom: e.entrepriseNom ?? "",
    nom: e.nom ?? fields["Nom de l'événement"] ?? "",
    type:
      e.type ??
      fields[
        "Type (ex : Logistique, Technique, Humain, Client, Fournisseur, Météo, Réglementation)"
      ] ??
      "",
    description: e.description ?? fields["Description complète"] ?? "",
    fields,
    createdAt: e.createdAt ?? now(),
    updatedAt: e.updatedAt ?? now(),
  };
}

function load(): EventsState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<EventsState>;
    return {
      events: Array.isArray(parsed.events)
        ? parsed.events.map((x) =>
            normalizeEvent(x as AtelierEntrepriseEvent)
          )
        : [],
      toast: null,
    };
  } catch {
    return emptyState();
  }
}

type EventsBag = {
  state: EventsState;
  hydrated: boolean;
  listeners: Set<() => void>;
};

function bag(): EventsBag {
  if (typeof window === "undefined") {
    return {
      state: emptyState(),
      hydrated: false,
      listeners: new Set(),
    };
  }
  const w = window as unknown as { __keyberEventsStoreV1?: EventsBag };
  if (!w.__keyberEventsStoreV1) {
    w.__keyberEventsStoreV1 = {
      state: emptyState(),
      hydrated: false,
      listeners: new Set(),
    };
  }
  return w.__keyberEventsStoreV1;
}

function emit() {
  bag().listeners.forEach((l) => l());
}

function persist(next: EventsState) {
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

function fromFields(
  fields: EventExcelFields,
  familyId: string,
  entrepriseNom: string
): AtelierEntrepriseEvent {
  const at = now();
  return {
    id: uid("evtlib"),
    familyId,
    entrepriseNom,
    nom: fields["Nom de l'événement"].trim(),
    type: fields[
      "Type (ex : Logistique, Technique, Humain, Client, Fournisseur, Météo, Réglementation)"
    ].trim(),
    description: fields["Description complète"].trim(),
    fields: { ...emptyEventFields(), ...fields },
    createdAt: at,
    updatedAt: at,
  };
}

export function useAtelierEventsStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    /** Événements d'une seule entreprise (familyId). */
    getEventsForFamily(familyId: string) {
      return bag().state.events.filter((e) => e.familyId === familyId);
    },
    getEvent(id: string) {
      return bag().state.events.find((e) => e.id === id);
    },
    /**
     * Import additif pour une entreprise : n'efface pas les anciens.
     * Homonymes (même nom, même familyId) ignorés.
     */
    validateEventsSubmission(
      familyId: string,
      entrepriseNom: string,
      rows: EventExcelFields[]
    ): { added: number; skipped: number; error?: string } {
      ensure();
      if (!familyId) return { added: 0, skipped: 0, error: "Entreprise manquante" };
      if (!rows.length) return { added: 0, skipped: 0, error: "Aucun événement" };

      const b = bag();
      const existingNames = new Set(
        b.state.events
          .filter((e) => e.familyId === familyId)
          .map((e) => e.nom.trim().toLowerCase())
      );
      const toAdd: AtelierEntrepriseEvent[] = [];
      let skipped = 0;

      for (const fields of rows) {
        const nom = fields["Nom de l'événement"]?.trim();
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
        toAdd.push(fromFields(fields, familyId, entrepriseNom));
      }

      if (!toAdd.length) {
        return {
          added: 0,
          skipped,
          error:
            skipped > 0
              ? "Aucun nouvel événement : tous existaient déjà ou étaient vides"
              : "Aucun événement à ajouter",
        };
      }

      persist({
        ...b.state,
        events: [...toAdd, ...b.state.events],
        toast:
          skipped > 0
            ? `${toAdd.length} événement(s) ajouté(s) pour ${entrepriseNom}, ${skipped} ignoré(s)`
            : `${toAdd.length} événement(s) ajouté(s) pour ${entrepriseNom}`,
      });
      return { added: toAdd.length, skipped };
    },
    deleteEvent(id: string, familyId: string): { error?: string } {
      ensure();
      const b = bag();
      const ev = b.state.events.find((e) => e.id === id);
      if (!ev) return { error: "Événement introuvable" };
      if (ev.familyId !== familyId) {
        return { error: "Cet événement appartient à une autre entreprise" };
      }
      persist({
        ...b.state,
        events: b.state.events.filter((e) => e.id !== id),
        toast: "Événement supprimé",
      });
      return {};
    },
    clearToast() {
      ensure();
      const b = bag();
      if (!b.state.toast) return;
      persist({ ...b.state, toast: null });
    },
  };
}

/** Phrase obligatoire dans le Prompt IA — n'invente aucun événement. */
export function eventsPromptRule(entrepriseNom: string): string {
  return `Utilise uniquement les événements importés pour cette entreprise (${entrepriseNom}). N'invente aucun nouvel événement. N'utilise pas les événements d'une autre entreprise. Chaque entreprise a ses propres événements.`;
}
