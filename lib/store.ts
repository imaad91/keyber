"use client";

import { useSyncExternalStore } from "react";
import { COMPUTER_APP_TIME } from "./computerData";
import type { Decision } from "./decisions";
import {
  advanceTime,
  applyCompetenceTraining as engineApplyTraining,
  applyDecision as engineApplyDecision,
  canSpendTime,
  clearTrainingPrompt as engineClearTrainingPrompt,
  markEmailRead as engineMarkEmailRead,
  resolveRumor as engineResolveRumor,
  unlockBadge,
} from "./engine";
import { checkEvenements } from "./evenements";
import type { GameState, ModeJeu } from "./gameState";
import { legacyModeFrom, toModeJeu } from "./gameState";
import { getContexteActif } from "@/data/registry";
import { createInitialGameState } from "./mock";
import { migrateGameState } from "./migrateGameState";
import {
  advanceOnboarding,
  advanceScenarioDay,
  applyDialogueChoice as runtimeApplyDialogueChoice,
  completeOnboardingStep4,
  startScenarioWeek,
} from "./runtime";
import {
  getActiveSlot,
  prepareNewGameState,
  saveSlotAndProgression,
  setActiveSlot as persistActiveSlot,
  type SavesBundle,
} from "./saveStore";
import type { SlotNumber } from "./sauvegarde";
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
  lastSavedAt: string | null;
  activeSlot: SlotNumber | null;
};

let snapshot: StoreSnapshot = {
  state: migrateGameState(createInitialGameState()),
  activeAction: null,
  playTab: "workspace",
  computerApp: null,
  selectedDecisionId: null,
  selectedPersonnageId: "pers-marie",
  showVisibilityPanel: false,
  livreOpened: false,
  lastSavedAt: null,
  activeSlot: null,
};

function autoSave(state: GameState) {
  const slot = snapshot.activeSlot ?? getActiveSlot();
  if (!slot) return;
  const { sauvegarde } = saveSlotAndProgression(slot, state);
  setSnapshot({
    lastSavedAt: sauvegarde.dateDerniereSauvegarde,
    activeSlot: slot,
  });
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(partial: Partial<StoreSnapshot>) {
  const next = { ...snapshot, ...partial };
  if (partial.state) {
    next.state = migrateGameState(partial.state);
  }
  snapshot = next;
  emit();
}

function patchState(updater: (s: GameState) => GameState) {
  setSnapshot({ state: updater(snapshot.state) });
}

export function setMode(mode: GameMode | ModeJeu) {
  const modeJeu = toModeJeu(mode);
  patchState((s) => ({
    ...s,
    modeActuel: modeJeu,
    world: { ...s.world, mode: legacyModeFrom(modeJeu) ?? mode },
  }));
}

export function setRole(roleId: string) {
  if (!snapshot.activeSlot && !getActiveSlot()) {
    ensureActiveSlot(1);
  }
  patchState((s) => ({
    ...s,
    modeActuel: "histoire",
    scenarioHistoireId: s.scenarioHistoireId ?? s.meta.scenarioId,
    meta: { ...s.meta, roleId },
    world: {
      ...s.world,
      mode: "story",
      introSeen: false,
      onboardingDone: false,
      onboardingStep: 1,
      unlockedActions: ["ACCESS_COMPUTER", "VIEW_ATELIER_LIVE"],
      feedbackFlash: "Rôle sélectionné — lit l'intro.",
      trainingPrompt: null,
    },
  }));
  patchState((s) => ({
    ...s,
    meta: { ...s.meta, jourActuel: 0 },
  }));
  autoSave(snapshot.state);
}

export function startCompetenceTraining(competenceId: string) {
  patchState((s) => ({
    ...s,
    modeActuel: "competence",
    scenarioCompetenceId: competenceId,
    world: {
      ...s.world,
      mode: "skills",
      feedbackFlash: null,
      trainingPrompt: null,
    },
  }));
}

export function applyCompetenceTraining(decision: Decision, choixId: string) {
  patchState((s) => engineApplyTraining(s, decision, choixId));
  autoSave(snapshot.state);
}

export function clearTrainingPrompt() {
  patchState((s) => engineClearTrainingPrompt(s));
}

export function dismissEventNotification(id?: string) {
  patchState((s) => ({
    ...s,
    world: {
      ...s.world,
      eventNotifications: id
        ? (s.world.eventNotifications ?? []).filter((n) => n.id !== id)
        : (s.world.eventNotifications ?? []).slice(1),
    },
  }));
}

export function clearUrgentBanner() {
  patchState((s) => ({
    ...s,
    world: { ...s.world, urgentBanner: null },
  }));
}

export function closeDayEndAndAdvance() {
  patchState((s) => {
    const cleared = {
      ...s,
      world: { ...s.world, showDayEnd: false },
    };
    return advanceScenarioDay(cleared);
  });
  autoSave(snapshot.state);
}

export function runEventCheck() {
  patchState((s) => checkEvenements(s));
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
            titre: getContexteActif().runtime.arrivalJournal.titre,
            narration: getContexteActif().runtime.arrivalJournal.narration,
            xp: 10,
            at: "08:00",
          },
          ...s.world.journal,
        ],
      },
    };
    return startScenarioWeek(withIntro);
  });
  autoSave(snapshot.state);
}

export function loadGameFromSave(state: GameState, slot: SlotNumber) {
  persistActiveSlot(slot);
  setSnapshot({
    state: migrateGameState(state),
    activeSlot: slot,
    activeAction: null,
    playTab: "workspace",
    computerApp: null,
    selectedDecisionId: null,
    selectedPersonnageId: "pers-marie",
    showVisibilityPanel: false,
    livreOpened: false,
    lastSavedAt: new Date().toISOString(),
  });
}

export function startNewGameInSlot(slot: SlotNumber) {
  persistActiveSlot(slot);
  const fresh = prepareNewGameState(createInitialGameState());
  setSnapshot({
    state: fresh,
    activeSlot: slot,
    activeAction: null,
    playTab: "workspace",
    computerApp: null,
    selectedDecisionId: null,
    selectedPersonnageId: "pers-marie",
    showVisibilityPanel: false,
    livreOpened: false,
    lastSavedAt: null,
  });
  const { sauvegarde } = saveSlotAndProgression(slot, fresh);
  setSnapshot({ lastSavedAt: sauvegarde.dateDerniereSauvegarde });
}

export function ensureActiveSlot(slot?: SlotNumber) {
  const s = slot ?? getActiveSlot() ?? 1;
  persistActiveSlot(s);
  setSnapshot({ activeSlot: s });
  return s;
}

export function setActiveAction(action: Action | null) {
  if (action) {
    if (snapshot.state.world.showDayEnd) {
      patchState((s) => ({
        ...s,
        world: {
          ...s.world,
          feedbackFlash: "Fin de journée — passe au jour suivant.",
        },
      }));
      return;
    }

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
    autoSave(snapshot.state);
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
  let next = advanceTime(snapshot.state, cost);
  if (app === "dashboard" && (next.flags.dashboardAlert ?? 0) >= 1) {
    next = {
      ...next,
      flags: { ...next.flags, dashboardAlert: 0 },
    };
  }
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
  autoSave(snapshot.state);
}

/** Open an app without spending time (notification “Voir”). */
export function focusComputerApp(app: ComputerAppId) {
  setSnapshot({
    activeAction: {
      id: "act-computer",
      type: "ACCESS_COMPUTER",
      titre: "Accès Ordinateur",
      icone: "Monitor",
      description: "",
      timeCostMinutes: 0,
    },
    computerApp: app,
    playTab: "workspace",
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
              titre: getContexteActif().runtime.livreOpened.titre,
              narration: getContexteActif().runtime.livreOpened.narration,
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
    let next = engineApplyDecision(
      {
        ...s,
        modeActuel: s.modeActuel ?? "histoire",
        world: { ...s.world, mode: s.world.mode ?? "story" },
      },
      decision,
      choixId
    );
    if (!next.world.onboardingDone && next.world.onboardingStep === 4) {
      next = completeOnboardingStep4(next);
    }
    return next;
  });
  autoSave(snapshot.state);
}

export function advanceDay() {
  patchState((s) => advanceScenarioDay(s));
  autoSave(snapshot.state);
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
  const slot = snapshot.activeSlot ?? getActiveSlot();
  setSnapshot({
    state: prepareNewGameState(createInitialGameState()),
    activeAction: null,
    playTab: "workspace",
    computerApp: null,
    selectedDecisionId: null,
    selectedPersonnageId: "pers-marie",
    showVisibilityPanel: false,
    livreOpened: false,
    lastSavedAt: null,
    activeSlot: slot,
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
    lastSavedAt: current.lastSavedAt,
    activeSlot: current.activeSlot,
    setMode,
    setRole,
    startCompetenceTraining,
    applyCompetenceTraining,
    clearTrainingPrompt,
    dismissEventNotification,
    clearUrgentBanner,
    closeDayEndAndAdvance,
    runEventCheck,
    markIntroSeen,
    setActiveAction,
    openComputerApp,
    focusComputerApp,
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
    loadGameFromSave,
    startNewGameInSlot,
    ensureActiveSlot,
  };
}

export type { SavesBundle };
