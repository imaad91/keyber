/**
 * Keyber OS — Temps & Horloge (Étape 10 : journée jouable).
 * minutesSinceStart = minutes écoulées depuis le début de journée (08:00),
 * comme le POC (0 → dayLengthMinutes ≈ 18:00).
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { osObjectifsOnDayEnd } from "@/lib/keyberOs/objectifs";
import type { OsPlayState } from "@/lib/keyberOs/types";

/** Heure d'ouverture atelier (affichage horloge). */
export const OS_WORK_DAY_START_HOUR = 8;

/**
 * Horloge joueur : 08:00 + minutes écoulées dans la journée.
 */
export function formatOsClock(minutesElapsedInDay: number): string {
  const elapsed = Math.max(0, Math.floor(minutesElapsedInDay));
  const total = OS_WORK_DAY_START_HOUR * 60 + elapsed;
  const h = Math.floor(total / 60) % 24;
  const min = total % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function osTempsDayLength(state: OsPlayState): number {
  const cfg = getOsRuntimeConfig().temps;
  return (
    state.meta?.dayLengthMinutes ||
    state.dayLengthMinutes ||
    cfg.dayLengthMinutes ||
    600
  );
}

export function osTempsElapsed(state: OsPlayState): number {
  return state.meta?.minutesSinceStart ?? state.minutesSinceStart ?? 0;
}

export function osTempsRemaining(state: OsPlayState): number {
  return Math.max(0, osTempsDayLength(state) - osTempsElapsed(state));
}

export function osTempsDayProgressPct(state: OsPlayState): number {
  const len = Math.max(1, osTempsDayLength(state));
  return Math.min(100, Math.max(0, (osTempsElapsed(state) / len) * 100));
}

export function osTempsCanSpend(state: OsPlayState, minutes: number): boolean {
  if (!isOsModuleEnabled("temps")) return true;
  if (minutes <= 0) return true;
  return osTempsRemaining(state) >= minutes;
}

function syncTempsMirrors(
  state: OsPlayState,
  elapsed: number,
  day: number,
  week: number,
  dayLen: number
): OsPlayState {
  const tempsRestantMinutes = Math.max(0, dayLen - elapsed);
  const heureActuelle = formatOsClock(elapsed);
  return {
    ...state,
    minutesSinceStart: elapsed,
    day,
    week,
    dayLengthMinutes: dayLen,
    meta: {
      ...(state.meta ?? {
        scenarioId: state.sessionId,
        roleId: null,
        jourActuel: day,
        heureActuelle,
        tempsRestantMinutes,
        week,
        minutesSinceStart: elapsed,
        dayLengthMinutes: dayLen,
      }),
      jourActuel: day,
      week,
      minutesSinceStart: elapsed,
      dayLengthMinutes: dayLen,
      heureActuelle,
      tempsRestantMinutes,
    },
  };
}

/**
 * Avance l'horloge. Cap à fin de journée (pas de wrap) — DayEnd = Étape 11.
 */
export function osTempsAdvance(
  state: OsPlayState,
  minutes: number
): OsPlayState {
  if (!isOsModuleEnabled("temps")) {
    return {
      ...state,
      log: [...state.log, "Temps & Horloge → module désactivé (Admin)"],
    };
  }
  const add = Math.max(0, Math.floor(minutes));
  if (add === 0) return state;

  const dayLen = osTempsDayLength(state);
  const prev = osTempsElapsed(state);
  const nextElapsed = Math.min(dayLen, prev + add);
  const day = state.meta?.jourActuel ?? state.day;
  const week = state.meta?.week ?? state.week;

  let next = syncTempsMirrors(state, nextElapsed, day, week, dayLen);
  const hitEnd = prev < dayLen && nextElapsed >= dayLen;

  if (hitEnd) {
    const autoDayEnd =
      getOsRuntimeConfig().cycleVie?.autoEndOnTimeFull !== false &&
      (getOsRuntimeConfig().cycleVie?.enabled !== false);
    if (autoDayEnd) {
      const missed = !next.world?.dayDecisionId;
      const moral = missed
        ? Math.max(0, (next.humain?.moralEquipe ?? 70) - 5)
        : next.humain?.moralEquipe;
      const confiance = missed
        ? Math.max(0, (next.humain?.confianceClient ?? 70) - 5)
        : next.humain?.confianceClient;
      next = {
        ...next,
        humain: next.humain
          ? {
              ...next.humain,
              ...(missed
                ? { moralEquipe: moral!, confianceClient: confiance! }
                : {}),
            }
          : next.humain,
        world: {
          ...next.world,
          showDayEnd: true,
          phase: "DAY_END",
          dayDecisionId: next.world?.dayDecisionId ?? "non-prise",
        },
        feedback: "Fin de journée — 18:00.",
        log: [
          ...next.log,
          `Temps & Horloge → +${add} min (J${day} ${formatOsClock(nextElapsed)}) · DayEnd`,
          ...(missed
            ? ["Cycle de vie → décision non prise (−moral / confiance)"]
            : []),
        ],
      };
      next = osObjectifsOnDayEnd(next);
    } else {
      next = {
        ...next,
        log: [
          ...next.log,
          `Temps & Horloge → +${add} min (J${day} ${formatOsClock(nextElapsed)}) · cap (DayEnd auto OFF)`,
        ],
      };
    }
  } else {
    next = {
      ...next,
      log: [
        ...next.log,
        `Temps & Horloge → +${add} min (J${day} ${formatOsClock(nextElapsed)}, reste ${osTempsRemaining(next)} min)`,
      ],
    };
  }

  return next;
}

/** Coûts minutes par action / app (alignés shell + POC). */
export const OS_ACTION_TIME_COST: Record<string, number> = {
  computer: 0,
  erp: 15,
  mail: 5,
  dashboard: 10,
  documents: 8,
  chat: 5,
  browser: 10,
  decide: 20,
  interview: 15,
  "atelier-live": 10,
};
