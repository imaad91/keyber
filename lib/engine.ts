import type { Decision, GameState } from "./types";

/**
 * Stub: applies a decision to game state.
 * Structure only — no real simulation logic yet.
 */
export function applyDecision(
  state: GameState,
  decision: Decision
): GameState {
  const deltas = decision.deltas ?? {};
  return {
    ...state,
    ...Object.fromEntries(
      Object.entries(deltas).map(([key, value]) => [
        key,
        (state[key] ?? 0) + (value ?? 0),
      ])
    ),
  };
}
