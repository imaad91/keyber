"use client";

/**
 * Horloge journée OS — chrome GameClockBar + barre de progression (Étape 10).
 */

import { formatRemainingLabel } from "@/lib/evenements";
import {
  formatOsClock,
  osTempsDayProgressPct,
  osTempsElapsed,
  osTempsRemaining,
  type OsPlayState,
} from "@/lib/keyberOs";

type Props = {
  play: OsPlayState;
};

export function OsGameClockBar({ play }: Props) {
  const day = play.meta?.jourActuel ?? play.day;
  if (day < 1) return null;

  const elapsed = osTempsElapsed(play);
  const remaining = osTempsRemaining(play);
  const heure = play.meta?.heureActuelle ?? formatOsClock(elapsed);
  const progressPct = osTempsDayProgressPct(play);
  const decisionTaken = Boolean(
    play.world?.dayDecisionId || (play.stepIndex > 0 && !play.finished)
  );

  return (
    <div className="border-b border-slate-200 bg-panel/90 px-4 py-2 text-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display font-semibold tabular-nums text-foreground">
          Jour {day} — {heure} — Il te reste {formatRemainingLabel(remaining)}
        </p>
        {decisionTaken ? (
          <span className="rounded-md bg-ok/15 px-2 py-0.5 text-[11px] font-semibold text-ok">
            Décision en cours
          </span>
        ) : (
          <span className="rounded-md bg-accent-warm/15 px-2 py-0.5 text-[11px] font-semibold text-accent-warm">
            Décision en attente
          </span>
        )}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
          title={`${Math.round(progressPct)} % de la journée`}
        />
      </div>
    </div>
  );
}
