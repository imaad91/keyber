"use client";

import { useSyncExternalStore } from "react";
import { COMPUTER_APP_TIME } from "./computerData";
import type { Decision } from "./decisions";
import {
  advanceTime,
  applyDecision as engineApplyDecision,
  canSpendTime,
  markEmailRead as engineMarkEmailRead,
  resolveRumor as engineResolveRumor,
  unlockBadge,
} from "./engine";
import type { GameState } from "./gameState";
import { createInitialGameState } from "./mock";
import {
  advanceOnboarding,
  advanceScenarioDay,
  applyDialogueChoice as runtimeApplyDialogueChoice,
  completeOnboardingStep4,
  startScenarioWeek,
} from "./runtime";
import type {
  Action,
  ComputerAppId,
  DialogueChoice,
  GameMode,
  PlayTab,
} from "./types";
import { toGameView, type GameView } from "./viewModel";

type StoreSnapshot = {
  state: GameState;
  activeAction: Action | null;
  playTab: PlayTab;
  computerApp: ComputerAppId | null;
  selectedDecisionId: string | null;
  selectedPersonnageId: string | null;
  showVisibilityPanel: boolean;
  livreOpened: boolean;
};

let snapshot: StoreSnapshot = {
  state: createInitialGameState(),
  activeAction: null,
  playTab: "workspace",
  computerApp: null,
  selectedDecisionId: null,
  selectedPersonnageId: "pers-marie",
  showVisibilityPanel: false,
  livreOpened: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(partial: Partial<StoreSnapshot>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

function patchState(updater: (s: GameState) => GameState) {
  setSnapshot({ state: updater(snapshot.state) });
}

export function setMode(mode: GameMode) {
  patchState((s) => ({
    ...s,
    world: { ...s.world, mode },
  }));
}

export function setRole(roleId: string) {
  patchState((s) => ({
    ...s,
    meta: { ...s.meta, roleId },
    world: {
      ...s.world,
      mode: "story",
      introSeen: false,
      onboardingDone: false,
      onboardingStep: 1,
      unlockedActions: ["ACCESS_COMPUTER", "VIEW_ATELIER_LIVE"],
      feedbackFlash: "Rôle sélectionné — lit l'intro.",
    },
  }));
  patchState((s) => ({
    ...s,
    meta: { ...s.meta, jourActuel: 0 },
  }));
}

export function markIntroSeen() {
  patchState((s) => {
    const withIntro: GameState = {
      ...s,
      world: {
        ...s.world,
        introSeen: true,
        journal: [
          {
            id: `j-intro-${Date.now()}`,
            day: 0,
            titre: "Lundi 8h00 — Arrivée",
            narration:
              "Tu franchis la porte de Novacier. Henri te salue. La Semaine Qui Décide De Tout commence.",
            xp: 10,
            at: "08:00",
          },
          ...s.world.journal,
        ],
      },
    };
    return startScenarioWeek(withIntro);
  });
}

export function setActiveAction(action: Action | null) {
  if (action) {
    const gated =
      snapshot.state.world.mode === "story" &&
      !snapshot.state.world.onboardingDone;
    if (
      gated &&
      !snapshot.state.world.unlockedActions.includes(action.type)
    ) {
      patchState((s) => ({
        ...s,
        world: {
          ...s.world,
          feedbackFlash: "Pas encore débloqué — suis le mentor.",
        },
      }));
      return;
    }

    if (!canSpendTime(snapshot.state, action.timeCostMinutes)) {
      patchState((s) => ({
        ...s,
        world: {
          ...s.world,
          feedbackFlash: "Pas assez de temps restant aujourd'hui.",
        },
      }));
      return;
    }

    let next = advanceTime(snapshot.state, action.timeCostMinutes);
    if (action.type === "VIEW_ATELIER_LIVE") {
      next = unlockBadge(next, "badge-atelier");
    }
    next = advanceOnboarding(next, action.type);

    setSnapshot({
      state: next,
      activeAction: action,
      computerApp: null,
      playTab: "workspace",
    });
    return;
  }

  setSnapshot({ activeAction: null, computerApp: null });
}

export function openComputerApp(app: ComputerAppId) {
  const cost = COMPUTER_APP_TIME[app] ?? 10;
  if (!canSpendTime(snapshot.state, cost)) {
    patchState((s) => ({
      ...s,
      world: {
        ...s.world,
        feedbackFlash: "Pas assez de temps restant aujourd'hui.",
      },
    }));
    return;
  }
  const next = advanceTime(snapshot.state, cost);
  setSnapshot({
    state: {
      ...next,
      world: {
        ...next.world,
        feedbackFlash: `+${cost} min — session ${appLabel(app)}`,
      },
    },
    computerApp: app,
  });
}

export function closeComputerApp() {
  setSnapshot({ computerApp: null });
}

function appLabel(app: ComputerAppId) {
  const map: Record<ComputerAppId, string> = {
    erp: "ERP",
    mail: "Boîte Mail",
    dashboard: "Dashboard",
    documents: "Documents",
    chat: "Chat",
    browser: "Navigateur",
  };
  return map[app];
}

export function setPlayTab(tab: PlayTab) {
  setSnapshot({ playTab: tab });
}

export function setSelectedDecisionId(id: string | null) {
  setSnapshot({ selectedDecisionId: id });
}

export function setSelectedPersonnageId(id: string) {
  setSnapshot({ selectedPersonnageId: id });
}

export function setShowVisibilityPanel(open: boolean) {
  setSnapshot({ showVisibilityPanel: open });
}

export function markLivreOpened() {
  if (snapshot.livreOpened) return;
  setSnapshot({ livreOpened: true });
  patchState((s) =>
    unlockBadge(
      {
        ...s,
        world: {
          ...s.world,
          feedbackFlash: "Livre de l'Entreprise ouvert",
          journal: [
            {
              id: `j-livre-${Date.now()}`,
              day: Math.max(0, s.meta.jourActuel),
              titre: "Livre de Novacier",
              narration:
                "Tu as ouvert le Livre : 1987, quasi-faillite 2022, AutoVolt 45 % du CA. La mémoire du lieu.",
              xp: 20,
              at: "—",
            },
            ...s.world.journal,
          ],
        },
      },
      "badge-livre"
    )
  );
}

export function applyDecision(decision: Decision, choixId: string) {
  patchState((s) => {
    let next = engineApplyDecision(s, decision, choixId);
    if (!next.world.onboardingDone && next.world.onboardingStep === 4) {
      next = completeOnboardingStep4(next);
    }
    return next;
  });
}

export function advanceDay() {
  patchState((s) => advanceScenarioDay(s));
}

export function applyDialogueChoice(
  personnageId: string,
  choice: DialogueChoice
) {
  patchState((s) => runtimeApplyDialogueChoice(s, personnageId, choice));
}

export function markEmailRead(emailId: string) {
  patchState((s) => engineMarkEmailRead(s, emailId));
}

export function resolveRumor(rumorId: string, verified: boolean) {
  patchState((s) => engineResolveRumor(s, rumorId, verified));
}

export function finishOnboarding() {
  patchState((s) => startScenarioWeek(completeOnboardingStep4(s)));
}

export function clearFeedback() {
  patchState((s) => ({
    ...s,
    world: { ...s.world, feedbackFlash: null },
  }));
}

export function resetState() {
  setSnapshot({
    state: createInitialGameState(),
    activeAction: null,
    playTab: "workspace",
    computerApp: null,
    selectedDecisionId: null,
    selectedPersonnageId: "pers-marie",
    showVisibilityPanel: false,
    livreOpened: false,
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function useGameStore() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const gameState: GameView = toGameView(current.state);

  return {
    gameState,
    rawState: current.state,
    activeAction: current.activeAction,
    playTab: current.playTab,
    computerApp: current.computerApp,
    selectedDecisionId: current.selectedDecisionId,
    selectedPersonnageId: current.selectedPersonnageId,
    showVisibilityPanel: current.showVisibilityPanel,
    livreOpened: current.livreOpened,
    setMode,
    setRole,
    markIntroSeen,
    setActiveAction,
    openComputerApp,
    closeComputerApp,
    setPlayTab,
    setSelectedDecisionId,
    setSelectedPersonnageId,
    setShowVisibilityPanel,
    markLivreOpened,
    applyDecision,
    advanceDay,
    applyDialogueChoice,
    markEmailRead,
    resolveRumor,
    finishOnboarding,
    clearFeedback,
    resetState,
  };
}
