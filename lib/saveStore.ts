/**
 * Client-side save slots — localStorage is the source of truth on this VM;
 * Supabase sync is best-effort via /api when secrets are configured.
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

/** Write slot locally + update global progression; fire-and-forget cloud sync. */
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

  void syncCloud(sauvegarde, progression);

  return { sauvegarde, progression };
}

export function clearSlot(slot: SlotNumber) {
  const bundle = loadSavesBundle();
  delete bundle.slots[slot];
  if (bundle.activeSlot === slot) bundle.activeSlot = null;
  persistBundle(bundle);
  void deleteCloudSlot(slot);
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

async function syncCloud(
  sauvegarde: Sauvegarde,
  progression: ProgressionGlobale
) {
  try {
    await fetch("/api/sauvegardes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: progression.userId,
        sauvegarde,
      }),
    });
    await fetch("/api/progression", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progression),
    });
  } catch {
    // local-only fallback — cloud optional
  }
}

async function deleteCloudSlot(slot: SlotNumber) {
  try {
    const userId = getOrCreateUserId();
    await fetch(
      `/api/sauvegardes?userId=${encodeURIComponent(userId)}&slot=${slot}`,
      { method: "DELETE" }
    );
  } catch {
    // ignore
  }
}

/** Pull cloud saves when available; merge by newest date. */
export async function hydrateFromCloud(): Promise<void> {
  if (!canUseStorage()) return;
  const userId = getOrCreateUserId();
  try {
    const [sRes, pRes] = await Promise.all([
      fetch(`/api/sauvegardes?userId=${encodeURIComponent(userId)}`),
      fetch(`/api/progression?userId=${encodeURIComponent(userId)}`),
    ]);
    if (sRes.ok) {
      const data = (await sRes.json()) as { slots?: Sauvegarde[] };
      if (data.slots?.length) {
        const bundle = loadSavesBundle();
        for (const s of data.slots) {
          const local = bundle.slots[s.slot];
          if (
            !local ||
            new Date(s.dateDerniereSauvegarde).getTime() >
              new Date(local.dateDerniereSauvegarde).getTime()
          ) {
            bundle.slots[s.slot] = s;
          }
        }
        persistBundle(bundle);
      }
    }
    if (pRes.ok) {
      const cloud = (await pRes.json()) as ProgressionGlobale | null;
      if (cloud?.userId) {
        const local = loadProgressionLocale();
        const merged = progressionFromState(
          userId,
          {
            progression: {
              xp: cloud.xpTotal,
              niveau: cloud.niveauGlobal,
              competences: Object.fromEntries(
                Object.entries(cloud.competences).map(([k, v]) => [k, v.niveau])
              ),
            },
            world: {
              skillProgress: cloud.competences,
              histoiresCompleted: cloud.histoiresTerminees.map((id) => ({
                scenarioId: id,
                titre: id,
                ending: null,
                at: cloud.updatedAt,
              })),
              trainingsCompleted: cloud.entrainementsTermines.map((key) => {
                const [competenceId, decisionId] = key.split(":");
                return {
                  competenceId: competenceId ?? key,
                  decisionId: decisionId ?? key,
                  choixId: "",
                  label: key,
                  at: cloud.updatedAt,
                  xp: 0,
                };
              }),
            },
          } as unknown as GameState,
          local
        );
        persistProgression({
          ...merged,
          histoiresTerminees: Array.from(
            new Set([
              ...local.histoiresTerminees,
              ...cloud.histoiresTerminees,
            ])
          ),
          entrainementsTermines: Array.from(
            new Set([
              ...local.entrainementsTermines,
              ...cloud.entrainementsTermines,
            ])
          ),
        });
      }
    }
  } catch {
    // stay local
  }
}
