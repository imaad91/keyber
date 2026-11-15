/**
 * Keyber OS — Moteur de Scénarios
 * Lit le paramétrage, expose les étapes / décisions. Aucun métier hardcodé.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { buildComputerPackFromParam } from "@/lib/keyberOs/ordinateurPack";
import type { OsDecision, OsPlayState } from "@/lib/keyberOs/types";

function parseTresorerie(param: ScenarioParamFile): number {
  const raw =
    param.Contexte["Trésorerie actuelle"] ||
    param.Contexte["Tresorerie actuelle"] ||
    "";
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 50_000;
}

function parseStock(param: ScenarioParamFile): number {
  const raw =
    param.Contexte[
      "Liste des stocks (nom, quantité actuelle, stock minimum, stock maximum, stock de sécurité, délai de réapprovisionnement, coût de stockage, problèmes récurrents)"
    ] || "";
  const m = raw.match(/:\s*(\d+)/);
  return m ? Number(m[1]) : 100;
}

export function osScenariosParseDecisions(
  param: ScenarioParamFile
): OsDecision[] {
  return (param.Décisions || []).map((d, i) => {
    const row = d as {
      id?: string;
      titre?: string;
      options?: string[];
    };
    const opts = Array.isArray(row.options) ? row.options : [];
    return {
      id: row.id || `d${i + 1}`,
      titre: row.titre || `Décision ${i + 1}`,
      options: opts.map((label, j) => ({
        id: `${row.id || `d${i + 1}`}-opt${j}`,
        label: String(label),
      })),
    };
  });
}

export function osScenariosBoot(
  param: ScenarioParamFile,
  sessionId: string,
  priorLog: string[] = []
): OsPlayState {
  const enabled = isOsModuleEnabled("moteur-scenarios");
  const cfg = getOsRuntimeConfig();
  const decisions = enabled ? osScenariosParseDecisions(param) : [];
  const log = [...priorLog];
  if (!enabled) {
    log.push("Moteur de Scénarios → module désactivé (Admin)");
  } else {
    log.push(`Moteur de Scénarios → ${param.Mode} — ${param.Nom}`);
  }

  const tresorerieBrute = parseTresorerie(param);
  const stock = parseStock(param);
  const production = 60;
  const commandes = 12;
  const pack = buildComputerPackFromParam(
    param,
    tresorerieBrute,
    stock,
    production,
    commandes
  );

  return {
    sessionId,
    param,
    stepIndex: 0,
    decisions,
    eventsFired: [],
    tresorerieBrute,
    stock,
    production,
    commandes,
    xp: 0,
    niveau: 1,
    score: 0,
    log,
    finished: !enabled || decisions.length === 0,
    feedback: null,
    day: cfg.temps.startDay,
    week: 1,
    minutesSinceStart: cfg.temps.startMinutes,
    dayLengthMinutes: cfg.temps.dayLengthMinutes,
    visibilityLevel: cfg.visibilite.defaultLevel,
    sensorInstalled: cfg.visibilite.sensorDefaultInstalled,
    activeAction: null,
    computerApp: null,
    selectedInterviewId: null,
    computer: pack.computer,
    interviews: pack.interviews,
    objectives: pack.objectives,
  };
}

export function osScenariosCurrentStep(state: OsPlayState): OsDecision | null {
  if (!isOsModuleEnabled("moteur-scenarios")) return null;
  return state.decisions[state.stepIndex] ?? null;
}
