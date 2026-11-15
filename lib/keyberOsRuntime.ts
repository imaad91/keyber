/**
 * Keyber OS — configuration runtime partagée Admin ↔ Front-End.
 * Storage : keyber-os-runtime-v1 (PAS keyber-studio-*).
 * Une section par composante Admin. Aucun nom d'entreprise.
 */

"use client";

import { useSyncExternalStore } from "react";
import type { OsModuleId } from "@/lib/keyberOs/types";

const STORAGE_KEY = "keyber-os-runtime-v1";

export type DecisionOptionDeltas = {
  tresorerie: number;
  stock: number;
  production: number;
};

export type KeyberOsRuntimeConfig = {
  updatedAt: string;
  /** @deprecated legacy flat — migré vers erp.tresorerieFacteur */
  tresorerieFacteur?: number;
  tresorerieFormuleLabel?: string;

  donneesSauvegarde: {
    enabled: boolean;
    /** Sauvegarde locale après chaque étape. */
    autosave: boolean;
  };
  moteurScenarios: {
    enabled: boolean;
  };
  moteurDecisions: {
    enabled: boolean;
    /** Deltas génériques pour option index 0 / 1 / 2 (+ fallback). */
    deltas: [DecisionOptionDeltas, DecisionOptionDeltas, DecisionOptionDeltas];
    commandesDelta: number;
  };
  moteurEvenements: {
    enabled: boolean;
    /** Impact stock quand un événement catalogue se déclenche. */
    stockImpact: number;
  };
  erp: {
    enabled: boolean;
    tresorerieFacteur: number;
    tresorerieFormuleLabel: string;
    equipeBase: number;
  };
  progression: {
    enabled: boolean;
    xpPerChoice: number;
    scorePerChoice: number;
    xpPerLevel: number;
  };
  interfaceJoueur: {
    enabled: boolean;
    showErpTiles: boolean;
    showPipelineLog: boolean;
    showProgressionLine: boolean;
    showShell: boolean;
    showClock: boolean;
    showObjectives: boolean;
  };
  ordinateur: {
    enabled: boolean;
    apps: {
      erp: boolean;
      mail: boolean;
      dashboard: boolean;
      documents: boolean;
      chat: boolean;
      browser: boolean;
    };
  };
  temps: {
    enabled: boolean;
    dayLengthMinutes: number;
    startDay: number;
    startMinutes: number;
  };
  interviews: {
    enabled: boolean;
  };
  objectifs: {
    enabled: boolean;
  };
  visibilite: {
    enabled: boolean;
    fogEnabled: boolean;
    fogBelowLevel: number;
    defaultLevel: number;
    sensorDefaultInstalled: boolean;
  };
};

const DEFAULT_DELTAS: [DecisionOptionDeltas, DecisionOptionDeltas, DecisionOptionDeltas] =
  [
    { tresorerie: -2000, stock: 40, production: 5 },
    { tresorerie: -800, stock: 15, production: 5 },
    { tresorerie: 500, stock: -10, production: -5 },
  ];

export const OS_RUNTIME_DEFAULTS: KeyberOsRuntimeConfig = {
  updatedAt: new Date(0).toISOString(),
  donneesSauvegarde: { enabled: true, autosave: true },
  moteurScenarios: { enabled: true },
  moteurDecisions: {
    enabled: true,
    deltas: [
      { ...DEFAULT_DELTAS[0]! },
      { ...DEFAULT_DELTAS[1]! },
      { ...DEFAULT_DELTAS[2]! },
    ],
    commandesDelta: 1,
  },
  moteurEvenements: { enabled: true, stockImpact: -5 },
  erp: {
    enabled: true,
    tresorerieFacteur: 1,
    tresorerieFormuleLabel: "tresorerie_affichee = tresorerie_brute × facteur",
    equipeBase: 6,
  },
  progression: {
    enabled: true,
    xpPerChoice: 25,
    scorePerChoice: 10,
    xpPerLevel: 100,
  },
  interfaceJoueur: {
    enabled: true,
    showErpTiles: true,
    showPipelineLog: false,
    showProgressionLine: true,
    showShell: true,
    showClock: true,
    showObjectives: true,
  },
  ordinateur: {
    enabled: true,
    apps: {
      erp: true,
      mail: true,
      dashboard: true,
      documents: true,
      chat: true,
      browser: true,
    },
  },
  temps: {
    enabled: true,
    dayLengthMinutes: 600,
    startDay: 1,
    startMinutes: 8 * 60,
  },
  interviews: { enabled: true },
  objectifs: { enabled: true },
  visibilite: {
    enabled: true,
    fogEnabled: true,
    fogBelowLevel: 2,
    defaultLevel: 1,
    sensorDefaultInstalled: false,
  },
};

/** Snapshot stable pour SSR / useSyncExternalStore (ne pas recloner à chaque appel). */
const OS_RUNTIME_DEFAULTS_FLAT: KeyberOsRuntimeFlat = {
  ...OS_RUNTIME_DEFAULTS,
  tresorerieFacteur: OS_RUNTIME_DEFAULTS.erp.tresorerieFacteur,
  tresorerieFormuleLabel: OS_RUNTIME_DEFAULTS.erp.tresorerieFormuleLabel,
};

/** Accès plat rétrocompat (ERP page / viewModel). */
export type KeyberOsRuntimeFlat = KeyberOsRuntimeConfig & {
  tresorerieFacteur: number;
  tresorerieFormuleLabel: string;
};

type Bag = {
  config: KeyberOsRuntimeConfig;
  /** Référence stable jusqu'au prochain set — requis par useSyncExternalStore. */
  flat: KeyberOsRuntimeFlat;
  hydrated: boolean;
  listeners: Set<() => void>;
};

const SSR_BAG: Bag = {
  config: OS_RUNTIME_DEFAULTS,
  flat: OS_RUNTIME_DEFAULTS_FLAT,
  hydrated: true,
  listeners: new Set(),
};

function cloneDefaults(): KeyberOsRuntimeConfig {
  return normalize(OS_RUNTIME_DEFAULTS);
}

function bag(): Bag {
  if (typeof window === "undefined") {
    return SSR_BAG;
  }
  const w = window as unknown as { __keyberOsRuntimeV1?: Bag };
  if (!w.__keyberOsRuntimeV1) {
    const config = cloneDefaults();
    w.__keyberOsRuntimeV1 = {
      config,
      flat: withFlat(config),
      hydrated: false,
      listeners: new Set(),
    };
  }
  return w.__keyberOsRuntimeV1;
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function normalize(raw: Partial<KeyberOsRuntimeConfig> | null): KeyberOsRuntimeConfig {
  const d = structuredClone(OS_RUNTIME_DEFAULTS);
  if (!raw || typeof raw !== "object") return d;

  const legacyFacteur =
    typeof raw.tresorerieFacteur === "number" ? raw.tresorerieFacteur : undefined;
  const legacyLabel =
    typeof raw.tresorerieFormuleLabel === "string"
      ? raw.tresorerieFormuleLabel
      : undefined;

  const erpIn = (raw.erp ?? {}) as Partial<KeyberOsRuntimeConfig["erp"]>;
  const decIn = (raw.moteurDecisions ??
    {}) as Partial<KeyberOsRuntimeConfig["moteurDecisions"]>;
  const deltasIn = Array.isArray(decIn.deltas) ? decIn.deltas : [];

  return {
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : d.updatedAt,
    donneesSauvegarde: {
      enabled: raw.donneesSauvegarde?.enabled ?? d.donneesSauvegarde.enabled,
      autosave: raw.donneesSauvegarde?.autosave ?? d.donneesSauvegarde.autosave,
    },
    moteurScenarios: {
      enabled: raw.moteurScenarios?.enabled ?? d.moteurScenarios.enabled,
    },
    moteurDecisions: {
      enabled: decIn.enabled ?? d.moteurDecisions.enabled,
      commandesDelta: clamp(
        Number(decIn.commandesDelta ?? d.moteurDecisions.commandesDelta),
        -50,
        50
      ),
      deltas: [0, 1, 2].map((i) => {
        const src = deltasIn[i] as Partial<DecisionOptionDeltas> | undefined;
        const def = d.moteurDecisions.deltas[i]!;
        return {
          tresorerie: clamp(Number(src?.tresorerie ?? def.tresorerie), -100000, 100000),
          stock: clamp(Number(src?.stock ?? def.stock), -500, 500),
          production: clamp(Number(src?.production ?? def.production), -100, 100),
        };
      }) as [DecisionOptionDeltas, DecisionOptionDeltas, DecisionOptionDeltas],
    },
    moteurEvenements: {
      enabled: raw.moteurEvenements?.enabled ?? d.moteurEvenements.enabled,
      stockImpact: clamp(
        Number(raw.moteurEvenements?.stockImpact ?? d.moteurEvenements.stockImpact),
        -100,
        100
      ),
    },
    erp: {
      enabled: erpIn.enabled ?? d.erp.enabled,
      tresorerieFacteur: clamp(
        Number(
          erpIn.tresorerieFacteur ?? legacyFacteur ?? d.erp.tresorerieFacteur
        ),
        0,
        10
      ),
      tresorerieFormuleLabel:
        (erpIn.tresorerieFormuleLabel ||
          legacyLabel ||
          d.erp.tresorerieFormuleLabel).trim() || d.erp.tresorerieFormuleLabel,
      equipeBase: clamp(
        Number(erpIn.equipeBase ?? d.erp.equipeBase),
        0,
        500
      ),
    },
    progression: {
      enabled: raw.progression?.enabled ?? d.progression.enabled,
      xpPerChoice: clamp(
        Number(raw.progression?.xpPerChoice ?? d.progression.xpPerChoice),
        0,
        1000
      ),
      scorePerChoice: clamp(
        Number(raw.progression?.scorePerChoice ?? d.progression.scorePerChoice),
        0,
        1000
      ),
      xpPerLevel: clamp(
        Number(raw.progression?.xpPerLevel ?? d.progression.xpPerLevel),
        1,
        10000
      ),
    },
    interfaceJoueur: {
      enabled: raw.interfaceJoueur?.enabled ?? d.interfaceJoueur.enabled,
      showErpTiles:
        raw.interfaceJoueur?.showErpTiles ?? d.interfaceJoueur.showErpTiles,
      showPipelineLog:
        raw.interfaceJoueur?.showPipelineLog ??
        d.interfaceJoueur.showPipelineLog,
      showProgressionLine:
        raw.interfaceJoueur?.showProgressionLine ??
        d.interfaceJoueur.showProgressionLine,
      showShell: raw.interfaceJoueur?.showShell ?? d.interfaceJoueur.showShell,
      showClock: raw.interfaceJoueur?.showClock ?? d.interfaceJoueur.showClock,
      showObjectives:
        raw.interfaceJoueur?.showObjectives ?? d.interfaceJoueur.showObjectives,
    },
    ordinateur: {
      enabled: raw.ordinateur?.enabled ?? d.ordinateur.enabled,
      apps: {
        erp: raw.ordinateur?.apps?.erp ?? d.ordinateur.apps.erp,
        mail: raw.ordinateur?.apps?.mail ?? d.ordinateur.apps.mail,
        dashboard:
          raw.ordinateur?.apps?.dashboard ?? d.ordinateur.apps.dashboard,
        documents:
          raw.ordinateur?.apps?.documents ?? d.ordinateur.apps.documents,
        chat: raw.ordinateur?.apps?.chat ?? d.ordinateur.apps.chat,
        browser: raw.ordinateur?.apps?.browser ?? d.ordinateur.apps.browser,
      },
    },
    temps: {
      enabled: raw.temps?.enabled ?? d.temps.enabled,
      dayLengthMinutes: clamp(
        Number(raw.temps?.dayLengthMinutes ?? d.temps.dayLengthMinutes),
        60,
        24 * 60
      ),
      startDay: clamp(Number(raw.temps?.startDay ?? d.temps.startDay), 0, 7),
      startMinutes: clamp(
        Number(raw.temps?.startMinutes ?? d.temps.startMinutes),
        0,
        24 * 60 - 1
      ),
    },
    interviews: {
      enabled: raw.interviews?.enabled ?? d.interviews.enabled,
    },
    objectifs: {
      enabled: raw.objectifs?.enabled ?? d.objectifs.enabled,
    },
    visibilite: {
      enabled: raw.visibilite?.enabled ?? d.visibilite.enabled,
      fogEnabled: raw.visibilite?.fogEnabled ?? d.visibilite.fogEnabled,
      fogBelowLevel: clamp(
        Number(raw.visibilite?.fogBelowLevel ?? d.visibilite.fogBelowLevel),
        0,
        3
      ),
      defaultLevel: clamp(
        Number(raw.visibilite?.defaultLevel ?? d.visibilite.defaultLevel),
        0,
        3
      ),
      sensorDefaultInstalled:
        raw.visibilite?.sensorDefaultInstalled ??
        d.visibilite.sensorDefaultInstalled,
    },
  };
}

function load(): KeyberOsRuntimeConfig {
  if (typeof window === "undefined") return OS_RUNTIME_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    return normalize(JSON.parse(raw) as Partial<KeyberOsRuntimeConfig>);
  } catch {
    return cloneDefaults();
  }
}

function ensure() {
  const b = bag();
  if (b.hydrated) return;
  b.hydrated = true;
  b.config = load();
  b.flat = withFlat(b.config);
}

function emit() {
  bag().listeners.forEach((l) => l());
}

function withFlat(cfg: KeyberOsRuntimeConfig): KeyberOsRuntimeFlat {
  return {
    ...cfg,
    tresorerieFacteur: cfg.erp.tresorerieFacteur,
    tresorerieFormuleLabel: cfg.erp.tresorerieFormuleLabel,
  };
}

export function getOsRuntimeConfig(): KeyberOsRuntimeFlat {
  ensure();
  return bag().flat;
}

export function setOsRuntimeConfig(
  patch: Partial<KeyberOsRuntimeConfig> & {
    tresorerieFacteur?: number;
    tresorerieFormuleLabel?: string;
  }
): KeyberOsRuntimeFlat {
  ensure();
  const b = bag();
  const merged: Partial<KeyberOsRuntimeConfig> = {
    ...b.config,
    ...patch,
    donneesSauvegarde: {
      ...b.config.donneesSauvegarde,
      ...patch.donneesSauvegarde,
    },
    moteurScenarios: {
      ...b.config.moteurScenarios,
      ...patch.moteurScenarios,
    },
    moteurDecisions: {
      ...b.config.moteurDecisions,
      ...patch.moteurDecisions,
      deltas:
        patch.moteurDecisions?.deltas ?? b.config.moteurDecisions.deltas,
    },
    moteurEvenements: {
      ...b.config.moteurEvenements,
      ...patch.moteurEvenements,
    },
    erp: {
      ...b.config.erp,
      ...patch.erp,
      ...(typeof patch.tresorerieFacteur === "number"
        ? { tresorerieFacteur: patch.tresorerieFacteur }
        : {}),
      ...(typeof patch.tresorerieFormuleLabel === "string"
        ? { tresorerieFormuleLabel: patch.tresorerieFormuleLabel }
        : {}),
    },
    progression: {
      ...b.config.progression,
      ...patch.progression,
    },
    interfaceJoueur: {
      ...b.config.interfaceJoueur,
      ...patch.interfaceJoueur,
    },
    ordinateur: {
      ...b.config.ordinateur,
      ...patch.ordinateur,
      apps: {
        ...b.config.ordinateur.apps,
        ...patch.ordinateur?.apps,
      },
    },
    temps: { ...b.config.temps, ...patch.temps },
    interviews: { ...b.config.interviews, ...patch.interviews },
    objectifs: { ...b.config.objectifs, ...patch.objectifs },
    visibilite: { ...b.config.visibilite, ...patch.visibilite },
  };
  const next = normalize(merged);
  next.updatedAt = new Date().toISOString();
  b.config = next;
  b.flat = withFlat(next);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  emit();
  return b.flat;
}

export function resetOsRuntimeConfig(): KeyberOsRuntimeFlat {
  return setOsRuntimeConfig(cloneDefaults());
}

/** Trésorerie affichée = brute × facteur OS (module ERP). */
export function applyOsTresorerie(brut: number): number {
  const f = getOsRuntimeConfig().erp.tresorerieFacteur;
  return Math.round(brut * f);
}

export function isOsModuleEnabled(id: OsModuleId): boolean {
  const c = getOsRuntimeConfig();
  switch (id) {
    case "donnees-sauvegarde":
      return c.donneesSauvegarde.enabled;
    case "moteur-scenarios":
      return c.moteurScenarios.enabled;
    case "moteur-decisions":
      return c.moteurDecisions.enabled;
    case "moteur-evenements":
      return c.moteurEvenements.enabled;
    case "erp":
      return c.erp.enabled;
    case "progression":
      return c.progression.enabled;
    case "interface-joueur":
      return c.interfaceJoueur.enabled;
    case "ordinateur":
      return c.ordinateur.enabled;
    case "temps":
      return c.temps.enabled;
    case "interviews":
      return c.interviews.enabled;
    case "objectifs":
      return c.objectifs.enabled;
    case "visibilite":
      return c.visibilite.enabled;
    default:
      return true;
  }
}

export function useKeyberOsRuntime() {
  const config = useSyncExternalStore(
    (l) => {
      ensure();
      bag().listeners.add(l);
      return () => bag().listeners.delete(l);
    },
    () => {
      ensure();
      return bag().flat;
    },
    () => OS_RUNTIME_DEFAULTS_FLAT
  );

  return {
    config,
    setConfig: setOsRuntimeConfig,
    resetConfig: resetOsRuntimeConfig,
    setTresorerieFacteur(v: number) {
      return setOsRuntimeConfig({ erp: { ...config.erp, tresorerieFacteur: v } });
    },
    setTresorerieFormuleLabel(v: string) {
      return setOsRuntimeConfig({
        erp: { ...config.erp, tresorerieFormuleLabel: v },
      });
    },
  };
}
