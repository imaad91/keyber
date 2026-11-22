/**
 * Keyber OS — Intro & Onboarding (Étape 12).
 * Textes génériques / param — aucun nom d'entreprise hardcodé.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { osDonneesSaveProgress } from "@/lib/keyberOs/donneesSauvegarde";
import type { OsPlayerAction, OsPlayState } from "@/lib/keyberOs/types";

export type OsOnboardingStepMeta = {
  step: 1 | 2 | 3 | 4;
  titre: string;
  mentorLine: string;
  /** Action à accomplir pour avancer. */
  actionHint: OsPlayerAction & string;
  /** Action débloquée en atteignant cette étape (avant action). */
  unlock: OsPlayerAction | "ALL";
};

/** Parcours coach générique (même ordre que le POC). */
export const OS_ONBOARDING_STEPS: OsOnboardingStepMeta[] = [
  {
    step: 1,
    titre: "Visite Atelier Live",
    mentorLine:
      "Ouvre l'Atelier Live — vois les machines avant de décider.",
    actionHint: "atelier-live",
    unlock: "atelier-live",
  },
  {
    step: 2,
    titre: "Parler à l'équipe",
    mentorLine: "Interviewe un interlocuteur — écoute le terrain.",
    actionHint: "interview",
    unlock: "interview",
  },
  {
    step: 3,
    titre: "Accès Ordinateur",
    mentorLine: "Ouvre l'ordinateur — ERP, mails et chat sont dessus.",
    actionHint: "computer",
    unlock: "computer",
  },
  {
    step: 4,
    titre: "Lancer la semaine",
    mentorLine:
      "Objectif : comprendre la situation, puis Décider. Termine la visite quand tu es prêt.",
    actionHint: "decide",
    unlock: "ALL",
  },
];

export const OS_ALL_ACTIONS: OsPlayerAction[] = [
  "computer",
  "decide",
  "interview",
  "atelier-live",
];

export function osIsHistoireMode(param: ScenarioParamFile): boolean {
  const m = String(param.Mode || "").toLowerCase();
  return m.includes("histoire");
}

export function osIntroLines(param: ScenarioParamFile): string[] {
  const role = param.Rôle || param.Compétence || "ton rôle";
  const entreprise = param.Entreprise || param.Nom || "l'entreprise";
  const secteur = param.Secteur || "ton secteur";
  const custom = (param as ScenarioParamFile & { Intro?: string[] }).Intro;
  if (Array.isArray(custom) && custom.length > 0) {
    return custom.filter((l) => typeof l === "string" && l.trim());
  }
  const contexteBits = Object.entries(param.Contexte || {})
    .slice(0, 2)
    .map(([, v]) => String(v).trim())
    .filter(Boolean);
  return [
    `Tu arrives chez ${entreprise}.`,
    `On te confie le rôle de ${role} — secteur ${secteur}.`,
    ...(contexteBits[0]
      ? [`Contexte : ${contexteBits[0].slice(0, 160)}`]
      : []),
    "Un mentor t'accompagne pour la visite du Jour 0. Observe, écoute, puis décide.",
  ];
}

export function osOnboardingNeedsFlow(state: OsPlayState): boolean {
  if (!isOsModuleEnabled("cycle-vie")) return false;
  const cfg = getOsRuntimeConfig().cycleVie;
  if (!cfg.onboardingEnabled) return false;
  return osIsHistoireMode(state.param);
}

export function osOnboardingCurrentMeta(state: OsPlayState) {
  const step = state.world?.onboardingStep ?? 1;
  return (
    OS_ONBOARDING_STEPS.find((s) => s.step === step) ?? OS_ONBOARDING_STEPS[0]!
  );
}

export function osMarkIntroSeen(state: OsPlayState): OsPlayState {
  const next: OsPlayState = {
    ...state,
    world: {
      ...state.world,
      introSeen: true,
      phase: state.world.onboardingDone ? "JOUR" : "ONBOARDING",
    },
    log: [...state.log, "Cycle de vie → intro vue"],
  };
  return osDonneesSaveProgress(next);
}

function uniqueActions(list: OsPlayerAction[]): OsPlayerAction[] {
  return Array.from(new Set(list.filter(Boolean)));
}

/**
 * Avance le coach quand le joueur fait l'action attendue.
 */
export function osOnboardingAdvance(
  state: OsPlayState,
  viaAction: OsPlayerAction
): OsPlayState {
  if (!osOnboardingNeedsFlow(state)) return state;
  if (state.world.onboardingDone) return state;
  if (!viaAction) return state;

  const meta = osOnboardingCurrentMeta(state);
  if (meta.actionHint !== viaAction) return state;

  const step = meta.step;
  let unlocked = [...(state.world.unlockedActions ?? [])];
  let onboardingStep = step;
  let feedback = state.feedback;
  const journal = [...(state.world.journal ?? [])];

  if (step === 1 && viaAction === "atelier-live") {
    unlocked = uniqueActions([...unlocked, "interview"]);
    onboardingStep = 2;
    feedback = "Mentor : bien. Maintenant, parle à quelqu'un.";
    journal.unshift({
      id: `j-ob-1-${Date.now()}`,
      day: 0,
      titre: "Atelier visité",
      narration: "Tu as vu la ligne. Le mentor te pousse vers l'équipe.",
      xp: 10,
      at: state.meta?.heureActuelle ?? "08:00",
    });
  } else if (step === 2 && viaAction === "interview") {
    unlocked = uniqueActions([...unlocked, "computer"]);
    onboardingStep = 3;
    feedback = "Mentor : l'ordinateur t'attend.";
    journal.unshift({
      id: `j-ob-2-${Date.now()}`,
      day: 0,
      titre: "Interview faite",
      narration: "Tu as écouté le terrain. Passe à l'ordinateur.",
      xp: 10,
      at: state.meta?.heureActuelle ?? "08:00",
    });
  } else if (step === 3 && viaAction === "computer") {
    unlocked = uniqueActions([...unlocked, "decide"]);
    onboardingStep = 4;
    feedback = "Mentor : quand tu es prêt, termine la visite.";
    journal.unshift({
      id: `j-ob-3-${Date.now()}`,
      day: 0,
      titre: "Ordinateur ouvert",
      narration: "ERP, mails, chat : tu as les outils. Lance la semaine.",
      xp: 10,
      at: state.meta?.heureActuelle ?? "08:00",
    });
  } else if (step === 4) {
    // Reste sur 4 jusqu'à finishOnboarding
    unlocked = uniqueActions([...unlocked, ...OS_ALL_ACTIONS]);
  }

  return {
    ...state,
    feedback,
    world: {
      ...state.world,
      unlockedActions: unlocked,
      onboardingStep: onboardingStep as 0 | 1 | 2 | 3 | 4 | 5,
      journal,
      phase: "ONBOARDING",
    },
    log: [
      ...state.log,
      `Cycle de vie → onboarding étape ${onboardingStep}`,
    ],
  };
}

/** Termine le Jour 0 et ouvre la semaine jouable. */
export function osFinishOnboarding(state: OsPlayState): OsPlayState {
  if (!osOnboardingNeedsFlow(state) && state.world.onboardingDone) {
    return state;
  }
  const day = Math.max(1, state.meta?.jourActuel ?? state.day ?? 1);
  const next: OsPlayState = {
    ...state,
    day,
    feedback: "Semaine lancée. À toi de jouer.",
    world: {
      ...state.world,
      onboardingDone: true,
      onboardingStep: 5,
      introSeen: true,
      phase: "JOUR",
      unlockedActions: [...OS_ALL_ACTIONS],
      journal: [
        {
          id: `j-week-${Date.now()}`,
          day,
          titre: "Début de semaine",
          narration:
            "Visite terminée. Les actions sont débloquées. Objectif : stabiliser la journée.",
          xp: 15,
          at: state.meta?.heureActuelle ?? "08:15",
        },
        ...(state.world.journal ?? []),
      ],
    },
    meta: state.meta
      ? {
          ...state.meta,
          jourActuel: day,
        }
      : state.meta,
    log: [...state.log, "Cycle de vie → onboarding terminé"],
  };
  return osDonneesSaveProgress(next);
}

/** État world initial selon mode + runtime. */
export function osOnboardingBootWorld(param: ScenarioParamFile): {
  introSeen: boolean;
  onboardingDone: boolean;
  onboardingStep: 0 | 1 | 2 | 3 | 4 | 5;
  unlockedActions: OsPlayerAction[];
  phase: "INTRO" | "ONBOARDING" | "JOUR";
} {
  const histoire = osIsHistoireMode(param);
  const cfg = getOsRuntimeConfig().cycleVie;
  const custom = (param as ScenarioParamFile & { Intro?: string[] }).Intro;
  const hasIntroLines =
    Array.isArray(custom) &&
    custom.some((l) => typeof l === "string" && l.trim().length > 0);
  const cycleOk = cfg.enabled && cfg.onboardingEnabled !== false;

  // Mode Histoire → intro + coach Jour 0.
  if (histoire && cycleOk) {
    return {
      introSeen: false,
      onboardingDone: false,
      onboardingStep: 1,
      unlockedActions: ["atelier-live"],
      phase: "INTRO",
    };
  }

  // Compétence (ou autre) avec bloc Intro[] → page narration puis jeu libre.
  if (hasIntroLines && cycleOk) {
    return {
      introSeen: false,
      onboardingDone: true,
      onboardingStep: 5,
      unlockedActions: [...OS_ALL_ACTIONS],
      phase: "INTRO",
    };
  }

  return {
    introSeen: true,
    onboardingDone: true,
    onboardingStep: 5,
    unlockedActions: [...OS_ALL_ACTIONS],
    phase: "JOUR",
  };
}
