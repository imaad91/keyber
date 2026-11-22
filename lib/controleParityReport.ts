/**
 * Étape 25 — Rapport Contrôle « parité feeling ».
 * Propose / affiche les trous (Book checklist, OS OFF, double moteur).
 * Ne patche rien — lecture seule.
 */

import { evaluateBookParityChecklist } from "@/lib/bookParityChecklist";
import type { BookParityReport } from "@/lib/bookParityChecklist";
import {
  bookVersionLabel,
  type BookEntry,
} from "@/lib/bookStore";
import {
  OS_BOOK_PLAY_PATH,
  OS_LEGACY_PLAY_PATH,
} from "@/lib/keyberOs/bookBridge";
import {
  getOsRuntimeConfig,
  isOsModuleEnabled,
} from "@/lib/keyberOsRuntime";
import type { OsModuleId } from "@/lib/keyberOs/types";

export type ControleParityFinding = {
  severity: "critique" | "majeure" | "mineure" | "info";
  area: string;
  title: string;
  detail: string;
  /** Suggestion — ne pas appliquer automatiquement. */
  proposal: string;
};

export type ControleParityBookRow = {
  entryId: string;
  label: string;
  status: string;
  mode: string;
  scorePct: number;
  okCount: number;
  total: number;
  missing: string[];
};

export type ControleParityReport = {
  generatedAt: string;
  findings: ControleParityFinding[];
  books: ControleParityBookRow[];
  osModulesOff: { id: OsModuleId; label: string }[];
  dualEngine: {
    officialPath: string;
    legacyPath: string;
    note: string;
  };
  summaryLines: string[];
  /** Texte collable dans Contrôle > Rapports. */
  texte: string;
  score: number;
};

const OS_MODULE_LABELS: { id: OsModuleId; label: string }[] = [
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

function severityRank(s: ControleParityFinding["severity"]): number {
  switch (s) {
    case "critique":
      return 0;
    case "majeure":
      return 1;
    case "mineure":
      return 2;
    default:
      return 3;
  }
}

/**
 * Construit le rapport depuis les cartes Book + runtime OS actuel.
 * `entries` = snapshot Book (localStorage).
 */
export function buildControleParityReport(
  entries: BookEntry[]
): ControleParityReport {
  const generatedAt = new Date().toISOString();
  const findings: ControleParityFinding[] = [];
  const books: ControleParityBookRow[] = [];

  // —— Double moteur (Étape 42 : /play redirigé) ——
  findings.push({
    severity: "info",
    area: "Entrée joueur",
    title: "Porte unique Book Live (Étape 42)",
    detail: `Catalogue officiel : /jouer/live → ${OS_BOOK_PLAY_PATH}/[id]. Ancien ${OS_LEGACY_PLAY_PATH} redirige vers le Live (POC joueur retiré).`,
    proposal:
      "Ne plus lier le produit à /play — redirection permanente vers /jouer/live.",
  });

  // —— Modules OS OFF ——
  const osModulesOff = OS_MODULE_LABELS.filter((m) => !isOsModuleEnabled(m.id));
  for (const m of osModulesOff) {
    findings.push({
      severity: "majeure",
      area: "Keyber OS runtime",
      title: `Module « ${m.label} » désactivé`,
      detail: `isOsModuleEnabled("${m.id}") === false dans keyber-os-runtime-v1.`,
      proposal: `Réactiver le module dans Admin → Keyber OS → ${m.label} si tu veux le feeling complet en Test.`,
    });
  }

  // —— Cartes Book ——
  const latestByFamily = new Map<string, BookEntry>();
  for (const e of entries) {
    const prev = latestByFamily.get(e.familyId);
    if (!prev || e.version > prev.version) latestByFamily.set(e.familyId, e);
  }
  const focus = Array.from(latestByFamily.values()).sort((a, b) =>
    a.entrepriseNom.localeCompare(b.entrepriseNom)
  );

  if (focus.length === 0) {
    findings.push({
      severity: "critique",
      area: "Book",
      title: "Aucune carte Book",
      detail: "Le store Book est vide — impossible d'évaluer la parité feeling.",
      proposal:
        "Seed Lumière ou Book → Générer après Atelier rempli, puis relancer ce rapport.",
    });
  }

  for (const entry of focus) {
    const parity: BookParityReport = evaluateBookParityChecklist(
      entry.paramFile
    );
    const missing = parity.items.filter((i) => !i.ok).map((i) => i.label);
    books.push({
      entryId: entry.id,
      label: bookVersionLabel(entry),
      status: entry.status,
      mode: entry.mode,
      scorePct: parity.scorePct,
      okCount: parity.okCount,
      total: parity.total,
      missing,
    });

    if (!entry.paramFile) {
      findings.push({
        severity: "critique",
        area: "Book",
        title: `${bookVersionLabel(entry)} — param manquant`,
        detail: "paramFile null : Vue Code vide.",
        proposal: "Régénérer la coquille ou coller un JSON param valide.",
      });
      continue;
    }

    if (parity.scorePct < 40) {
      findings.push({
        severity: "critique",
        area: "Book checklist",
        title: `${bookVersionLabel(entry)} — parité ${parity.scorePct}%`,
        detail: `Manques : ${missing.join(", ") || "—"}.`,
        proposal:
          "Remplir le param (Atelier → Générer / contenu Lumière) jusqu'à vertir les cases feeling. Ne pas inventer hors démo Lumière.",
      });
    } else if (parity.scorePct < 80) {
      findings.push({
        severity: "majeure",
        area: "Book checklist",
        title: `${bookVersionLabel(entry)} — parité partielle ${parity.scorePct}%`,
        detail: `Encore rouge : ${missing.join(", ") || "—"}.`,
        proposal: "Compléter les blocs manquants listés ; retester /jouer/book/[id].",
      });
    } else if (!parity.allOk) {
      findings.push({
        severity: "mineure",
        area: "Book checklist",
        title: `${bookVersionLabel(entry)} — presque complet (${parity.scorePct}%)`,
        detail: `Restent : ${missing.join(", ")}.`,
        proposal: "Peaufiner les derniers items avant Live feeling-complet.",
      });
    } else {
      findings.push({
        severity: "info",
        area: "Book checklist",
        title: `${bookVersionLabel(entry)} — checklist 100%`,
        detail: "Toutes les cases feeling sont vertes sur le param.",
        proposal: "Valider en session Test ; Contrôle ne patche pas le contenu.",
      });
    }
  }

  // —— Runtime snapshot info ——
  const cfg = getOsRuntimeConfig();
  findings.push({
    severity: "info",
    area: "Runtime",
    title: "Snapshot Keyber OS",
    detail: `Autosave=${cfg.donneesSauvegarde.autosave ? "on" : "off"} · modules OFF=${osModulesOff.length}.`,
    proposal: "Consulter Admin → Keyber OS pour ajuster les toggles (manuel).",
  });

  findings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

  const critiques = findings.filter((f) => f.severity === "critique").length;
  const majeures = findings.filter((f) => f.severity === "majeure").length;
  const avgBook =
    books.length === 0
      ? 0
      : Math.round(
          books.reduce((s, b) => s + b.scorePct, 0) / books.length
        );
  const score = Math.max(
    0,
    Math.min(
      100,
      avgBook - critiques * 15 - majeures * 5 - osModulesOff.length * 3
    )
  );

  const summaryLines = [
    `Rapport parité feeling — ${new Date(generatedAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} (Europe/Paris)`,
    `Score synthétique : ${score}/100 · Book moy. ${avgBook}% · ${critiques} critique(s) · ${majeures} majeure(s) · ${osModulesOff.length} module(s) OS OFF`,
    `Entrée joueur : /jouer/live → ${OS_BOOK_PLAY_PATH}/[id] · ${OS_LEGACY_PLAY_PATH} redirigé (Étape 42)`,
    books.length
      ? `Cartes analysées (dernière version / famille) : ${books.map((b) => `${b.label} ${b.scorePct}%`).join(" · ")}`
      : "Aucune carte Book à analyser",
    "Ce rapport propose — il ne patche pas le code ni le param.",
  ];

  const texte = [
    "# Rapport Contrôle — Parité feeling (Étape 25)",
    "",
    ...summaryLines.map((l) => `- ${l}`),
    "",
    "## Findings",
    "",
    ...findings.map(
      (f, i) =>
        `${i + 1}. [${f.severity.toUpperCase()}] (${f.area}) ${f.title}\n   ${f.detail}\n   → Proposition : ${f.proposal}`
    ),
    "",
    "## Book — détail checklist",
    "",
    ...(books.length
      ? books.map(
          (b) =>
            `- ${b.label} [${b.status}/${b.mode}] ${b.okCount}/${b.total} (${b.scorePct}%)${
              b.missing.length ? ` — manque : ${b.missing.join(", ")}` : ""
            }`
        )
      : ["- (vide)"]),
    "",
    "## Modules OS désactivés",
    "",
    ...(osModulesOff.length
      ? osModulesOff.map((m) => `- ${m.label} (\`${m.id}\`)`)
      : ["- Aucun"]),
    "",
  ].join("\n");

  return {
    generatedAt,
    findings,
    books,
    osModulesOff,
    dualEngine: {
      officialPath: `${OS_BOOK_PLAY_PATH}/[id]`,
      legacyPath: OS_LEGACY_PLAY_PATH,
      note: "Étape 42 — /play redirige vers /jouer/live ; POC joueur retiré.",
    },
    summaryLines,
    texte,
    score,
  };
}
