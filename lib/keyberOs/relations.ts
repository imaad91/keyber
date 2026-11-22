/**
 * Keyber OS — Relations PNJ (Étape 16)
 * Jauges génériques par slot (id interview / contact). Aucun PNJ hardcodé.
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsInterview, OsPlayState } from "@/lib/keyberOs/types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function osRelationsDefaultTrust(): number {
  return getOsRuntimeConfig().relations?.defaultTrust ?? 55;
}

export function osRelationGet(
  state: OsPlayState,
  slotId: string,
  fallback?: number
): number {
  const v = state.relations?.[slotId];
  if (typeof v === "number") return clamp(v, 0, 100);
  return clamp(
    fallback ?? osRelationsDefaultTrust(),
    0,
    100
  );
}

/** Initialise les slots relations depuis le catalogue interviews (si vides). */
export function osRelationsInitFromInterviews(
  interviews: OsInterview[],
  existing?: Record<string, number>
): Record<string, number> {
  const def = osRelationsDefaultTrust();
  const next: Record<string, number> = { ...(existing ?? {}) };
  for (const iv of interviews) {
    if (next[iv.id] == null) {
      next[iv.id] = clamp(iv.relationConfiance ?? def, 0, 100);
    }
  }
  return next;
}

export function osRelationApplyDelta(
  state: OsPlayState,
  slotId: string,
  delta: number
): OsPlayState {
  if (!isOsModuleEnabled("relations") && !isOsModuleEnabled("interviews")) {
    return state;
  }
  const prev = osRelationGet(state, slotId);
  const nextVal = clamp(prev + delta, 0, 100);
  return {
    ...state,
    relations: {
      ...state.relations,
      [slotId]: nextVal,
    },
  };
}

export type OsRelationSlot = {
  id: string;
  nom: string;
  role: string;
  trust: number;
};

export function osRelationSlots(state: OsPlayState): OsRelationSlot[] {
  const fromInterviews = state.interviews.map((iv) => ({
    id: iv.id,
    nom: iv.nom,
    role: iv.role,
    trust: osRelationGet(state, iv.id, iv.relationConfiance),
  }));
  if (fromInterviews.length) return fromInterviews;

  return Object.entries(state.relations ?? {}).map(([id, trust]) => ({
    id,
    nom: id,
    role: "PNJ",
    trust: clamp(trust, 0, 100),
  }));
}
