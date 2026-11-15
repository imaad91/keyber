/**
 * Atelier — bibliothèque globale Compétences + Cours (Excel → localStorage).
 * Créés une fois ici, sélectionnés ensuite dans Création.
 * keyber-studio-competences-v1 — pas de contenu inventé.
 */

"use client";

import { useSyncExternalStore } from "react";
import { uid } from "@/lib/adminTypes";
import {
  emptyCompetenceFields,
  emptyCoursFields,
  validateCoursLinks,
  type CompetenceExcelFields,
  type CoursExcelFields,
} from "@/lib/atelierCompetencesExcel";

const STORAGE_KEY = "keyber-studio-competences-v1";

export type AtelierBibliothequeCours = {
  id: string;
  competenceId: string;
  titre: string;
  description: string;
  niveau: string;
  ordre: number;
  fields: CoursExcelFields;
  createdAt: string;
  updatedAt: string;
};

export type AtelierBibliothequeCompetence = {
  id: string;
  nom: string;
  categorie: string;
  type: string;
  description: string;
  fields: CompetenceExcelFields;
  createdAt: string;
  updatedAt: string;
};

type CompetencesState = {
  competences: AtelierBibliothequeCompetence[];
  cours: AtelierBibliothequeCours[];
  toast: string | null;
};

function now() {
  return new Date().toISOString();
}

function emptyState(): CompetencesState {
  return { competences: [], cours: [], toast: null };
}

function parseOrdre(raw: string): number {
  const n = Number.parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

function normalizeCompetence(
  c: Partial<AtelierBibliothequeCompetence> & { id: string }
): AtelierBibliothequeCompetence {
  const fields = { ...emptyCompetenceFields(), ...(c.fields ?? {}) };
  return {
    id: c.id,
    nom: c.nom ?? fields["Nom de la compétence"] ?? "",
    categorie: c.categorie ?? fields["Catégorie"] ?? "",
    type: c.type ?? fields["Type (Transverse ou Ciblée)"] ?? "",
    description: c.description ?? fields["Description complète"] ?? "",
    fields,
    createdAt: c.createdAt ?? now(),
    updatedAt: c.updatedAt ?? now(),
  };
}

function normalizeCours(
  c: Partial<AtelierBibliothequeCours> & { id: string; competenceId: string }
): AtelierBibliothequeCours {
  const fields = { ...emptyCoursFields(), ...(c.fields ?? {}) };
  return {
    id: c.id,
    competenceId: c.competenceId,
    titre: c.titre ?? fields["Titre du cours"] ?? "",
    description: c.description ?? fields["Description en 1 phrase"] ?? "",
    niveau: c.niveau ?? fields["Niveau (Débutant / Intermédiaire / Expert)"] ?? "",
    ordre: c.ordre ?? parseOrdre(fields["Ordre dans la compétence"] ?? ""),
    fields,
    createdAt: c.createdAt ?? now(),
    updatedAt: c.updatedAt ?? now(),
  };
}

function load(): CompetencesState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<CompetencesState>;
    return {
      competences: Array.isArray(parsed.competences)
        ? parsed.competences.map((x) =>
            normalizeCompetence(x as AtelierBibliothequeCompetence)
          )
        : [],
      cours: Array.isArray(parsed.cours)
        ? parsed.cours.map((x) =>
            normalizeCours(x as AtelierBibliothequeCours)
          )
        : [],
      toast: null,
    };
  } catch {
    return emptyState();
  }
}

let state: CompetencesState = emptyState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: CompetencesState) {
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

function competenceFromFields(
  fields: CompetenceExcelFields
): AtelierBibliothequeCompetence {
  const at = now();
  return {
    id: uid("complib"),
    nom: fields["Nom de la compétence"].trim(),
    categorie: fields["Catégorie"].trim(),
    type: fields["Type (Transverse ou Ciblée)"].trim(),
    description: fields["Description complète"].trim(),
    fields: { ...emptyCompetenceFields(), ...fields },
    createdAt: at,
    updatedAt: at,
  };
}

function coursFromFields(
  fields: CoursExcelFields,
  competenceId: string
): AtelierBibliothequeCours {
  const at = now();
  return {
    id: uid("courslib"),
    competenceId,
    titre: fields["Titre du cours"].trim(),
    description: fields["Description en 1 phrase"].trim(),
    niveau: fields["Niveau (Débutant / Intermédiaire / Expert)"].trim(),
    ordre: parseOrdre(fields["Ordre dans la compétence"]),
    fields: { ...emptyCoursFields(), ...fields },
    createdAt: at,
    updatedAt: at,
  };
}

export function useAtelierCompetencesStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    getCompetence(id: string) {
      return state.competences.find((c) => c.id === id);
    },
    getCoursForCompetence(competenceId: string) {
      return state.cours
        .filter((c) => c.competenceId === competenceId)
        .slice()
        .sort((a, b) => a.ordre - b.ordre || a.titre.localeCompare(b.titre));
    },
    /**
     * Vérifie les liens cours → compétence (fichier + bibliothèque).
     * Message exact demandé si inconnu : « Cette compétence n'existe pas, corrige le nom. »
     */
    checkImportLinks(
      competences: CompetenceExcelFields[],
      cours: CoursExcelFields[]
    ): { ok: true } | { ok: false; error: string } {
      ensure();
      return validateCoursLinks(
        competences,
        cours,
        state.competences.map((c) => c.nom)
      );
    },
    /**
     * Import additif : ajoute compétences / cours sans effacer l'existant.
     * Homonymes de compétence ignorés. Cours déjà présents (même titre sous
     * la même compétence) ignorés.
     */
    validateCompetencesSubmission(
      competenceRows: CompetenceExcelFields[],
      coursRows: CoursExcelFields[]
    ): {
      addedCompetences: number;
      addedCours: number;
      skipped: number;
      error?: string;
    } {
      ensure();

      const linkCheck = validateCoursLinks(
        competenceRows,
        coursRows,
        state.competences.map((c) => c.nom)
      );
      if (!linkCheck.ok) {
        return {
          addedCompetences: 0,
          addedCours: 0,
          skipped: 0,
          error: linkCheck.error,
        };
      }

      const existingNames = new Map(
        state.competences.map((c) => [c.nom.trim().toLowerCase(), c.id] as const)
      );
      const toAddCompetences: AtelierBibliothequeCompetence[] = [];
      let skipped = 0;

      for (const fields of competenceRows) {
        const nom = fields["Nom de la compétence"]?.trim();
        if (!nom) {
          skipped += 1;
          continue;
        }
        const key = nom.toLowerCase();
        if (existingNames.has(key)) {
          skipped += 1;
          continue;
        }
        const created = competenceFromFields(fields);
        existingNames.set(key, created.id);
        toAddCompetences.push(created);
      }

      const nameToId = new Map(existingNames);
      const existingCoursKeys = new Set(
        state.cours.map((c) => {
          const parent = state.competences.find((x) => x.id === c.competenceId);
          return `${(parent?.nom ?? "").toLowerCase()}::${c.titre.trim().toLowerCase()}`;
        })
      );
      // Also account for competences about to be added
      for (const c of toAddCompetences) {
        void c;
      }

      const toAddCours: AtelierBibliothequeCours[] = [];
      for (const fields of coursRows) {
        const linked = fields["Nom de la compétence liée"]?.trim();
        const titre = fields["Titre du cours"]?.trim();
        if (!linked || !titre) {
          skipped += 1;
          continue;
        }
        const competenceId = nameToId.get(linked.toLowerCase());
        if (!competenceId) {
          return {
            addedCompetences: 0,
            addedCours: 0,
            skipped: 0,
            error: "Cette compétence n'existe pas, corrige le nom.",
          };
        }
        const key = `${linked.toLowerCase()}::${titre.toLowerCase()}`;
        if (existingCoursKeys.has(key)) {
          skipped += 1;
          continue;
        }
        existingCoursKeys.add(key);
        toAddCours.push(coursFromFields(fields, competenceId));
      }

      if (!toAddCompetences.length && !toAddCours.length) {
        return {
          addedCompetences: 0,
          addedCours: 0,
          skipped,
          error:
            skipped > 0
              ? "Aucun nouvel élément : tout existait déjà ou était vide"
              : "Rien à ajouter",
        };
      }

      const parts: string[] = [];
      if (toAddCompetences.length)
        parts.push(`${toAddCompetences.length} compétence(s)`);
      if (toAddCours.length) parts.push(`${toAddCours.length} cours`);
      const toast =
        skipped > 0
          ? `${parts.join(" + ")} ajouté(s), ${skipped} ignoré(s)`
          : `${parts.join(" + ")} ajouté(s)`;

      persist({
        ...state,
        competences: [...toAddCompetences, ...state.competences],
        cours: [...toAddCours, ...state.cours],
        toast,
      });

      return {
        addedCompetences: toAddCompetences.length,
        addedCours: toAddCours.length,
        skipped,
      };
    },
    deleteCompetence(id: string): { error?: string } {
      ensure();
      if (!state.competences.some((c) => c.id === id)) {
        return { error: "Compétence introuvable" };
      }
      persist({
        ...state,
        competences: state.competences.filter((c) => c.id !== id),
        cours: state.cours.filter((c) => c.competenceId !== id),
        toast: "Compétence et cours liés supprimés",
      });
      return {};
    },
    deleteCours(id: string): { error?: string } {
      ensure();
      if (!state.cours.some((c) => c.id === id)) {
        return { error: "Cours introuvable" };
      }
      persist({
        ...state,
        cours: state.cours.filter((c) => c.id !== id),
        toast: "Cours supprimé",
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
