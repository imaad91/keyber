/**
 * Client-side save slots — localStorage only.
 */

import type { GameState, ModeJeu } from "./gameState";
import {
  ACTIVE_SLOT_KEY,
  PROGRESSION_STORAGE_KEY,
  SAVE_STORAGE_KEY,
  USER_ID_KEY,
  applyProgressionToState,
  computePourcentage,
  emptyProgression,
  progressionFromState,
  type ProgressionGlobale,
  type Sauvegarde,
  type SlotNumber,
} from "./sauvegarde";

export type SavesBundle = {
  slots: Partial<Record<SlotNumber, Sauvegarde>>;
  activeSlot: SlotNumber | null;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getOrCreateUserId(): string {
  if (!canUseStorage()) return "local-dev";
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `user-${Date.now().toString(36)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function loadSavesBundle(): SavesBundle {
  if (!canUseStorage()) return { slots: {}, activeSlot: null };
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    const activeRaw = localStorage.getItem(ACTIVE_SLOT_KEY);
    const activeSlot = activeRaw ? (Number(activeRaw) as SlotNumber) : null;
    if (!raw) return { slots: {}, activeSlot };
    const parsed = JSON.parse(raw) as SavesBundle["slots"];
    return {
      slots: parsed ?? {},
      activeSlot:
        activeSlot === 1 || activeSlot === 2 || activeSlot === 3
          ? activeSlot
          : null,
    };
  } catch {
    return { slots: {}, activeSlot: null };
  }
}

export function loadProgressionLocale(): ProgressionGlobale {
  const userId = getOrCreateUserId();
  if (!canUseStorage()) return emptyProgression(userId);
  try {
    const raw = localStorage.getItem(PROGRESSION_STORAGE_KEY);
    if (!raw) return emptyProgression(userId);
    return { ...emptyProgression(userId), ...(JSON.parse(raw) as ProgressionGlobale), userId };
  } catch {
    return emptyProgression(userId);
  }
}

function persistBundle(bundle: SavesBundle) {
  if (!canUseStorage()) return;
  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(bundle.slots));
  if (bundle.activeSlot) {
    localStorage.setItem(ACTIVE_SLOT_KEY, String(bundle.activeSlot));
  } else {
    localStorage.removeItem(ACTIVE_SLOT_KEY);
  }
}

function persistProgression(p: ProgressionGlobale) {
  if (!canUseStorage()) return;
  localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(p));
}

export function setActiveSlot(slot: SlotNumber | null) {
  if (!canUseStorage()) return;
  if (slot) localStorage.setItem(ACTIVE_SLOT_KEY, String(slot));
  else localStorage.removeItem(ACTIVE_SLOT_KEY);
}

export function getActiveSlot(): SlotNumber | null {
  if (!canUseStorage()) return null;
  const n = Number(localStorage.getItem(ACTIVE_SLOT_KEY));
  return n === 1 || n === 2 || n === 3 ? n : null;
}

export function buildSauvegarde(
  slot: SlotNumber,
  state: GameState,
  opts?: { nomJoueur?: string; id?: string }
): Sauvegarde {
  const mode = (state.modeActuel ?? null) as ModeJeu | null;
  return {
    id: opts?.id ?? `save-${slot}-${state.meta.scenarioId ?? "x"}`,
    slot,
    nomJoueur: opts?.nomJoueur ?? "Pilote KEYBER",
    mode,
    scenarioId: state.meta.scenarioId ?? state.scenarioHistoireId,
    gameState: state,
    dateDerniereSauvegarde: new Date().toISOString(),
    jourActuel: state.meta.jourActuel,
    pourcentageProgression: computePourcentage(state),
  };
}

/** Write slot locally + update global progression. */
export function saveSlotAndProgression(
  slot: SlotNumber,
  state: GameState,
  nomJoueur = "Pilote KEYBER"
): { sauvegarde: Sauvegarde; progression: ProgressionGlobale } {
  const bundle = loadSavesBundle();
  const existing = bundle.slots[slot];
  const sauvegarde = buildSauvegarde(slot, state, {
    nomJoueur: existing?.nomJoueur ?? nomJoueur,
    id: existing?.id ?? `save-${slot}-${Date.now().toString(36)}`,
  });
  bundle.slots[slot] = sauvegarde;
  bundle.activeSlot = slot;
  persistBundle(bundle);

  const userId = getOrCreateUserId();
  const progression = progressionFromState(
    userId,
    state,
    loadProgressionLocale()
  );
  persistProgression(progression);

  return { sauvegarde, progression };
}

export function clearSlot(slot: SlotNumber) {
  const bundle = loadSavesBundle();
  delete bundle.slots[slot];
  if (bundle.activeSlot === slot) bundle.activeSlot = null;
  persistBundle(bundle);
}

export function getMostRecentSave(): Sauvegarde | null {
  const { slots } = loadSavesBundle();
  const list = Object.values(slots).filter(Boolean) as Sauvegarde[];
  if (list.length === 0) return null;
  return list.sort(
    (a, b) =>
      new Date(b.dateDerniereSauvegarde).getTime() -
      new Date(a.dateDerniereSauvegarde).getTime()
  )[0]!;
}

/** New run: fresh GameState + persistent skills from ProgressionGlobale. */
export function prepareNewGameState(
  fresh: GameState,
  progression?: ProgressionGlobale | null
): GameState {
  const prog = progression ?? loadProgressionLocale();
  return applyProgressionToState(fresh, prog);
}
