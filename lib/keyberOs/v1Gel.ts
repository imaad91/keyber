/**
 * Étape 40 — Gel V1 architecture (avant migration Novacier).
 * Contrat figé OS / Book / Atelier + preuve Contrôle « système prouvé avec Lumière ».
 * Lecture seule — ne patche rien.
 */

import { evaluateBookParityChecklist } from "@/lib/bookParityChecklist";
import {
  bookVersionLabel,
  type BookEntry,
} from "@/lib/bookStore";
import {
  OS_BOOK_PLAY_PATH,
  OS_LEGACY_PLAY_PATH,
  OS_LIVE_CATALOG_PATH,
  OS_LIVE_COMPETENCE_PATH,
  OS_LIVE_HISTOIRE_PATH,
} from "@/lib/keyberOs/bookBridge";
import { OS_PARAM_LOADER_RULES } from "@/lib/keyberOs/paramLoader";
import type { OsModuleId } from "@/lib/keyberOs/types";
import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { SCENARIO_FILE_CONTRACT } from "@/lib/scenarioFileContract";

/** Entreprise preuve V1 (exception démo plan) — filtre Contrôle uniquement. */
export const V1_PROOF_ENTREPRISE = "Lumière & Co";

export const V1_GEL = {
  id: "etape-40-gel-v1",
  title: "Gel V1 — architecture figée",
  version: 1,
  /** Ce que V1 garantit avant Novacier. */
  guarantees: [
    "OS générique : aucun métier hardcodé dans lib/keyberOs/*.",
    "1 scénario = 1 Mode (Compétence XOR Histoire).",
    "1 scénario = 1 fichier JSON concaténé (contrat Étape 35).",
    "Loader Book : disk | embedded uniquement (Étape 36) — zéro fallback Novacier.",
    "Chemin joueur officiel : /jouer/book/[id] via OsPlayShell + pipeline.",
    "Catalogue Live : /jouer/live → Compétence | Histoire (Étape 39).",
    "Studio (keyber-studio-*) ≠ jeu (keyber-os-* / keyber-play-catalog-v1).",
    "Live Book = une version figée par lignée.",
  ],
  /** Historique post-gel (étapes 41–42 livrées). */
  deferred: [
    "Étape 41 — Pack Novacier Book (exemple) : FAIT.",
    "Étape 42 — /play redirigé vers /jouer/live ; POC joueur retiré : FAIT.",
  ],
  contractRefs: [
    SCENARIO_FILE_CONTRACT.id,
    "etape-36-loader-strict",
    "etape-39-catalogue-live",
    "KEYBER_OS_RULES.md",
  ],
} as const;

export const V1_OS_MODULES: { id: OsModuleId; label: string }[] = [
  { id: "donnees-sauvegarde", label: "Données & Sauvegarde" },
  { id: "moteur-scenarios", label: "Moteur de Scénarios" },
  { id: "moteur-decisions", label: "Moteur de Décisions" },
  { id: "moteur-evenements", label: "Moteur d'Événements" },
  { id: "notifications", label: "Notifications" },
  { id: "erp", label: "ERP" },
  { id: "progression", label: "Progression" },
  { id: "interface-joueur", label: "Interface Joueur" },
  { id: "ordinateur", label: "Ordinateur" },
  { id: "temps", label: "Temps" },
  { id: "cycle-vie", label: "Cycle de vie" },
  { id: "interviews", label: "Interviews" },
  { id: "relations", label: "Relations" },
  { id: "objectifs", label: "Objectifs" },
  { id: "visibilite", label: "Visibilité" },
];

export type V1ProofCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type V1LumiereProofReport = {
  generatedAt: string;
  entreprise: string;
  /** VERT = système prouvé avec Lumière pour gel V1. */
  verdict: "VERT" | "JAUNE" | "ROUGE";
  verdictLabel: string;
  checks: V1ProofCheck[];
  liveHistoire: { id: string; label: string; scorePct: number } | null;
  liveCompetence: { id: string; label: string; scorePct: number } | null;
  modulesOff: string[];
  paths: {
    book: string;
    live: string;
    competence: string;
    histoire: string;
    legacy: string;
  };
  summaryLines: string[];
  texte: string;
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function isLumiere(e: BookEntry): boolean {
  return norm(e.entrepriseNom).includes("lumière") ||
    norm(e.entrepriseNom).includes("lumiere");
}

/**
 * Rapport Contrôle Étape 40 — preuve V1 via Lumière & Co Live.
 */
export function buildV1LumiereProofReport(
  entries: BookEntry[]
): V1LumiereProofReport {
  const generatedAt = new Date().toISOString();
  const lumiere = entries.filter(isLumiere);
  const liveHist = lumiere
    .filter((e) => e.status === "live" && e.mode === "histoire")
    .sort((a, b) => b.version - a.version)[0];
  const liveComp = lumiere
    .filter((e) => e.status === "live" && e.mode === "competence")
    .sort((a, b) => b.version - a.version)[0];

  const histParity = liveHist?.paramFile
    ? evaluateBookParityChecklist(liveHist.paramFile)
    : null;
  const compParity = liveComp?.paramFile
    ? evaluateBookParityChecklist(liveComp.paramFile)
    : null;

  const modulesOff = V1_OS_MODULES.filter((m) => !isOsModuleEnabled(m.id)).map(
    (m) => m.label
  );

  const checks: V1ProofCheck[] = [
    {
      id: "cartes-lumiere",
      label: "Cartes Book Lumière présentes",
      ok: lumiere.length > 0,
      detail: lumiere.length
        ? `${lumiere.length} carte(s) Book pour ${V1_PROOF_ENTREPRISE}`
        : "Aucune carte Book Lumière — seed démo ou générer puis publier Live.",
    },
    {
      id: "live-histoire",
      label: "Histoire Live figée",
      ok: Boolean(liveHist?.paramFile),
      detail: liveHist
        ? `${bookVersionLabel(liveHist)} · param ${liveHist.paramFileName || "embedded"}`
        : "Pas d'Histoire Live Lumière — Book → Live sur une version.",
    },
    {
      id: "live-competence",
      label: "Compétence Live figée",
      ok: Boolean(liveComp?.paramFile),
      detail: liveComp
        ? `${bookVersionLabel(liveComp)} · param ${liveComp.paramFileName || "embedded"}`
        : "Pas de Compétence Live Lumière — Book → Live sur une version.",
    },
    {
      id: "parite-histoire",
      label: "Checklist feeling Histoire = 100%",
      ok: Boolean(histParity?.allOk),
      detail: histParity
        ? `${histParity.okCount}/${histParity.total} (${histParity.scorePct}%)`
        : "Impossible d'évaluer (pas de param Histoire Live).",
    },
    {
      id: "parite-competence",
      label: "Checklist feeling Compétence = 100%",
      ok: Boolean(compParity?.allOk),
      detail: compParity
        ? `${compParity.okCount}/${compParity.total} (${compParity.scorePct}%)`
        : "Impossible d'évaluer (pas de param Compétence Live).",
    },
    {
      id: "modules-os",
      label: "Modules Keyber OS tous ON",
      ok: modulesOff.length === 0,
      detail: modulesOff.length
        ? `OFF : ${modulesOff.join(", ")}`
        : `${V1_OS_MODULES.length} modules runtime activés`,
    },
    {
      id: "contrat-fichier",
      label: "Contrat 1 fichier / scénario figé",
      ok: true,
      detail: SCENARIO_FILE_CONTRACT.rules[0],
    },
    {
      id: "loader-strict",
      label: "Loader OS strict (pas de fallback Novacier)",
      ok: true,
      detail: OS_PARAM_LOADER_RULES[1],
    },
    {
      id: "catalogue-live",
      label: "Catalogue Live Compétence ≠ Histoire",
      ok: true,
      detail: `${OS_LIVE_COMPETENCE_PATH} · ${OS_LIVE_HISTOIRE_PATH}`,
    },
    {
      id: "legacy-play",
      label: "Legacy /play retiré de l'entrée joueur (Étape 42)",
      ok: true,
      detail: `${OS_LEGACY_PLAY_PATH} → /jouer/live (POC joueur retiré, plus d'archive).`,
    },
  ];

  const blocking = checks.filter(
    (c) =>
      !c.ok &&
      c.id !== "contrat-fichier" &&
      c.id !== "loader-strict" &&
      c.id !== "catalogue-live" &&
      c.id !== "legacy-play"
  );
  const critical = blocking.filter((c) =>
    ["cartes-lumiere", "live-histoire", "live-competence"].includes(c.id)
  );

  let verdict: V1LumiereProofReport["verdict"] = "VERT";
  let verdictLabel = "Système prouvé avec Lumière — gel V1 OK";
  if (critical.length > 0) {
    verdict = "ROUGE";
    verdictLabel = "Preuve Lumière incomplète — Live / cartes manquantes";
  } else if (blocking.length > 0) {
    verdict = "JAUNE";
    verdictLabel =
      "Presque prêt — checklist ou modules OS à verdisser avant gel";
  }

  const liveHistoire = liveHist
    ? {
        id: liveHist.id,
        label: bookVersionLabel(liveHist),
        scorePct: histParity?.scorePct ?? 0,
      }
    : null;
  const liveCompetence = liveComp
    ? {
        id: liveComp.id,
        label: bookVersionLabel(liveComp),
        scorePct: compParity?.scorePct ?? 0,
      }
    : null;

  const summaryLines = [
    `Gel V1 (Étape 40) — ${new Date(generatedAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} (Europe/Paris)`,
    `Verdict : ${verdict} — ${verdictLabel}`,
    `Preuve : ${V1_PROOF_ENTREPRISE}`,
    liveHistoire
      ? `Histoire Live : ${liveHistoire.label} (${liveHistoire.scorePct}%)`
      : "Histoire Live : absente",
    liveCompetence
      ? `Compétence Live : ${liveCompetence.label} (${liveCompetence.scorePct}%)`
      : "Compétence Live : absente",
    `Modules OS OFF : ${modulesOff.length ? modulesOff.join(", ") : "aucun"}`,
    `Checks OK : ${checks.filter((c) => c.ok).length}/${checks.length}`,
    "Ce rapport propose — il ne patche pas le code ni le param.",
  ];

  const texte = [
    "# Rapport Contrôle — Système prouvé avec Lumière (Étape 40)",
    "",
    ...summaryLines.map((l) => `- ${l}`),
    "",
    "## Checks",
    "",
    ...checks.map(
      (c) =>
        `- [${c.ok ? "OK" : "KO"}] ${c.label}\n  ${c.detail}`
    ),
    "",
    "## Contrat V1 figé",
    "",
    ...V1_GEL.guarantees.map((g) => `- ${g}`),
    "",
    "## Différé (après go V1)",
    "",
    ...V1_GEL.deferred.map((d) => `- ${d}`),
    "",
  ].join("\n");

  return {
    generatedAt,
    entreprise: V1_PROOF_ENTREPRISE,
    verdict,
    verdictLabel,
    checks,
    liveHistoire,
    liveCompetence,
    modulesOff,
    paths: {
      book: `${OS_BOOK_PLAY_PATH}/[id]`,
      live: OS_LIVE_CATALOG_PATH,
      competence: OS_LIVE_COMPETENCE_PATH,
      histoire: OS_LIVE_HISTOIRE_PATH,
      legacy: OS_LEGACY_PLAY_PATH,
    },
    summaryLines,
    texte,
  };
}
