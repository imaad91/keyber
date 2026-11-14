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
    nom:
      e.nom ??
      fields["Nom"] ??
      (fields as Record<string, string>)["Nom de l'événement"] ??
      "",
    type:
      e.type ??
      fields[
        "Type (Logistique/Technique/Humain/Client/Fournisseur/Météo/Réglementation)"
      ] ??
      (fields as Record<string, string>)[
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
    nom: fields["Nom"].trim(),
    type: fields[
      "Type (Logistique/Technique/Humain/Client/Fournisseur/Météo/Réglementation)"
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
     * Listing Atelier : 1 ligne = 1 entreprise / 1 fichier événements.
     * Pas de bibliothèque partagée entre entreprises.
     */
    listEntrepriseFiles(): EntrepriseEventsFile[] {
      ensure();
      const byFamily = new Map<string, AtelierEntrepriseEvent[]>();
      for (const e of bag().state.events) {
        const list = byFamily.get(e.familyId) ?? [];
        list.push(e);
        byFamily.set(e.familyId, list);
      }
      const files: EntrepriseEventsFile[] = [];
      for (const [familyId, list] of Array.from(byFamily.entries())) {
        const nom = list[0]?.entrepriseNom?.trim() || "Entreprise";
        const importedAt = list
          .map((x) => x.updatedAt || x.createdAt)
          .sort()
          .slice(-1)[0]!;
        files.push({
          familyId,
          entrepriseNom: nom,
          eventCount: list.length,
          importedAt,
          label: eventsFileLabel(nom),
        });
      }
      return files.sort((a, b) =>
        b.importedAt.localeCompare(a.importedAt)
      );
    },
    deleteEntrepriseFile(familyId: string): { error?: string } {
      ensure();
      const b = bag();
      const before = b.state.events.length;
      const next = b.state.events.filter((e) => e.familyId !== familyId);
      if (next.length === before) {
        return { error: "Fichier événements introuvable pour cette entreprise" };
      }
      const nom =
        b.state.events.find((e) => e.familyId === familyId)?.entrepriseNom ??
        "cette entreprise";
      persist({
        ...b.state,
        events: next,
        toast: `${eventsFileLabel(nom)} supprimé`,
      });
      return {};
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
        const nom = fields["Nom"]?.trim();
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

export type EntrepriseEventsFile = {
  familyId: string;
  entrepriseNom: string;
  eventCount: number;
  importedAt: string;
  label: string;
};

/** Ex. « Fichier Événements d'AgriBio » / « Fichier Événements de Novacier ». */
export function eventsFileLabel(entrepriseNom: string): string {
  const nom = entrepriseNom.trim() || "Entreprise";
  const elision = /^[aeiouyhàâäéèêëïîôùûüç]/i.test(nom);
  return elision
    ? `Fichier Événements d'${nom}`
    : `Fichier Événements de ${nom}`;
}

/** Phrase obligatoire dans le Prompt IA Création. */
export function eventsPromptRule(entrepriseNom: string): string {
  return `Utilise automatiquement tous les événements importés pour cette entreprise (${entrepriseNom}). N'invente aucun nouvel événement. N'utilise pas les événements d'une autre entreprise. Il n'y a pas de sélection à faire pour les événements, ils sont déjà liés à l'entreprise.`;
}
