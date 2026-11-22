/**
 * Keyber OS — Interviews / PNJ (Étape 16)
 * Sélection PNJ + choix de dialogue → relation / XP / conséquences.
 */

import { osApplyConsequences } from "@/lib/keyberOs/consequences";
import { osObjectifsEvaluate } from "@/lib/keyberOs/objectifs";
import {
  osRelationApplyDelta,
  osRelationGet,
} from "@/lib/keyberOs/relations";
import type {
  OsDialogueChoice,
  OsPlayState,
} from "@/lib/keyberOs/types";
import { isOsModuleEnabled } from "@/lib/keyberOsRuntime";

export function osInterviewSelect(
  state: OsPlayState,
  interviewId: string | null
): OsPlayState {
  if (!isOsModuleEnabled("interviews")) {
    return {
      ...state,
      feedback: "Module Interviews désactivé dans Keyber OS Admin",
      log: [...state.log, "Interviews → module désactivé (Admin)"],
    };
  }
  return {
    ...state,
    activeAction: "interview",
    selectedInterviewId: interviewId,
    log: interviewId
      ? [...state.log, `Interviews → PNJ « ${interviewId} »`]
      : state.log,
  };
}

/**
 * Applique un choix de dialogue : confiance slot + XP optionnel + conséquences.
 */
export function osApplyDialogueChoice(
  state: OsPlayState,
  interviewId: string,
  choice: OsDialogueChoice
): OsPlayState {
  if (!isOsModuleEnabled("interviews")) {
    return {
      ...state,
      feedback: "Module Interviews désactivé dans Keyber OS Admin",
      log: [...state.log, "Interviews → module désactivé (Admin)"],
    };
  }

  const interview = state.interviews.find((i) => i.id === interviewId);
  if (!interview) {
    return {
      ...state,
      log: [
        ...state.log,
        `Interviews → PNJ inconnu « ${interviewId} »`,
      ],
    };
  }

  let next = osRelationApplyDelta(state, interviewId, choice.confianceDelta);
  const trust = osRelationGet(next, interviewId, interview.relationConfiance);
  const deltaLabel =
    choice.confianceDelta >= 0
      ? `+${choice.confianceDelta}`
      : `${choice.confianceDelta}`;

  if (choice.xp && choice.xp > 0) {
    const xp = next.xp + choice.xp;
    next = {
      ...next,
      xp,
      progression: next.progression
        ? { ...next.progression, xp }
        : next.progression,
    };
  }

  if (choice.consequences?.length) {
    next = osApplyConsequences(next, choice.consequences);
  }

  const day = next.meta?.jourActuel ?? next.day;
  const heure = next.meta?.heureActuelle ?? "08:00";

  next = {
    ...next,
    feedback: `Confiance ${interview.nom} ${deltaLabel} → ${trust}/100`,
    world: {
      ...next.world,
      journal: [
        {
          id: `j-dlg-${interviewId}-${Date.now()}`,
          day: Math.max(0, day),
          titre: `Dialogue — ${interview.nom}`,
          narration: `Tu as répondu « ${choice.texte} ». ${choice.reponse}${
            choice.unlockInfo ? ` [${choice.unlockInfo}]` : ""
          }`,
          xp: choice.xp ?? 0,
          at: heure,
        },
        ...next.world.journal,
      ],
    },
    log: [
      ...next.log,
      `Interviews → « ${interview.nom} » choix « ${choice.id} » (confiance ${deltaLabel} → ${trust})`,
    ],
  };

  return osObjectifsEvaluate(next);
}
