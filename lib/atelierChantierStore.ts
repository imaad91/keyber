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
  /** Rempli à l'Étape 1 (création secteur). */
  secteurId: string;
  /** Contexte brouillon / publié lié (créé à l'Étape 1). */
  contexteId: string;
  createdAt: string;
  updatedAt: string;
  /** true une fois publié dans l'Atelier. */
  publie: boolean;
  etapes: ChantierEtapeState[];
};

/** Catégories proposées — l'utilisateur peut en créer d'autres. */
export const CHANTIER_CATEGORIES_DEFAUT = [
  "Production",
  "Logistique",
  "Qualité",
  "Management",
] as const;

export type ChantierCompetenceType = "transverse" | "ciblee";

export const CHANTIER_COMPETENCE_TYPE_LABELS: Record<
  ChantierCompetenceType,
  string
> = {
  transverse: "Transverse",
  ciblee: "Ciblée",
};

/** Cours lié à une compétence de chantier (Étape 3) — pas publié dans Atelier. */
export type ChantierCours = {
  id: string;
  titre: string;
  contenu: string;
  formule: string;
  exempleChiffre: string;
  erreursFrequentes: string;
  createdAt: string;
  updatedAt: string;
};

/** Compétence de chantier (Étape 3) — brouillon, hors Atelier > Compétences. */
export type ChantierCompetence = {
  id: string;
  chantierId: string;
  nom: string;
  categorie: string;
  description: string;
  type: ChantierCompetenceType;
  cours: ChantierCours[];
  createdAt: string;
  updatedAt: string;
};

/** Choix d'une décision Mode Compétence (Étape 4) — pas de rôle. */
export type ChantierDecisionChoix = {
  id: string;
  texte: string;
  /** true = bonne réponse */
  correct: boolean;
  feedback: string;
};

export type ChantierDecisionModeCompetence = {
  id: string;
  texte: string;
  choix: ChantierDecisionChoix[];
  /** false si l'utilisateur signale que la décision ne travaille pas la compétence */
  lieeACompetence: boolean;
};

/**
 * Scénario Mode Compétence (Étape 4) — entraînement intensif.
 * JAMAIS de rôle : une seule compétence précise.
 */
export type ChantierScenarioModeCompetence = {
  id: string;
  chantierId: string;
  titre: string;
  /** Exactement 1 compétence (Étape 3). */
  competenceId: string;
  description: string;
  /** Ordre linéaire : Décision 1 → 2 → 3 → Fin */
  decisions: ChantierDecisionModeCompetence[];
  createdAt: string;
  updatedAt: string;
};

type ChantierState = {
  chantiers: AtelierChantier[];
  /** Compétences + cours créés dans les chantiers (Étape 3). */
  competences: ChantierCompetence[];
  /** Scénarios Mode Compétence (Étape 4) — brouillon chantier. */
  scenariosModeCompetence: ChantierScenarioModeCompetence[];
  /** Catégories créées par l'utilisateur (en plus des défauts). */
  categoriesCustom: string[];
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
  return {
    chantiers: [],
    competences: [],
    scenariosModeCompetence: [],
    categoriesCustom: [],
    toast: null,
  };
}

function normalizeDecisionChoix(
  c: Partial<ChantierDecisionChoix> & { id: string }
): ChantierDecisionChoix {
  return {
    id: c.id,
    texte: c.texte ?? "",
    correct: Boolean(c.correct),
    feedback: c.feedback ?? "",
  };
}

function normalizeDecision(
  d: Partial<ChantierDecisionModeCompetence> & { id: string }
): ChantierDecisionModeCompetence {
  return {
    id: d.id,
    texte: d.texte ?? "",
    choix: Array.isArray(d.choix)
      ? d.choix.map((x) => normalizeDecisionChoix(x as ChantierDecisionChoix))
      : [],
    lieeACompetence: d.lieeACompetence !== false,
  };
}

function normalizeScenarioModeCompetence(
  s: Partial<ChantierScenarioModeCompetence> & { id: string }
): ChantierScenarioModeCompetence {
  return {
    id: s.id,
    chantierId: s.chantierId ?? "",
    titre: s.titre ?? "",
    competenceId: s.competenceId ?? "",
    description: s.description ?? "",
    decisions: Array.isArray(s.decisions)
      ? s.decisions.map((d) =>
          normalizeDecision(d as ChantierDecisionModeCompetence)
        )
      : [],
    createdAt: s.createdAt ?? now(),
    updatedAt: s.updatedAt ?? now(),
  };
}

function normalizeCours(c: Partial<ChantierCours> & { id: string }): ChantierCours {
  return {
    id: c.id,
    titre: c.titre ?? "",
    contenu: c.contenu ?? "",
    formule: c.formule ?? "",
    exempleChiffre: c.exempleChiffre ?? "",
    erreursFrequentes: c.erreursFrequentes ?? "",
    createdAt: c.createdAt ?? now(),
    updatedAt: c.updatedAt ?? now(),
  };
}

function normalizeCompetence(
  c: Partial<ChantierCompetence> & { id: string }
): ChantierCompetence {
  const type: ChantierCompetenceType =
    c.type === "transverse" || c.type === "ciblee" ? c.type : "ciblee";
  return {
    id: c.id,
    chantierId: c.chantierId ?? "",
    nom: c.nom ?? "",
    categorie: c.categorie ?? "",
    description: c.description ?? "",
    type,
    cours: Array.isArray(c.cours)
      ? c.cours.map((x) => normalizeCours(x as ChantierCours))
      : [],
    createdAt: c.createdAt ?? now(),
    updatedAt: c.updatedAt ?? now(),
  };
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
    const competences = Array.isArray(parsed.competences)
      ? parsed.competences.map((x) =>
          normalizeCompetence(x as ChantierCompetence)
        )
      : [];
    const categoriesCustom = Array.isArray(parsed.categoriesCustom)
      ? parsed.categoriesCustom.filter(
          (x): x is string => typeof x === "string" && x.trim().length > 0
        )
      : [];
    const scenariosModeCompetence = Array.isArray(
      parsed.scenariosModeCompetence
    )
      ? parsed.scenariosModeCompetence.map((x) =>
          normalizeScenarioModeCompetence(x as ChantierScenarioModeCompetence)
        )
      : [];
    return {
      chantiers,
      competences,
      scenariosModeCompetence,
      categoriesCustom,
      toast: null,
    };
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
    contexteId: c.contexteId ?? "",
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
    createChantier(input: { nom: string }): AtelierChantier | { error: string } {
      ensure();
      const nom = input.nom.trim();
      if (!nom) return { error: "Nom du contexte à créer obligatoire" };
      const c: AtelierChantier = {
        id: uid("chantier"),
        nom,
        secteurId: "",
        contexteId: "",
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
    updateChantierLinks(
      id: string,
      patch: { secteurId?: string; contexteId?: string; nom?: string }
    ): { error?: string } {
      ensure();
      if (!state.chantiers.some((c) => c.id === id)) {
        return { error: "Chantier introuvable" };
      }
      persist({
        ...state,
        chantiers: state.chantiers.map((ch) =>
          ch.id !== id
            ? ch
            : {
                ...ch,
                secteurId:
                  patch.secteurId !== undefined
                    ? patch.secteurId
                    : ch.secteurId,
                contexteId:
                  patch.contexteId !== undefined
                    ? patch.contexteId
                    : ch.contexteId,
                nom: patch.nom !== undefined ? patch.nom.trim() || ch.nom : ch.nom,
                updatedAt: now(),
              }
        ),
        toast: null,
      });
      return {};
    },
    findChantierByContexteId(contexteId: string) {
      return state.chantiers.find((c) => c.contexteId === contexteId);
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
    setChantierPublie(id: string, publie: boolean): { error?: string } {
      ensure();
      if (!state.chantiers.some((c) => c.id === id)) {
        return { error: "Chantier introuvable" };
      }
      persist({
        ...state,
        chantiers: state.chantiers.map((ch) =>
          ch.id === id ? { ...ch, publie, updatedAt: now() } : ch
        ),
        toast: publie ? "Chantier publié" : "Chantier rouvert en modification",
      });
      return {};
    },
    /** Marque le chantier prêt ; la publication contexte se fait côté UI via atelierStore. */
    attemptPublish(id: string): { error?: string; ok?: boolean } {
      ensure();
      const c = state.chantiers.find((x) => x.id === id);
      if (!c) return { error: "Chantier introuvable" };
      if (!isChantierPretAPublier(c)) {
        return {
          error: "Les 6 étapes doivent être validées avant de publier",
        };
      }
      if (!c.contexteId) {
        return { error: "Étape 1 incomplète : aucun contexte lié" };
      }
      return { ok: true };
    },
    competencesForChantier(chantierId: string) {
      return state.competences.filter((c) => c.chantierId === chantierId);
    },
    listCategories(): string[] {
      const fromComps = state.competences.map((c) => c.categorie.trim());
      const all = [
        ...CHANTIER_CATEGORIES_DEFAUT,
        ...state.categoriesCustom,
        ...fromComps,
      ];
      return Array.from(
        new Set(all.filter((x) => x.length > 0))
      ).sort((a, b) => a.localeCompare(b, "fr"));
    },
    addCategorieCustom(nom: string): { error?: string } {
      ensure();
      const n = nom.trim();
      if (!n) return { error: "Nom de catégorie obligatoire" };
      if (
        CHANTIER_CATEGORIES_DEFAUT.some(
          (d) => d.toLowerCase() === n.toLowerCase()
        ) ||
        state.categoriesCustom.some((d) => d.toLowerCase() === n.toLowerCase())
      ) {
        return {};
      }
      persist({
        ...state,
        categoriesCustom: [...state.categoriesCustom, n],
        toast: null,
      });
      return {};
    },
    createCompetence(input: {
      chantierId: string;
      nom: string;
      categorie: string;
      description?: string;
      type: ChantierCompetenceType;
    }): ChantierCompetence | { error: string } {
      ensure();
      if (!state.chantiers.some((c) => c.id === input.chantierId)) {
        return { error: "Chantier introuvable" };
      }
      const nom = input.nom.trim();
      if (!nom) return { error: "Nom de la compétence obligatoire" };
      const categorie = input.categorie.trim();
      if (!categorie) return { error: "Catégorie obligatoire" };
      if (input.type !== "transverse" && input.type !== "ciblee") {
        return { error: "Type obligatoire (Transverse ou Ciblée)" };
      }
      const comp: ChantierCompetence = {
        id: uid("chcomp"),
        chantierId: input.chantierId,
        nom,
        categorie,
        description: (input.description ?? "").trim(),
        type: input.type,
        cours: [],
        createdAt: now(),
        updatedAt: now(),
      };
      let categoriesCustom = state.categoriesCustom;
      const isDefault = CHANTIER_CATEGORIES_DEFAUT.some(
        (d) => d.toLowerCase() === categorie.toLowerCase()
      );
      const alreadyCustom = categoriesCustom.some(
        (d) => d.toLowerCase() === categorie.toLowerCase()
      );
      if (!isDefault && !alreadyCustom) {
        categoriesCustom = [...categoriesCustom, categorie];
      }
      persist({
        ...state,
        competences: [comp, ...state.competences],
        categoriesCustom,
        toast: "Compétence ajoutée",
      });
      return comp;
    },
    updateCompetence(
      id: string,
      patch: Partial<
        Pick<
          ChantierCompetence,
          "nom" | "categorie" | "description" | "type"
        >
      >
    ): { error?: string } {
      ensure();
      const prev = state.competences.find((c) => c.id === id);
      if (!prev) return { error: "Compétence introuvable" };
      if (patch.nom !== undefined && !patch.nom.trim()) {
        return { error: "Nom de la compétence obligatoire" };
      }
      if (patch.categorie !== undefined && !patch.categorie.trim()) {
        return { error: "Catégorie obligatoire" };
      }
      const categorie =
        patch.categorie !== undefined
          ? patch.categorie.trim()
          : prev.categorie;
      let categoriesCustom = state.categoriesCustom;
      if (patch.categorie !== undefined) {
        const isDefault = CHANTIER_CATEGORIES_DEFAUT.some(
          (d) => d.toLowerCase() === categorie.toLowerCase()
        );
        const alreadyCustom = categoriesCustom.some(
          (d) => d.toLowerCase() === categorie.toLowerCase()
        );
        if (!isDefault && !alreadyCustom) {
          categoriesCustom = [...categoriesCustom, categorie];
        }
      }
      persist({
        ...state,
        categoriesCustom,
        competences: state.competences.map((c) =>
          c.id !== id
            ? c
            : {
                ...c,
                nom: patch.nom !== undefined ? patch.nom.trim() : c.nom,
                categorie,
                description:
                  patch.description !== undefined
                    ? patch.description.trim()
                    : c.description,
                type: patch.type ?? c.type,
                updatedAt: now(),
              }
        ),
        toast: "Compétence enregistrée",
      });
      return {};
    },
    deleteCompetence(id: string): { error?: string } {
      ensure();
      if (!state.competences.some((c) => c.id === id)) {
        return { error: "Compétence introuvable" };
      }
      persist({
        ...state,
        competences: state.competences.filter((c) => c.id !== id),
        toast: "Compétence supprimée",
      });
      return {};
    },
    createCours(
      competenceId: string,
      input: {
        titre: string;
        contenu?: string;
        formule?: string;
        exempleChiffre?: string;
        erreursFrequentes?: string;
      }
    ): ChantierCours | { error: string } {
      ensure();
      const comp = state.competences.find((c) => c.id === competenceId);
      if (!comp) return { error: "Compétence introuvable" };
      const titre = input.titre.trim();
      if (!titre) return { error: "Titre du cours obligatoire" };
      const cours: ChantierCours = {
        id: uid("chcours"),
        titre,
        contenu: (input.contenu ?? "").trim(),
        formule: (input.formule ?? "").trim(),
        exempleChiffre: (input.exempleChiffre ?? "").trim(),
        erreursFrequentes: (input.erreursFrequentes ?? "").trim(),
        createdAt: now(),
        updatedAt: now(),
      };
      persist({
        ...state,
        competences: state.competences.map((c) =>
          c.id !== competenceId
            ? c
            : {
                ...c,
                cours: [cours, ...c.cours],
                updatedAt: now(),
              }
        ),
        toast: "Cours ajouté",
      });
      return cours;
    },
    updateCours(
      competenceId: string,
      coursId: string,
      patch: Partial<
        Pick<
          ChantierCours,
          | "titre"
          | "contenu"
          | "formule"
          | "exempleChiffre"
          | "erreursFrequentes"
        >
      >
    ): { error?: string } {
      ensure();
      const comp = state.competences.find((c) => c.id === competenceId);
      if (!comp) return { error: "Compétence introuvable" };
      if (!comp.cours.some((x) => x.id === coursId)) {
        return { error: "Cours introuvable" };
      }
      if (patch.titre !== undefined && !patch.titre.trim()) {
        return { error: "Titre du cours obligatoire" };
      }
      persist({
        ...state,
        competences: state.competences.map((c) =>
          c.id !== competenceId
            ? c
            : {
                ...c,
                updatedAt: now(),
                cours: c.cours.map((x) =>
                  x.id !== coursId
                    ? x
                    : {
                        ...x,
                        titre:
                          patch.titre !== undefined
                            ? patch.titre.trim()
                            : x.titre,
                        contenu:
                          patch.contenu !== undefined
                            ? patch.contenu.trim()
                            : x.contenu,
                        formule:
                          patch.formule !== undefined
                            ? patch.formule.trim()
                            : x.formule,
                        exempleChiffre:
                          patch.exempleChiffre !== undefined
                            ? patch.exempleChiffre.trim()
                            : x.exempleChiffre,
                        erreursFrequentes:
                          patch.erreursFrequentes !== undefined
                            ? patch.erreursFrequentes.trim()
                            : x.erreursFrequentes,
                        updatedAt: now(),
                      }
                ),
              }
        ),
        toast: "Cours enregistré",
      });
      return {};
    },
    deleteCours(competenceId: string, coursId: string): { error?: string } {
      ensure();
      const comp = state.competences.find((c) => c.id === competenceId);
      if (!comp) return { error: "Compétence introuvable" };
      persist({
        ...state,
        competences: state.competences.map((c) =>
          c.id !== competenceId
            ? c
            : {
                ...c,
                cours: c.cours.filter((x) => x.id !== coursId),
                updatedAt: now(),
              }
        ),
        toast: "Cours supprimé",
      });
      return {};
    },
    scenariosModeCompetenceForChantier(chantierId: string) {
      return state.scenariosModeCompetence.filter(
        (s) => s.chantierId === chantierId
      );
    },
    getScenarioModeCompetence(id: string) {
      return state.scenariosModeCompetence.find((s) => s.id === id);
    },
    createScenarioModeCompetence(input: {
      chantierId: string;
      titre: string;
      competenceId: string;
      description?: string;
    }): ChantierScenarioModeCompetence | { error: string } {
      ensure();
      if (!state.chantiers.some((c) => c.id === input.chantierId)) {
        return { error: "Chantier introuvable" };
      }
      const titre = input.titre.trim();
      if (!titre) return { error: "Titre obligatoire" };
      if (!input.competenceId) {
        return { error: "Compétence à travailler obligatoire" };
      }
      const comp = state.competences.find(
        (c) =>
          c.id === input.competenceId && c.chantierId === input.chantierId
      );
      if (!comp) {
        return {
          error: "Compétence introuvable — créez-la d'abord à l'Étape 3",
        };
      }
      const s: ChantierScenarioModeCompetence = {
        id: uid("scmc"),
        chantierId: input.chantierId,
        titre,
        competenceId: input.competenceId,
        description: (input.description ?? "").trim(),
        decisions: [],
        createdAt: now(),
        updatedAt: now(),
      };
      persist({
        ...state,
        scenariosModeCompetence: [s, ...state.scenariosModeCompetence],
        toast: "Scénario Mode Compétence créé",
      });
      return s;
    },
    updateScenarioModeCompetence(
      id: string,
      patch: Partial<
        Pick<
          ChantierScenarioModeCompetence,
          "titre" | "competenceId" | "description" | "decisions"
        >
      >
    ): { error?: string } {
      ensure();
      const prev = state.scenariosModeCompetence.find((s) => s.id === id);
      if (!prev) return { error: "Scénario introuvable" };
      if (patch.titre !== undefined && !patch.titre.trim()) {
        return { error: "Titre obligatoire" };
      }
      let competenceId = prev.competenceId;
      if (patch.competenceId !== undefined) {
        if (!patch.competenceId) {
          return { error: "Compétence à travailler obligatoire" };
        }
        const comp = state.competences.find(
          (c) =>
            c.id === patch.competenceId && c.chantierId === prev.chantierId
        );
        if (!comp) {
          return { error: "Compétence introuvable dans ce chantier" };
        }
        competenceId = patch.competenceId;
      }
      persist({
        ...state,
        scenariosModeCompetence: state.scenariosModeCompetence.map((s) =>
          s.id !== id
            ? s
            : {
                ...s,
                titre:
                  patch.titre !== undefined ? patch.titre.trim() : s.titre,
                competenceId,
                description:
                  patch.description !== undefined
                    ? patch.description.trim()
                    : s.description,
                decisions: patch.decisions ?? s.decisions,
                updatedAt: now(),
              }
        ),
        toast: null,
      });
      return {};
    },
    deleteScenarioModeCompetence(id: string): { error?: string } {
      ensure();
      if (!state.scenariosModeCompetence.some((s) => s.id === id)) {
        return { error: "Scénario introuvable" };
      }
      persist({
        ...state,
        scenariosModeCompetence: state.scenariosModeCompetence.filter(
          (s) => s.id !== id
        ),
        toast: "Scénario supprimé",
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
