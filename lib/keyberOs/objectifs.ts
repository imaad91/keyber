/**
 * Keyber OS — Objectifs (Étape 17)
 * Évaluation générique par metric/op/cibleNombre. Aucun objectif métier hardcodé.
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsObjective, OsPlayState } from "@/lib/keyberOs/types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Lit une métrique numérique depuis l'état OS. */
export function osObjectifMetricValue(
  state: OsPlayState,
  metric: string | undefined
): number | null {
  if (!metric) return null;
  const m = metric.trim().toLowerCase();

  switch (m) {
    case "stock":
    case "finance.stockkg":
      return state.stock;
    case "tresorerie":
    case "finance.tresorerie":
    case "tresoreriebrute":
      return state.tresorerieBrute;
    case "production":
      return state.production;
    case "commandes":
      return state.commandes;
    case "stepindex":
    case "decisions":
      return state.stepIndex;
    case "daydecision":
    case "daydecisionid":
      return state.world?.dayDecisionId ? 1 : 0;
    case "emailsread":
      return state.computer.emails.filter((e) => e.read).length;
    case "emailsreadurgent":
      return state.computer.emails.filter((e) => e.read && e.urgent).length;
    case "eventsfired":
      return state.eventsFired.length;
    case "onboardingstep":
      return state.world?.onboardingStep ?? 0;
    case "onboardingdone":
      return state.world?.onboardingDone ? 1 : 0;
    case "pieces":
    case "piecesaujourdhui":
      return state.finance?.piecesAujourdhui ?? 0;
    case "piecesbrutessemaine":
    case "qualite":
      return state.finance?.piecesBrutesSemaine ?? state.finance?.qualite ?? 0;
    case "moral":
    case "moralequipe":
      return state.humain?.moralEquipe ?? 0;
    case "ethique":
      return state.humain?.ethique ?? 0;
    case "confianceclient":
      return state.humain?.confianceClient ?? 0;
    case "xp":
      return state.xp;
    case "score":
      return state.score;
    case "niveau":
      return state.niveau;
    case "visibility":
    case "visibilitylevel":
      return state.visibilityLevel;
    case "sensorinstalled":
      return state.sensorInstalled ? 1 : 0;
    default:
      if (m.startsWith("flags.")) {
        return state.flags?.[metric.slice("flags.".length)] ?? 0;
      }
      if (m.startsWith("relations.")) {
        const key = metric.split(".")[1]!;
        return state.relations?.[key] ?? 0;
      }
      return null;
  }
}

function met(
  value: number,
  op: OsObjective["op"] | undefined,
  cible: number
): boolean {
  const operator = op ?? "gte";
  if (operator === "lte") return value <= cible;
  if (operator === "eq") return value === cible;
  return value >= cible;
}

function evaluateOne(state: OsPlayState, obj: OsObjective): OsObjective {
  if (obj.status === "COMPLETE" || obj.status === "ECHOUE") return obj;

  const cibleN =
    typeof obj.cibleNombre === "number" && Number.isFinite(obj.cibleNombre)
      ? obj.cibleNombre
      : null;

  if (!obj.metric || cibleN == null) {
    // Compat legacy : obj-2 = décision, obj-1 = stock ≥ 80
    if (obj.id === "obj-2" || /décision|decision/i.test(obj.titre + obj.cible)) {
      const v = state.stepIndex;
      const target = 1;
      const done = v >= target;
      return {
        ...obj,
        progression: Math.min(target, v),
        cibleNombre: target,
        status: done ? "COMPLETE" : obj.status,
      };
    }
    if (obj.id === "obj-1" || /stock/i.test(obj.titre + obj.cible)) {
      const threshold = 80;
      const v = state.stock;
      const done = v >= threshold;
      return {
        ...obj,
        progression: Math.min(threshold, v),
        cibleNombre: threshold,
        status: done ? "COMPLETE" : obj.status,
      };
    }
    return obj;
  }

  const raw = osObjectifMetricValue(state, obj.metric);
  if (raw == null) return obj;

  const progression = clamp(raw, 0, Math.max(cibleN, raw));
  const done = met(raw, obj.op, cibleN);
  return {
    ...obj,
    progression: Math.min(cibleN, Math.max(0, raw)),
    status: done ? "COMPLETE" : obj.status,
  };
}

/**
 * Recalcule progression / COMPLETE. Attribution XP sur nouveaux COMPLETE.
 */
export function osObjectifsEvaluate(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("objectifs")) {
    return {
      ...state,
      log: [...state.log, "Objectifs → module désactivé (Admin)"],
    };
  }

  const cfg = getOsRuntimeConfig().objectifs;
  const objectives = state.objectives.map((o) => evaluateOne(state, o));
  const newlyCompleted = objectives.filter(
    (o, i) =>
      o.status === "COMPLETE" &&
      state.objectives[i]?.status !== "COMPLETE"
  );

  let next: OsPlayState = { ...state, objectives };
  const log = [...state.log];

  for (const o of newlyCompleted) {
    log.push(`Objectifs → « ${o.titre} » COMPLETE`);
    const xpGain = o.xp ?? cfg.xpOnComplete ?? 0;
    if (cfg.awardXp !== false && xpGain > 0) {
      const xp = next.xp + xpGain;
      next = {
        ...next,
        xp,
        progression: next.progression
          ? { ...next.progression, xp }
          : next.progression,
        feedback: `Objectif atteint : ${o.titre} (+${xpGain} XP)`,
      };
    } else {
      next = {
        ...next,
        feedback: `Objectif atteint : ${o.titre}`,
      };
    }
  }

  return { ...next, log };
}

/** @deprecated alias — pipeline / choix */
export function osObjectifsAfterChoice(state: OsPlayState): OsPlayState {
  return osObjectifsEvaluate(state);
}

/**
 * En fin de journée : marque ECHOUE les objectifs journaliers encore EN_COURS
 * avec failOnDayEnd (ou défaut Admin).
 */
export function osObjectifsOnDayEnd(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("objectifs")) return state;
  const cfg = getOsRuntimeConfig().objectifs;
  if (cfg.failJournalierOnDayEnd === false) return state;

  let changed = false;
  const objectives = state.objectives.map((o) => {
    if (o.status !== "EN_COURS") return o;
    const shouldFail =
      o.failOnDayEnd === true ||
      (o.failOnDayEnd !== false &&
        String(o.type).toUpperCase() === "JOURNALIER");
    if (!shouldFail) return o;
    changed = true;
    return { ...o, status: "ECHOUE" as const };
  });

  if (!changed) return state;
  return {
    ...state,
    objectives,
    log: [
      ...state.log,
      "Objectifs → journaliers non atteints → ECHOUE (DayEnd)",
    ],
  };
}
