/**
 * Stub Atelier store — l'UI Atelier a été reconstruite (shell).
 * Conservé pour Contrôle (agents) : snapshot vide, pas de contenu métier inventé.
 * Storage Studio : keyber-studio-* (aucun seed métier ici).
 *
 * Voir lib/atelierScenarioMode.ts pour la règle Mode Compétence XOR Mode Histoire.
 */

"use client";

export type CompetenceType = "generale" | "technique";

export type AtelierCompetence = {
  id: string;
  nom: string;
  type: CompetenceType;
  contexteId: string;
  definitionExacte: string;
  formule: string;
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

type AtelierState = {
  contextes: unknown[];
  competences: AtelierCompetence[];
  scenarios: unknown[];
  toast: string | null;
};

export function isTechniqueVague(c: AtelierCompetence): boolean {
  if (c.type !== "technique") return false;
  const hasFormule = c.formule.trim().length > 0;
  const hasIndicateur = c.indicateurs.some((i) => i.trim().length > 8);
  return !hasFormule || !hasIndicateur;
}

function emptyState(): AtelierState {
  return {
    contextes: [],
    competences: [],
    scenarios: [],
    toast: null,
  };
}

/** Read-only snapshot for agents (no React). */
export function getAtelierSnapshotForAgents(): AtelierState {
  return emptyState();
}
