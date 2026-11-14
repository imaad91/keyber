"use client";

import { formatRemainingLabel } from "@/lib/evenements";
import { useGameStore } from "@/lib/store";

export function GameClockBar() {
  const { gameState } = useGameStore();
  if (!gameState.scenarioActive || gameState.day < 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-panel/90 px-4 py-2 text-sm backdrop-blur">
      <p className="font-display font-semibold tabular-nums text-foreground">
        Jour {gameState.day} — {gameState.heureActuelle} — Il te reste{" "}
        {formatRemainingLabel(gameState.tempsRestantMinutes)}
      </p>
      {gameState.dayDecisionId ? (
        <span className="rounded-md bg-ok/15 px-2 py-0.5 text-[11px] font-semibold text-ok">
          Décision prise
        </span>
      ) : (
        <span className="rounded-md bg-accent-warm/15 px-2 py-0.5 text-[11px] font-semibold text-accent-warm">
          Décision en attente
        </span>
      )}
    </div>
  );
}
