/**
 * Save slots + global progression (localStorage).
 */

import {
  canonicalizeSkillId,
  emptyCibleesProgress,
  emptyGeneralesProgress,
  getCompetenceDef,
} from "./competences";
import type { GameState, ModeJeu } from "./gameState";

export type SlotNumber = 1 | 2 | 3;

export type Sauvegarde = {
  id: string;
  slot: SlotNumber;
  nomJoueur: string;
  mode: ModeJeu | null;
  scenarioId: string | null;
  gameState: GameState;
  dateDerniereSauvegarde: string;
  jourActuel: number;
  pourcentageProgression: number;
};

export type ProgressionGlobale = {
  userId: string;
  niveauGlobal: number;
  xpTotal: number;
  /** Flat merge for persistence — split on apply */
  competences: Record<string, { niveau: number; xp: number; indicateursValides?: boolean[] }>;
  histoiresTerminees: string[];
  entrainementsTermines: string[];
  updatedAt: string;
};

export const SAVE_STORAGE_KEY = "keyber-saves-v1";
export const PROGRESSION_STORAGE_KEY = "keyber-progression-v1";
export const ACTIVE_SLOT_KEY = "keyber-active-slot";
export const USER_ID_KEY = "keyber-user-id";

export function computePourcentage(state: GameState): number {
  if (state.modeActuel === "competence") {
    const done = state.world.trainingsCompleted?.length ?? 0;
    return Math.min(100, Math.round((done / 11) * 100));
  }
  const jour = Math.max(0, state.meta.jourActuel);
  if (state.world.showDebrief || state.world.ending) return 100;
  return Math.min(100, Math.round((jour / 5) * 100));
}

export function emptyProgression(userId: string): ProgressionGlobale {
  return {
    userId,
    niveauGlobal: 1,
    xpTotal: 0,
    competences: {},
    histoiresTerminees: [],
    entrainementsTermines: [],
    updatedAt: new Date().toISOString(),
  };
}

export function progressionFromState(
  userId: string,
  state: GameState,
  prev?: ProgressionGlobale | null
): ProgressionGlobale {
  const base = prev ?? emptyProgression(userId);
  const competences = { ...base.competences };
  const merge = (
    id: string,
    prog: { niveau: number; xp: number; indicateursValides?: boolean[] }
  ) => {
    const canon = canonicalizeSkillId(id);
    const cur = competences[canon];
    if (
      !cur ||
      prog.niveau > cur.niveau ||
      (prog.niveau === cur.niveau && prog.xp > cur.xp)
    ) {
      competences[canon] = {
        niveau: prog.niveau,
        xp: prog.xp,
        indicateursValides: prog.indicateursValides,
      };
    }
  };
  for (const [id, prog] of Object.entries(
    state.progression.competencesGenerales ?? {}
  )) {
    merge(id, prog);
  }
  for (const [id, prog] of Object.entries(
    state.progression.competencesCiblees ?? {}
  )) {
    merge(id, prog);
  }
  for (const [id, prog] of Object.entries(state.world.skillProgress ?? {})) {
    merge(id, prog);
  }
  const histoires = new Set(base.histoiresTerminees);
  for (const h of state.world.histoiresCompleted ?? []) {
    if (h.scenarioId) histoires.add(h.scenarioId);
  }
  if (state.world.ending && state.meta.scenarioId) {
    histoires.add(state.meta.scenarioId);
  }
  const trains = new Set(base.entrainementsTermines);
  for (const t of state.world.trainingsCompleted ?? []) {
    trains.add(`${t.competenceId}:${t.decisionId}`);
  }
  return {
    userId,
    niveauGlobal: Math.max(base.niveauGlobal, state.progression.niveau),
    xpTotal: Math.max(
      base.xpTotal,
      state.progression.xp + (state.progression.niveau - 1) * 500
    ),
    competences,
    histoiresTerminees: Array.from(histoires),
    entrainementsTermines: Array.from(trains),
    updatedAt: new Date().toISOString(),
  };
}

/** Apply persistent skill bars onto a fresh / reset GameState. */
export function applyProgressionToState(
  state: GameState,
  progression: ProgressionGlobale
): GameState {
  const competencesGenerales = {
    ...(state.progression.competencesGenerales ?? emptyGeneralesProgress()),
  };
  const competencesCiblees = {
    ...(state.progression.competencesCiblees ?? emptyCibleesProgress()),
  };
  const skillProgress = { ...state.world.skillProgress };
  for (const [rawId, prog] of Object.entries(progression.competences)) {
    const id = canonicalizeSkillId(rawId);
    const def = getCompetenceDef(id);
    const entry = {
      niveau: prog.niveau,
      xp: prog.xp,
      ...(def?.type === "ciblee"
        ? {
            indicateursValides:
              prog.indicateursValides ?? [false, false, false],
          }
        : {}),
    };
    if (def?.type === "ciblee") competencesCiblees[id] = entry;
    else if (def?.type === "generale") competencesGenerales[id] = entry;
    skillProgress[id] = { niveau: prog.niveau, xp: prog.xp };
  }
  return {
    ...state,
    progression: {
      ...state.progression,
      niveau: Math.max(state.progression.niveau, progression.niveauGlobal),
      competencesGenerales,
      competencesCiblees,
    },
    world: {
      ...state.world,
      skillProgress,
    },
  };
}

export function formatRelativeSave(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

export function formatClockSave(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    });
  } catch {
    return "--:--";
  }
}
