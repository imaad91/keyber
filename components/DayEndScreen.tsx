"use client";

import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";

export function DayEndScreen() {
  const { gameState, closeDayEndAndAdvance } = useGameStore();
  if (!gameState.showDayEnd) return null;

  const missed = gameState.dayDecisionId === "non-prise";
  const nextDay = gameState.day >= 5 ? null : gameState.day + 1;
  const eventsToday = gameState.evenementsDeclenches?.length ?? 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-panel p-6 shadow-glow">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          18:00
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold">
          Fin de journée — Jour {gameState.day}
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>
            Décision du jour :{" "}
            <strong className="text-foreground">
              {missed ? "Non prise" : "Prise"}
            </strong>
          </li>
          <li>
            Qualité semaine :{" "}
            <strong className="text-foreground">
              {gameState.piecesQualiteSemaine}/500
            </strong>
          </li>
          <li>
            Éthique :{" "}
            <strong className="text-foreground">{gameState.ethique}</strong>
          </li>
          <li>
            Trésorerie :{" "}
            <strong className="text-foreground">
              {gameState.tresorerie.toLocaleString("fr-FR")} €
            </strong>
          </li>
          <li>
            Évènements déclenchés :{" "}
            <strong className="text-foreground">{eventsToday}</strong>
          </li>
        </ul>
        {(gameState.lastSkillDebrief?.length ?? 0) > 0 ? (
          <div className="mt-4 space-y-1.5 rounded-xl border border-white/10 bg-panel-2 p-3 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              Débrief compétences
            </p>
            {(gameState.lastSkillDebrief ?? []).map((line) => (
              <p key={line} className="leading-relaxed text-foreground">
                {line}
              </p>
            ))}
          </div>
        ) : null}
        <div className="mt-6">
          <Button size="lg" className="w-full" onClick={() => closeDayEndAndAdvance()}>
            {nextDay ? `Passer au Jour ${nextDay}` : "Voir le débrief"}
          </Button>
        </div>
      </div>
    </div>
  );
}
