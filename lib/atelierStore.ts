/**
 * Atelier — 3 couches : Contexte → Compétences → Scénarios.
 * Studio-only storage, séparée du jeu.
 */

"use client";

import { useSyncExternalStore } from "react";
import { uid } from "@/lib/adminTypes";

const STORAGE_KEY = "keyber-studio-atelier-v1";

export type CompetenceType = "generale" | "technique";
export type CompetenceNiveau = "debutant" | "intermediaire" | "expert";
export type ScenarioStatut = "brouillon" | "en_test" | "publie" | "archive";

export type AtelierContexte = {
  id: string;
  nom: string;
  organisation: string;
  stock: string;
  contrats: string;
  comptabilite: string;
  problematiques: string;
  createdAt: string;
  updatedAt: string;
};

export type AtelierCompetence = {
  id: string; // technical id, immutable after create
  nom: string;
  type: CompetenceType;
  contexteId: string;
  definitionExacte: string;
  formule: string; // required for technique ideally
  indicateurs: string[];
  erreursFrequentes: string[];
  niveaux: {
    debutant: string;
    intermediaire: string;
    expert: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AtelierScenario = {
  id: string;
  titre: string;
  contexteId: string;
  competenceIds: string[];
  situation: string;
  decisions: string;
  reglesFin: string;
  statut: ScenarioStatut;
  createdAt: string;
  updatedAt: string;
};

type AtelierState = {
  contextes: AtelierContexte[];
  competences: AtelierCompetence[];
  scenarios: AtelierScenario[];
  toast: string | null;
};

export const COMPETENCE_TYPE_LABELS: Record<CompetenceType, string> = {
  generale: "Générale",
  technique: "Technique",
};

export const SCENARIO_STATUT_LABELS: Record<ScenarioStatut, string> = {
  brouillon: "Brouillon",
  en_test: "En test",
  publie: "Publié",
  archive: "Archivé",
};

export function isTechniqueVague(c: AtelierCompetence): boolean {
  if (c.type !== "technique") return false;
  const hasFormule = c.formule.trim().length > 0;
  const hasIndicateur = c.indicateurs.some((i) => i.trim().length > 8);
  return !hasFormule || !hasIndicateur;
}

function now() {
  return new Date().toISOString();
}

function seedNovacier(): AtelierState {
  const ctxId = "ctx-novacier";
  const ctx: AtelierContexte = {
    id: ctxId,
    nom: "Novacier",
    organisation:
      "Usine métallurgique ~45 personnes, 3 lignes de production. Marie (chef d'atelier), Karim (maintenance), Laurent (direction), Henri (mentor). Organigramme plat, RP novice.",
    stock:
      "Acier ~850 kg en stock. Capacité ~60 pièces/jour. Rebut réel ~18 % une fois le brouillard levé. Machine 3 : capteur défaillant.",
    contrats:
      "2 gros clients dont AutoVolt = 45 % du CA. Commande urgente : 500 pièces qualité avant vendredi 16h. Pénalités de retard contractuelles.",
    comptabilite:
      "Trésorerie ~420 k€, tendue. Marges serrées. Coût capteur Machine 3 ~5–6 k€. Quasi-faillite 2022 encore dans les têtes.",
    problematiques:
      "Fournisseur en retard, machine 3 en panne latente, tension Marie/nouveau RP, pression AutoVolt, qualité vs délai.",
    createdAt: "2026-11-13T10:00:00.000Z",
    updatedAt: "2026-11-13T10:00:00.000Z",
  };

  const planificationMrp: AtelierCompetence = {
    id: "planification_mrp",
    nom: "Planification MRP",
    type: "technique",
    contexteId: ctxId,
    definitionExacte:
      "Calculer le besoin net de production / achat à partir du besoin brut, du stock disponible et des en-cours.",
    formule: "Besoin net = Besoin brut - Stock - En-cours",
    indicateurs: [
      "Le joueur a calculé le besoin net sans erreur sur 3 OF d'affilée",
    ],
    erreursFrequentes: [
      "Confondre besoin brut et besoin net",
      "Oublier l'en-cours",
    ],
    niveaux: {
      debutant: "Sait écrire la formule et identifier stock / en-cours sur un OF simple.",
      intermediaire:
        "Calcule correctement le besoin net sur plusieurs OF avec variations de stock.",
      expert:
        "Anticipe les ruptures et ajuste le plan MRP face à un client urgent.",
    },
    createdAt: "2026-11-13T10:30:00.000Z",
    updatedAt: "2026-11-13T10:30:00.000Z",
  };

  const dimensionnement: AtelierCompetence = {
    id: "dimensionnement_ligne",
    nom: "Dimensionnement de ligne",
    type: "technique",
    contexteId: ctxId,
    definitionExacte:
      "Dimensionner la capacité de ligne (cadence, heures, ressources) pour tenir un volume cible dans un délai donné.",
    formule: "Capacité utile = Cadence × Temps dispo × (1 - rebut)",
    indicateurs: [
      "Le joueur propose un plan de charge qui couvre 500 pièces qualité avant vendredi sans dépasser la trésorerie",
    ],
    erreursFrequentes: [
      "Ignorer le rebut dans le calcul de capacité",
      "Compter les heures brutes sans maintenance",
    ],
    niveaux: {
      debutant: "Calcule une capacité journalière simple.",
      intermediaire: "Intègre rebut, HS et pannes dans le dimensionnement.",
      expert: "Arbitre capacité vs coût vs délai client.",
    },
    createdAt: "2026-11-13T10:35:00.000Z",
    updatedAt: "2026-11-13T10:35:00.000Z",
  };

  const negociation: AtelierCompetence = {
    id: "negociation",
    nom: "Négociation",
    type: "generale",
    contexteId: ctxId,
    definitionExacte:
      "Conduire un échange pour obtenir un accord acceptable entre contraintes internes et exigences client / fournisseur.",
    formule: "",
    indicateurs: [
      "Le joueur obtient un accord AutoVolt sans casser la relation ni la trésorerie",
    ],
    erreursFrequentes: [
      "Promettre sans capacité réelle",
      "Céder sur le prix sans contrepartie",
    ],
    niveaux: {
      debutant: "Prépare 2 arguments et une concession minimale.",
      intermediaire: "Négocie délai / volume / pénalités avec données ERP.",
      expert: "Structure un deal win-win sous pression.",
    },
    createdAt: "2026-11-13T10:40:00.000Z",
    updatedAt: "2026-11-13T10:40:00.000Z",
  };

  const scenarios: AtelierScenario[] = [
    {
      id: "sc-rupture-stock",
      titre: "Rupture stock",
      contexteId: ctxId,
      competenceIds: ["planification_mrp"],
      situation:
        "Le stock acier ne couvre plus les OF de la semaine. Il faut recalculer le besoin net avant de lancer les ordres.",
      decisions:
        "Recalculer MRP, prioriser OF, arbitrer achat urgent vs report.",
      reglesFin:
        "Succès si besoin net correct sur 3 OF et aucune rupture critique non anticipée.",
      statut: "brouillon",
      createdAt: "2026-11-13T11:00:00.000Z",
      updatedAt: "2026-11-13T11:00:00.000Z",
    },
    {
      id: "sc-client-urgent",
      titre: "Client urgent 500 pièces avant vendredi",
      contexteId: ctxId,
      competenceIds: ["dimensionnement_ligne", "negociation"],
      situation:
        "AutoVolt exige 500 pièces qualité avant vendredi 16h. Capacité et relation client en tension.",
      decisions:
        "Dimensionner la ligne, HS / réorg, négocier délai ou lot partiel.",
      reglesFin:
        "Succès si plan de charge crédible + accord client documenté.",
      statut: "brouillon",
      createdAt: "2026-11-13T11:05:00.000Z",
      updatedAt: "2026-11-13T11:05:00.000Z",
    },
  ];

  return {
    contextes: [ctx],
    competences: [planificationMrp, dimensionnement, negociation],
    scenarios,
    toast: null,
  };
}

function emptyState(): AtelierState {
  return seedNovacier();
}

function load(): AtelierState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AtelierState>;
    const seed = seedNovacier();
    return {
      contextes: parsed.contextes?.length ? parsed.contextes : seed.contextes,
      competences: parsed.competences?.length
        ? parsed.competences
        : seed.competences,
      scenarios: parsed.scenarios?.length ? parsed.scenarios : seed.scenarios,
      toast: null,
    };
  } catch {
    return emptyState();
  }
}

let state: AtelierState = emptyState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: AtelierState) {
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
  // First visit: no write until mutation.
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

export function slugifyCompetenceId(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64);
}

export function useAtelierStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    getContexte(id: string) {
      return state.contextes.find((c) => c.id === id);
    },
    getCompetence(id: string) {
      return state.competences.find((c) => c.id === id);
    },
    getScenario(id: string) {
      return state.scenarios.find((s) => s.id === id);
    },
    competencesForContexte(contexteId: string) {
      return state.competences.filter((c) => c.contexteId === contexteId);
    },
    createContexte(nom: string): AtelierContexte {
      ensure();
      const c: AtelierContexte = {
        id: uid("ctx"),
        nom: nom.trim() || "Nouveau contexte",
        organisation: "",
        stock: "",
        contrats: "",
        comptabilite: "",
        problematiques: "",
        createdAt: now(),
        updatedAt: now(),
      };
      persist({
        ...state,
        contextes: [c, ...state.contextes],
        toast: "Contexte créé",
      });
      return c;
    },
    updateContexte(id: string, patch: Partial<AtelierContexte>) {
      ensure();
      persist({
        ...state,
        contextes: state.contextes.map((c) =>
          c.id === id
            ? {
                ...c,
                ...patch,
                id: c.id,
                createdAt: c.createdAt,
                updatedAt: now(),
              }
            : c
        ),
        toast: "Contexte enregistré",
      });
    },
    createCompetence(input: {
      id: string;
      nom: string;
      type: CompetenceType;
      contexteId: string;
    }): AtelierCompetence | { error: string } {
      ensure();
      const id = slugifyCompetenceId(input.id || input.nom);
      if (!id) return { error: "Id invalide" };
      if (!input.contexteId) return { error: "Contexte obligatoire" };
      if (!state.contextes.some((c) => c.id === input.contexteId)) {
        return { error: "Contexte inconnu" };
      }
      if (state.competences.some((c) => c.id === id)) {
        return { error: `Id déjà utilisé : ${id}` };
      }
      const c: AtelierCompetence = {
        id,
        nom: input.nom.trim() || id,
        type: input.type,
        contexteId: input.contexteId,
        definitionExacte: "",
        formule: "",
        indicateurs: [""],
        erreursFrequentes: [""],
        niveaux: { debutant: "", intermediaire: "", expert: "" },
        createdAt: now(),
        updatedAt: now(),
      };
      persist({
        ...state,
        competences: [c, ...state.competences],
        toast: "Compétence créée",
      });
      return c;
    },
    updateCompetence(
      id: string,
      patch: Partial<Omit<AtelierCompetence, "id" | "createdAt">>
    ) {
      ensure();
      persist({
        ...state,
        competences: state.competences.map((c) =>
          c.id === id
            ? {
                ...c,
                ...patch,
                id: c.id,
                createdAt: c.createdAt,
                updatedAt: now(),
              }
            : c
        ),
        toast: "Compétence enregistrée",
      });
    },
    createScenario(input: {
      titre: string;
      contexteId: string;
      competenceIds: string[];
    }): AtelierScenario | { error: string } {
      ensure();
      if (!input.contexteId) return { error: "Contexte obligatoire" };
      if (!state.contextes.some((c) => c.id === input.contexteId)) {
        return { error: "Contexte inconnu" };
      }
      const allowed = new Set(
        state.competences
          .filter((c) => c.contexteId === input.contexteId)
          .map((c) => c.id)
      );
      for (const cid of input.competenceIds) {
        if (!allowed.has(cid)) {
          return {
            error:
              "Impossible de cibler une compétence hors du contexte du scénario",
          };
        }
      }
      if (input.competenceIds.length === 0) {
        return { error: "Au moins une compétence requise" };
      }
      const s: AtelierScenario = {
        id: uid("sc"),
        titre: input.titre.trim() || "Nouveau scénario",
        contexteId: input.contexteId,
        competenceIds: [...input.competenceIds],
        situation: "",
        decisions: "",
        reglesFin: "",
        statut: "brouillon",
        createdAt: now(),
        updatedAt: now(),
      };
      persist({
        ...state,
        scenarios: [s, ...state.scenarios],
        toast: "Scénario créé",
      });
      return s;
    },
    updateScenario(
      id: string,
      patch: Partial<Omit<AtelierScenario, "id" | "createdAt">>
    ): { error?: string } {
      ensure();
      const prev = state.scenarios.find((s) => s.id === id);
      if (!prev) return { error: "Scénario introuvable" };
      const nextContexte = patch.contexteId ?? prev.contexteId;
      if (!state.contextes.some((c) => c.id === nextContexte)) {
        return { error: "Contexte obligatoire" };
      }
      const nextComps = patch.competenceIds ?? prev.competenceIds;
      const allowed = new Set(
        state.competences
          .filter((c) => c.contexteId === nextContexte)
          .map((c) => c.id)
      );
      for (const cid of nextComps) {
        if (!allowed.has(cid)) {
          return {
            error:
              "Impossible de cibler une compétence hors du contexte du scénario",
          };
        }
      }
      if (nextComps.length === 0) {
        return { error: "Au moins une compétence requise" };
      }
      persist({
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === id
            ? {
                ...s,
                ...patch,
                id: s.id,
                createdAt: s.createdAt,
                contexteId: nextContexte,
                competenceIds: nextComps,
                updatedAt: now(),
              }
            : s
        ),
        toast: "Scénario enregistré",
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

/** Read-only snapshot for agents (no React). */
export function getAtelierSnapshotForAgents(): AtelierState {
  ensure();
  return state;
}
