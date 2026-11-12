"use client";

import { Target } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ObjectiveType } from "@/lib/types";

const LABELS: Record<ObjectiveType, string> = {
  JOURNALIER: "Journalier",
  HEBDOMADAIRE: "Hebdomadaire",
  ANNUEL: "Annuel",
};

export function ObjectivePanel() {
  const { gameState } = useGameStore();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-accent" />
        <h2 className="font-display text-sm font-semibold text-foreground">
          Objectifs
        </h2>
      </div>

      <div className="space-y-2">
        {gameState.objectives.map((obj) => {
          const pct = Math.min(100, (obj.progression / obj.cible) * 100);
          return (
            <article
              key={obj.id}
              className={cn(
                "rounded-xl border border-white/10 bg-panel-2 p-3 transition",
                obj.status === "COMPLETE" && "border-ok/40 bg-ok/10"
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  {LABELS[obj.type as keyof typeof LABELS] ?? obj.type}
                </span>
                <span className="text-[10px] text-muted">+{obj.xp} XP</span>
              </div>
              <h3 className="text-sm font-semibold leading-snug text-foreground">
                {obj.titre}
              </h3>
              <p className="mt-1 text-[11px] leading-snug text-muted">
                {obj.description}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    obj.status === "COMPLETE" ? "bg-ok" : "bg-accent"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] tabular-nums text-muted">
                {obj.progression}/{obj.cible}
                {obj.status === "COMPLETE" ? " · Terminé" : ""}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
