"use client";

/**
 * Overlay fin de journée OS — chrome DayEndScreen (Étape 11).
 */

import { Button } from "@/components/ui/button";
import {
  osCycleVieCloseAndAdvance,
  type OsPlayState,
} from "@/lib/keyberOs";
import { getOsRuntimeConfig } from "@/lib/keyberOsRuntime";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

export function OsDayEndScreen({ play, setPlay }: Props) {
  if (!play.world?.showDayEnd) return null;

  const day = play.meta?.jourActuel ?? play.day;
  const maxDays = getOsRuntimeConfig().cycleVie?.maxDays ?? 5;
  const missed =
    !play.world.dayDecisionId || play.world.dayDecisionId === "non-prise";
  const nextDay = day >= maxDays ? null : day + 1;
  const eventsToday =
    play.historique?.evenementsDeclenches?.length ??
    play.eventsFired?.length ??
    0;
  const ethique = play.humain?.ethique ?? 70;
  const tresorerie = play.finance?.tresorerie ?? play.tresorerieBrute ?? 0;
  const pieces =
    play.finance?.piecesBrutesSemaine ?? play.finance?.piecesAujourdhui ?? 0;
  const debrief = play.world.lastSkillDebrief ?? [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-panel p-6 shadow-glow">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          18:00
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold">
          Fin de journée — Jour {day}
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>
            Décision du jour :{" "}
            <strong className="text-foreground">
              {missed ? "Non prise" : "Prise"}
            </strong>
          </li>
          <li>
            Pièces / semaine :{" "}
            <strong className="text-foreground">{pieces}</strong>
          </li>
          <li>
            Éthique :{" "}
            <strong className="text-foreground">{ethique}</strong>
          </li>
          <li>
            Trésorerie :{" "}
            <strong className="text-foreground">
              {tresorerie.toLocaleString("fr-FR")} €
            </strong>
          </li>
          <li>
            Évènements déclenchés :{" "}
            <strong className="text-foreground">{eventsToday}</strong>
          </li>
        </ul>
        {debrief.length > 0 ? (
          <div className="mt-4 space-y-1.5 rounded-xl border border-white/10 bg-panel-2 p-3 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              Débrief compétences
            </p>
            {debrief.map((line) => (
              <p key={line} className="leading-relaxed text-foreground">
                {line}
              </p>
            ))}
          </div>
        ) : null}
        <div className="mt-6">
          <Button
            size="lg"
            className="w-full"
            onClick={() => setPlay(osCycleVieCloseAndAdvance(play))}
          >
            {nextDay ? `Passer au Jour ${nextDay}` : "Voir le débrief"}
          </Button>
        </div>
      </div>
    </div>
  );
}
