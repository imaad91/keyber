/**
 * Étape 35 — Contrat « 1 scénario = 1 fichier concaténé ».
 * Tout le feeling / param vit dans un seul JSON sous data/scenarios/<id>/…
 * L'OS ne doit rien lire hors de ce fichier pour un scénario Book.
 */

import { slugForParamFile } from "@/lib/bookGenerationPrompt";
import {
  SCENARIO_PARAM_BLOCKS,
  normalizeScenarioParamFile,
  validateScenarioParamFile,
  type ScenarioParamFileExtended,
} from "@/lib/scenarioParamSchema";

/** Clés interdites = contenu / pointeurs hors fichier unique. */
export const FORBIDDEN_EXTERNAL_KEYS = [
  "$ref",
  "$import",
  "importFrom",
  "importPath",
  "externalPack",
  "externalUrl",
  "loadFrom",
  "scenarioRegistry",
  "registryId",
  "contextPath",
  "ordinateurPath",
  "eventsPath",
] as const;

export const SCENARIO_FILE_CONTRACT = {
  id: "etape-35-fichier-unique",
  title: "1 scénario = 1 fichier concaténé",
  version: 1,
  rules: [
    "Un scénario Book = un seul fichier JSON sous data/scenarios/<id>/…",
    "Tous les blocs schéma (Contexte, Events, Ordinateur, Jours, Interviews, Objectifs, Kpis, Décisions, Fins, Livre…) sont DANS ce fichier — même vides ([] / {}).",
    "Le champ `fichier` nomme ce JSON ; pas de second fichier de feeling pour le même scénario.",
    "Interdit : pointeurs / imports externes ($ref, importFrom, loadFrom, registry…).",
    "L'OS Book lit uniquement ce fichier (Étape 36) — zéro fallback Novacier / registry entreprise.",
  ],
} as const;

export type ScenarioContractIssue = {
  level: "error" | "warn";
  code: string;
  message: string;
};

export type ScenarioContractResult = {
  ok: boolean;
  issues: ScenarioContractIssue[];
  /** Chemin disque relatif attendu. */
  diskRelativePath: string | null;
  scenarioId: string | null;
  fileName: string | null;
  /** Param normalisé si JSON valide (même si contrat KO). */
  param: ScenarioParamFileExtended | null;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function collectForbiddenKeys(
  node: unknown,
  path: string,
  out: { path: string; key: string }[]
) {
  if (Array.isArray(node)) {
    node.forEach((item, i) =>
      collectForbiddenKeys(item, `${path}[${i}]`, out)
    );
    return;
  }
  if (!isPlainObject(node)) return;
  for (const [k, v] of Object.entries(node)) {
    const lower = k.toLowerCase();
    if (
      (FORBIDDEN_EXTERNAL_KEYS as readonly string[]).includes(k) ||
      (FORBIDDEN_EXTERNAL_KEYS as readonly string[]).some(
        (f) => f.toLowerCase() === lower
      )
    ) {
      out.push({ path: path || "(racine)", key: k });
    }
    collectForbiddenKeys(v, path ? `${path}.${k}` : k, out);
  }
}

export function scenarioIdFromEntreprise(entrepriseNom: string): string {
  return slugForParamFile(entrepriseNom) || "scenario";
}

export function buildScenarioDiskRelativePath(
  scenarioId: string,
  fileName: string
): string {
  const safeId = scenarioId.replace(/[^a-z0-9-_]/gi, "-").slice(0, 64);
  const safeFile = fileName.replace(/\\/g, "/").split("/").pop() || fileName;
  return `data/scenarios/${safeId}/${safeFile}`;
}

/**
 * Validateur contrat Étape 35.
 * Vert = tous les blocs présents dans le fichier + pas de pointeur externe.
 */
export function validateScenarioFileContract(
  raw: unknown
): ScenarioContractResult {
  const issues: ScenarioContractIssue[] = [];
  const schema = validateScenarioParamFile(raw);

  if (!schema.ok || !isPlainObject(raw)) {
    for (const e of schema.errors) {
      issues.push({
        level: "error",
        code: "schema",
        message: e,
      });
    }
    return {
      ok: false,
      issues,
      diskRelativePath: null,
      scenarioId: null,
      fileName: null,
      param: null,
    };
  }

  for (const w of schema.warnings) {
    issues.push({ level: "warn", code: "schema_warn", message: w });
  }

  const param = normalizeScenarioParamFile(raw);

  // Blocs obligatoires : présents comme clés dans le fichier source (pas seulement après normalize)
  for (const def of SCENARIO_PARAM_BLOCKS) {
    if (raw[def.key] === undefined) {
      issues.push({
        level: "error",
        code: "bloc_manquant",
        message: `Bloc manquant dans le fichier : \`${def.key}\` (${def.label}). Ajoute-le (vide OK) — refus hors fichier.`,
      });
    }
  }

  const fichier =
    typeof raw.fichier === "string" ? raw.fichier.trim() : "";
  if (!fichier) {
    issues.push({
      level: "error",
      code: "fichier_vide",
      message:
        "Champ `fichier` vide — le contrat exige le nom du JSON unique.",
    });
  } else if (!fichier.endsWith(".json")) {
    issues.push({
      level: "error",
      code: "fichier_extension",
      message: "`fichier` doit se terminer par .json",
    });
  }

  const entreprise =
    typeof raw.Entreprise === "string" ? raw.Entreprise.trim() : "";
  if (!entreprise) {
    issues.push({
      level: "warn",
      code: "entreprise_vide",
      message: "`Entreprise` vide — slug data/scenarios/<id>/ indéterminé.",
    });
  }

  // Ordinateur / Livre doivent être des objets inline, pas des chemins
  if (typeof raw.Ordinateur === "string") {
    issues.push({
      level: "error",
      code: "bloc_hors_fichier",
      message:
        "`Ordinateur` est une chaîne (chemin ?) — refuse. Le pack doit être inline dans ce JSON.",
    });
  }
  if (typeof raw.Livre === "string") {
    issues.push({
      level: "error",
      code: "bloc_hors_fichier",
      message:
        "`Livre` est une chaîne (chemin ?) — refuse. La structure Livre doit être inline.",
    });
  }

  const forbiddenHits: { path: string; key: string }[] = [];
  collectForbiddenKeys(raw, "", forbiddenHits);
  for (const hit of forbiddenHits) {
    issues.push({
      level: "error",
      code: "pointeur_externe",
      message: `Pointeur hors fichier interdit : \`${hit.key}\` @ ${hit.path}`,
    });
  }

  const scenarioId = entreprise
    ? scenarioIdFromEntreprise(entreprise)
    : null;
  const fileName = fichier || null;
  const diskRelativePath =
    scenarioId && fileName
      ? buildScenarioDiskRelativePath(scenarioId, fileName)
      : null;

  if (diskRelativePath) {
    issues.push({
      level: "warn",
      code: "disk_path",
      message: `Chemin disque attendu : ${diskRelativePath}`,
    });
  }

  const hasError = issues.some((i) => i.level === "error");
  return {
    ok: !hasError,
    issues,
    diskRelativePath,
    scenarioId,
    fileName,
    param,
  };
}

export function formatScenarioContractReport(
  result: ScenarioContractResult
): string {
  const lines = [
    `## Contrat ${SCENARIO_FILE_CONTRACT.title}`,
    result.ok ? "Statut : VERT ✓" : "Statut : ROUGE ✕",
    result.diskRelativePath
      ? `Disque : ${result.diskRelativePath}`
      : "Disque : (indéterminé)",
    "",
    ...result.issues.map(
      (i) =>
        `${i.level === "error" ? "✕" : "!"} [${i.code}] ${i.message}`
    ),
  ];
  return lines.join("\n");
}

/** Assure toutes les clés contrat sur un param (écriture disque). */
export function ensureContractKeysInParam(
  raw: unknown
): ScenarioParamFileExtended {
  const normalized = normalizeScenarioParamFile(raw);
  const out = { ...normalized } as Record<string, unknown>;
  for (const def of SCENARIO_PARAM_BLOCKS) {
    if (out[def.key] === undefined) {
      out[def.key] = structuredClone(def.emptyValue);
    }
  }
  if (!out.fichier && typeof out.Nom === "string") {
    out.fichier = `${slugForParamFile(String(out.Nom))}_v1.json`;
  }
  return out as ScenarioParamFileExtended;
}
