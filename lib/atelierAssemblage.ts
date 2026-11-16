/**
 * Étape 34 — Pipeline assemblage Atelier → param Book (déterministe).
 * Fusionne Contexte + Événements + packs Excel (Ordinateur 32 / Narration 33)
 * → fichier de paramétrage. Aucune invention métier.
 */

import type { AtelierCreation } from "@/lib/atelierCreationStore";
import type { AtelierEntrepriseEvent } from "@/lib/atelierEventsStore";
import {
  countNarrationPackRows,
  narrationPackToParamBlocks,
} from "@/lib/atelierNarrationExcel";
import {
  countOrdinateurPackRows,
  ordinateurPackToParam,
} from "@/lib/atelierOrdinateurExcel";
import {
  buildSkeletonParamFile,
  filledContexteRecord,
  type ScenarioParamFile,
} from "@/lib/bookGenerationPrompt";
import {
  emptyOrdinateurStructure,
  normalizeScenarioParamFile,
} from "@/lib/scenarioParamSchema";

export type AssemblageLogLevel = "ok" | "info" | "warn";

export type AssemblageLogLine = {
  level: AssemblageLogLevel;
  message: string;
};

export type AssemblageStats = {
  contexteFields: number;
  events: number;
  ordinateurRows: number;
  narrationRows: number;
  decisions: number;
  optionsApprox: number;
  interviews: number;
  objectifs: number;
  kpis: number;
  jours: number;
  fins: number;
  ordinateurKeysFilled: number;
};

export type AssembleParamArgs = {
  creation: AtelierCreation;
  events: AtelierEntrepriseEvent[];
  mode: "competence" | "histoire";
  roleName: string;
  competenceName: string;
  roleNames: string[];
  competences: { nom: string; cours: string[] }[];
  fichier: string;
  nom: string;
  version?: number;
};

export type AssembleParamResult = {
  paramFile: ScenarioParamFile;
  log: AssemblageLogLine[];
  stats: AssemblageStats;
};

function arrLen(v: unknown): number {
  return Array.isArray(v) ? v.length : 0;
}

function filterDecisionsForMode(
  decisions: unknown[],
  mode: "competence" | "histoire",
  competenceName: string
): unknown[] {
  const want = competenceName.trim().toLowerCase();
  return decisions.filter((raw) => {
    if (!raw || typeof raw !== "object") return false;
    const d = raw as Record<string, unknown>;
    const cid = String(d.competenceId ?? "").trim();
    if (mode === "competence") {
      if (!cid) return false;
      if (!want) return true;
      return cid.toLowerCase() === want;
    }
    return !cid;
  });
}

/**
 * Assemble un param Book depuis les imports Atelier uniquement.
 */
export function assembleParamFromAtelier(
  args: AssembleParamArgs
): AssembleParamResult {
  const log: AssemblageLogLine[] = [];
  const version = args.version ?? 1;
  const contexte = filledContexteRecord(
    args.creation.fields as unknown as Record<string, string>
  );
  const contexteFields = Object.keys(contexte).length;

  log.push({
    level: "info",
    message: `Assemblage ${args.mode} — « ${args.nom} » (V${version})`,
  });
  log.push({
    level: contexteFields > 0 ? "ok" : "warn",
    message: `Contexte : ${contexteFields} champ(s) non vide(s)`,
  });
  log.push({
    level: args.events.length > 0 ? "ok" : "warn",
    message: `Événements Atelier : ${args.events.length}`,
  });

  const ordPack = args.creation.ordinateurPack ?? {};
  const narrPack = args.creation.narrationPack ?? {};
  const ordinateurRows = countOrdinateurPackRows(ordPack);
  const narrationRows = countNarrationPackRows(narrPack);

  log.push({
    level: ordinateurRows > 0 ? "ok" : "info",
    message: `Excel Ordinateur (staging) : ${ordinateurRows} ligne(s)`,
  });
  log.push({
    level: narrationRows > 0 ? "ok" : "info",
    message: `Excel Narration / décisions (staging) : ${narrationRows} ligne(s)`,
  });

  const skeleton = buildSkeletonParamFile({
    nom: args.nom,
    version,
    mode: args.mode,
    roleName: args.roleName,
    competenceName: args.competenceName,
    secteur: args.creation.secteur,
    entrepriseNom: args.creation.nom,
    contexte,
    events: args.events,
    roleNames: args.roleNames,
    competences: args.competences,
    fichier: args.fichier,
  });

  const fromOrd = ordinateurPackToParam(ordPack);
  const fromNarr = narrationPackToParamBlocks(narrPack);
  const allDecisions = Array.isArray(fromNarr.Décisions)
    ? fromNarr.Décisions
    : [];
  const decisions = filterDecisionsForMode(
    allDecisions,
    args.mode,
    args.competenceName
  );

  if (allDecisions.length > 0 && decisions.length === 0) {
    log.push({
      level: "warn",
      message: `Décisions Excel : ${allDecisions.length} ligne(s) mais 0 pour le mode ${args.mode} (filtre Compétence id)`,
    });
  } else if (decisions.length > 0) {
    log.push({
      level: "ok",
      message: `Décisions assemblées : ${decisions.length} (filtrées mode ${args.mode})`,
    });
  }

  const baseOrd = emptyOrdinateurStructure() as Record<string, unknown>;
  const mergedOrd: Record<string, unknown> = { ...baseOrd };

  for (const [k, v] of Object.entries(fromOrd as Record<string, unknown>)) {
    if (Array.isArray(v) && v.length > 0) mergedOrd[k] = v;
    else if (v != null && !Array.isArray(v)) mergedOrd[k] = v;
  }

  if (fromNarr.Interviews.length > 0) {
    mergedOrd.interviews = fromNarr.Interviews;
  }
  if (fromNarr.Objectifs.length > 0) {
    mergedOrd.objectifs = fromNarr.Objectifs;
  }

  const ordinateurKeysFilled = Object.values(mergedOrd).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v != null && v !== ""
  ).length;

  log.push({
    level: ordinateurKeysFilled > 0 ? "ok" : "info",
    message: `Ordinateur param : ${ordinateurKeysFilled} clé(s) peuplée(s)`,
  });

  const fins = fromNarr.Fins;
  if (fins.length) {
    log.push({
      level: "ok",
      message: `Fins : ${fins.length}`,
    });
  }
  if (fromNarr.Jours.length) {
    log.push({
      level: "ok",
      message: `Jours : ${fromNarr.Jours.length}`,
    });
  }
  if (fromNarr.Kpis.length) {
    log.push({
      level: "ok",
      message: `Kpis : ${fromNarr.Kpis.length}`,
    });
  }
  if (fromNarr.Interviews.length) {
    log.push({
      level: "ok",
      message: `Interviews / PNJ : ${fromNarr.Interviews.length}`,
    });
  }
  if (fromNarr.Objectifs.length) {
    log.push({
      level: "ok",
      message: `Objectifs : ${fromNarr.Objectifs.length}`,
    });
  }

  if (ordinateurRows === 0 && narrationRows === 0) {
    log.push({
      level: "warn",
      message:
        "Aucun pack Excel staging — Vue Code = structure + contexte/events seulement (blocs feeling vides).",
    });
  }

  const optionsApprox = decisions.reduce<number>((n, d) => {
    if (!d || typeof d !== "object") return n;
    return n + arrLen((d as { options?: unknown }).options);
  }, 0);

  const raw: ScenarioParamFile = {
    ...skeleton,
    Décisions: decisions,
    Fins: fins.length ? fins : skeleton.Fins,
    Ordinateur: mergedOrd,
    Jours: fromNarr.Jours.length ? fromNarr.Jours : skeleton.Jours,
    Interviews: fromNarr.Interviews.length
      ? fromNarr.Interviews
      : skeleton.Interviews,
    Objectifs: fromNarr.Objectifs.length
      ? fromNarr.Objectifs
      : skeleton.Objectifs,
    Kpis: fromNarr.Kpis.length ? fromNarr.Kpis : skeleton.Kpis,
  };

  const paramFile = normalizeScenarioParamFile(raw) as ScenarioParamFile;

  const stats: AssemblageStats = {
    contexteFields,
    events: args.events.length,
    ordinateurRows,
    narrationRows,
    decisions: decisions.length,
    optionsApprox,
    interviews: arrLen(paramFile.Interviews),
    objectifs: arrLen(paramFile.Objectifs),
    kpis: arrLen(paramFile.Kpis),
    jours: arrLen(paramFile.Jours),
    fins: arrLen(paramFile.Fins),
    ordinateurKeysFilled,
  };

  log.push({
    level: "ok",
    message: `Terminé — fichier ${args.fichier} (déterministe, zéro invention)`,
  });

  return { paramFile, log, stats };
}

/** Formate le journal pour affichage Admin / texte Book. */
export function formatAssemblageLog(log: AssemblageLogLine[]): string {
  return log
    .map((l) => {
      const mark =
        l.level === "ok" ? "✓" : l.level === "warn" ? "!" : "·";
      return `${mark} ${l.message}`;
    })
    .join("\n");
}

export function summarizeAssemblageStats(stats: AssemblageStats): string {
  return [
    `Contexte ${stats.contexteFields}`,
    `Events ${stats.events}`,
    `Ord. Excel ${stats.ordinateurRows}`,
    `Narr. Excel ${stats.narrationRows}`,
    `Décisions ${stats.decisions}`,
    `PNJ ${stats.interviews}`,
    `Objectifs ${stats.objectifs}`,
    `Kpis ${stats.kpis}`,
    `Jours ${stats.jours}`,
    `Fins ${stats.fins}`,
  ].join(" · ");
}
