/**
 * Keyber OS — Ordinateur (shell + apps)
 */

import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { osEvenementsTrigger } from "@/lib/keyberOs/moteurEvenements";
import { osObjectifsEvaluate } from "@/lib/keyberOs/objectifs";
import { osOnboardingAdvance } from "@/lib/keyberOs/onboarding";
import {
  OS_ACTION_TIME_COST,
  osTempsAdvance,
  osTempsCanSpend,
} from "@/lib/keyberOs/temps";
import { syncDashboardCards } from "@/lib/keyberOs/ordinateurPack";
import { osProductionLiveSync } from "@/lib/keyberOs/productionLive";
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
  if (action === "atelier-live" && !isOsModuleEnabled("production-live")) {
    return {
      ...state,
      feedback: "Module Vue Live Production désactivé dans Keyber OS Admin",
      log: [...state.log, "Production Live → module désactivé (Admin)"],
    };
  }

  if (
    action &&
    !state.world?.onboardingDone &&
    state.world?.unlockedActions &&
    !state.world.unlockedActions.includes(action)
  ) {
    return {
      ...state,
      feedback: "Pas encore débloqué — suis le mentor.",
      log: [...state.log, `Onboarding → action « ${action} » verrouillée`],
    };
  }

  let next: OsPlayState = {
    ...state,
    activeAction: action,
    computerApp: action === "computer" ? state.computerApp : null,
    selectedInterviewId:
      action === "interview"
        ? state.selectedInterviewId ?? state.interviews[0]?.id ?? null
        : null,
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
      next = osEvenementsTrigger(next);
    }
    next = osOnboardingAdvance(next, action);
  }
  if (action === "atelier-live") {
    next = osProductionLiveSync(next);
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
    next = osEvenementsTrigger(next);
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
  const next: OsPlayState = {
    ...state,
    computer: {
      ...state.computer,
      emails: state.computer.emails.map((e) =>
        e.id === emailId ? { ...e, read: true } : e
      ),
    },
  };
  return osObjectifsEvaluate(next);
}

export function osOrdinateurSyncAfterErp(state: OsPlayState): OsPlayState {
  return {
    ...state,
    computer: syncDashboardCards(state),
  };
}
