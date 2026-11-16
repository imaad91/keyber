/**
 * Keyber OS — Moteur de Scénarios
 * Lit le paramétrage, expose les étapes / décisions. Aucun métier hardcodé.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { buildComputerPackFromParam } from "@/lib/keyberOs/ordinateurPack";
import {
  createDefaultOsKpis,
  createEmptyOsFinance,
  createEmptyOsHistorique,
  createEmptyOsHumain,
  createEmptyOsMeta,
  createEmptyOsProgression,
  createEmptyOsVisibilite,
  createEmptyOsWorld,
} from "@/lib/keyberOs/createRichDefaults";
import { osOnboardingBootWorld } from "@/lib/keyberOs/onboarding";
import { formatOsClock } from "@/lib/keyberOs/temps";
import type {
  OsChoice,
  OsConsequence,
  OsDecision,
  OsPlayState,
} from "@/lib/keyberOs/types";

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

type RawChoice =
  | string
  | {
      id?: string;
      label?: string;
      description?: string;
      feedbackTexte?: string;
      consequences?: OsConsequence[];
      impacts?: OsChoice["impacts"];
    };

function parseChoice(
  raw: RawChoice,
  decisionId: string,
  index: number
): OsChoice {
  if (typeof raw === "string") {
    return {
      id: `${decisionId}-opt${index}`,
      label: raw,
    };
  }
  return {
    id: raw.id || `${decisionId}-opt${index}`,
    label: String(raw.label || `Option ${index + 1}`),
    description: raw.description,
    feedbackTexte: raw.feedbackTexte,
    consequences: Array.isArray(raw.consequences)
      ? raw.consequences.filter(
          (c) => c && typeof c.cible === "string" && typeof c.valeur === "number"
        )
      : undefined,
    impacts: raw.impacts,
  };
}

/**
 * Parse Décisions du param.
 * Options = string[] (legacy) OU objets riches { label, consequences, feedbackTexte }.
 */
export function osScenariosParseDecisions(
  param: ScenarioParamFile
): OsDecision[] {
  return (param.Décisions || []).map((d, i) => {
    const row = d as {
      id?: string;
      titre?: string;
      dilemme?: string;
      jour?: number;
      xpGagne?: number;
      options?: RawChoice[];
      choix?: RawChoice[];
    };
    const decisionId = row.id || `d${i + 1}`;
    const rawOpts = Array.isArray(row.options)
      ? row.options
      : Array.isArray(row.choix)
        ? row.choix
        : [];
    return {
      id: decisionId,
      titre: row.titre || `Décision ${i + 1}`,
      dilemme: row.dilemme,
      jour: row.jour,
      xpGagne: row.xpGagne,
      options: rawOpts.map((opt, j) => parseChoice(opt, decisionId, j)),
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
  log.push("Données & Sauvegarde → schéma d'état OS riche initialisé (Étape 1)");

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

  const day = cfg.temps.startDay;
  const minutesSinceStart = cfg.temps.startMinutes;
  const dayLengthMinutes = cfg.temps.dayLengthMinutes;
  const tempsRestant = Math.max(0, dayLengthMinutes - minutesSinceStart);

  const meta = createEmptyOsMeta({
    scenarioId: sessionId,
    roleId: param.Rôle || null,
    jourActuel: day,
    heureActuelle: formatOsClock(minutesSinceStart),
    tempsRestantMinutes: tempsRestant,
    week: 1,
    minutesSinceStart,
    dayLengthMinutes,
  });

  const finance = createEmptyOsFinance({
    tresorerie: tresorerieBrute,
    stockKg: stock,
    productionParJour: production,
    commandes,
  });

  const progression = createEmptyOsProgression();
  const visibilite = createEmptyOsVisibilite({
    level: cfg.visibilite.defaultLevel,
    sensorInstalled: cfg.visibilite.sensorDefaultInstalled,
  });

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
    day,
    week: 1,
    minutesSinceStart,
    dayLengthMinutes,
    visibilityLevel: visibilite.level,
    sensorInstalled: visibilite.sensorInstalled,
    activeAction: null,
    computerApp: null,
    selectedInterviewId: null,
    computer: pack.computer,
    interviews: pack.interviews,
    objectives: pack.objectives,
    meta,
    finance,
    humain: createEmptyOsHumain(),
    relations: {},
    progression,
    visibilite,
    historique: createEmptyOsHistorique(),
    flags: {},
    world: createEmptyOsWorld({
      ...osOnboardingBootWorld(param),
    }),
    kpis: createDefaultOsKpis(),
  };
}

export function osScenariosCurrentStep(state: OsPlayState): OsDecision | null {
  if (!isOsModuleEnabled("moteur-scenarios")) return null;
  return state.decisions[state.stepIndex] ?? null;
}
