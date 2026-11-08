"use client";

import { useSyncExternalStore } from "react";
import {
  advanceOnboarding,
  advanceTime,
  applyDecision as engineApplyDecision,
  applyDialogueChoice as engineApplyDialogueChoice,
  canSpendTime,
  completeOnboardingStep4,
  markEmailRead as engineMarkEmailRead,
  resolveRumor as engineResolveRumor,
  unlockBadge,
} from "./engine";
import { createInitialGameState } from "./mock";
import type {
  Action,
  Decision,
  DialogueChoice,
  GameMode,
  GameState,
  PlayTab,
} from "./types";

type StoreSnapshot = {
  gameState: GameState;
  activeAction: Action | null;
  playTab: PlayTab;
  selectedDecisionId: string | null;
  selectedPersonnageId: string | null;
  showVisibilityPanel: boolean;
  livreOpened: boolean;
};

let snapshot: StoreSnapshot = {
  gameState: createInitialGameState(),
  activeAction: null,
  playTab: "workspace",
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

function patchGame(updater: (s: GameState) => GameState) {
  setSnapshot({ gameState: updater(snapshot.gameState) });
}

export function setMode(mode: GameMode) {
  patchGame((s) => ({ ...s, mode }));
}

export function setRole(roleId: string) {
  patchGame((s) => ({
    ...s,
    roleId,
    mode: "story",
    introSeen: false,
    day: 0,
    onboardingDone: false,
    onboardingStep: 1,
    unlockedActions: ["CHAT", "VIEW_ATELIER_LIVE"],
    feedbackFlash: "Rôle sélectionné — lit l'intro.",
  }));
}

export function markIntroSeen() {
  patchGame((s) => ({
    ...s,
    introSeen: true,
    feedbackFlash: "Premier jour — suis Henri.",
    journal: [
      {
        id: `j-intro-${Date.now()}`,
        day: 0,
        titre: "Lundi 8h00 — Arrivée",
        narration:
          "Tu as franchi la porte de Novacier. Henri Vallon t'attend. Le Chapitre 1 commence.",
        xp: 10,
        at: "08:00",
      },
      ...s.journal,
    ],
  }));
}

export function setActiveAction(action: Action | null) {
  if (action) {
    const gated =
      snapshot.gameState.mode === "story" &&
      !snapshot.gameState.onboardingDone;
    if (gated && !snapshot.gameState.unlockedActions.includes(action.type)) {
      patchGame((s) => ({
        ...s,
        feedbackFlash: "Pas encore débloqué — suis le mentor.",
      }));
      return;
    }

    if (!canSpendTime(snapshot.gameState, action.timeCostMinutes)) {
      patchGame((s) => ({
        ...s,
        feedbackFlash: "Pas assez de temps restant aujourd'hui.",
      }));
      return;
    }

    let next = advanceTime(snapshot.gameState, action.timeCostMinutes);
    if (action.type === "VIEW_ATELIER_LIVE") {
      next = unlockBadge(next, "badge-atelier");
    }
    next = advanceOnboarding(next, action.type);

    setSnapshot({
      gameState: next,
      activeAction: action,
      playTab:
        action.type === "EMAILS"
          ? "emails"
          : action.type === "CHAT"
            ? "chat"
            : "workspace",
    });
    return;
  }

  setSnapshot({ activeAction: null });
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
  patchGame((s) =>
    unlockBadge(
      {
        ...s,
        feedbackFlash: "Livre de l'Entreprise ouvert",
        journal: [
          {
            id: `j-livre-${Date.now()}`,
            day: Math.max(0, s.day),
            titre: "Livre de Novacier",
            narration:
              "Tu as ouvert le Livre de l'Entreprise. Histoire, organigramme, valeurs — la mémoire du lieu.",
            xp: 20,
            at: "—",
          },
          ...s.journal,
        ],
      },
      "badge-livre"
    )
  );
}

export function applyDecision(decision: Decision) {
  patchGame((s) => {
    let next = engineApplyDecision(s, decision);
    if (!next.onboardingDone && next.onboardingStep === 4) {
      next = completeOnboardingStep4(next);
    }
    return next;
  });
}

export function applyDialogueChoice(
  personnageId: string,
  choice: DialogueChoice
) {
  patchGame((s) => engineApplyDialogueChoice(s, personnageId, choice));
}

export function markEmailRead(emailId: string) {
  patchGame((s) => engineMarkEmailRead(s, emailId));
}

export function resolveRumor(rumorId: string, verified: boolean) {
  patchGame((s) => engineResolveRumor(s, rumorId, verified));
}

export function finishOnboarding() {
  patchGame((s) => completeOnboardingStep4(s));
}

export function clearFeedback() {
  patchGame((s) => ({ ...s, feedbackFlash: null }));
}

export function resetState() {
  setSnapshot({
    gameState: createInitialGameState(),
    activeAction: null,
    playTab: "workspace",
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

  return {
    ...current,
    setMode,
    setRole,
    markIntroSeen,
    setActiveAction,
    setPlayTab,
    setSelectedDecisionId,
    setSelectedPersonnageId,
    setShowVisibilityPanel,
    markLivreOpened,
    applyDecision,
    applyDialogueChoice,
    markEmailRead,
    resolveRumor,
    finishOnboarding,
    clearFeedback,
    resetState,
  };
}
