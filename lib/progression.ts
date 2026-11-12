/**
 * Shared skill XP — Mode Compétence & Mode Histoire read/write the same bars.
 */

import type { GameState } from "./gameState";

/** XP needed inside a skill to gain one skill level. */
export const XP_PER_SKILL_LEVEL = 100;

const SKILL_LABELS: Record<string, string> = {
  negociation: "Négociation",
  crise: "Gestion de crise",
  leadership: "Leadership",
  stock: "Gestion de stock",
  data: "Data & visibilité",
};

export function skillLabel(competenceId: string) {
  return SKILL_LABELS[competenceId] ?? competenceId;
}

export function getSkillLevel(state: GameState, competenceId: string): number {
  const fromProgress = state.world.skillProgress[competenceId]?.niveau;
  if (typeof fromProgress === "number") return fromProgress;
  const fromCompetences = state.progression.competences[competenceId];
  if (typeof fromCompetences === "number") return fromCompetences;
  return 1;
}

export function getSkillXp(state: GameState, competenceId: string): number {
  return state.world.skillProgress[competenceId]?.xp ?? 0;
}

/** Award XP to one competence; level up when threshold crossed. Also bumps global XP. */
export function addSkillXp(
  state: GameState,
  competenceId: string,
  amount: number
): GameState {
  if (amount <= 0) return state;

  const current = state.world.skillProgress[competenceId] ?? {
    niveau: state.progression.competences[competenceId] ?? 1,
    xp: 0,
  };

  let xp = current.xp + amount;
  let niveau = current.niveau;
  let leveled = 0;
  while (xp >= XP_PER_SKILL_LEVEL) {
    xp -= XP_PER_SKILL_LEVEL;
    niveau += 1;
    leveled += 1;
  }

  const flash =
    leveled > 0
      ? `${skillLabel(competenceId)} : Niveau ${niveau} !`
      : state.world.feedbackFlash;

  return {
    ...state,
    progression: {
      ...state.progression,
      xp: state.progression.xp + amount,
      competences: {
        ...state.progression.competences,
        [competenceId]: niveau,
      },
    },
    world: {
      ...state.world,
      skillProgress: {
        ...state.world.skillProgress,
        [competenceId]: { niveau, xp },
      },
      feedbackFlash: flash,
    },
  };
}

/** Keep progression.competences aligned with skillProgress (idempotent). */
export function syncCompetencesFromSkills(state: GameState): GameState {
  const competences = { ...state.progression.competences };
  for (const [id, prog] of Object.entries(state.world.skillProgress)) {
    competences[id] = prog.niveau;
  }
  return {
    ...state,
    progression: { ...state.progression, competences },
  };
}
