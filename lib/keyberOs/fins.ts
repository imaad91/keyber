/**
 * Keyber OS — Fins & Endings (Étape 30).
 * Lit `param.Fins` : conditions → kind → écran. Aucun contenu métier inventé.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import type { OsEndingKind, OsPlayState } from "@/lib/keyberOs/types";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";

function osPiecesQualite(state: OsPlayState): number {
  return (
    state.finance?.piecesBrutesSemaine ||
    state.finance?.piecesAujourdhui ||
    state.production ||
    0
  );
}

export type OsFinCondition = {
  /** ethique | pieces | tresorerie | stock | moral | score | xp | jour | confiance */
  metric: string;
  op?: "gte" | "lte" | "eq" | "gt" | "lt";
  value: number;
};

export type ScenarioParamFin = {
  id: string;
  label: string;
  /** VICTOIRE | PARTIELLE | ECHEC — défaut déduit de l'id si absent. */
  kind?: Exclude<OsEndingKind, null>;
  narration?: string;
  xp?: number;
  /** Toutes les conditions doivent matcher (AND). Vide = candidat libre. */
  conditions?: OsFinCondition[];
  /** Plus haut = évalué en premier. */
  priority?: number;
};

export type OsFinMatch = {
  fin: ScenarioParamFin | null;
  kind: Exclude<OsEndingKind, null>;
  narration: string;
  xp: number;
  source: "param" | "legacy";
};

export function emptyFinsStructure(): ScenarioParamFin[] {
  return [];
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function inferKind(
  id: string,
  label: string,
  explicit?: string
): Exclude<OsEndingKind, null> {
  const raw = (explicit || `${id} ${label}`).toUpperCase();
  if (raw.includes("VICTOIRE") || raw.includes("WIN") || /\bok\b/i.test(id))
    return "VICTOIRE";
  if (
    raw.includes("ECHEC") ||
    raw.includes("FAIL") ||
    raw.includes("RUPTURE") ||
    raw.includes("DEFAITE")
  )
    return "ECHEC";
  if (raw.includes("PARTIEL")) return "PARTIELLE";
  return "PARTIELLE";
}

export function normalizeParamFin(raw: unknown): ScenarioParamFin | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = asString(o.id);
  const label = asString(o.label || o.titre || o.nom);
  if (!id && !label) return null;
  const conditions = Array.isArray(o.conditions)
    ? o.conditions
        .map((c) => {
          const row = (c ?? {}) as Record<string, unknown>;
          const metric = asString(row.metric || row.si || row.cible);
          if (!metric) return null;
          const opRaw = asString(row.op || row.operateur, "gte");
          const op =
            opRaw === "lte" ||
            opRaw === "eq" ||
            opRaw === "gt" ||
            opRaw === "lt" ||
            opRaw === "gte"
              ? opRaw
              : "gte";
          return {
            metric,
            op,
            value: asNumber(row.value ?? row.valeur ?? row.superieurA, 0),
          } satisfies OsFinCondition;
        })
        .filter(Boolean) as OsFinCondition[]
    : [];

  const kindExplicit = asString(o.kind || o.type || o.ending);
  return {
    id: id || `fin-${label}`.toLowerCase().replace(/\s+/g, "-"),
    label: label || id,
    kind: inferKind(id, label, kindExplicit),
    narration: asString(o.narration || o.description || o.texte),
    xp: o.xp != null ? asNumber(o.xp) : undefined,
    conditions,
    priority: o.priority != null ? asNumber(o.priority) : undefined,
  };
}

export function normalizeParamFins(raw: unknown): ScenarioParamFin[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeParamFin)
    .filter(Boolean) as ScenarioParamFin[];
}

export function finsFromParam(
  param: ScenarioParamFile | null | undefined
): ScenarioParamFin[] {
  return normalizeParamFins(param?.Fins);
}

function metricValue(state: OsPlayState, metric: string): number {
  const key = metric.toLowerCase().replace(/[^a-z]/g, "");
  switch (key) {
    case "ethique":
      return state.humain?.ethique ?? 70;
    case "pieces":
    case "qualite":
    case "piecesqualite":
      return osPiecesQualite(state);
    case "tresorerie":
      return state.finance?.tresorerie ?? state.tresorerieBrute ?? 0;
    case "stock":
      return state.finance?.stockKg ?? state.stock ?? 0;
    case "moral":
    case "moralequipe":
      return state.humain?.moralEquipe ?? 70;
    case "confiance":
    case "confianceclient":
      return state.humain?.confianceClient ?? 70;
    case "score":
      return state.progression?.score ?? state.score ?? 0;
    case "xp":
      return state.progression?.xp ?? state.xp ?? 0;
    case "jour":
    case "jouractuel":
      return state.meta?.jourActuel ?? state.day ?? 1;
    case "production":
      return state.finance?.productionParJour ?? state.production ?? 0;
    default: {
      const flag = state.flags?.[metric] ?? state.flags?.[key];
      if (typeof flag === "number") return flag;
      return 0;
    }
  }
}

function matchCondition(state: OsPlayState, c: OsFinCondition): boolean {
  const left = metricValue(state, c.metric);
  const right = c.value;
  switch (c.op ?? "gte") {
    case "lte":
      return left <= right;
    case "eq":
      return left === right;
    case "gt":
      return left > right;
    case "lt":
      return left < right;
    case "gte":
    default:
      return left >= right;
  }
}

function legacyEnding(state: OsPlayState): Exclude<OsEndingKind, null> {
  const q = osPiecesQualite(state);
  const e = state.humain?.ethique ?? 70;
  if (e < 20 || q < 400) return "ECHEC";
  if (q >= 480 && e > 50) return "VICTOIRE";
  if (q >= 400 && q < 480) return "PARTIELLE";
  if (q >= 480 && e <= 50) return "PARTIELLE";
  return "ECHEC";
}

function legacyNarration(
  kind: Exclude<OsEndingKind, null>,
  state: OsPlayState
): string {
  const pieces = osPiecesQualite(state);
  const ethique = state.humain?.ethique ?? 70;
  if (kind === "VICTOIRE") {
    return `Objectif tenu : ${pieces} pièces qualité, éthique à ${ethique}. L'équipe tient la semaine.`;
  }
  if (kind === "PARTIELLE") {
    return `Résultat mitigé : ${pieces} pièces, éthique ${ethique}. Des arbitrages restent à consolider.`;
  }
  return `La semaine rate la cible (${pieces} pièces, éthique ${ethique}). Analyse les décisions dans le journal.`;
}

function defaultXp(kind: Exclude<OsEndingKind, null>): number {
  return kind === "VICTOIRE" ? 80 : kind === "PARTIELLE" ? 50 : 30;
}

/**
 * Évalue les Fins du param. Si aucune condition ne matche (ou Fins vides),
 * retombe sur les bandes legacy génériques.
 */
export function osEvaluateFin(state: OsPlayState): OsFinMatch {
  const fins = finsFromParam(state.param);
  const ranked = [...fins].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );

  for (const fin of ranked) {
    const conds = fin.conditions ?? [];
    if (conds.length === 0) continue;
    if (conds.every((c) => matchCondition(state, c))) {
      const kind = fin.kind ?? "PARTIELLE";
      return {
        fin,
        kind,
        narration:
          fin.narration?.trim() ||
          fin.label ||
          legacyNarration(kind, state),
        xp: fin.xp ?? defaultXp(kind),
        source: "param",
      };
    }
  }

  // Fins sans conditions : mappe le kind legacy sur une entrée label.
  const legacy = legacyEnding(state);
  const byKind = ranked.find((f) => f.kind === legacy);
  if (byKind) {
    return {
      fin: byKind,
      kind: legacy,
      narration:
        byKind.narration?.trim() ||
        byKind.label ||
        legacyNarration(legacy, state),
      xp: byKind.xp ?? defaultXp(legacy),
      source: "param",
    };
  }

  // Première fin sans condition comme fallback soft si legacy introuvable
  const free = ranked.find((f) => !(f.conditions && f.conditions.length));
  if (free && fins.length && !ranked.some((f) => (f.conditions ?? []).length)) {
    const kind = free.kind ?? legacy;
    return {
      fin: free,
      kind,
      narration:
        free.narration?.trim() || free.label || legacyNarration(kind, state),
      xp: free.xp ?? defaultXp(kind),
      source: "param",
    };
  }

  return {
    fin: null,
    kind: legacy,
    narration: legacyNarration(legacy, state),
    xp: defaultXp(legacy),
    source: "legacy",
  };
}

export function osFinsModuleEnabled(): boolean {
  if (!isOsModuleEnabled("fins")) return false;
  return getOsRuntimeConfig().fins?.enabled !== false;
}

/**
 * Applique la fin matchée (écran + ending) sans forcer le débrief semaine.
 * Utilisé quand le scénario se termine (plus de décisions).
 */
export function osApplyMatchedFin(state: OsPlayState): OsPlayState {
  if (!osFinsModuleEnabled()) return state;
  const match = osEvaluateFin(state);
  const xpGain = match.xp;
  const nextXp = (state.progression?.xp ?? state.xp ?? 0) + xpGain;
  return {
    ...state,
    finished: true,
    xp: nextXp,
    feedback: match.narration,
    progression: state.progression
      ? { ...state.progression, xp: nextXp }
      : state.progression,
    world: {
      ...state.world,
      ending: match.kind,
      matchedFinId: match.fin?.id ?? null,
      matchedFinLabel: match.fin?.label ?? null,
      journal: [
        {
          id: `j-fin-${Date.now()}`,
          day: state.meta?.jourActuel ?? state.day,
          titre: match.fin?.label || `Fin — ${match.kind}`,
          narration: match.narration,
          xp: xpGain,
          at: state.meta?.heureActuelle ?? "16:00",
        },
        ...(state.world?.journal ?? []),
      ],
    },
    log: [
      ...state.log,
      match.fin
        ? `Fins → écran « ${match.fin.label} » (${match.kind})`
        : `Fins → legacy ${match.kind}`,
    ],
  };
}
