/**
 * Atelier — Chantier / Création (pipeline de création d'un contexte).
 * Studio-only localStorage, séparé du jeu.
 */

"use client";

import { useSyncExternalStore } from "react";
import { uid } from "@/lib/adminTypes";

const STORAGE_KEY = "keyber-studio-chantier-v1";

export type ChantierEtapeStatut =
  | "a_faire"
  | "en_cours"
  | "bloque"
  | "valide";

export const CHANTIER_ETAPE_STATUT_LABELS: Record<
  ChantierEtapeStatut,
  string
> = {
  a_faire: "À faire",
  en_cours: "En cours",
  bloque: "Bloqué",
  valide: "Validé",
};

export type ChantierEtapeDef = {
  numero: 1 | 2 | 3 | 4 | 5 | 6;
  nom: string;
  description: string;
};

/** Ordre fixe des 6 étapes — ne pas réordonner. */
export const CHANTIER_ETAPES: ChantierEtapeDef[] = [
  {
    numero: 1,
    nom: "Données brutes → Fiche Contexte",
    description:
      "Rassembler les données brutes et bâtir la fiche du contexte d'entreprise.",
  },
  {
    numero: 2,
    nom: "Rôles",
    description: "Définir les rôles jouables pour ce contexte.",
  },
  {
    numero: 3,
    nom: "Compétences + Cours",
    description: "Lister les compétences et les cours associés au contexte.",
  },
  {
    numero: 4,
    nom: "Scénarios Mode Compétence",
    description: "Écrire les scénarios du mode Compétence.",
  },
  {
    numero: 5,
    nom: "Scénarios Mode Histoire",
    description: "Écrire les scénarios du mode Histoire.",
  },
  {
    numero: 6,
    nom: "Test + Corrections",
    description: "Tester le parcours et appliquer les corrections.",
  },
];

export type ChantierEtapeState = {
  numero: 1 | 2 | 3 | 4 | 5 | 6;
  statut: ChantierEtapeStatut;
  /** Texte utilisateur quand l'étape est bloquée. */
  motifBlocage: string;
};

export type AtelierChantier = {
  id: string;
  /** Nom du contexte à créer (ex. AgriBio). */
  nom: string;
  secteurId: string;
  createdAt: string;
  updatedAt: string;
  /** true une fois publié dans l'Atelier (publication réelle plus tard). */
  publie: boolean;
  etapes: ChantierEtapeState[];
};

type ChantierState = {
  chantiers: AtelierChantier[];
  toast: string | null;
};

function now() {
  return new Date().toISOString();
}

function emptyEtapes(): ChantierEtapeState[] {
  return CHANTIER_ETAPES.map((e) => ({
    numero: e.numero,
    statut: "a_faire" as const,
    motifBlocage: "",
  }));
}

function emptyState(): ChantierState {
  return { chantiers: [], toast: null };
}

function load(): ChantierState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ChantierState>;
    const chantiers = Array.isArray(parsed.chantiers)
      ? parsed.chantiers.map(normalizeChantier)
      : [];
    return { chantiers, toast: null };
  } catch {
    return emptyState();
  }
}

function normalizeChantier(
  c: Partial<AtelierChantier> & { id: string }
): AtelierChantier {
  const base = emptyEtapes();
  const byNum = new Map(
    (c.etapes ?? []).map((e) => [e.numero, e] as const)
  );
  return {
    id: c.id,
    nom: c.nom ?? "",
    secteurId: c.secteurId ?? "",
    createdAt: c.createdAt ?? now(),
    updatedAt: c.updatedAt ?? now(),
    publie: Boolean(c.publie),
    etapes: base.map((e) => {
      const prev = byNum.get(e.numero);
      if (!prev) return e;
      const statut = (
        ["a_faire", "en_cours", "bloque", "valide"] as ChantierEtapeStatut[]
      ).includes(prev.statut)
        ? prev.statut
        : "a_faire";
      return {
        numero: e.numero,
        statut,
        motifBlocage: prev.motifBlocage ?? "",
      };
    }),
  };
}

let state: ChantierState = emptyState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: ChantierState) {
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

export function countEtapesValidees(c: AtelierChantier): number {
  return c.etapes.filter((e) => e.statut === "valide").length;
}

export function isChantierPretAPublier(c: AtelierChantier): boolean {
  return c.etapes.length === 6 && c.etapes.every((e) => e.statut === "valide");
}

/** Une étape précédente bloquée empêche d'avancer sur les suivantes. */
export function hasEtapePrecedenteBloquee(
  c: AtelierChantier,
  numero: number
): boolean {
  return c.etapes.some((e) => e.numero < numero && e.statut === "bloque");
}

export function buildPromptCorrection(
  chantierNom: string,
  numero: number,
  motif: string
): string {
  return `Corrige uniquement l'Étape ${numero}, pour le Chantier ${chantierNom}. Ne touche à rien d'autre. Ne touche pas aux autres étapes. Ne touche pas à l'Atelier. Ne touche pas au jeu. Voilà ce qui est bloqué : ${motif}. Corrige exactement ça.`;
}

export function useAtelierChantierStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    getChantier(id: string) {
      return state.chantiers.find((c) => c.id === id);
    },
    createChantier(input: {
      nom: string;
      secteurId: string;
    }): AtelierChantier | { error: string } {
      ensure();
      const nom = input.nom.trim();
      if (!nom) return { error: "Nom du contexte à créer obligatoire" };
      if (!input.secteurId) return { error: "Secteur obligatoire" };
      const c: AtelierChantier = {
        id: uid("chantier"),
        nom,
        secteurId: input.secteurId,
        createdAt: now(),
        updatedAt: now(),
        publie: false,
        etapes: emptyEtapes(),
      };
      persist({
        ...state,
        chantiers: [c, ...state.chantiers],
        toast: "Chantier créé",
      });
      return c;
    },
    deleteChantier(id: string): { error?: string } {
      ensure();
      const c = state.chantiers.find((x) => x.id === id);
      if (!c) return { error: "Chantier introuvable" };
      if (c.publie) {
        return { error: "Impossible de supprimer un chantier déjà publié" };
      }
      persist({
        ...state,
        chantiers: state.chantiers.filter((x) => x.id !== id),
        toast: "Chantier supprimé",
      });
      return {};
    },
    setEtapeStatut(
      chantierId: string,
      numero: 1 | 2 | 3 | 4 | 5 | 6,
      statut: ChantierEtapeStatut,
      motifBlocage?: string
    ): { error?: string } {
      ensure();
      const c = state.chantiers.find((x) => x.id === chantierId);
      if (!c) return { error: "Chantier introuvable" };
      if (statut !== "a_faire" && hasEtapePrecedenteBloquee(c, numero)) {
        return {
          error:
            "Une étape précédente est bloquée — débloquez-la avant de continuer",
        };
      }
      if (statut === "bloque") {
        const motif = (motifBlocage ?? "").trim();
        if (!motif) {
          return {
            error: "Indiquez ce qui ne vous plaît pas avant de bloquer",
          };
        }
      }
      persist({
        ...state,
        chantiers: state.chantiers.map((ch) =>
          ch.id !== chantierId
            ? ch
            : {
                ...ch,
                updatedAt: now(),
                etapes: ch.etapes.map((e) =>
                  e.numero !== numero
                    ? e
                    : {
                        ...e,
                        statut,
                        motifBlocage:
                          statut === "bloque"
                            ? (motifBlocage ?? "").trim()
                            : "",
                      }
                ),
              }
        ),
        toast:
          statut === "valide"
            ? `Étape ${numero} validée`
            : statut === "bloque"
              ? `Étape ${numero} bloquée`
              : statut === "en_cours"
                ? `Étape ${numero} en cours`
                : "Étape mise à jour",
      });
      return {};
    },
    /** Placeholder — publication réelle plus tard. */
    attemptPublish(id: string): { error?: string; message?: string } {
      ensure();
      const c = state.chantiers.find((x) => x.id === id);
      if (!c) return { error: "Chantier introuvable" };
      if (!isChantierPretAPublier(c)) {
        return {
          error: "Les 6 étapes doivent être validées avant de publier",
        };
      }
      return { message: "Publication à implémenter plus tard" };
    },
    clearToast() {
      ensure();
      if (!state.toast) return;
      persist({ ...state, toast: null });
    },
  };
}
