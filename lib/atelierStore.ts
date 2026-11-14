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

export type AtelierSecteur = {
  id: string;
  nom: string;
  description: string;
  contraintes: string;
  createdAt: string;
  updatedAt: string;
};

export type AtelierRole = {
  id: string;
  contexteId: string;
  nom: string;
  description: string;
  responsabilites: string;
  infosErp: string;
  competenceIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type AtelierContexte = {
  id: string;
  nom: string;
  /** Secteur d'activité obligatoire (id AtelierSecteur). */
  secteurId: string;
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
  /** Rôle jouable du contexte (optionnel). */
  roleId?: string;
  situation: string;
  decisions: string;
  reglesFin: string;
  statut: ScenarioStatut;
  /** Spec BPMN métier optionnelle — sinon générée depuis les champs texte. */
  workflow?: import("@/lib/atelierWorkflow").AtelierWorkflowSpec;
  createdAt: string;
  updatedAt: string;
};

type AtelierState = {
  secteurs: AtelierSecteur[];
  contextes: AtelierContexte[];
  roles: AtelierRole[];
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
    secteurId: "",
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
    secteurs: [],
    contextes: [ctx],
    roles: [],
    competences: [planificationMrp, dimensionnement, negociation],
    scenarios,
    toast: null,
  };
}

function normalizeContexte(c: Partial<AtelierContexte> & { id: string }): AtelierContexte {
  return {
    id: c.id,
    nom: c.nom ?? "",
    secteurId: c.secteurId ?? "",
    organisation: c.organisation ?? "",
    stock: c.stock ?? "",
    contrats: c.contrats ?? "",
    comptabilite: c.comptabilite ?? "",
    problematiques: c.problematiques ?? "",
    createdAt: c.createdAt ?? now(),
    updatedAt: c.updatedAt ?? now(),
  };
}

/** Rôle verrouillé s'il est lié à un scénario déjà joué / publié / en test. */
export function isRoleUsedInPlayedScenario(
  roleId: string,
  scenarios: AtelierScenario[]
): boolean {
  return scenarios.some(
    (s) =>
      s.roleId === roleId &&
      (s.statut === "en_test" || s.statut === "publie" || s.statut === "archive")
  );
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
      secteurs: Array.isArray(parsed.secteurs) ? parsed.secteurs : [],
      contextes: parsed.contextes?.length
        ? parsed.contextes.map((c) => normalizeContexte(c))
        : seed.contextes,
      roles: Array.isArray(parsed.roles) ? parsed.roles : [],
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
    getSecteur(id: string) {
      return state.secteurs.find((s) => s.id === id);
    },
    getContexte(id: string) {
      return state.contextes.find((c) => c.id === id);
    },
    getRole(id: string) {
      return state.roles.find((r) => r.id === id);
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
    rolesForContexte(contexteId: string) {
      return state.roles.filter((r) => r.contexteId === contexteId);
    },
    contextesUsingSecteur(secteurId: string) {
      return state.contextes.filter((c) => c.secteurId === secteurId);
    },
    createSecteur(input: {
      nom: string;
      description?: string;
      contraintes?: string;
    }): AtelierSecteur | { error: string } {
      ensure();
      const nom = input.nom.trim();
      if (!nom) return { error: "Nom du secteur obligatoire" };
      const s: AtelierSecteur = {
        id: uid("sec"),
        nom,
        description: (input.description ?? "").trim(),
        contraintes: (input.contraintes ?? "").trim(),
        createdAt: now(),
        updatedAt: now(),
      };
      persist({
        ...state,
        secteurs: [s, ...state.secteurs],
        toast: "Secteur créé",
      });
      return s;
    },
    updateSecteur(
      id: string,
      patch: Partial<Omit<AtelierSecteur, "id" | "createdAt">>
    ): { error?: string } {
      ensure();
      if (!state.secteurs.some((s) => s.id === id)) {
        return { error: "Secteur introuvable" };
      }
      if (patch.nom !== undefined && !patch.nom.trim()) {
        return { error: "Nom du secteur obligatoire" };
      }
      persist({
        ...state,
        secteurs: state.secteurs.map((s) =>
          s.id === id
            ? {
                ...s,
                ...patch,
                nom: patch.nom !== undefined ? patch.nom.trim() : s.nom,
                description:
                  patch.description !== undefined
                    ? patch.description.trim()
                    : s.description,
                contraintes:
                  patch.contraintes !== undefined
                    ? patch.contraintes.trim()
                    : s.contraintes,
                id: s.id,
                createdAt: s.createdAt,
                updatedAt: now(),
              }
            : s
        ),
        toast: "Secteur enregistré",
      });
      return {};
    },
    deleteSecteur(id: string): { error?: string } {
      ensure();
      if (state.contextes.some((c) => c.secteurId === id)) {
        return {
          error:
            "Impossible de supprimer : un contexte utilise encore ce secteur",
        };
      }
      if (!state.secteurs.some((s) => s.id === id)) {
        return { error: "Secteur introuvable" };
      }
      persist({
        ...state,
        secteurs: state.secteurs.filter((s) => s.id !== id),
        toast: "Secteur supprimé",
      });
      return {};
    },
    createContexte(input: {
      nom: string;
      secteurId: string;
    }): AtelierContexte | { error: string } {
      ensure();
      const nom = input.nom.trim();
      if (!nom) return { error: "Nom du contexte obligatoire" };
      if (!input.secteurId) return { error: "Secteur d'activité obligatoire" };
      if (!state.secteurs.some((s) => s.id === input.secteurId)) {
        return { error: "Secteur inconnu" };
      }
      const c: AtelierContexte = {
        id: uid("ctx"),
        nom,
        secteurId: input.secteurId,
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
    updateContexte(
      id: string,
      patch: Partial<AtelierContexte>
    ): { error?: string } {
      ensure();
      const prev = state.contextes.find((c) => c.id === id);
      if (!prev) return { error: "Contexte introuvable" };
      const nextSecteur = patch.secteurId ?? prev.secteurId;
      if (!nextSecteur) {
        return { error: "Secteur d'activité obligatoire" };
      }
      if (!state.secteurs.some((s) => s.id === nextSecteur)) {
        return { error: "Secteur inconnu" };
      }
      persist({
        ...state,
        contextes: state.contextes.map((c) =>
          c.id === id
            ? {
                ...c,
                ...patch,
                secteurId: nextSecteur,
                id: c.id,
                createdAt: c.createdAt,
                updatedAt: now(),
              }
            : c
        ),
        toast: "Contexte enregistré",
      });
      return {};
    },
    createRole(input: {
      contexteId: string;
      nom: string;
      description?: string;
      responsabilites?: string;
      infosErp?: string;
      competenceIds?: string[];
    }): AtelierRole | { error: string } {
      ensure();
      const nom = input.nom.trim();
      if (!nom) return { error: "Nom du rôle obligatoire" };
      if (!input.contexteId) return { error: "Contexte obligatoire" };
      if (!state.contextes.some((c) => c.id === input.contexteId)) {
        return { error: "Contexte inconnu" };
      }
      const allowed = new Set(
        state.competences
          .filter((c) => c.contexteId === input.contexteId)
          .map((c) => c.id)
      );
      const competenceIds = (input.competenceIds ?? []).filter((cid) =>
        allowed.has(cid)
      );
      const r: AtelierRole = {
        id: uid("role"),
        contexteId: input.contexteId,
        nom,
        description: (input.description ?? "").trim(),
        responsabilites: (input.responsabilites ?? "").trim(),
        infosErp: (input.infosErp ?? "").trim(),
        competenceIds,
        createdAt: now(),
        updatedAt: now(),
      };
      persist({
        ...state,
        roles: [r, ...state.roles],
        toast: "Rôle ajouté",
      });
      return r;
    },
    updateRole(
      id: string,
      patch: Partial<Omit<AtelierRole, "id" | "contexteId" | "createdAt">>
    ): { error?: string } {
      ensure();
      const prev = state.roles.find((r) => r.id === id);
      if (!prev) return { error: "Rôle introuvable" };
      if (patch.nom !== undefined && !patch.nom.trim()) {
        return { error: "Nom du rôle obligatoire" };
      }
      const allowed = new Set(
        state.competences
          .filter((c) => c.contexteId === prev.contexteId)
          .map((c) => c.id)
      );
      const competenceIds =
        patch.competenceIds !== undefined
          ? patch.competenceIds.filter((cid) => allowed.has(cid))
          : prev.competenceIds;
      persist({
        ...state,
        roles: state.roles.map((r) =>
          r.id === id
            ? {
                ...r,
                ...patch,
                nom: patch.nom !== undefined ? patch.nom.trim() : r.nom,
                description:
                  patch.description !== undefined
                    ? patch.description.trim()
                    : r.description,
                responsabilites:
                  patch.responsabilites !== undefined
                    ? patch.responsabilites.trim()
                    : r.responsabilites,
                infosErp:
                  patch.infosErp !== undefined
                    ? patch.infosErp.trim()
                    : r.infosErp,
                competenceIds,
                id: r.id,
                contexteId: r.contexteId,
                createdAt: r.createdAt,
                updatedAt: now(),
              }
            : r
        ),
        toast: "Rôle enregistré",
      });
      return {};
    },
    deleteRole(id: string): { error?: string } {
      ensure();
      if (!state.roles.some((r) => r.id === id)) {
        return { error: "Rôle introuvable" };
      }
      if (isRoleUsedInPlayedScenario(id, state.scenarios)) {
        return {
          error:
            "Impossible de supprimer : ce rôle est utilisé dans un scénario joué",
        };
      }
      persist({
        ...state,
        roles: state.roles.filter((r) => r.id !== id),
        scenarios: state.scenarios.map((s) =>
          s.roleId === id ? { ...s, roleId: undefined } : s
        ),
        toast: "Rôle supprimé",
      });
      return {};
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
