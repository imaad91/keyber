/**
 * Closed validation workflow: Fiche → Scénario Provisoire → Tests Agents → Publié.
 * Admin-only; independent from player GameState.
 */

import { uid } from "./adminTypes";

export type StatutWorkflow =
  | "brouillon"
  | "soumise"
  | "fiche_validee"
  | "corrections_demandees"
  | "provisoire_cree"
  | "en_test"
  | "retenu_publie"
  | "rejete";

/** The 6 primary timeline / Kanban columns (ordered). */
export const WORKFLOW_MAIN_STEPS: {
  id: StatutWorkflow;
  label: string;
  short: string;
}[] = [
  { id: "brouillon", label: "Brouillon", short: "Brouillon" },
  { id: "soumise", label: "Soumise", short: "Soumise" },
  { id: "fiche_validee", label: "Fiche Validée", short: "Validée" },
  { id: "provisoire_cree", label: "Provisoire Créé", short: "Provisoire" },
  { id: "en_test", label: "En Test", short: "En Test" },
  { id: "retenu_publie", label: "Retenu / Publié", short: "Retenu" },
];

export const WORKFLOW_STATUT_META: Record<
  StatutWorkflow,
  { label: string; color: string; pill: string; column: string }
> = {
  brouillon: {
    label: "Brouillon",
    color: "gris",
    pill: "bg-slate-100 text-slate-700",
    column: "bg-slate-50 border-slate-200",
  },
  soumise: {
    label: "Soumise",
    color: "bleu",
    pill: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
    column: "bg-sky-50/60 border-sky-200",
  },
  fiche_validee: {
    label: "Fiche Validée",
    color: "vert clair",
    pill: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
    column: "bg-emerald-50/50 border-emerald-200",
  },
  corrections_demandees: {
    label: "Corrections demandées",
    color: "rouge clair",
    pill: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
    column: "bg-rose-50 border-rose-200",
  },
  provisoire_cree: {
    label: "Provisoire Créé",
    color: "orange",
    pill: "bg-orange-50 text-orange-800 ring-1 ring-orange-200",
    column: "bg-orange-50/60 border-orange-200",
  },
  en_test: {
    label: "En Test",
    color: "violet",
    pill: "bg-violet-50 text-violet-800 ring-1 ring-violet-200",
    column: "bg-violet-50/60 border-violet-200",
  },
  retenu_publie: {
    label: "Retenu / Publié",
    color: "vert foncé",
    pill: "bg-emerald-700 text-white",
    column: "bg-emerald-100/80 border-emerald-400",
  },
  rejete: {
    label: "Rejeté",
    color: "rouge",
    pill: "bg-red-100 text-red-800 ring-1 ring-red-300",
    column: "bg-red-50 border-red-300",
  },
};

export type WorkflowActor =
  | "Utilisateur"
  | "Système"
  | `Agent ${string}`;

export type WorkflowTransition = {
  id: string;
  at: string;
  from: StatutWorkflow;
  to: StatutWorkflow;
  by: WorkflowActor;
  commentaire?: string;
};

export type FicheAgentIssue = {
  priorite: "haute" | "moyenne" | "basse";
  titre: string;
  detail: string;
};

export type FicheAgentReport = {
  agentId: string;
  nom: string;
  score: number;
  statut: "valide" | "bloque";
  issues: FicheAgentIssue[];
  ranAt: string;
};

/** List filters (grouped). */
export type WorkflowListFilter =
  | "tout"
  | "brouillon"
  | "soumise"
  | "en_test"
  | "retenu"
  | "rejete";

export const WORKFLOW_LIST_FILTERS: {
  id: WorkflowListFilter;
  label: string;
}[] = [
  { id: "tout", label: "Tout" },
  { id: "brouillon", label: "Brouillon" },
  { id: "soumise", label: "Soumise" },
  { id: "en_test", label: "En Test" },
  { id: "retenu", label: "Retenu" },
  { id: "rejete", label: "Rejeté" },
];

export function workflowLabel(s: StatutWorkflow) {
  return WORKFLOW_STATUT_META[s]?.label ?? s;
}

/** Map status to primary step index 1..6 (side statuses map to nearest). */
export function workflowStepNumber(s: StatutWorkflow): number {
  switch (s) {
    case "brouillon":
    case "corrections_demandees":
      return 1;
    case "soumise":
      return 2;
    case "fiche_validee":
      return 3;
    case "provisoire_cree":
      return 4;
    case "en_test":
      return 5;
    case "retenu_publie":
    case "rejete":
      return 6;
    default:
      return 1;
  }
}

export function workflowProgressLabel(s: StatutWorkflow): string {
  return `Étape ${workflowStepNumber(s)}/6`;
}

export function matchesWorkflowFilter(
  s: StatutWorkflow,
  filter: WorkflowListFilter
): boolean {
  if (filter === "tout") return true;
  if (filter === "brouillon")
    return s === "brouillon" || s === "corrections_demandees";
  if (filter === "soumise") return s === "soumise" || s === "fiche_validee";
  if (filter === "en_test")
    return s === "provisoire_cree" || s === "en_test";
  if (filter === "retenu") return s === "retenu_publie";
  if (filter === "rejete") return s === "rejete";
  return true;
}

/** Content editable only in brouillon (after corrections → must return to brouillon). */
export function isFicheContentEditable(s: StatutWorkflow): boolean {
  return s === "brouillon";
}

export function makeTransition(
  from: StatutWorkflow,
  to: StatutWorkflow,
  by: WorkflowActor,
  commentaire?: string
): WorkflowTransition {
  return {
    id: uid("wf"),
    at: new Date().toISOString(),
    from,
    to,
    by,
    commentaire: commentaire?.trim() || undefined,
  };
}

/** Agent Validé if score ≥ 70 and no haute-priority issues. */
export function agentReportStatus(
  score: number,
  issues: { priorite: string }[]
): "valide" | "bloque" {
  const blocked = issues.some((i) => i.priorite === "haute") || score < 70;
  return blocked ? "bloque" : "valide";
}

export function allAgentsValidated(reports: FicheAgentReport[]): boolean {
  return reports.length >= 4 && reports.every((r) => r.statut === "valide");
}

/** Migrate legacy fill-status → workflow. */
export function migrateLegacyFicheStatut(raw: unknown): StatutWorkflow {
  if (
    typeof raw === "string" &&
    raw in WORKFLOW_STATUT_META
  ) {
    return raw as StatutWorkflow;
  }
  switch (raw) {
    case "en_cours":
    case "complete":
      return "brouillon";
    case "validee":
      return "retenu_publie";
    case "brouillon":
    default:
      return "brouillon";
  }
}
