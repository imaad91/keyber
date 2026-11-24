/**
 * Keyber OS — Cycle de vie (DayEnd / passage de jour) — Étape 11.
 * Aucun contenu d'entreprise hardcodé.
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { osDonneesSaveProgress } from "@/lib/keyberOs/donneesSauvegarde";
import { osOpenDebrief } from "@/lib/keyberOs/debrief";
import { osEvenementsTrigger } from "@/lib/keyberOs/moteurEvenements";
import { osCampusOnDayChange } from "@/lib/keyberOs/campus";
import { osObjectifsOnDayEnd } from "@/lib/keyberOs/objectifs";
import {
  formatOsClock,
  osTempsAdvance,
  osTempsDayLength,
  osTempsRemaining,
} from "@/lib/keyberOs/temps";
import type { OsPlayState } from "@/lib/keyberOs/types";

function resetDayClock(
  state: OsPlayState,
  day: number,
  week: number
): OsPlayState {
  const dayLen = osTempsDayLength(state);
  const heureActuelle = formatOsClock(0);
  return {
    ...state,
    minutesSinceStart: 0,
    day,
    week,
    dayLengthMinutes: dayLen,
    meta: {
      ...(state.meta ?? {
        scenarioId: state.sessionId,
        roleId: null,
        jourActuel: day,
        heureActuelle,
        tempsRestantMinutes: dayLen,
        week,
        minutesSinceStart: 0,
        dayLengthMinutes: dayLen,
      }),
      jourActuel: day,
      week,
      minutesSinceStart: 0,
      dayLengthMinutes: dayLen,
      heureActuelle,
      tempsRestantMinutes: dayLen,
    },
  };
}

/** Force la fin de journée (consomme le reste + overlay DayEnd). */
export function osCycleVieForceDayEnd(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("cycle-vie")) {
    return {
      ...state,
      feedback: "Module Cycle de vie désactivé dans Keyber OS Admin",
      log: [...state.log, "Cycle de vie → module désactivé (Admin)"],
    };
  }
  const remaining = osTempsRemaining(state);
  let next =
    remaining > 0 ? osTempsAdvance(state, remaining) : { ...state };
  next = osEvenementsTrigger(next);
  next = osObjectifsOnDayEnd(next);
  if (!next.world?.showDayEnd) {
    next = {
      ...next,
      world: {
        ...next.world,
        showDayEnd: true,
        phase: "DAY_END",
        dayDecisionId: next.world?.dayDecisionId ?? "non-prise",
      },
      feedback: "Fin de journée — 18:00.",
      activeAction: null,
      computerApp: null,
      log: [...next.log, "Cycle de vie → DayEnd forcé"],
    };
  } else {
    next = {
      ...next,
      activeAction: null,
      computerApp: null,
      log: [...next.log, "Cycle de vie → DayEnd forcé"],
    };
  }
  return osDonneesSaveProgress(next);
}

/**
 * Ferme le DayEnd et passe au jour suivant (ou débrief si semaine finie).
 */
export function osCycleVieCloseAndAdvance(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("cycle-vie")) {
    return {
      ...state,
      world: { ...state.world, showDayEnd: false },
      log: [...state.log, "Cycle de vie → module désactivé (Admin)"],
    };
  }
  const cfg = getOsRuntimeConfig().cycleVie;
  const day = state.meta?.jourActuel ?? state.day;
  const week = state.meta?.week ?? state.week;
  const maxDays = cfg.maxDays ?? 5;

  let next: OsPlayState = {
    ...state,
    world: {
      ...state.world,
      showDayEnd: false,
    },
    activeAction: null,
    computerApp: null,
  };

  if (day >= maxDays) {
    return osOpenDebrief(next);
  }

  const nextDay = day + 1;
  next = resetDayClock(next, nextDay, week);
  next = {
    ...next,
    world: {
      ...next.world,
      dayDecisionId: null,
      phase: "JOUR",
      showDebrief: false,
      alarmActive: false,
      journal: [
        {
          id: `j-day-${nextDay}-${Date.now()}`,
          day: nextDay,
          titre: `Début Jour ${nextDay}`,
          narration: "Nouvelle journée. Horloge remise à 08:00.",
          xp: 0,
          at: "08:00",
        },
        ...(next.world?.journal ?? []),
      ],
    },
    feedback: `Passage au Jour ${nextDay}`,
    log: [
      ...next.log,
      `Cycle de vie → Jour ${nextDay} (horloge ${formatOsClock(0)})`,
    ],
  };
  next = osCampusOnDayChange(next);
  return osDonneesSaveProgress(next);
}
