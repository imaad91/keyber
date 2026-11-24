/**
 * Étape 21 — Schéma fichier de paramétrage Book (ScenarioParamFile étendu).
 * Blocs vides autorisés ; 1 schéma pour tous les scénarios.
 * Aucun contenu métier inventé.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import type { BookGraphEdge, BookGraphNode, BookGraphView } from "@/lib/bookStore";
import type {
  OsConsequence,
  OsInterview,
  OsKpiDef,
  OsObjective,
} from "@/lib/keyberOs/types";
import {
  emptyLivreStructure,
  normalizeParamLivre,
  type ScenarioParamLivre,
} from "@/lib/osLivre";
import {
  emptyCampus,
  emptyClearCampusUi,
  emptyHotspots,
  emptyProductionLive,
  normalizeCampus,
  normalizeClearCampusUi,
  normalizeHotspots,
  normalizeProductionLive,
} from "@/lib/clearCampus/schema";
import type {
  ClearCampusUiConfig,
  ScenarioParamCampus,
  ScenarioParamHotspot,
  ScenarioParamProductionLive,
} from "@/lib/clearCampus/types";

/** Jour / phase déclaratif (timeline Book + futurs moteurs). */
export type ScenarioParamJour = {
  id: string;
  jour: number;
  label: string;
  phase?: string;
  decisionIds?: string[];
  eventIds?: string[];
};

/** Entrée catalogue de conséquences nommées (référencable depuis choix / events). */
export type ScenarioParamConsequencePack = {
  id: string;
  label: string;
  consequences: OsConsequence[];
};

/** Pack Ordinateur dans le param (apps + nested optionnels). */
export type ScenarioParamOrdinateur = {
  stock?: unknown[];
  commandes?: unknown[];
  production?: unknown[];
  employes?: unknown[];
  factures?: unknown[];
  machines?: unknown[];
  clients?: unknown[];
  fournisseurs?: unknown[];
  maintenance?: unknown[];
  emails?: unknown[];
  chatContacts?: unknown[];
  chatThreads?: unknown[];
  documents?: unknown[];
  browser?: unknown[];
  dashboardCards?: unknown[];
  dashboardSeries?: unknown[];
  interviews?: OsInterview[];
  objectifs?: OsObjective[];
  sensors?: unknown[];
};

/** Clés top-level du schéma étendu (Vue Code) — Étape 21 + Clear Campus. */
export const SCENARIO_PARAM_EXTENDED_KEYS = [
  "Ordinateur",
  "Jours",
  "Interviews",
  "Objectifs",
  "Kpis",
  "Conséquences",
  "Intro",
  "Livre",
  "ClearCampus",
  "Campus",
  "Hotspots",
  "ProductionLive",
] as const;

export type ScenarioParamExtendedKey =
  (typeof SCENARIO_PARAM_EXTENDED_KEYS)[number];

/** ScenarioParamFile + blocs étendus Étape 21 + Clear Campus Phase 1. */
export type ScenarioParamFileExtended = ScenarioParamFile & {
  Ordinateur?: ScenarioParamOrdinateur;
  /** Alias produit de Ordinateur (Suite outils) — fusionné à la normalisation. */
  Suite?: ScenarioParamOrdinateur;
  Jours?: ScenarioParamJour[];
  Interviews?: OsInterview[];
  Objectifs?: OsObjective[];
  Kpis?: OsKpiDef[];
  Conséquences?: ScenarioParamConsequencePack[];
  Intro?: string[];
  Livre?: ScenarioParamLivre;
  ClearCampus?: ClearCampusUiConfig;
  Campus?: ScenarioParamCampus;
  Hotspots?: ScenarioParamHotspot[];
  ProductionLive?: ScenarioParamProductionLive;
};

export type ScenarioParamBlockKind =
  | "meta"
  | "array"
  | "object"
  | "record"
  | "string";

export type ScenarioParamBlockDef = {
  key: string;
  label: string;
  kind: ScenarioParamBlockKind;
  /** Bloc POC / feeling — visible même vide. */
  extended?: boolean;
  /**
   * Clear Campus Phase 1 : absence dans le JSON source = warn, pas error contrat.
   * (évite de casser les packs disque existants avant ré-assemblage)
   */
  contractSoft?: boolean;
  emptyValue: unknown;
};

/** Catalogue unique des blocs (Admin 3 vues + validation). */
export const SCENARIO_PARAM_BLOCKS: ScenarioParamBlockDef[] = [
  { key: "Nom", label: "Nom", kind: "string", emptyValue: "" },
  { key: "Version", label: "Version", kind: "meta", emptyValue: 1 },
  { key: "Type", label: "Type", kind: "string", emptyValue: "Scénario" },
  { key: "Mode", label: "Mode", kind: "string", emptyValue: "Compétence" },
  { key: "Rôle", label: "Rôle", kind: "string", emptyValue: "" },
  { key: "Compétence", label: "Compétence", kind: "string", emptyValue: "" },
  { key: "Secteur", label: "Secteur", kind: "string", emptyValue: "" },
  { key: "Entreprise", label: "Entreprise", kind: "string", emptyValue: "" },
  { key: "fichier", label: "Fichier", kind: "string", emptyValue: "" },
  { key: "Contexte", label: "Contexte", kind: "record", emptyValue: {} },
  {
    key: "Événements entreprise",
    label: "Événements entreprise",
    kind: "array",
    emptyValue: [],
  },
  {
    key: "Rôles sélectionnés",
    label: "Rôles sélectionnés",
    kind: "array",
    emptyValue: [],
  },
  {
    key: "Compétences sélectionnées",
    label: "Compétences sélectionnées",
    kind: "array",
    emptyValue: [],
  },
  { key: "Décisions", label: "Décisions", kind: "array", emptyValue: [] },
  { key: "Fins", label: "Fins", kind: "array", emptyValue: [] },
  {
    key: "Ordinateur",
    label: "Ordinateur",
    kind: "object",
    extended: true,
    emptyValue: {},
  },
  {
    key: "Jours",
    label: "Jours",
    kind: "array",
    extended: true,
    emptyValue: [],
  },
  {
    key: "Interviews",
    label: "Interviews",
    kind: "array",
    extended: true,
    emptyValue: [],
  },
  {
    key: "Objectifs",
    label: "Objectifs",
    kind: "array",
    extended: true,
    emptyValue: [],
  },
  {
    key: "Kpis",
    label: "Kpis",
    kind: "array",
    extended: true,
    emptyValue: [],
  },
  {
    key: "Conséquences",
    label: "Conséquences",
    kind: "array",
    extended: true,
    emptyValue: [],
  },
  {
    key: "Intro",
    label: "Intro",
    kind: "array",
    extended: true,
    emptyValue: [],
  },
  {
    key: "Livre",
    label: "Livre",
    kind: "object",
    extended: true,
    emptyValue: {},
  },
  {
    key: "ClearCampus",
    label: "Clear Campus (UI)",
    kind: "object",
    extended: true,
    contractSoft: true,
    emptyValue: {},
  },
  {
    key: "Campus",
    label: "Campus",
    kind: "object",
    extended: true,
    contractSoft: true,
    emptyValue: {},
  },
  {
    key: "Hotspots",
    label: "Hotspots",
    kind: "array",
    extended: true,
    contractSoft: true,
    emptyValue: [],
  },
  {
    key: "ProductionLive",
    label: "Vue Live Production",
    kind: "object",
    extended: true,
    contractSoft: true,
    emptyValue: {},
  },
];

export type ScenarioParamBlockStatus = {
  key: string;
  label: string;
  present: boolean;
  filled: boolean;
  count: number | null;
  detail: string;
  extended?: boolean;
};

export type ScenarioParamValidation = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  param: ScenarioParamFileExtended | null;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function arrayLen(v: unknown): number {
  return Array.isArray(v) ? v.length : 0;
}

function recordLen(v: unknown): number {
  return isPlainObject(v) ? Object.keys(v).length : 0;
}

function blockFilled(def: ScenarioParamBlockDef, value: unknown): boolean {
  if (value === undefined || value === null) return false;
  switch (def.kind) {
    case "array":
      return arrayLen(value) > 0;
    case "record":
    case "object":
      return recordLen(value) > 0;
    case "string":
      return String(value).trim().length > 0;
    case "meta":
      return value !== undefined && value !== null && value !== "";
    default:
      return true;
  }
}

function blockCount(def: ScenarioParamBlockDef, value: unknown): number | null {
  if (def.kind === "array") return Array.isArray(value) ? value.length : 0;
  if (def.kind === "record" || def.kind === "object")
    return isPlainObject(value) ? Object.keys(value).length : 0;
  return null;
}

/**
 * Structure Ordinateur complète (clés feeling) — tableaux vides, pas de métier inventé.
 * Étape 23 : génération Book émet cette coquille.
 */
export function emptyOrdinateurStructure(): ScenarioParamOrdinateur {
  return {
    stock: [],
    commandes: [],
    production: [],
    employes: [],
    factures: [],
    machines: [],
    clients: [],
    fournisseurs: [],
    maintenance: [],
    emails: [],
    chatContacts: [],
    chatThreads: [],
    documents: [],
    browser: [],
    dashboardCards: [],
    dashboardSeries: [],
    interviews: [],
    objectifs: [],
    sensors: [],
  };
}

/** Coquilles vides des blocs étendus (POC feeling). */
export function emptyExtendedParamShells(): Pick<
  ScenarioParamFileExtended,
  ScenarioParamExtendedKey
> {
  return {
    Ordinateur: emptyOrdinateurStructure(),
    Jours: [],
    Interviews: [],
    Objectifs: [],
    Kpis: [],
    Conséquences: [],
    Intro: [],
    Livre: emptyLivreStructure(),
    ClearCampus: emptyClearCampusUi(),
    Campus: emptyCampus(),
    Hotspots: emptyHotspots(),
    ProductionLive: emptyProductionLive(),
  };
}

/**
 * Normalise un param : garantit toutes les clés du schéma (blocs vides OK).
 * N'invente pas de contenu métier — uniquement des coquilles.
 */
export function normalizeScenarioParamFile(
  raw: unknown
): ScenarioParamFileExtended {
  const base = isPlainObject(raw) ? { ...raw } : {};
  const shells = emptyExtendedParamShells();

  for (const def of SCENARIO_PARAM_BLOCKS) {
    if (base[def.key] === undefined) {
      if (def.extended) {
        base[def.key] = structuredClone(
          shells[def.key as ScenarioParamExtendedKey]
        );
      } else if (def.key === "Décisions" || def.key === "Fins") {
        base[def.key] = [];
      } else if (def.key === "Contexte") {
        base[def.key] = {};
      } else if (
        def.key === "Événements entreprise" ||
        def.key === "Rôles sélectionnés" ||
        def.key === "Compétences sélectionnées"
      ) {
        base[def.key] = [];
      } else if (def.key === "Version") {
        base[def.key] = 1;
      } else if (typeof def.emptyValue === "string") {
        base[def.key] = "";
      }
    }
  }

  // Suite outils = alias Ordinateur (Phase 1.4) — fusion sans inventer de métier
  if (isPlainObject(base.Suite)) {
    const suitePack = base.Suite as ScenarioParamOrdinateur;
    if (!isPlainObject(base.Ordinateur)) {
      base.Ordinateur = { ...emptyOrdinateurStructure(), ...suitePack };
    } else {
      base.Ordinateur = {
        ...emptyOrdinateurStructure(),
        ...suitePack,
        ...(base.Ordinateur as object),
      };
    }
  }

  if (!isPlainObject(base.Ordinateur)) {
    base.Ordinateur = emptyOrdinateurStructure();
  } else {
    const o = { ...emptyOrdinateurStructure(), ...(base.Ordinateur as object) };
    base.Ordinateur = o;
  }
  if (!Array.isArray(base.Jours)) base.Jours = [];
  if (!Array.isArray(base.Interviews)) base.Interviews = [];
  if (!Array.isArray(base.Objectifs)) base.Objectifs = [];
  if (!Array.isArray(base.Kpis)) base.Kpis = [];
  if (!Array.isArray(base.Conséquences)) base.Conséquences = [];
  if (!Array.isArray(base.Intro)) base.Intro = [];
  if (!Array.isArray(base.Décisions)) base.Décisions = [];
  if (!Array.isArray(base.Fins)) base.Fins = [];
  const entreprise =
    typeof base.Entreprise === "string" ? base.Entreprise : "";
  base.Livre = normalizeParamLivre(base.Livre, entreprise);

  base.ClearCampus = normalizeClearCampusUi(base.ClearCampus);
  base.Campus = normalizeCampus(base.Campus);
  base.Hotspots = normalizeHotspots(base.Hotspots);
  base.ProductionLive = normalizeProductionLive(base.ProductionLive);

  return base as ScenarioParamFileExtended;
}
/** Validation légère — JSON objet + types de blocs ; pas de rejet métier. */
export function validateScenarioParamFile(
  raw: unknown
): ScenarioParamValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isPlainObject(raw)) {
    return {
      ok: false,
      errors: ["Le fichier de paramétrage doit être un objet JSON."],
      warnings,
      param: null,
    };
  }

  if (raw.Nom !== undefined && typeof raw.Nom !== "string") {
    errors.push("`Nom` doit être une chaîne.");
  }
  if (
    raw.Version !== undefined &&
    typeof raw.Version !== "number" &&
    Number.isNaN(Number(raw.Version))
  ) {
    errors.push("`Version` doit être un nombre.");
  }

  for (const def of SCENARIO_PARAM_BLOCKS) {
    const v = raw[def.key];
    if (v === undefined) continue;
    if (def.kind === "array" && !Array.isArray(v)) {
      errors.push(`\`${def.key}\` doit être un tableau.`);
    }
    if (
      (def.kind === "object" || def.kind === "record") &&
      !isPlainObject(v)
    ) {
      errors.push(`\`${def.key}\` doit être un objet.`);
    }
    if (def.kind === "string" && typeof v !== "string") {
      errors.push(`\`${def.key}\` doit être une chaîne.`);
    }
  }

  const param = normalizeScenarioParamFile(raw);

  for (const key of SCENARIO_PARAM_EXTENDED_KEYS) {
    if (raw[key] === undefined) {
      warnings.push(`Bloc \`${key}\` manquant — coquille vide ajoutée.`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    param: errors.length === 0 ? param : null,
  };
}

/** Statut de chaque bloc pour Vue Texte. */
export function summarizeScenarioParamBlocks(
  param: ScenarioParamFileExtended | null | undefined
): ScenarioParamBlockStatus[] {
  const p = param ? normalizeScenarioParamFile(param) : null;
  return SCENARIO_PARAM_BLOCKS.map((def) => {
    const value = p
      ? (p as Record<string, unknown>)[def.key]
      : undefined;
    const present = p != null && value !== undefined;
    const filled = present ? blockFilled(def, value) : false;
    const count = present ? blockCount(def, value) : null;
    let detail = "absent";
    if (!p) detail = "pas de param";
    else if (!present) detail = "absent";
    else if (!filled) detail = "vide";
    else if (count != null) detail = `${count} élément${count > 1 ? "s" : ""}`;
    else detail = "renseigné";
    return {
      key: def.key,
      label: def.label,
      present,
      filled,
      count,
      detail,
      extended: def.extended,
    };
  });
}

/** Texte résumé blocs (peut préfixer / compléter Vue Texte). */
export function formatScenarioParamBlocksSummary(
  param: ScenarioParamFileExtended | null | undefined
): string {
  const rows = summarizeScenarioParamBlocks(param);
  const lines = [
    "## Schéma paramétrage (Étape 21)",
    "",
    ...rows.map((r) => {
      const mark = !r.present ? "○" : r.filled ? "●" : "◌";
      return `- ${mark} ${r.label} (\`${r.key}\`) — ${r.detail}`;
    }),
    "",
    "● rempli · ◌ présent mais vide · ○ absent",
  ];
  return lines.join("\n");
}

/** Graphe Admin : un nœud par bloc majeur + arêtes structurelles. */
export function buildScenarioParamBlocksGraph(
  param: ScenarioParamFileExtended | null | undefined
): BookGraphView {
  const statuses = summarizeScenarioParamBlocks(param);
  const focusKeys = [
    "Contexte",
    "Campus",
    "Hotspots",
    "ProductionLive",
    "Événements entreprise",
    "Décisions",
    "Ordinateur",
    "Jours",
    "Interviews",
    "Objectifs",
    "Kpis",
    "Conséquences",
    "Intro",
    "Fins",
  ];

  const nodes: BookGraphNode[] = [
    {
      id: "meta",
      label: param?.Nom
        ? `Meta · ${param.Nom}`
        : "Meta (Nom / Mode / Entreprise)",
      x: 280,
      y: 24,
      w: 240,
      h: 48,
    },
  ];

  const edges: BookGraphEdge[] = [];
  const cols = 3;
  focusKeys.forEach((key, i) => {
    const st = statuses.find((s) => s.key === key);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const id = `block-${key}`;
    const suffix = st?.filled
      ? st.count != null
        ? ` (${st.count})`
        : ""
      : " (vide)";
    nodes.push({
      id,
      label: `${st?.label || key}${suffix}`,
      x: 40 + col * 220,
      y: 120 + row * 100,
      w: 200,
      h: 52,
    });
    edges.push({ from: "meta", to: id, label: "" });
  });

  edges.push({ from: "block-Décisions", to: "block-Fins", label: "issues" });
  edges.push({
    from: "block-Événements entreprise",
    to: "block-Conséquences",
    label: "",
  });
  edges.push({
    from: "block-Ordinateur",
    to: "block-Interviews",
    label: "",
  });
  edges.push({
    from: "block-Ordinateur",
    to: "block-Objectifs",
    label: "",
  });

  return { nodes, edges };
}

/** Lit Interviews top-level, sinon Ordinateur.interviews. */
export function readParamInterviews(
  param: ScenarioParamFile
): OsInterview[] | undefined {
  const p = param as ScenarioParamFileExtended;
  if (Array.isArray(p.Interviews) && p.Interviews.length > 0) {
    return p.Interviews;
  }
  const nested = p.Ordinateur?.interviews;
  return Array.isArray(nested) && nested.length > 0 ? nested : undefined;
}

/** Lit Objectifs top-level, sinon Ordinateur.objectifs. */
export function readParamObjectifs(
  param: ScenarioParamFile
): OsObjective[] | undefined {
  const p = param as ScenarioParamFileExtended;
  if (Array.isArray(p.Objectifs) && p.Objectifs.length > 0) {
    return p.Objectifs;
  }
  const nested = p.Ordinateur?.objectifs;
  return Array.isArray(nested) && nested.length > 0 ? nested : undefined;
}

/** Lit Kpis top-level si non vide. */
export function readParamKpis(
  param: ScenarioParamFile
): OsKpiDef[] | undefined {
  const p = param as ScenarioParamFileExtended;
  if (Array.isArray(p.Kpis) && p.Kpis.length > 0) return p.Kpis;
  return undefined;
}
