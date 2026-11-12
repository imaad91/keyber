"use client";

import { Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dayTitles, TARGET_PIECES } from "@/lib/scenario";
import { exampleActions } from "@/lib/mock";
import { useGameStore } from "@/lib/store";

export function ScenarioDayBanner() {
  const { gameState, setActiveAction, advanceDay } = useGameStore();
  if (!gameState.scenarioActive || gameState.day < 1) return null;

  const title = dayTitles[gameState.day] ?? `Jour ${gameState.day}`;

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-panel-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {title}
            {gameState.alarmActive ? (
              <span className="ml-2 inline-flex items-center gap-1 text-danger">
                <Siren className="h-3 w-3 machine-fault" /> Alarme Machine 3
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-muted">
            Objectif semaine : {gameState.piecesQualiteSemaine}/{TARGET_PIECES}{" "}
            pièces qualité · Éthique {gameState.ethique} · AutoVolt{" "}
            {gameState.confianceAutoVolt}
          </p>
          {!gameState.sensorInstalled && gameState.day === 1 ? (
            <p className="mt-1 text-xs text-accent-warm">
              KPIs en ??? — interviewe Karim ou investis dans le capteur (5 k€).
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              const d = exampleActions.find((a) => a.type === "DECIDE");
              if (d) setActiveAction({ ...d, timeCostMinutes: 0 });
            }}
          >
            Décision du jour
          </Button>
          {gameState.dayDecisionId ? (
            <Button size="sm" variant="accent" onClick={() => advanceDay()}>
              {gameState.day >= 5 ? "Débrief 16h" : "Jour suivant"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
