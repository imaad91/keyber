/**
 * Keyber OS — Ordinateur (shell + apps)
 */

import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { osTempsAdvance, OS_ACTION_TIME_COST } from "@/lib/keyberOs/temps";
import { syncDashboardCards } from "@/lib/keyberOs/ordinateurPack";
import type {
  OsComputerAppId,
  OsPlayState,
  OsPlayerAction,
} from "@/lib/keyberOs/types";

export function osOrdinateurSetAction(
  state: OsPlayState,
  action: OsPlayerAction
): OsPlayState {
  if (action === "computer" && !isOsModuleEnabled("ordinateur")) {
    return {
      ...state,
      feedback: "Module Ordinateur désactivé dans Keyber OS Admin",
      log: [...state.log, "Ordinateur → module désactivé (Admin)"],
    };
  }
  let next: OsPlayState = {
    ...state,
    activeAction: action,
    computerApp: action === "computer" ? state.computerApp : null,
    selectedInterviewId:
      action === "interview" ? state.selectedInterviewId : null,
  };
  if (action && action !== state.activeAction) {
    const cost = OS_ACTION_TIME_COST[action] ?? 5;
    next = osTempsAdvance(next, cost);
  }
  return next;
}

export function osOrdinateurOpenApp(
  state: OsPlayState,
  app: OsComputerAppId | null
): OsPlayState {
  if (!isOsModuleEnabled("ordinateur")) {
    return {
      ...state,
      log: [...state.log, "Ordinateur → module désactivé (Admin)"],
    };
  }
  let next: OsPlayState = {
    ...state,
    activeAction: "computer",
    computerApp: app,
  };
  if (app) {
    next = osTempsAdvance(next, OS_ACTION_TIME_COST[app] ?? 5);
    next = {
      ...next,
      log: [...next.log, `Ordinateur → app « ${app} »`],
    };
  }
  return next;
}

export function osOrdinateurMarkEmailRead(
  state: OsPlayState,
  emailId: string
): OsPlayState {
  return {
    ...state,
    computer: {
      ...state.computer,
      emails: state.computer.emails.map((e) =>
        e.id === emailId ? { ...e, read: true } : e
      ),
    },
  };
}

export function osOrdinateurSyncAfterErp(state: OsPlayState): OsPlayState {
  return {
    ...state,
    computer: syncDashboardCards(state),
  };
}
