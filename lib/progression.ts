/**
 * Shared skill XP — Mode Compétence & Mode Histoire read/write the same bars.
 */

import {
  canonicalizeSkillId,
  emptyCibleesProgress,
  emptyGeneralesProgress,
  getCompetenceDef,
  isCiblee,
  isGenerale,
  skillLabel as labelFromCatalog,
  type CompetenceImpact,
  type CompetenceProgress,
} from "./competences";
import type { CompetenceProgressState, GameState } from "./gameState";

/** XP needed inside a skill to gain one skill level. */
export const XP_PER_SKILL_LEVEL = 100;

export function skillLabel(competenceId: string) {
  return labelFromCatalog(competenceId);
}

function ensureSkillMaps(state: GameState): GameState {
  const generales =
    state.progression.competencesGenerales ?? emptyGeneralesProgress();
  const ciblees =
    state.progression.competencesCiblees ?? emptyCibleesProgress();
  // Migrate legacy flat competences / skillProgress once
  const legacy = {
    ...(state.progression.competences ?? {}),
  };
  for (const [id, prog] of Object.entries(state.world.skillProgress ?? {})) {
    legacy[id] = prog.niveau;
  }
  const nextGen = { ...generales };
  const nextCib = { ...ciblees };
  for (const [rawId, niveau] of Object.entries(legacy)) {
    const id = canonicalizeSkillId(rawId);
    const def = getCompetenceDef(id);
    if (!def) continue;
    if (def.type === "generale") {
      nextGen[id] = nextGen[id] ?? {
        niveau: typeof niveau === "number" ? niveau : 1,
        xp: state.world.skillProgress?.[rawId]?.xp ?? 0,
      };
    } else {
      nextCib[id] = nextCib[id] ?? {
        niveau: typeof niveau === "number" ? niveau : 1,
        xp: state.world.skillProgress?.[rawId]?.xp ?? 0,
        indicateursValides: [false, false, false],
      };
    }
  }
  return {
    ...state,
    progression: {
      ...state.progression,
      competencesGenerales: nextGen,
      competencesCiblees: nextCib,
    },
  };
}

export function getSkillProgress(
  state: GameState,
  competenceId: string
): CompetenceProgressState {
  const s = ensureSkillMaps(state);
  const id = canonicalizeSkillId(competenceId);
  if (isGenerale(id)) {
    return (
      s.progression.competencesGenerales[id] ?? { niveau: 1, xp: 0 }
    );
  }
  return (
    s.progression.competencesCiblees[id] ?? {
      niveau: 1,
      xp: 0,
      indicateursValides: [false, false, false],
    }
  );
}

export function getSkillLevel(state: GameState, competenceId: string): number {
  return getSkillProgress(state, competenceId).niveau;
}

export function getSkillXp(state: GameState, competenceId: string): number {
  return getSkillProgress(state, competenceId).xp;
}

function mirrorSkillProgress(state: GameState): GameState {
  const skillProgress: Record<string, { niveau: number; xp: number }> = {};
  for (const [id, p] of Object.entries(
    state.progression.competencesGenerales ?? {}
  )) {
    skillProgress[id] = { niveau: p.niveau, xp: p.xp };
  }
  for (const [id, p] of Object.entries(
    state.progression.competencesCiblees ?? {}
  )) {
    skillProgress[id] = { niveau: p.niveau, xp: p.xp };
  }
  const flat: Record<string, number> = {};
  for (const [id, p] of Object.entries(skillProgress)) {
    flat[id] = p.niveau;
  }
  return {
    ...state,
    progression: {
      ...state.progression,
      competences: flat,
    },
    world: { ...state.world, skillProgress },
  };
}

/** Award XP to one competence; level up when threshold crossed. Also bumps global XP. */
export function addSkillXp(
  state: GameState,
  competenceId: string,
  amount: number,
  indicateurIndex?: number
): GameState {
  if (amount <= 0) return state;
  let next = ensureSkillMaps(state);
  const id = canonicalizeSkillId(competenceId);
  const def = getCompetenceDef(id);
  if (!def) return state;

  const bucket =
    def.type === "generale"
      ? next.progression.competencesGenerales
      : next.progression.competencesCiblees;
  const current: CompetenceProgress = bucket[id] ?? {
    niveau: 1,
    xp: 0,
    indicateursValides:
      def.type === "ciblee" ? [false, false, false] : undefined,
  };

  let xp = current.xp + amount;
  let niveau = current.niveau;
  let leveled = 0;
  while (xp >= XP_PER_SKILL_LEVEL && niveau < 5) {
    xp -= XP_PER_SKILL_LEVEL;
    niveau += 1;
    leveled += 1;
  }
  if (niveau >= 5) {
    niveau = 5;
    xp = Math.min(xp, XP_PER_SKILL_LEVEL - 1);
  }

  const indicateursValides = [...(current.indicateursValides ?? [false, false, false])];
  if (
    def.type === "ciblee" &&
    typeof indicateurIndex === "number" &&
    indicateurIndex >= 0 &&
    indicateurIndex < 3
  ) {
    indicateursValides[indicateurIndex] = true;
  }

  const updated: CompetenceProgressState = {
    niveau,
    xp,
    ...(def.type === "ciblee" ? { indicateursValides } : {}),
  };

  next = {
    ...next,
    progression: {
      ...next.progression,
      xp: next.progression.xp + amount,
      competencesGenerales:
        def.type === "generale"
          ? { ...next.progression.competencesGenerales, [id]: updated }
          : next.progression.competencesGenerales,
      competencesCiblees:
        def.type === "ciblee"
          ? { ...next.progression.competencesCiblees, [id]: updated }
          : next.progression.competencesCiblees,
    },
    world: {
      ...next.world,
      feedbackFlash:
        leveled > 0
          ? `${skillLabel(id)} : Niveau ${niveau} !`
          : next.world.feedbackFlash,
    },
  };

  return mirrorSkillProgress(next);
}

/** Apply a list of precise skill impacts (story or training). */
export function applyCompetenceImpacts(
  state: GameState,
  impacts: CompetenceImpact[]
): { state: GameState; debrief: string[] } {
  let next = ensureSkillMaps(state);
  const debrief: string[] = [];
  for (const impact of impacts) {
    next = addSkillXp(
      next,
      impact.competenceId,
      impact.xp,
      impact.indicateurIndex
    );
    const def = getCompetenceDef(impact.competenceId);
    const type = impact.type ?? def?.type ?? "generale";
    const nom = def?.nom ?? impact.competenceId;
    const typeLabel = type === "generale" ? "Générale" : "Ciblée";
    debrief.push(`${typeLabel} - ${nom} +${impact.xp} : ${impact.feedback}`);
  }
  next = {
    ...next,
    world: {
      ...next.world,
      lastSkillDebrief: debrief,
      feedbackFlash: debrief[0] ?? next.world.feedbackFlash,
    },
  };
  return { state: mirrorSkillProgress(next), debrief };
}

/** Keep progression maps aligned (idempotent). */
export function syncCompetencesFromSkills(state: GameState): GameState {
  return mirrorSkillProgress(ensureSkillMaps(state));
}

export { emptyGeneralesProgress, emptyCibleesProgress, isGenerale, isCiblee };
