/**
 * Play content resolver — active contexte / scénario via registry.
 * Admin Studio must NEVER override player decisions or GameState.
 */

import { getScenarioActif } from "@/data/registry";
import type { Decision } from "@/lib/decisions";

/** Always false — Studio is decoupled from the player. */
export function adminOverridesActive(): boolean {
  return false;
}

/**
 * Decision used by the player Décider screen & engine.
 * From active contexte scenario — never from Admin localStorage.
 */
export function getPlayDecisionForDay(day: number): Decision | undefined {
  return getScenarioActif().decisionForDay(day);
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
