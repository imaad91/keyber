/**
 * Registry OS — seul point d'entrée pour contextes & scénarios.
 * L'OS ne connaît aucun nom d'entreprise : il lit getContexteActif().
 */

import type { Decision } from "@/lib/decisions";
import type { GameState } from "@/lib/gameState";
import {
  contexteNovacier,
  type ContexteModule,
  type ContexteScenario,
} from "@/data/contextes/novacier";
import { contexteTestEntreprise } from "@/data/contextes/test-entreprise";

const CONTEXTES: Record<string, ContexteModule> = {
  [contexteNovacier.id]: contexteNovacier,
  [contexteTestEntreprise.id]: contexteTestEntreprise,
};

const STORAGE_KEY = "keyber-active-contexte-id";
const DEFAULT_CONTEXTE_ID = contexteNovacier.id;

let activeContexteId: string = DEFAULT_CONTEXTE_ID;

function readStoredId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function listContextes(): ContexteModule[] {
  return Object.values(CONTEXTES);
}

export function getContexte(id: string): ContexteModule {
  return CONTEXTES[id] ?? CONTEXTES[DEFAULT_CONTEXTE_ID]!;
}

export function getContexteActif(): ContexteModule {
  if (typeof window !== "undefined") {
    const stored = readStoredId();
    if (stored && CONTEXTES[stored]) activeContexteId = stored;
  }
  return getContexte(activeContexteId);
}

export function setContexteActif(id: string): ContexteModule {
  const ctx = getContexte(id);
  activeContexteId = ctx.id;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, ctx.id);
    } catch {
      /* ignore */
    }
  }
  return ctx;
}

export function getScenario(
  contexteId: string,
  scenarioId: string
): ContexteScenario {
  const ctx = getContexte(contexteId);
  return (
    ctx.scenarios[scenarioId] ??
    ctx.scenarios[ctx.defaultScenarioId]!
  );
}

export function getScenarioActif(): ContexteScenario {
  const ctx = getContexteActif();
  return ctx.scenarios[ctx.defaultScenarioId]!;
}

/** @deprecated Prefer getScenarioActif / getContexteActif — kept for call sites. */
export type ScenarioModule = {
  id: string;
  createInitial: () => GameState;
  decisions: Decision[];
  decisionForDay: (day: number) => Decision | undefined;
};

export function getScenarioById(scenarioId: string): ScenarioModule {
  const ctx = getContexteActif();
  const sc =
    Object.values(ctx.scenarios).find((s) => s.id === scenarioId) ??
    ctx.scenarios[ctx.defaultScenarioId]!;
  return {
    id: sc.id,
    createInitial: sc.createInitial,
    decisions: sc.decisions,
    decisionForDay: sc.decisionForDay,
  };
}

export function getDefaultScenario(): ScenarioModule {
  return getScenarioById(getScenarioActif().id);
}

/** Alias historique */
export function getScenario_legacy(scenarioId: string): ScenarioModule {
  return getScenarioById(scenarioId);
}

export { getScenarioById as getScenarioModule };
