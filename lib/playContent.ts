/**
 * Play content resolver — static scenario files only.
 * Admin Studio must NEVER override player decisions or GameState.
 */

import { decisionForDay } from "@/data/scenarioNovacier";
import type { Decision } from "@/lib/decisions";

/** Always false — Studio is decoupled from the player. */
export function adminOverridesActive(): boolean {
  return false;
}

/**
 * Decision used by the player Décider screen & engine.
 * Always from static Novacier data — never from Admin localStorage.
 */
export function getPlayDecisionForDay(day: number): Decision | undefined {
  return decisionForDay(day);
}

export function getPlayDecisionByChoixId(
  choixId: string
): { decision: Decision; day: number } | undefined {
  for (let day = 1; day <= 5; day++) {
    const d = getPlayDecisionForDay(day);
    if (d?.choix.some((c) => c.id === choixId)) {
      return { decision: d, day };
    }
  }
  return undefined;
}
