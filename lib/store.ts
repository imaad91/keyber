"use client";

import { useSyncExternalStore } from "react";
import { applyDecision as engineApplyDecision } from "./engine";
import { initialGameState } from "./mock-data";
import type { Action, Decision, GameState } from "./types";

type StoreSnapshot = {
  gameState: GameState;
  activeAction: Action | null;
};

let snapshot: StoreSnapshot = {
  gameState: initialGameState,
  activeAction: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(partial: Partial<StoreSnapshot>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

export function setActiveAction(action: Action | null) {
  setSnapshot({ activeAction: action });
}

export function applyDecision(decision: Decision) {
  setSnapshot({
    gameState: engineApplyDecision(snapshot.gameState, decision),
  });
}

export function resetState() {
  setSnapshot({ gameState: initialGameState });
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
    gameState: current.gameState,
    activeAction: current.activeAction,
    setActiveAction,
    applyDecision,
    resetState,
  };
}
