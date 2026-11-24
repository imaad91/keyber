/**
 * Keyber OS — résolution Hotspots Clear Campus (Phase 2).
 * Lieu → action (suite / interview / décision / document / productionLive).
 */

import { normalizeHotspots } from "@/lib/clearCampus/schema";
import type { ScenarioParamHotspot } from "@/lib/clearCampus/types";
import {
  ensureOsCampus,
  osCampusEnsureOnState,
  osCampusGoToRoom,
} from "@/lib/keyberOs/campus";
import { osOrdinateurOpenApp, osOrdinateurSetAction } from "@/lib/keyberOs/ordinateur";
import { osProductionLiveSync } from "@/lib/keyberOs/productionLive";
import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";
import type { ScenarioParamFileExtended } from "@/lib/scenarioParamSchema";

function listHotspots(state: OsPlayState): ScenarioParamHotspot[] {
  return normalizeHotspots(
    (state.param as ScenarioParamFileExtended).Hotspots
  );
}

/**
 * Active un hotspot : navigue la salle puis ouvre l'action liée.
 */
export function osHotspotActivate(
  state: OsPlayState,
  hotspotId: string
): OsPlayState {
  if (!isOsModuleEnabled("campus")) {
    return {
      ...state,
      feedback: "Module Campus désactivé — hotspots indisponibles.",
      log: [...state.log, "Hotspot → Campus OFF (Admin)"],
    };
  }

  let next = osCampusEnsureOnState(state);
  const hotspot = listHotspots(next).find((h) => h.id === hotspotId);
  if (!hotspot) {
    return {
      ...next,
      feedback: "Hotspot inconnu.",
      log: [...next.log, `Hotspot → « ${hotspotId} » introuvable`],
    };
  }

  next = osCampusGoToRoom(next, hotspot.roomId);
  if (next.feedback?.includes("verrouill") || next.feedback?.includes("inconnue")) {
    return next;
  }

  const campus = ensureOsCampus(next);
  next = {
    ...next,
    campus: {
      ...campus,
      selectedHotspotId: hotspot.id,
    },
    log: [
      ...next.log,
      `Hotspot → « ${hotspot.label} » (${hotspot.type})`,
    ],
  };

  switch (hotspot.type) {
    case "suite": {
      next = osOrdinateurSetAction(next, "computer");
      if (hotspot.targetId === "mail") {
        next = osOrdinateurOpenApp(next, "mail");
      } else if (hotspot.targetId === "documents") {
        next = osOrdinateurOpenApp(next, "documents");
      } else if (hotspot.targetId === "chat") {
        next = osOrdinateurOpenApp(next, "chat");
      } else if (hotspot.targetId === "browser") {
        next = osOrdinateurOpenApp(next, "browser");
      } else if (hotspot.targetId === "dashboard") {
        next = osOrdinateurOpenApp(next, "dashboard");
      } else {
        next = osOrdinateurOpenApp(next, "erp");
      }
      break;
    }
    case "document": {
      next = osOrdinateurSetAction(next, "computer");
      next = osOrdinateurOpenApp(next, "documents");
      break;
    }
    case "interview": {
      next = osOrdinateurSetAction(next, "interview");
      if (hotspot.targetId) {
        next = {
          ...next,
          selectedInterviewId: hotspot.targetId,
        };
      }
      break;
    }
    case "decision": {
      next = osOrdinateurSetAction(next, "decide");
      break;
    }
    case "productionLive": {
      if (!isOsModuleEnabled("production-live")) {
        return {
          ...next,
          feedback: "Module Vue Live Production désactivé (Admin).",
          log: [...next.log, "Hotspot → production-live OFF"],
        };
      }
      next = osProductionLiveSync(next);
      next = osOrdinateurSetAction(next, "atelier-live");
      break;
    }
    default:
      break;
  }

  return next;
}
