/**
 * Keyber OS — Progression, Scores & Niveaux
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

export function osProgressionApply(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("progression")) {
    return {
      ...state,
      log: [
        ...state.log,
        "Progression, Scores & Niveaux → module désactivé (Admin)",
      ],
    };
  }

  const cfg = getOsRuntimeConfig().progression;
  const next: OsPlayState = {
    ...state,
    xp: state.xp + cfg.xpPerChoice,
    score: state.score + cfg.scorePerChoice,
    log: [...state.log],
  };

  const threshold = next.niveau * cfg.xpPerLevel;
  if (next.xp >= threshold) {
    next.niveau += 1;
    next.log.push(
      `Progression, Scores & Niveaux → niveau ${next.niveau} (XP ${next.xp}, seuil ${cfg.xpPerLevel}/niv)`
    );
  } else {
    next.log.push(
      `Progression, Scores & Niveaux → +${cfg.xpPerChoice} XP / +${cfg.scorePerChoice} score (total XP ${next.xp})`
    );
  }
  return next;
}
