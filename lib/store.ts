"use client";

import { useSyncExternalStore } from "react";
import {
  advanceTime,
  applyDecision as engineApplyDecision,
  canSpendTime,
  markEmailRead as engineMarkEmailRead,
  resolveRumor as engineResolveRumor,
  unlockBadge,
} from "./engine";
import { createInitialGameState } from "./mock";
import type {
  Action,
  Decision,
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
};

let snapshot: StoreSnapshot = {
  gameState: createInitialGameState(),
  activeAction: null,
  playTab: "workspace",
  selectedDecisionId: null,
  selectedPersonnageId: "pers-marie",
  showVisibilityPanel: false,
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
    feedbackFlash: "Rôle sélectionné — bienvenue dans le quotidien.",
  }));
}

export function setActiveAction(action: Action | null) {
  if (action && !canSpendTime(snapshot.gameState, action.timeCostMinutes)) {
    patchGame((s) => ({
      ...s,
      feedbackFlash: "Pas assez de temps restant aujourd'hui.",
    }));
    return;
  }

  if (action) {
    let next = advanceTime(snapshot.gameState, action.timeCostMinutes);
    if (action.type === "VIEW_ATELIER_LIVE") {
      next = unlockBadge(next, "badge-atelier");
    }
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

export function applyDecision(decision: Decision) {
  patchGame((s) => engineApplyDecision(s, decision));
}

export function markEmailRead(emailId: string) {
  patchGame((s) => engineMarkEmailRead(s, emailId));
}

export function resolveRumor(rumorId: string, verified: boolean) {
  patchGame((s) => engineResolveRumor(s, rumorId, verified));
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
    setActiveAction,
    setPlayTab,
    setSelectedDecisionId,
    setSelectedPersonnageId,
    setShowVisibilityPanel,
    applyDecision,
    markEmailRead,
    resolveRumor,
    clearFeedback,
    resetState,
  };
}
