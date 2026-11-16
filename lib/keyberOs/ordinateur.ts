/**
 * Keyber OS — Ordinateur (shell + apps)
 */

import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import {
  OS_ACTION_TIME_COST,
  osTempsAdvance,
  osTempsCanSpend,
} from "@/lib/keyberOs/temps";
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
    feedback: action === state.activeAction ? state.feedback : null,
  };
  if (action && action !== state.activeAction) {
    // « decide » : coût appliqué à la validation du choix (pipeline).
    // « computer » : 0 — le temps part à l'ouverture d'une app.
    const cost =
      action === "decide" || action === "computer"
        ? 0
        : (OS_ACTION_TIME_COST[action] ?? 5);
    if (cost > 0) {
      if (!osTempsCanSpend(next, cost)) {
        return {
          ...state,
          feedback: "Pas assez de temps restant aujourd'hui.",
          log: [
            ...state.log,
            `Temps → action « ${action} » refusée (reste insuffisant)`,
          ],
        };
      }
      next = osTempsAdvance(next, cost);
    }
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
    const cost = OS_ACTION_TIME_COST[app] ?? 5;
    if (!osTempsCanSpend(next, cost)) {
      return {
        ...state,
        feedback: "Pas assez de temps restant aujourd'hui.",
        log: [
          ...state.log,
          `Temps → app « ${app} » refusée (reste insuffisant)`,
        ],
      };
    }
    next = osTempsAdvance(next, cost);
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
