"use client";

import { useSyncExternalStore } from "react";
import {
  normalizeAgent,
  type AgentProfile,
  type AgentRunReport,
} from "./agents";
import {
  buildCoeurFromAdminState,
  coeurToAdminSlices,
  emptyCoeur,
  repairMissingCompetenceImpacts,
  type ScenarioCoeur,
} from "./adminCoeur";
import {
  emptyGlossaireTerme,
  isTermUsedInPublishedCoeur,
  mergeGlossaire,
  slugifyTerme,
  type GlossaireTerme,
} from "./adminGlossaire";
import {
  createLockedJournalDecision,
  JOURNAL_MODULE_HREFS,
  mergeJournalDecisions,
  type JournalDecision,
  type JournalModuleLie,
} from "./adminJournalDecisions";
import {
  appendVersion,
  emptyCoeurMeta,
  markHighlightsSeen,
  type CoeurOrigin,
} from "./coeurHistory";
import {
  emptyFiche,
  ficheFillPercent,
  normalizeAdminFiche,
  type AdminFiche,
} from "./adminFiches";
import {
  createAdminSeed,
  emptyDecision,
  emptyEntreprise,
  emptyEvent,
  emptyPersonnage,
  emptyScenario,
} from "./adminSeed";
import type {
  AdminConsultantSubmission,
  AdminDecision,
  AdminEntreprise,
  AdminEvent,
  AdminPersonnage,
  AdminScenario,
  AdminState,
} from "./adminTypes";
import {
  agentReportStatus,
  allAgentsValidated,
  isFicheContentEditable,
  makeTransition,
  type StatutWorkflow,
  type WorkflowActor,
} from "./adminWorkflow";
import {
  allCompetenceImpactsPrecise,
  evaluateImpactPrecision,
  normalizeLockedImpact,
  scanCoeurCompetencePrecision,
  validateLockedImpact,
} from "./competenceLocks";

const STORAGE_KEY = "keyber-admin-v1";

export const COEUR_LOCKED_MESSAGE =
  "Action interdite - Le Cœur est verrouillé";

function migrateCoeurs(
  partial: Partial<AdminState>,
  seed: AdminState
): AdminState["coeurs"] {
  const base = { ...seed.coeurs, ...(partial.coeurs ?? {}) };
  const scenarios = partial.scenarios ?? seed.scenarios;
  const draft: AdminState = {
    scenarios,
    entreprises: partial.entreprises ?? seed.entreprises,
    personnages: partial.personnages ?? seed.personnages,
    decisions: partial.decisions ?? seed.decisions,
    events: partial.events ?? seed.events,
    fiches: partial.fiches ?? seed.fiches,
    coeurs: base,
    coeurMeta: partial.coeurMeta ?? seed.coeurMeta,
    agents: partial.agents ?? seed.agents,
    agentReports: partial.agentReports ?? [],
    consultants: partial.consultants ?? [],
    glossaire: mergeGlossaire(partial.glossaire, seed.glossaire),
    journalDecisions: mergeJournalDecisions(
      partial.journalDecisions,
      seed.journalDecisions
    ),
    toast: null,
  };
  for (const s of scenarios) {
    if (!base[s.id]) {
      base[s.id] = buildCoeurFromAdminState(draft, s.id);
    }
  }
  return base;
}

function loadState(): AdminState {
  if (typeof window === "undefined") return createAdminSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createAdminSeed();
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    const seed = createAdminSeed();
  const coeurs = migrateCoeurs(parsed, seed);
  for (const [id, c] of Object.entries(seed.coeurs)) {
    if (!coeurs[id]) coeurs[id] = c;
  }
  // Restore competence impacts stripped by older rebuilds / stale LS
  for (const id of Object.keys(coeurs)) {
    coeurs[id] = repairMissingCompetenceImpacts(coeurs[id]!);
  }
    const coeurMeta = { ...seed.coeurMeta, ...(parsed.coeurMeta ?? {}) };
    for (const id of Object.keys(coeurs)) {
      if (!coeurMeta[id]) {
        coeurMeta[id] = appendVersion(
          emptyCoeurMeta(),
          coeurs[id]!,
          "systeme",
          "Migration",
          "CŒUR migré"
        );
        coeurMeta[id]!.highlights = coeurMeta[id]!.highlights.map((h) => ({
          ...h,
          seen: true,
        }));
      }
    }
    return {
      scenarios: (() => {
        const loaded = parsed.scenarios ?? seed.scenarios;
        const byId = new Map(loaded.map((s) => [s.id, s]));
        for (const demo of seed.scenarios) {
          if (!byId.has(demo.id)) byId.set(demo.id, demo);
        }
        return Array.from(byId.values()).map((s) => {
          const fiche = (parsed.fiches ?? seed.fiches).find(
            (f) =>
              (f as AdminFiche).scenarioId === s.id ||
              (f as { scenarioId?: string }).scenarioId === s.id
          );
          const wf =
            s.statutWorkflow ??
            (fiche
              ? normalizeAdminFiche(
                  fiche as Partial<AdminFiche> & { statut?: unknown }
                ).statutWorkflow
              : "brouillon");
          return { ...s, statutWorkflow: wf };
        });
      })(),
      entreprises: parsed.entreprises ?? seed.entreprises,
      personnages: parsed.personnages ?? seed.personnages,
      decisions: (() => {
        const loaded = parsed.decisions ?? seed.decisions;
        // Mirror competence impacts onto admin decision slices (rebuild-safe)
        return loaded.map((d) => {
          const coeur = coeurs[d.scenarioId];
          const cd = coeur?.decisions.find((x) => x.id === d.id);
          if (!cd) return d;
          return {
            ...d,
            choix: d.choix.map((c, i) => {
              if (c.competencesImpactees?.length) return c;
              const cc =
                cd.choix.find((x) => x.id === c.id) ?? cd.choix[i];
              if (!cc?.competencesImpactees?.length) return c;
              return {
                ...c,
                competencesImpactees: cc.competencesImpactees.map((imp) => ({
                  ...imp,
                })),
              };
            }),
          };
        });
      })(),
      events: parsed.events ?? seed.events,
      fiches: (() => {
        const loaded = (parsed.fiches?.length ? parsed.fiches : seed.fiches).map(
          (f) =>
            normalizeAdminFiche(
              f as Partial<AdminFiche> & { statut?: unknown }
            )
        );
        // Ensure demo workflow fiches exist for Suivi Validation examples
        const byId = new Map(loaded.map((f) => [f.id, f]));
        for (const demo of seed.fiches) {
          if (!byId.has(demo.id)) byId.set(demo.id, demo);
        }
        return Array.from(byId.values());
      })(),
      coeurs,
      coeurMeta,
      agents: parsed.agents?.length
        ? parsed.agents.map((a) => normalizeAgent(a))
        : seed.agents,
      agentReports: parsed.agentReports ?? [],
      consultants: parsed.consultants ?? [],
      glossaire: mergeGlossaire(parsed.glossaire, seed.glossaire),
      journalDecisions: mergeJournalDecisions(
        parsed.journalDecisions,
        seed.journalDecisions
      ),
      toast: null,
    };
  } catch {
    return createAdminSeed();
  }
}

let state: AdminState = createAdminSeed();
let hydrated = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: AdminState) {
  state = next;
  if (typeof window !== "undefined") {
    const rest = { ...next, toast: null };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    window.dispatchEvent(new Event("keyber-admin-updated"));
  }
  emit();
}

function toast(message: string) {
  persist({ ...state, toast: message });
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const hadRaw = Boolean(window.localStorage.getItem(STORAGE_KEY));
  state = loadState();
  // First Studio visit writes seed so Mode Joueur can read the same source.
  if (!hadRaw) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, toast: null })
    );
    window.dispatchEvent(new Event("keyber-admin-updated"));
  }
}

function patch(partial: Partial<AdminState>) {
  persist({ ...state, ...partial });
}

function syncSlicesFromCoeur(coeur: ScenarioCoeur, base: AdminState): AdminState {
  const { scenarioPatch, decisions, events } = coeurToAdminSlices(coeur);
  const sid = coeur.scenario.id;
  return {
    ...base,
    scenarios: base.scenarios.map((s) =>
      s.id === sid ? { ...s, ...scenarioPatch } : s
    ),
    decisions: [
      ...base.decisions.filter((d) => d.scenarioId !== sid),
      ...decisions,
    ],
    events: [...base.events.filter((e) => e.scenarioId !== sid), ...events],
    coeurs: { ...base.coeurs, [sid]: coeur },
  };
}

function rebuildCoeurFromSlices(scenarioId: string) {
  // Build from slices while keeping gameStateInitial from current CŒUR
  const prev = state.coeurs[scenarioId];
  const fromSlices = buildCoeurFromAdminState(
    {
      ...state,
      // Keep a placeholder so Novacier doesn't fall back to seed file
      coeurs: {
        ...state.coeurs,
        [scenarioId]: prev ?? emptyCoeur(
          state.scenarios.find((s) => s.id === scenarioId) ??
            emptyScenario(1)
        ),
      },
    },
    scenarioId
  );
  const coeur: ScenarioCoeur = {
    ...fromSlices,
    gameStateInitial: prev?.gameStateInitial ?? fromSlices.gameStateInitial,
  };
  commitCoeur(coeur, {
    origin: "fiche",
    originLabel: "Fiche Scénario",
    summary: "CŒUR régénéré depuis la fiche (décisions / événements)",
    silent: true,
  });
}

/** Read the CŒUR for a scenario (source of truth). */
export function getScenarioCoeur(scenarioId: string): ScenarioCoeur {
  ensureHydrated();
  return (
    state.coeurs[scenarioId] ?? buildCoeurFromAdminState(state, scenarioId)
  );
}

export function getCoeurMeta(scenarioId: string) {
  ensureHydrated();
  return state.coeurMeta[scenarioId] ?? emptyCoeurMeta();
}

type CommitOpts = {
  origin: CoeurOrigin;
  originLabel: string;
  summary: string;
  silent?: boolean;
  message?: string;
};

/**
 * ONLY authorized write path for the CŒUR (Agents or Fiche Scénario).
 */
function commitCoeur(coeur: ScenarioCoeur, opts: CommitOpts) {
  if (opts.origin !== "agent" && opts.origin !== "fiche" && opts.origin !== "seed" && opts.origin !== "systeme") {
    toast(COEUR_LOCKED_MESSAGE);
    return false;
  }
  let next = syncSlicesFromCoeur(coeur, state);
  const prevMeta = next.coeurMeta[coeur.scenario.id] ?? emptyCoeurMeta();
  const meta = appendVersion(
    prevMeta,
    coeur,
    opts.origin,
    opts.originLabel,
    opts.summary
  );
  next = {
    ...next,
    coeurMeta: { ...next.coeurMeta, [coeur.scenario.id]: meta },
  };
  persist(next);
  if (!opts.silent) {
    toast(opts.message ?? "CŒUR mis à jour via voie autorisée");
  }
  return true;
}

/**
 * @deprecated Direct UI apply is locked. Use applyCoeurFromAgent / Fiche.
 */
export function applyScenarioCoeur(
  ..._args: [ScenarioCoeur, { silent?: boolean; message?: string }?]
) {
  void _args;
  ensureHydrated();
  toast(COEUR_LOCKED_MESSAGE);
  return false;
}

/** Authorized: Agent proposes → user validates → apply. */
export function applyCoeurFromAgent(
  coeur: ScenarioCoeur,
  agentLabel: string,
  summary: string
) {
  ensureHydrated();
  return commitCoeur(coeur, {
    origin: "agent",
    originLabel: agentLabel,
    summary,
  });
}

/** Authorized: structured Fiche Scénario generates CŒUR. */
export function applyCoeurFromFiche(
  coeur: ScenarioCoeur,
  summary = "CŒUR généré depuis la Fiche Scénario"
) {
  ensureHydrated();
  return commitCoeur(coeur, {
    origin: "fiche",
    originLabel: "Fiche Scénario",
    summary,
  });
}

export function markCoeurHighlightsSeen(scenarioId: string) {
  ensureHydrated();
  const meta = state.coeurMeta[scenarioId] ?? emptyCoeurMeta();
  persist({
    ...state,
    coeurMeta: {
      ...state.coeurMeta,
      [scenarioId]: markHighlightsSeen(meta),
    },
  });
  toast("Highlights marqués comme vus");
}

/* —— Fiches (rich intake) + closed workflow —— */

function syncWorkflowToScenarioAndCoeur(
  scenarioId: string,
  statutWorkflow: StatutWorkflow,
  provisoire: boolean,
  publishScenarioFlag?: boolean
) {
  if (!scenarioId) return;
  const scenarios = state.scenarios.map((s) => {
    if (s.id !== scenarioId) return s;
    const next: AdminScenario = {
      ...s,
      statutWorkflow,
      provisoire,
    };
    if (publishScenarioFlag === true) next.statut = "publie";
    if (publishScenarioFlag === false && provisoire) next.statut = "en_attente";
    return next;
  });
  const existing = state.coeurs[scenarioId];
  const coeurs = existing
    ? {
        ...state.coeurs,
        [scenarioId]: {
          ...existing,
          scenario: {
            ...existing.scenario,
            statutWorkflow,
            provisoire,
          },
        },
      }
    : state.coeurs;
  state = { ...state, scenarios, coeurs };
}

function applyFicheWorkflow(
  ficheId: string,
  to: StatutWorkflow,
  opts: {
    by?: WorkflowActor;
    commentaire?: string;
    patchFiche?: Partial<AdminFiche>;
    provisoire?: boolean;
    publish?: boolean;
  } = {}
): boolean {
  ensureHydrated();
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche) {
    toast("Fiche introuvable");
    return false;
  }
  const from = fiche.statutWorkflow;
  const transition = makeTransition(
    from,
    to,
    opts.by ?? "Utilisateur",
    opts.commentaire
  );
  const now = transition.at;
  const nextFiche: AdminFiche = {
    ...fiche,
    ...opts.patchFiche,
    statutWorkflow: to,
    lastStepAt: now,
    updatedAt: now,
    historique: [...(fiche.historique ?? []), transition],
  };
  if (opts.commentaire && to === "corrections_demandees") {
    nextFiche.commentaireCorrection = opts.commentaire;
  }
  if (opts.commentaire && to === "rejete") {
    nextFiche.raisonRejet = opts.commentaire;
  }
  if (typeof opts.provisoire === "boolean") {
    nextFiche.provisoire = opts.provisoire;
  }

  state = {
    ...state,
    fiches: state.fiches.map((f) => (f.id === ficheId ? nextFiche : f)),
  };
  syncWorkflowToScenarioAndCoeur(
    nextFiche.scenarioId,
    to,
    Boolean(nextFiche.provisoire),
    opts.publish
  );
  persist(state);
  return true;
}

export function createFiche(scenarioId?: string) {
  ensureHydrated();
  const scn =
    state.scenarios.find((s) => s.id === scenarioId) ?? state.scenarios[0];
  const ent = state.entreprises.find((e) => e.id === scn?.entrepriseId);
  const fiche = emptyFiche(scn?.id ?? "");
  fiche.titre = scn
    ? `Fiche ${scn.titre.split("—")[0]?.trim() || scn.titre}`
    : "Nouvelle fiche";
  fiche.entrepriseNom = ent?.nom ?? "";
  fiche.role = scn?.competence || "Responsable de Production";
  state = { ...state, fiches: [...state.fiches, fiche] };
  if (fiche.scenarioId) {
    syncWorkflowToScenarioAndCoeur(fiche.scenarioId, "brouillon", false);
  }
  persist(state);
  toast("Fiche créée");
  return fiche.id;
}

export function updateFiche(id: string, data: Partial<AdminFiche>) {
  ensureHydrated();
  const fiche = state.fiches.find((f) => f.id === id);
  if (!fiche) return;
  const editable = isFicheContentEditable(fiche.statutWorkflow);
  const contentKeys =
    data.sections !== undefined ||
    data.titre !== undefined ||
    data.entrepriseNom !== undefined ||
    data.role !== undefined ||
    data.scenarioId !== undefined;
  if (!editable && contentKeys) {
    toast("Fiche figée — repassez en brouillon pour modifier");
    return;
  }
  // Never allow free-form statutWorkflow via updateFiche
  const { statutWorkflow: _ignore, historique: _h, ...safe } = data;
  void _ignore;
  void _h;
  patch({
    fiches: state.fiches.map((f) =>
      f.id === id
        ? {
            ...f,
            ...safe,
            sections: data.sections
              ? { ...f.sections, ...data.sections }
              : f.sections,
            updatedAt: new Date().toISOString(),
          }
        : f
    ),
  });
  toast("Fiche enregistrée");
}

/**
 * Draft Cœur from Fiche — used by workflow « Générer le Scénario Provisoire ».
 */
export function generateCoeurFromFiche(ficheId: string): boolean {
  ensureHydrated();
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche?.scenarioId) {
    toast("Liez d'abord la Fiche à un scénario");
    return false;
  }
  const pct = ficheFillPercent(fiche);
  let coeur = getScenarioCoeur(fiche.scenarioId);
  const draftId = `adm-ev-fiche-${fiche.id}`;
  const draftTexte = [
    `Provisoire généré depuis « ${fiche.titre} » (${pct}%).`,
    fiche.sections.contexteEntreprise.slice(0, 280),
    fiche.sections.personnagesRiches.slice(0, 200),
    fiche.sections.decisionsRiches.slice(0, 200),
    fiche.sections.donneesReelles.slice(0, 200),
  ]
    .filter(Boolean)
    .join("\n\n");

  const others = coeur.evenements.filter((e) => e.id !== draftId);
  coeur = {
    ...coeur,
    scenario: {
      ...coeur.scenario,
      titre: coeur.scenario.titre || fiche.titre,
      entrepriseId:
        coeur.scenario.entrepriseId ||
        state.scenarios.find((s) => s.id === fiche.scenarioId)?.entrepriseId ||
        "",
      statutWorkflow: "provisoire_cree",
      provisoire: true,
    },
    evenements: [
      {
        id: draftId,
        jour: 1,
        heure: "08:00",
        type: "Autre",
        titre: `Provisoire Fiche — ${fiche.titre}`,
        texte: draftTexte || "Fiche encore vide — à enrichir.",
      },
      ...others,
    ],
  };

  const ok = applyCoeurFromFiche(
    coeur,
    `Scénario provisoire généré depuis la Fiche « ${fiche.titre} »`
  );
  if (ok) {
    applyFicheWorkflow(ficheId, "provisoire_cree", {
      by: "Système",
      commentaire: "Cœur + Scénario Provisoire générés",
      provisoire: true,
      publish: false,
      patchFiche: { coeurGenere: true },
    });
    toast("Scénario Provisoire créé (badge PROVISOIRE)");
  }
  return ok;
}

export function ficheForScenario(scenarioId: string): AdminFiche | undefined {
  ensureHydrated();
  return state.fiches.find((f) => f.scenarioId === scenarioId);
}

export function soumettreFiche(ficheId: string) {
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche || fiche.statutWorkflow !== "brouillon") {
    toast("Transition interdite");
    return false;
  }
  const ok = applyFicheWorkflow(ficheId, "soumise", {
    commentaire: "Fiche soumise — figée en attente de validation",
  });
  if (ok) toast("Fiche soumise");
  return ok;
}

export function validerFiche(ficheId: string) {
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche || fiche.statutWorkflow !== "soumise") {
    toast("Transition interdite");
    return false;
  }
  const ok = applyFicheWorkflow(ficheId, "fiche_validee", {
    commentaire: "Fiche validée — réel et chiffres cohérents",
  });
  if (ok) toast("Fiche validée");
  return ok;
}

export function demanderCorrectionsFiche(ficheId: string, commentaire: string) {
  if (!commentaire.trim()) {
    toast("Commentaire de correction obligatoire");
    return false;
  }
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche || fiche.statutWorkflow !== "soumise") {
    toast("Transition interdite");
    return false;
  }
  const ok = applyFicheWorkflow(ficheId, "corrections_demandees", {
    commentaire: commentaire.trim(),
  });
  if (ok) toast("Corrections demandées");
  return ok;
}

export function repasserFicheEnBrouillon(ficheId: string) {
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche || fiche.statutWorkflow !== "corrections_demandees") {
    toast("Transition interdite");
    return false;
  }
  const ok = applyFicheWorkflow(ficheId, "brouillon", {
    commentaire: "Retour en brouillon pour corrections",
  });
  if (ok) toast("Fiche repassée en brouillon");
  return ok;
}

export function genererScenarioProvisoire(ficheId: string) {
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche || fiche.statutWorkflow !== "fiche_validee") {
    toast("Transition interdite — validez d'abord la Fiche");
    return false;
  }
  return generateCoeurFromFiche(ficheId);
}

export function lancerTestsAgents(ficheId: string) {
  ensureHydrated();
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (
    !fiche ||
    (fiche.statutWorkflow !== "provisoire_cree" &&
      fiche.statutWorkflow !== "en_test")
  ) {
    toast("Transition interdite");
    return false;
  }
  if (!fiche.scenarioId) {
    toast("Aucun scénario lié");
    return false;
  }
  const reports = runAgentsOnScenario(fiche.scenarioId);
  const agents = state.agents;
  const agentTestReports = reports.map((r) => {
    const agent = agents.find((a) => a.id === r.agentId);
    return {
      agentId: r.agentId,
      nom: agent?.nom ?? r.agentId,
      score: r.score,
      statut: agentReportStatus(r.score, r.issues),
      issues: r.issues.map((i) => ({
        priorite: i.priorite,
        titre: i.titre,
        detail: i.detail,
      })),
      ranAt: r.ranAt,
    };
  });
  const coeur = getScenarioCoeur(fiche.scenarioId);
  const competencePrecision = scanCoeurCompetencePrecision(coeur);
  const ok = applyFicheWorkflow(ficheId, "en_test", {
    commentaire: "Tests Agents lancés",
    provisoire: true,
    publish: false,
    patchFiche: { agentTestReports, competencePrecision },
  });
  if (ok) toast("Tests Agents en cours");
  return ok;
}

export function retenirScenario(ficheId: string) {
  ensureHydrated();
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche || fiche.statutWorkflow !== "en_test") {
    toast("Transition interdite");
    return false;
  }
  const reports = fiche.agentTestReports ?? [];
  if (!allAgentsValidated(reports)) {
    toast("En attente de validation des Agents");
    return false;
  }
  const precision =
    fiche.competencePrecision ??
    (fiche.scenarioId
      ? scanCoeurCompetencePrecision(getScenarioCoeur(fiche.scenarioId))
      : []);
  if (!allCompetenceImpactsPrecise(precision)) {
    toast(
      "Retenir bloqué — toutes les décisions doivent être à Précis ✓ (compétences)"
    );
    return false;
  }
  const ok = applyFicheWorkflow(ficheId, "retenu_publie", {
    commentaire: "Scénario retenu et publié",
    provisoire: false,
    publish: true,
  });
  if (ok) toast("Scénario retenu / publié");
  return ok;
}

export function rejeterScenario(ficheId: string, raison: string) {
  if (!raison.trim()) {
    toast("Raison du rejet obligatoire");
    return false;
  }
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche || fiche.statutWorkflow !== "en_test") {
    toast("Transition interdite");
    return false;
  }
  const ok = applyFicheWorkflow(ficheId, "rejete", {
    commentaire: raison.trim(),
    provisoire: false,
    publish: false,
  });
  if (ok) toast("Scénario rejeté");
  return ok;
}

export function archiverFicheWorkflow(ficheId: string) {
  ensureHydrated();
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche || fiche.statutWorkflow !== "retenu_publie") {
    toast("Transition interdite");
    return false;
  }
  if (fiche.scenarioId) {
    updateScenario(fiche.scenarioId, { statut: "archive" });
  }
  toast("Scénario archivé");
  return true;
}

export function dupliquerFichePourRecommencer(ficheId: string) {
  ensureHydrated();
  const fiche = state.fiches.find((f) => f.id === ficheId);
  if (!fiche || fiche.statutWorkflow !== "rejete") {
    toast("Disponible uniquement pour une fiche rejetée");
    return null;
  }
  const copy = emptyFiche(fiche.scenarioId);
  copy.titre = `${fiche.titre} (copie)`;
  copy.entrepriseNom = fiche.entrepriseNom;
  copy.role = fiche.role;
  copy.sections = { ...fiche.sections };
  state = { ...state, fiches: [...state.fiches, copy] };
  if (copy.scenarioId) {
    syncWorkflowToScenarioAndCoeur(copy.scenarioId, "brouillon", false);
  }
  persist(state);
  toast("Fiche dupliquée — recommencez le workflow");
  return copy.id;
}

/* —— Scenarios —— */
export function createScenario() {
  ensureHydrated();
  const s = emptyScenario(state.scenarios.length + 1);
  const coeur = emptyCoeur(s);
  const meta = appendVersion(
    emptyCoeurMeta(),
    coeur,
    "fiche",
    "Fiche Scénario",
    "Nouveau scénario"
  );
  meta.highlights = meta.highlights.map((h) => ({ ...h, seen: true }));
  patch({
    scenarios: [...state.scenarios, s],
    coeurs: { ...state.coeurs, [s.id]: coeur },
    coeurMeta: { ...state.coeurMeta, [s.id]: meta },
  });
  toast("Scénario créé");
  return s.id;
}

export function updateScenario(id: string, data: Partial<AdminScenario>) {
  ensureHydrated();
  patch({
    scenarios: state.scenarios.map((s) =>
      s.id === id ? { ...s, ...data } : s
    ),
  });
  toast("Scénario enregistré");
}

export function duplicateScenario(id: string) {
  ensureHydrated();
  const src = state.scenarios.find((s) => s.id === id);
  if (!src) return null;
  const copy: AdminScenario = {
    ...src,
    id: `scn-${Date.now().toString(36)}`,
    titre: `${src.titre} (copie)`,
    statut: "brouillon",
    order: state.scenarios.length + 1,
  };
  const decisions = state.decisions
    .filter((d) => d.scenarioId === id)
    .map((d) => ({
      ...d,
      id: `dec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      scenarioId: copy.id,
    }));
  const events = state.events
    .filter((e) => e.scenarioId === id)
    .map((e) => ({
      ...e,
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      scenarioId: copy.id,
    }));
  const srcCoeur = getScenarioCoeur(id);
  const copyCoeur: ScenarioCoeur = {
    ...JSON.parse(JSON.stringify(srcCoeur)),
    scenario: {
      id: copy.id,
      titre: copy.titre,
      entrepriseId: copy.entrepriseId ?? "",
    },
  };
  patch({
    scenarios: [...state.scenarios, copy],
    decisions: [...state.decisions, ...decisions],
    events: [...state.events, ...events],
    coeurs: { ...state.coeurs, [copy.id]: copyCoeur },
  });
  toast("Scénario dupliqué");
  return copy.id;
}

export function archiveScenario(id: string) {
  updateScenario(id, { statut: "archive" });
  toast("Scénario archivé");
}

export function publishScenario(id: string) {
  updateScenario(id, { statut: "publie" });
  toast("Scénario publié");
}

export function reorderScenarios(orderedIds: string[]) {
  ensureHydrated();
  patch({
    scenarios: state.scenarios.map((s) => {
      const idx = orderedIds.indexOf(s.id);
      return idx >= 0 ? { ...s, order: idx + 1 } : s;
    }),
  });
  toast("Ordre de la bibliothèque mis à jour");
}

/* —— Entreprises —— */
export function createEntreprise() {
  ensureHydrated();
  const e = emptyEntreprise();
  patch({ entreprises: [...state.entreprises, e] });
  toast("Entreprise créée");
  return e.id;
}

export function updateEntreprise(id: string, data: Partial<AdminEntreprise>) {
  ensureHydrated();
  patch({
    entreprises: state.entreprises.map((e) =>
      e.id === id ? { ...e, ...data } : e
    ),
  });
  toast("Entreprise enregistrée");
}

/* —— Personnages —— */
export function createPersonnage() {
  ensureHydrated();
  const p = emptyPersonnage();
  patch({ personnages: [...state.personnages, p] });
  toast("Personnage créé");
  return p.id;
}

export function updatePersonnage(id: string, data: Partial<AdminPersonnage>) {
  ensureHydrated();
  patch({
    personnages: state.personnages.map((p) =>
      p.id === id ? { ...p, ...data } : p
    ),
  });
  toast("Personnage enregistré");
}

/* —— Decisions & Events —— */
export function createDecision(scenarioId: string) {
  ensureHydrated();
  const order =
    state.decisions.filter((d) => d.scenarioId === scenarioId).length + 1;
  const d = emptyDecision(scenarioId, order);
  patch({ decisions: [...state.decisions, d] });
  rebuildCoeurFromSlices(scenarioId);
  toast("Décision créée");
  return d.id;
}

export function updateDecision(id: string, data: Partial<AdminDecision>) {
  ensureHydrated();
  const prev = state.decisions.find((d) => d.id === id);
  patch({
    decisions: state.decisions.map((d) =>
      d.id === id ? { ...d, ...data } : d
    ),
  });
  if (prev) rebuildCoeurFromSlices(prev.scenarioId);
  toast("Décision enregistrée — appliquée dans Décider (Mode Joueur)");
}

export function deleteDecision(id: string) {
  ensureHydrated();
  const prev = state.decisions.find((d) => d.id === id);
  patch({ decisions: state.decisions.filter((d) => d.id !== id) });
  if (prev) rebuildCoeurFromSlices(prev.scenarioId);
  toast("Décision supprimée");
}

export function createEvent(scenarioId: string) {
  ensureHydrated();
  const order =
    state.events.filter((e) => e.scenarioId === scenarioId).length + 1;
  const e = emptyEvent(scenarioId, order);
  patch({ events: [...state.events, e] });
  rebuildCoeurFromSlices(scenarioId);
  toast("Événement créé");
  return e.id;
}

export function updateEvent(id: string, data: Partial<AdminEvent>) {
  ensureHydrated();
  const prev = state.events.find((e) => e.id === id);
  patch({
    events: state.events.map((e) => (e.id === id ? { ...e, ...data } : e)),
  });
  if (prev) rebuildCoeurFromSlices(prev.scenarioId);
  toast("Événement enregistré");
}

export function deleteEvent(id: string) {
  ensureHydrated();
  const prev = state.events.find((e) => e.id === id);
  patch({ events: state.events.filter((e) => e.id !== id) });
  if (prev) rebuildCoeurFromSlices(prev.scenarioId);
  toast("Événement supprimé");
}

export function reorderTimeline(
  scenarioId: string,
  kind: "decision" | "event",
  orderedIds: string[]
) {
  ensureHydrated();
  if (kind === "decision") {
    patch({
      decisions: state.decisions.map((d) => {
        if (d.scenarioId !== scenarioId) return d;
        const idx = orderedIds.indexOf(d.id);
        return idx >= 0 ? { ...d, order: idx + 1 } : d;
      }),
    });
  } else {
    patch({
      events: state.events.map((e) => {
        if (e.scenarioId !== scenarioId) return e;
        const idx = orderedIds.indexOf(e.id);
        return idx >= 0 ? { ...e, order: idx + 1 } : e;
      }),
    });
  }
  toast("Timeline mise à jour");
}

/* —— Consultants —— */
export function validateConsultant(id: string) {
  ensureHydrated();
  const sub = state.consultants.find((c) => c.id === id);
  if (!sub) return;
  patch({
    consultants: state.consultants.map((c) =>
      c.id === id ? { ...c, status: "valide" as const } : c
    ),
    scenarios: state.scenarios.map((s) =>
      s.id === sub.scenarioId
        ? {
            ...s,
            statut: "publie" as const,
            consultantPercent: sub.percent,
          }
        : s
    ),
  });
  toast("Scénario consultant validé");
}

export function refuseConsultant(id: string) {
  ensureHydrated();
  const sub = state.consultants.find((c) => c.id === id);
  patch({
    consultants: state.consultants.map((c) =>
      c.id === id ? { ...c, status: "refuse" as const } : c
    ),
    scenarios: sub
      ? state.scenarios.map((s) =>
          s.id === sub.scenarioId
            ? { ...s, statut: "archive" as const }
            : s
        )
      : state.scenarios,
  });
  toast("Scénario consultant refusé");
}

export function updateConsultantPercent(id: string, percent: number) {
  ensureHydrated();
  patch({
    consultants: state.consultants.map((c) =>
      c.id === id ? { ...c, percent } : c
    ),
  });
  toast("Pourcentage consultant mis à jour");
}

export function clearAdminToast() {
  ensureHydrated();
  if (!state.toast) return;
  persist({ ...state, toast: null });
}

export function resetAdminData() {
  const seed = createAdminSeed();
  persist(seed);
  toast("Données admin réinitialisées");
}

/* —— Agents (pilot the CŒUR; not the CŒUR itself) —— */
export function updateAgent(id: string, data: Partial<AgentProfile>) {
  ensureHydrated();
  patch({
    agents: state.agents.map((a) => (a.id === id ? { ...a, ...data } : a)),
  });
  toast("Agent mis à jour — vous modifiez le pilotage du Cœur, pas le Cœur lui-même.");
}

export function duplicateAgent(id: string) {
  ensureHydrated();
  const src = state.agents.find((a) => a.id === id);
  if (!src) return null;
  const copy: AgentProfile = {
    ...src,
    id: `agent-${Date.now().toString(36)}`,
    nom: `${src.nom} (copie)`,
    competences: [...src.competences],
    icone: src.icone ?? "target",
  };
  patch({ agents: [...state.agents, copy] });
  toast("Agent dupliqué");
  return copy.id;
}

export function createAgent() {
  ensureHydrated();
  const a: AgentProfile = {
    id: `agent-${Date.now().toString(36)}`,
    nom: "Nouvel agent",
    role: "À définir",
    competences: [],
    mission: "",
    sortieAttendue: "",
    niveauExigence: "normal",
    actif: true,
    icone: "target",
  };
  patch({ agents: [...state.agents, a] });
  toast("Agent créé — vous modifiez le pilotage du Cœur, pas le Cœur lui-même.");
  return a.id;
}

export function setAgentActive(id: string, actif: boolean) {
  updateAgent(id, { actif });
}

/** Simulated agent run — produces reports; optional demo patch via Expert Métier. */
export function runAgentsOnScenario(scenarioId: string, onlyId?: string) {
  ensureHydrated();
  const coeur = getScenarioCoeur(scenarioId);
  const agents = state.agents.filter((a) =>
    onlyId ? a.id === onlyId && a.actif : a.actif
  );
  const reports: AgentRunReport[] = agents.map((a) => {
    const issues = [];
    if (a.id === "agent-metier" || a.role.toLowerCase().includes("métier")) {
      const d1 = coeur.decisions.find((d) => d.jour === 1);
      const cap = d1?.choix.find((c) => /capteur/i.test(c.label));
      const cash = cap?.consequences.find((c) => c.cible === "tresorerie");
      if (cash && cash.valeur === -5000) {
        issues.push({
          priorite: "moyenne" as const,
          titre: "Coût capteur sous-évalué",
          detail: "Un capteur industriel + pose est souvent > 5 k€ en 2026.",
          solution: "Passer Trésorerie à -6000 sur le choix Capteur.",
          nodeId: cap?.id,
        });
      }
    }
    if (a.id === "agent-coherence-erp") {
      for (const d of coeur.decisions) {
        for (const c of d.choix) {
          for (const cons of c.consequences) {
            if (cons.cible.includes("tresoreriee") || cons.cible === "cash") {
              issues.push({
                priorite: "haute" as const,
                titre: `Cible invalide ${cons.cible}`,
                detail: `Décision ${d.id} / choix ${c.id}`,
                solution: "Remplacer par tresorerie",
                nodeId: d.id,
              });
            }
          }
          for (const imp of c.competencesImpactees ?? []) {
            const lockErrs = validateLockedImpact(imp, `${d.id}/${c.id}`);
            for (const e of lockErrs) {
              issues.push({
                priorite: "haute" as const,
                titre: "Utilisation imprécise",
                detail: e.message,
                solution:
                  "Corriger competenceId / indicateurTeste / feedbacks dans le Cœur",
                nodeId: d.id,
              });
            }
          }
        }
      }
    }
    if (a.id === "agent-testeur") {
      issues.push({
        priorite: "basse" as const,
        titre: "Branche « Rien » peu enseignante",
        detail: "Le joueur peut terminer J1 sans lever le brouillard.",
        solution: "Renforcer le feedbackTexte du choix Rien.",
        nodeId: "d1-rien",
      });
    }
    if (a.id === "agent-pedagogue") {
      let incoherent = 0;
      for (const d of coeur.decisions) {
        for (const c of d.choix) {
          for (const imp of c.competencesImpactees ?? []) {
            const { statut, erreurs } = evaluateImpactPrecision(
              d.dilemme,
              normalizeLockedImpact(imp)
            );
            if (statut === "incoherent" || erreurs.some((e) => e.includes("Incohérence"))) {
              incoherent++;
              issues.push({
                priorite: "haute" as const,
                titre: "Incohérence : décision ne teste pas l'indicateur annoncé",
                detail: `${d.titre} / ${c.label} — ${erreurs.join(" ; ")}`,
                solution:
                  "Réécrire le dilemme pour parler de l'indicateur, ou changer indicateurTeste",
                nodeId: d.id,
              });
            }
          }
        }
      }
      if (incoherent === 0) {
        issues.push({
          priorite: "basse" as const,
          titre: "Couverture compétences",
          detail: "Éthique concentrée J4 — peu de rappels avant.",
          solution: "Ajouter un hint éthique en feedback J2.",
        });
      }
    }
    const penalty = issues.reduce(
      (s, i) => s + (i.priorite === "haute" ? 25 : i.priorite === "moyenne" ? 12 : 5),
      0
    );
    return {
      agentId: a.id,
      score: Math.max(0, 100 - penalty),
      issues,
      ranAt: new Date().toISOString(),
    };
  });
  persist({ ...state, agentReports: reports });
  toast(
    onlyId
      ? "Rapport agent généré"
      : `Rapport multi-agents : ${reports.length} agent(s)`
  );
  return reports;
}

/** Apply a demo métier patch (authorized agent path) for highlight demo. */
export function applyAgentMetierCapteurPatch(scenarioId: string) {
  ensureHydrated();
  const coeur = JSON.parse(JSON.stringify(getScenarioCoeur(scenarioId))) as ScenarioCoeur;
  const d1 = coeur.decisions.find((d) => d.jour === 1);
  const cap = d1?.choix.find((c) => /capteur/i.test(c.label));
  const cash = cap?.consequences.find((c) => c.cible === "tresorerie");
  if (!cash) {
    toast("Aucune conséquence trésorerie Capteur à patcher");
    return false;
  }
  cash.valeur = -6000;
  return applyCoeurFromAgent(
    coeur,
    "Agent Expert Métier",
    "Ajustement coût capteur : Trésorerie -5000 → -6000"
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AdminState {
  ensureHydrated();
  return state;
}

function getServerSnapshot(): AdminState {
  return createAdminSeed();
}

export function useAdminStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    createScenario,
    updateScenario,
    duplicateScenario,
    archiveScenario,
    publishScenario,
    reorderScenarios,
    createFiche,
    updateFiche,
    generateCoeurFromFiche,
    ficheForScenario,
    soumettreFiche,
    validerFiche,
    demanderCorrectionsFiche,
    repasserFicheEnBrouillon,
    genererScenarioProvisoire,
    lancerTestsAgents,
    retenirScenario,
    rejeterScenario,
    archiverFicheWorkflow,
    dupliquerFichePourRecommencer,
    createEntreprise,
    updateEntreprise,
    createPersonnage,
    updatePersonnage,
    createDecision,
    updateDecision,
    deleteDecision,
    createEvent,
    updateEvent,
    deleteEvent,
    reorderTimeline,
    validateConsultant,
    refuseConsultant,
    updateConsultantPercent,
    clearAdminToast,
    resetAdminData,
    getScenarioCoeur,
    getCoeurMeta,
    applyScenarioCoeur,
    applyCoeurFromAgent,
    applyCoeurFromFiche,
    markCoeurHighlightsSeen,
    updateAgent,
    duplicateAgent,
    createAgent,
    setAgentActive,
    runAgentsOnScenario,
    applyAgentMetierCapteurPatch,
    updateGlossaireTerme,
    createGlossaireTerme,
    deleteGlossaireTerme,
    addJournalDecision,
  };
}

/* —— Workflow > Glossaire (human edits only; AI read-only) —— */
export function updateGlossaireTerme(
  terme: string,
  patchData: Partial<
    Omit<GlossaireTerme, "terme" | "seed">
  >
): boolean {
  ensureHydrated();
  const idx = state.glossaire.findIndex((t) => t.terme === terme);
  if (idx < 0) {
    toast("Terme introuvable dans le Glossaire");
    return false;
  }
  const precise = (patchData.definitionPrecise ?? state.glossaire[idx]!.definitionPrecise).trim();
  if (!precise || precise.length < 20) {
    toast("Définition précise obligatoire (1-2 phrases exactes)");
    return false;
  }
  const next = [...state.glossaire];
  const cur = next[idx]!;
  next[idx] = {
    ...cur,
    ...patchData,
    terme: cur.terme,
    seed: cur.seed,
    definitionPrecise: precise,
    definitionCourte:
      (patchData.definitionCourte ?? cur.definitionCourte).trim() || precise,
    updatedAt: new Date().toISOString(),
  };
  patch({ glossaire: next });
  toast("Terme Glossaire enregistré");
  return true;
}

export function createGlossaireTerme(input: {
  terme: string;
  nomLisible: string;
  definitionPrecise: string;
  definitionCourte?: string;
  exempleConcret?: string;
  utilisations?: GlossaireTerme["utilisations"];
  synonymesInterdits?: string[];
}): GlossaireTerme | null {
  ensureHydrated();
  const id = slugifyTerme(input.terme);
  if (!id) {
    toast("Identifiant technique invalide");
    return null;
  }
  if (state.glossaire.some((t) => t.terme === id)) {
    toast(`Le terme « ${id} » existe déjà`);
    return null;
  }
  if (!input.definitionPrecise.trim() || input.definitionPrecise.trim().length < 20) {
    toast("Définition précise obligatoire");
    return null;
  }
  const created = emptyGlossaireTerme({
    terme: id,
    nomLisible: input.nomLisible.trim() || id,
    definitionPrecise: input.definitionPrecise.trim(),
    definitionCourte:
      input.definitionCourte?.trim() || input.definitionPrecise.trim(),
    exempleConcret: input.exempleConcret?.trim() || "",
    utilisations: input.utilisations,
    synonymesInterdits: input.synonymesInterdits,
  });
  patch({ glossaire: [...state.glossaire, created] });
  toast("Terme ajouté au Glossaire");
  return created;
}

export function deleteGlossaireTerme(terme: string): boolean {
  ensureHydrated();
  const entry = state.glossaire.find((t) => t.terme === terme);
  if (!entry) {
    toast("Terme introuvable");
    return false;
  }
  const publishedTexts: string[] = [];
  for (const [sid, coeur] of Object.entries(state.coeurs)) {
    const scn = state.scenarios.find((s) => s.id === sid);
    const published =
      scn?.statut === "publie" ||
      scn?.statutWorkflow === "retenu_publie" ||
      coeur.scenario.statutWorkflow === "retenu_publie";
    if (!published) continue;
    publishedTexts.push(JSON.stringify(coeur));
  }
  if (isTermUsedInPublishedCoeur(terme, publishedTexts)) {
    toast(
      "Suppression refusée : ce terme est utilisé dans un Cœur publié"
    );
    return false;
  }
  patch({ glossaire: state.glossaire.filter((t) => t.terme !== terme) });
  toast("Terme Glossaire supprimé");
  return true;
}

/* —— Workflow > Journal des décisions (append-only) —— */
export function addJournalDecision(input: {
  titre: string;
  decision: string;
  pourquoi: string;
  consequenceSiChange: string;
  moduleLie: JournalModuleLie;
}): JournalDecision | null {
  ensureHydrated();
  if (!input.titre.trim() || !input.decision.trim() || !input.pourquoi.trim()) {
    toast("Titre, Décision et Pourquoi sont obligatoires");
    return null;
  }
  const created = createLockedJournalDecision({
    ...input,
    moduleHref: JOURNAL_MODULE_HREFS[input.moduleLie],
  });
  patch({
    journalDecisions: [created, ...state.journalDecisions],
  });
  toast("Décision ajoutée au journal (verrouillée)");
  return created;
}

export type { AdminConsultantSubmission };
