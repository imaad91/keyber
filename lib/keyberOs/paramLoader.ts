/**
 * Étape 36 — Loader OS Book strict.
 * Source autorisée : fichier data/scenarios/… OU param embedded Book.
 * Jamais Novacier / getScenario / data/contextes / registry entreprise.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import {
  buildScenarioDiskRelativePath,
  scenarioIdFromEntreprise,
  validateScenarioFileContract,
} from "@/lib/scenarioFileContract";
import { fetchParamFile, paramFileExists } from "@/lib/playCatalog";

export type OsParamSourceKind = "disk" | "embedded";

export type OsParamLoadSource = {
  kind: OsParamSourceKind;
  /** Nom du JSON (champ fichier / paramFileName). */
  fileName: string;
  /** Chemin relatif attendu si disque. */
  relativePath: string | null;
  /** Résumé pour logs / Admin. */
  label: string;
};

export type OsParamResolveOk = {
  ok: true;
  param: ScenarioParamFile;
  source: OsParamLoadSource;
  /** true si on a dû se rabattre sur embedded faute de disque. */
  diskMissing: boolean;
  log: string;
};

export type OsParamResolveFail = {
  ok: false;
  error: string;
  log: string;
};

export type OsParamResolveResult = OsParamResolveOk | OsParamResolveFail;

const REMEMBER_KEY = "keyber-os-param-source-v1";

/** Interdit explicitement tout fallback métier hardcodé. */
export const OS_PARAM_LOADER_RULES = [
  "Boot Book lit uniquement le fichier de paramétrage (disk) ou le param embedded Book.",
  "Aucun fallback Novacier, getScenario, data/contextes, ni registry entreprise.",
  "Contrat Étape 35 appliqué avant init session (blocs hors fichier → refus).",
  "Log boot : « source = fichier X (disk|embedded) ».",
] as const;

function sourceLabel(kind: OsParamSourceKind, fileName: string): string {
  return `source = fichier ${fileName || "(sans nom)"} (${kind})`;
}

function relativeForParam(
  param: ScenarioParamFile,
  fileName: string
): string | null {
  const ent =
    typeof param.Entreprise === "string" ? param.Entreprise.trim() : "";
  if (!ent || !fileName) return null;
  return buildScenarioDiskRelativePath(
    scenarioIdFromEntreprise(ent),
    fileName
  );
}

function acceptParam(
  param: ScenarioParamFile,
  source: OsParamLoadSource,
  diskMissing: boolean
): OsParamResolveResult {
  const contract = validateScenarioFileContract(param);
  if (!contract.ok) {
    const first = contract.issues.find((i) => i.level === "error");
    const log = `Loader OS → refus contrat — ${
      first?.message || "blocs manquants / hors fichier"
    }`;
    return { ok: false, error: log, log };
  }
  const log = `Loader OS → ${source.label}${
    source.relativePath ? ` · ${source.relativePath}` : ""
  }${diskMissing ? " · disque absent (embedded)" : ""}`;
  return { ok: true, param, source, diskMissing, log };
}

/**
 * Résout le param Book strictement (async, côté client).
 */
export async function resolveOsBookParam(args: {
  paramFileName: string;
  embedded: ScenarioParamFile | null;
}): Promise<OsParamResolveResult> {
  const name = args.paramFileName.trim();
  const embedded = args.embedded;

  if (!name && !embedded) {
    const log =
      "Loader OS → aucun fichier ni param embedded — refus (pas de fallback Novacier)";
    return { ok: false, error: log, log };
  }

  if (name) {
    const exists = await paramFileExists(name);
    if (exists) {
      const fromDisk = await fetchParamFile(name);
      if (fromDisk) {
        const fileName =
          (typeof fromDisk.fichier === "string" && fromDisk.fichier.trim()) ||
          name;
        const source: OsParamLoadSource = {
          kind: "disk",
          fileName,
          relativePath: relativeForParam(fromDisk, fileName),
          label: sourceLabel("disk", fileName),
        };
        return acceptParam(fromDisk, source, false);
      }
    }
    if (embedded) {
      const fileName =
        (typeof embedded.fichier === "string" && embedded.fichier.trim()) ||
        name;
      const source: OsParamLoadSource = {
        kind: "embedded",
        fileName,
        relativePath: relativeForParam(embedded, fileName),
        label: sourceLabel("embedded", fileName),
      };
      return acceptParam(embedded, source, true);
    }
    const log = `Loader OS → fichier « ${name} » introuvable et pas d'embedded — refus (pas de fallback Novacier)`;
    return { ok: false, error: log, log };
  }

  // name vide, embedded seul
  const fileName =
    (typeof embedded!.fichier === "string" && embedded!.fichier.trim()) ||
    embedded!.Nom ||
    "embedded.json";
  const source: OsParamLoadSource = {
    kind: "embedded",
    fileName,
    relativePath: relativeForParam(embedded!, fileName),
    label: sourceLabel("embedded", fileName),
  };
  return acceptParam(embedded!, source, false);
}

export function rememberOsParamSource(source: OsParamLoadSource) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      REMEMBER_KEY,
      JSON.stringify({ ...source, at: new Date().toISOString() })
    );
  } catch {
    /* ignore */
  }
}

export function readRememberedOsParamSource():
  | (OsParamLoadSource & { at?: string })
  | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OsParamLoadSource & { at?: string };
  } catch {
    return null;
  }
}
