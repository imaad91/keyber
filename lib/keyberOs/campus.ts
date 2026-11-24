/**
 * Keyber OS — Campus (Clear Campus Phase 2).
 * Navigation ailes / salles / déblocages depuis param.Campus.
 * Aucun nom d'entreprise hardcodé.
 */

import {
  normalizeCampus,
  normalizeClearCampusUi,
  normalizeHotspots,
} from "@/lib/clearCampus/schema";
import type { ScenarioParamHotspot } from "@/lib/clearCampus/types";
import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";
import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import type { ScenarioParamFileExtended } from "@/lib/scenarioParamSchema";

export type OsCampusState = {
  currentWingId: string | null;
  currentRoomId: string | null;
  unlockedWingIds: string[];
  unlockedRoomIds: string[];
  selectedHotspotId: string | null;
};

export function emptyOsCampusState(): OsCampusState {
  return {
    currentWingId: null,
    currentRoomId: null,
    unlockedWingIds: [],
    unlockedRoomIds: [],
    selectedHotspotId: null,
  };
}

function asExtended(param: ScenarioParamFile): ScenarioParamFileExtended {
  return param as ScenarioParamFileExtended;
}

/** Débloque ailes/salles selon le jour courant. */
export function osCampusComputeUnlocks(
  param: ScenarioParamFile,
  day: number
): Pick<OsCampusState, "unlockedWingIds" | "unlockedRoomIds"> {
  const campus = normalizeCampus(asExtended(param).Campus);
  const unlockedWingIds = campus.wings
    .filter((w) => (w.unlockDay ?? 1) <= day)
    .map((w) => w.id);
  const unlockedRoomIds = campus.rooms
    .filter(
      (r) =>
        (r.unlockDay ?? 1) <= day &&
        unlockedWingIds.includes(r.wingId)
    )
    .map((r) => r.id);
  return { unlockedWingIds, unlockedRoomIds };
}

/** Boot Campus au démarrage de session. */
export function osCampusBoot(
  param: ScenarioParamFile,
  day: number
): OsCampusState {
  const campus = normalizeCampus(asExtended(param).Campus);
  const unlocks = osCampusComputeUnlocks(param, day);
  const firstRoom =
    campus.rooms.find((r) => unlocks.unlockedRoomIds.includes(r.id)) ??
    campus.rooms[0] ??
    null;
  const firstWing =
    (firstRoom &&
      campus.wings.find((w) => w.id === firstRoom.wingId)) ||
    campus.wings.find((w) => unlocks.unlockedWingIds.includes(w.id)) ||
    campus.wings[0] ||
    null;

  return {
    ...emptyOsCampusState(),
    ...unlocks,
    currentWingId: firstWing?.id ?? null,
    currentRoomId: firstRoom?.id ?? null,
    selectedHotspotId: null,
  };
}

export function ensureOsCampus(state: OsPlayState): OsCampusState {
  return state.campus ?? emptyOsCampusState();
}

export function osCampusEnsureOnState(state: OsPlayState): OsPlayState {
  if (state.campus) return state;
  const day = state.meta?.jourActuel ?? state.day ?? 1;
  return {
    ...state,
    campus: osCampusBoot(state.param, day),
  };
}

/** Sync déblocages quand le jour avance. */
export function osCampusOnDayChange(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("campus")) return state;
  const day = state.meta?.jourActuel ?? state.day ?? 1;
  const unlocks = osCampusComputeUnlocks(state.param, day);
  const campus = ensureOsCampus(state);
  return {
    ...state,
    campus: {
      ...campus,
      ...unlocks,
    },
    log: [
      ...state.log,
      `Campus → déblocages jour ${day} · ${unlocks.unlockedRoomIds.length} salle(s)`,
    ],
  };
}

export function osCampusGoToRoom(
  state: OsPlayState,
  roomId: string
): OsPlayState {
  if (!isOsModuleEnabled("campus")) {
    return {
      ...state,
      feedback: "Module Campus désactivé dans Keyber OS Admin",
      log: [...state.log, "Campus → module désactivé (Admin)"],
    };
  }
  const next = osCampusEnsureOnState(state);
  const campus = ensureOsCampus(next);
  const rooms = normalizeCampus(asExtended(next.param).Campus).rooms;
  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return {
      ...next,
      feedback: "Salle inconnue.",
      log: [...next.log, `Campus → salle « ${roomId} » introuvable`],
    };
  }
  if (!campus.unlockedRoomIds.includes(roomId)) {
    return {
      ...next,
      feedback: "Salle encore verrouillée.",
      log: [...next.log, `Campus → salle « ${roomId} » verrouillée`],
    };
  }
  return {
    ...next,
    campus: {
      ...campus,
      currentRoomId: room.id,
      currentWingId: room.wingId,
      selectedHotspotId: null,
    },
    log: [...next.log, `Campus → salle « ${room.label} »`],
  };
}

export function osCampusListHotspotsInRoom(
  state: OsPlayState,
  roomId?: string | null
): ScenarioParamHotspot[] {
  const campus = ensureOsCampus(state);
  const rid = roomId ?? campus.currentRoomId;
  if (!rid) return [];
  return normalizeHotspots(asExtended(state.param).Hotspots).filter(
    (h) => h.roomId === rid
  );
}

export function osCampusUiPolicy(state: OsPlayState) {
  return normalizeClearCampusUi(asExtended(state.param).ClearCampus);
}
