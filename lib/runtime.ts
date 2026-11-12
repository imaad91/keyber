/**
 * Session runtime helpers (day advance, onboarding, dialogue).
 * Scenario content is injected from data — no hardcoded decision numbers here.
 */

import type { DialogueChoice } from "./types";
import type { ActionType, GameState } from "./gameState";
import {
  addXP,
  checkObjectives,
  computeEnding,
  formatGameClock,
  unlockBadge,
} from "./engine";
import { syncMetaClock } from "./gameState";
import {
  CHARACTER_META,
  type CharacterVisualId,
} from "./characterStyle";
import { onboardingStepsMeta } from "./mock";
import { createScenarioDayState } from "./mock";
import { clamp, RELATION_ALIASES } from "./gameState";

export function advanceScenarioDay(state: GameState): GameState {
  if (state.world.showDebrief) return state;

  if (state.meta.jourActuel >= 5 && state.world.dayDecisionId) {
    const ending = computeEnding(state);
    const xp = state.meta.rules.endingXp[ending ?? "ECHEC"] ?? 50;
    return {
      ...state,
      world: {
        ...state.world,
        showDebrief: true,
        ending,
        feedbackFlash:
          ending === "VICTOIRE"
            ? "Victoire — contrat AutoVolt tenu"
            : ending === "PARTIELLE"
              ? "Victoire partielle"
              : "Échec — contrat en danger",
        badges: state.world.badges.map((b) =>
          b.id === "badge-victoire" && ending === "VICTOIRE"
            ? { ...b, unlocked: true }
            : b
        ),
        journal: [
          {
            id: `j-end-${Date.now()}`,
            day: 5,
            titre: "Débrief 16h00",
            narration: endingNarration(ending, state),
            xp,
            at: "16:00",
          },
          ...state.world.journal,
        ],
      },
      meta: {
        ...state.meta,
        minutesSinceStart: state.meta.dayLengthMinutes,
      },
    };
  }

  if (!state.world.dayDecisionId) {
    return {
      ...state,
      world: {
        ...state.world,
        feedbackFlash: "Prends d'abord la décision du jour.",
      },
    };
  }

  const nextDay = state.meta.jourActuel + 1;
  let next = createScenarioDayState(state, nextDay);
  next = {
    ...next,
    world: {
      ...next.world,
      feedbackFlash: `Passage au Jour ${nextDay}`,
    },
  };

  if (nextDay === 3) {
    next = {
      ...next,
      meta: { ...next.meta, minutesSinceStart: 2 * 60 },
      flags: { ...next.flags, alarmActive: 1 },
      world: {
        ...next.world,
        alarmActive: true,
        machines: next.world.machines.map((m) =>
          m.id === "m3"
            ? { ...m, etat: "PANNE", production: 0, nextMaintenance: "URGENTE" }
            : m
        ),
        journal: [
          {
            id: `j-panne-${Date.now()}`,
            day: 3,
            titre: "10h00 — PANNE MACHINE 3",
            narration:
              "Alarme. L'Atelier Live bascule au rouge. Il faut décider : réparer, contourner, ou prestataire.",
            xp: 10,
            at: "10:00",
          },
          ...next.world.journal,
        ],
      },
    };
    next = syncMetaClock(next);
  }

  if (
    state.meta.jourActuel === 3 &&
    state.historique.decisionsPrises.some((d) => d.choixId === "d3-repair")
  ) {
    next = {
      ...next,
      flags: { ...next.flags, machine3DownDays: 0 },
      world: {
        ...next.world,
        machines: next.world.machines.map((m) =>
          m.id === "m3"
            ? {
                ...m,
                etat: "PRODUCTION",
                production: 18,
                nextMaintenance: "J+5",
              }
            : m
        ),
      },
    };
  }

  return checkObjectives(next);
}

function endingNarration(
  ending: GameState["world"]["ending"],
  state: GameState
): string {
  const q = state.finance.qualite;
  const e = state.humain.ethique;
  if (ending === "VICTOIRE") {
    return `Victoire. ${q} pièces qualité, éthique ${e}. AutoVolt reste. Novacier tient.`;
  }
  if (ending === "PARTIELLE") {
    return `Victoire partielle. ${q} pièces qualité, éthique ${e}. Le contrat est fragile, mais vivant.`;
  }
  return `Échec. ${q} pièces qualité, éthique ${e}. AutoVolt s'éloigne — l'écho de 2022.`;
}

export function startScenarioWeek(state: GameState): GameState {
  const patch = createScenarioDayState(state, 1);
  return syncMetaClock({
    ...patch,
    meta: {
      ...patch.meta,
      jourActuel: 1,
      minutesSinceStart: 15,
    },
    world: {
      ...patch.world,
      onboardingDone: true,
      onboardingStep: 5,
      unlockedActions: [
        "ACCESS_COMPUTER",
        "INTERVIEW",
        "DECIDE",
        "VIEW_ATELIER_LIVE",
      ],
      scenarioActive: true,
      feedbackFlash: "Jour 1 — 08:15. Mail de Laurent. Brouillard total.",
      journal: [
        {
          id: `j-week-${Date.now()}`,
          day: 1,
          titre: "Jour 1 — Le brouillard",
          narration:
            "Lundi. Tous les KPIs affichent ???. Laurent demande où en est le retard. Karim murmure qu'un capteur est mort.",
          xp: 10,
          at: "08:15",
        },
        ...patch.world.journal,
      ],
    },
  });
}

export function applyDialogueChoice(
  state: GameState,
  personnageId: string,
  choice: DialogueChoice
): GameState {
  const current = state.relations[personnageId] ?? 50;
  const nextVal = clamp(current + choice.confianceDelta, 0, 100);
  const relations = {
    ...state.relations,
    [personnageId]: nextVal,
  };
  const short = Object.entries(RELATION_ALIASES).find(
    ([, v]) => v === personnageId
  )?.[0];
  if (short) relations[short] = nextVal;

  const unlockedInfos = choice.unlockInfo
    ? Array.from(new Set([...state.world.unlockedInfos, choice.unlockInfo]))
    : state.world.unlockedInfos;

  const shortName =
    CHARACTER_META[personnageId as CharacterVisualId]?.shortName ??
    "Confiance";
  const deltaLabel =
    choice.confianceDelta >= 0
      ? `+${choice.confianceDelta}`
      : `${choice.confianceDelta}`;

  let next: GameState = {
    ...state,
    relations,
    world: {
      ...state.world,
      unlockedInfos,
      feedbackFlash: `Confiance ${shortName} ${deltaLabel}`,
    },
  };

  if (choice.xp) next = addXP(next, choice.xp);

  if (
    choice.unlockInfo === "RUMEUR_CONFIRMED" ||
    choice.unlockInfo === "RUMEUR_PARTIELLE"
  ) {
    next = {
      ...next,
      world: {
        ...next.world,
        rumors: next.world.rumors.map((r) =>
          r.id === "rum-autovolt-pl" ? { ...r, verified: true } : r
        ),
        events: next.world.events.map((e) =>
          e.id === "ev-rumor-pl" ? { ...e, rumorResolved: true } : e
        ),
        feedbackFlash: "Rumeur AutoVolt / Pologne confirmée via interview",
      },
    };
  }

  next = {
    ...next,
    world: {
      ...next.world,
      journal: [
        {
          id: `j-dlg-${Date.now()}`,
          day: Math.max(0, next.meta.jourActuel),
          titre: "Choix de dialogue",
          narration: `Tu as répondu « ${choice.texte} ». ${choice.reponse}${
            choice.xp ? ` +${choice.xp} XP` : ""
          }`,
          xp: choice.xp ?? 0,
          at: formatGameClock(next.meta.minutesSinceStart),
        },
        ...next.world.journal,
      ],
    },
  };

  return checkObjectives(next);
}

export function advanceOnboarding(
  state: GameState,
  viaAction: ActionType
): GameState {
  if (state.world.onboardingDone) return state;

  const meta = onboardingStepsMeta.find(
    (s) => s.step === state.world.onboardingStep
  );
  if (!meta) return state;
  if (meta.actionHint !== viaAction && meta.unlock !== "ALL") {
    if (viaAction !== meta.actionHint) return state;
  }

  const step = state.world.onboardingStep;
  let unlockedActions = [...state.world.unlockedActions];
  let messages = [...state.world.messages];
  let onboardingStep = step;
  let onboardingDone = false;
  let jourActuel = state.meta.jourActuel;
  let feedbackFlash = state.world.feedbackFlash;
  let badges = state.world.badges;
  let journal = state.world.journal;

  if (step === 1 && viaAction === "VIEW_ATELIER_LIVE") {
    unlockedActions = uniqueActions([...unlockedActions, "INTERVIEW"]);
    onboardingStep = 2;
    messages = [
      {
        id: `msg-m-${Date.now()}`,
        from: "Henri Vallon",
        role: "Mentor",
        text: "Bien. Maintenant va voir Marie — interview.",
        time: formatGameClock(state.meta.minutesSinceStart),
        mentor: true,
      },
      ...messages,
    ];
    feedbackFlash = "Étape 1/4 — Atelier découvert";
    journal = [
      {
        id: `j-ob-1-${Date.now()}`,
        day: 0,
        titre: "Jour 0 — Atelier",
        narration:
          "Henri t'a fait ouvrir l'Atelier Live. Les machines respirent. La 3 clignote déjà rouge.",
        xp: 15,
        at: formatGameClock(state.meta.minutesSinceStart),
      },
      ...journal,
    ];
  } else if (step === 2 && viaAction === "INTERVIEW") {
    unlockedActions = uniqueActions([...unlockedActions, "ACCESS_COMPUTER"]);
    onboardingStep = 3;
    messages = [
      {
        id: `msg-m-${Date.now()}`,
        from: "Henri Vallon",
        role: "Mentor",
        text: "Marie t'a parlé. Ouvre maintenant l'ordinateur — ERP et mails sont dessus.",
        time: formatGameClock(state.meta.minutesSinceStart),
        mentor: true,
      },
      ...messages,
    ];
    feedbackFlash = "Étape 2/4 — Marie rencontrée";
    journal = [
      {
        id: `j-ob-2-${Date.now()}`,
        day: 0,
        titre: "Jour 0 — Marie",
        narration:
          "Tu as rencontré Marie Dubois. La confiance se gagne réponse après réponse.",
        xp: 15,
        at: formatGameClock(state.meta.minutesSinceStart),
      },
      ...journal,
    ];
  } else if (step === 3 && viaAction === "ACCESS_COMPUTER") {
    unlockedActions = uniqueActions([...unlockedActions, "DECIDE"]);
    onboardingStep = 4;
    messages = [
      {
        id: `msg-m-${Date.now()}`,
        from: "Henri Vallon",
        role: "Mentor",
        text: "Dernière étape : ton premier objectif. Stabilise la machine 3 quand tu seras prêt.",
        time: formatGameClock(state.meta.minutesSinceStart),
        mentor: true,
      },
      ...messages,
    ];
    feedbackFlash = "Étape 3/4 — Ordinateur découvert";
    journal = [
      {
        id: `j-ob-3-${Date.now()}`,
        day: 0,
        titre: "Jour 0 — Ordinateur",
        narration:
          "Tu as ouvert l'ordinateur Novacier. ERP, mails, chat : tout passe par là.",
        xp: 15,
        at: formatGameClock(state.meta.minutesSinceStart),
      },
      ...journal,
    ];
  } else if (step === 4 && viaAction === "DECIDE") {
    unlockedActions = uniqueActions([
      ...unlockedActions,
      "DECIDE",
      "ACCESS_COMPUTER",
      "INTERVIEW",
      "VIEW_ATELIER_LIVE",
    ]);
    onboardingStep = 5;
    onboardingDone = true;
    jourActuel = Math.max(1, jourActuel === 0 ? 1 : jourActuel);
    badges = badges.map((b) =>
      b.id === "badge-jour0" ? { ...b, unlocked: true } : b
    );
    feedbackFlash = "Jour 0 terminé — bienvenue dans le quotidien";
    journal = [
      {
        id: `j-ob-4-${Date.now()}`,
        day: 1,
        titre: "Fin du Jour 0",
        narration:
          "Le mentor s'efface un peu. Les outils sont à toi. Chapitre 1 continue.",
        xp: 40,
        at: formatGameClock(state.meta.minutesSinceStart),
      },
      ...journal,
    ];
  } else {
    return state;
  }

  let next: GameState = {
    ...state,
    meta: { ...state.meta, jourActuel },
    world: {
      ...state.world,
      unlockedActions,
      onboardingStep,
      onboardingDone,
      messages,
      badges,
      journal,
      feedbackFlash,
    },
  };

  if (onboardingDone || onboardingStep > step) next = addXP(next, 15);
  if (onboardingDone) next = addXP(next, 40);
  return checkObjectives(next);
}

export function completeOnboardingStep4(state: GameState): GameState {
  return advanceOnboarding(state, "DECIDE");
}

function uniqueActions(list: ActionType[]): ActionType[] {
  return Array.from(new Set(list));
}

export { unlockBadge };
