/**
 * Keyber OS — Visibilité / brouillard / capteurs (Étape 18)
 * Matrice de tiers + inventaire capteurs param. Aucun scénario hardcodé.
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { osObjectifsEvaluate } from "@/lib/keyberOs/objectifs";
import type {
  OsSensor,
  OsVisibilityInvestment,
  OsVisibilityTier,
  OsPlayState,
} from "@/lib/keyberOs/types";

/** Matrice générique des tiers (affichage panneau). */
export const OS_VISIBILITY_MATRIX: {
  tier: OsVisibilityTier;
  label: string;
  meaning: string;
  erp: string;
  kpi: string;
}[] = [
  {
    tier: 0,
    label: "INCONNU",
    meaning: "Aucune donnée fiable",
    erp: "Colonnes ???",
    kpi: "Pastille brouillard",
  },
  {
    tier: 1,
    label: "ESTIMÉ",
    meaning: "Ordres de grandeur",
    erp: "Valeurs arrondies",
    kpi: "~ estimations",
  },
  {
    tier: 2,
    label: "PRÉCIS",
    meaning: "Mesure atelier / capteur",
    erp: "Chiffres lisibles",
    kpi: "Pastille précise",
  },
  {
    tier: 3,
    label: "TEMPS_REEL",
    meaning: "Flux live",
    erp: "Dashboard LIVE",
    kpi: "Pastille LIVE",
  },
];

export const OS_DEFAULT_VISIBILITY_INVESTMENTS: OsVisibilityInvestment[] = [
  {
    level: 1,
    label: "Reporting basique",
    description: "Estimations arrondies sur les jauges principales.",
    cost: 5_000,
  },
  {
    level: 2,
    label: "Capteur atelier",
    description: "Lève le brouillard ERP / dashboard / KPI finance.",
    cost: 25_000,
  },
  {
    level: 3,
    label: "Temps réel",
    description: "Pastilles LIVE — pilotage minute par minute.",
    cost: 80_000,
  },
];

export function osDefaultSensors(): OsSensor[] {
  return [
    {
      id: "sensor-atelier",
      label: "Capteur ligne critique",
      description: "Mesure état machine + cadence — lève le fog ERP.",
      cost: 25_000,
      unlockLevel: 2,
      modules: ["tresorerie", "stock", "production", "rebut"],
      installed: false,
    },
    {
      id: "sensor-live",
      label: "Passerelle temps réel",
      description: "Flux LIVE sur les KPI principaux.",
      cost: 55_000,
      unlockLevel: 3,
      modules: ["tresorerie", "stock", "production", "rebut", "moral", "ethique"],
      installed: false,
    },
  ];
}

export function osVisibiliteInvestments(): OsVisibilityInvestment[] {
  const cfg = getOsRuntimeConfig().visibilite;
  return cfg.investments?.length
    ? cfg.investments
    : OS_DEFAULT_VISIBILITY_INVESTMENTS;
}

export function osVisibiliteFog(state: OsPlayState): boolean {
  if (!isOsModuleEnabled("visibilite")) return false;
  const cfg = getOsRuntimeConfig().visibilite;
  if (!cfg.fogEnabled) return false;
  const sensor =
    state.visibilite?.sensorInstalled ?? state.sensorInstalled ?? false;
  const level = state.visibilite?.level ?? state.visibilityLevel ?? 0;
  return !sensor && level < cfg.fogBelowLevel;
}

function syncMirrors(
  state: OsPlayState,
  level: number,
  sensorInstalled: boolean,
  parModule: Record<string, OsVisibilityTier>,
  sensors: OsSensor[]
): OsPlayState {
  return {
    ...state,
    visibilityLevel: level,
    sensorInstalled,
    visibilite: {
      level,
      sensorInstalled,
      parModule,
      sensors,
    },
  };
}

function spendCash(state: OsPlayState, cost: number): OsPlayState | null {
  if (cost <= 0) return state;
  if (state.tresorerieBrute < cost) return null;
  const tresorerieBrute = state.tresorerieBrute - cost;
  return {
    ...state,
    tresorerieBrute,
    finance: state.finance
      ? { ...state.finance, tresorerie: tresorerieBrute }
      : state.finance,
  };
}

/**
 * Installe un capteur (id) ou le premier non installé / générique.
 * Débite le coût, monte le niveau, clarifie les modules.
 */
export function osVisibiliteInstallSensor(
  state: OsPlayState,
  sensorId?: string
): OsPlayState {
  if (!isOsModuleEnabled("visibilite")) return state;

  const block = state.visibilite ?? {
    level: state.visibilityLevel ?? 1,
    sensorInstalled: state.sensorInstalled ?? false,
    parModule: {},
    sensors: osDefaultSensors(),
  };
  const sensors = (block.sensors?.length ? block.sensors : osDefaultSensors()).map(
    (s) => ({ ...s })
  );

  const target =
    (sensorId ? sensors.find((s) => s.id === sensorId) : null) ??
    sensors.find((s) => !s.installed) ??
    sensors[0];

  if (!target) {
    // Fallback legacy : juste lever le fog
    const nextLevel = Math.max(block.level, 2);
    let next = syncMirrors(state, nextLevel, true, { ...block.parModule }, []);
    next = {
      ...next,
      log: [
        ...next.log,
        "Visibilité → capteur installé (brouillard ERP levé)",
      ],
      feedback: "Capteur installé — brouillard levé.",
    };
    return osObjectifsEvaluate(next);
  }

  if (target.installed) {
    return {
      ...state,
      feedback: `Capteur « ${target.label} » déjà installé.`,
      log: [...state.log, `Visibilité → « ${target.id} » déjà installé`],
    };
  }

  const paid = spendCash(state, target.cost);
  if (!paid) {
    return {
      ...state,
      feedback: `Trésorerie insuffisante (${target.cost.toLocaleString("fr-FR")} €).`,
      log: [
        ...state.log,
        `Visibilité → achat « ${target.id} » refusé (cash)`,
      ],
    };
  }

  const nextSensors = sensors.map((s) =>
    s.id === target.id ? { ...s, installed: true } : s
  );
  const nextLevel = Math.max(block.level, target.unlockLevel);
  const parModule: Record<string, OsVisibilityTier> = {
    ...block.parModule,
  };
  for (const mod of target.modules ?? []) {
    const tier = (target.unlockLevel >= 3 ? 3 : 2) as OsVisibilityTier;
    const prev = parModule[mod] ?? 0;
    parModule[mod] = Math.max(prev, tier) as OsVisibilityTier;
  }

  let next = syncMirrors(
    paid,
    nextLevel,
    true,
    parModule,
    nextSensors
  );
  next = {
    ...next,
    flags: {
      ...next.flags,
      sensorInstalled: 1,
    },
    feedback: `Capteur « ${target.label} » installé (−${target.cost.toLocaleString("fr-FR")} €).`,
    log: [
      ...next.log,
      `Visibilité → capteur « ${target.id} » installé (niv. ${nextLevel})`,
    ],
  };
  return osObjectifsEvaluate(next);
}

/** Achète un palier d'investissement (1 / 2 / 3). Niveau 2 ≈ capteur. */
export function osVisibiliteInvest(
  state: OsPlayState,
  level: 1 | 2 | 3
): OsPlayState {
  if (!isOsModuleEnabled("visibilite")) return state;
  const inv = osVisibiliteInvestments().find((i) => i.level === level);
  if (!inv) return state;

  const current = state.visibilite?.level ?? state.visibilityLevel ?? 0;
  const sensor =
    state.visibilite?.sensorInstalled ?? state.sensorInstalled ?? false;
  if (level === 2 && sensor) {
    return {
      ...state,
      feedback: "Capteur déjà actif.",
    };
  }
  if (level !== 2 && current >= level) {
    return {
      ...state,
      feedback: `Niveau ${level} déjà atteint.`,
    };
  }

  if (level === 2) {
    return osVisibiliteInstallSensor(state);
  }

  const paid = spendCash(state, inv.cost);
  if (!paid) {
    return {
      ...state,
      feedback: `Trésorerie insuffisante (${inv.cost.toLocaleString("fr-FR")} €).`,
      log: [
        ...state.log,
        `Visibilité → investissement niv.${level} refusé (cash)`,
      ],
    };
  }

  const block = paid.visibilite ?? {
    level: current,
    sensorInstalled: sensor,
    parModule: {},
    sensors: state.visibilite?.sensors ?? osDefaultSensors(),
  };
  const nextLevel = Math.max(block.level, level);
  let next = syncMirrors(
    paid,
    nextLevel,
    block.sensorInstalled,
    { ...block.parModule },
    block.sensors ?? []
  );
  next = {
    ...next,
    feedback: `Visibilité niveau ${level} (−${inv.cost.toLocaleString("fr-FR")} €).`,
    log: [
      ...next.log,
      `Visibilité → investissement niv.${level} (−${inv.cost} €)`,
    ],
  };
  return osObjectifsEvaluate(next);
}

export function osVisibiliteSensors(state: OsPlayState): OsSensor[] {
  const list = state.visibilite?.sensors;
  if (list?.length) return list;
  return osDefaultSensors().map((s) => ({
    ...s,
    installed:
      s.unlockLevel <= 2
        ? Boolean(state.visibilite?.sensorInstalled ?? state.sensorInstalled)
        : (state.visibilite?.level ?? state.visibilityLevel ?? 0) >= 3 &&
          Boolean(state.visibilite?.sensorInstalled ?? state.sensorInstalled),
  }));
}
