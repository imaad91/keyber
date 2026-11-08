"use client";

import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exampleActions, exampleDecisions, visibilityInvestments } from "@/lib/mock";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function VisibilityPanel() {
  const {
    gameState,
    showVisibilityPanel,
    setShowVisibilityPanel,
    applyDecision,
    setSelectedDecisionId,
    setActiveAction,
  } = useGameStore();

  if (!showVisibilityPanel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="reward-pop w-full max-w-lg rounded-2xl border border-white/15 bg-panel p-5 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              <Eye className="h-3.5 w-3.5" />
              Visibilité des données
            </p>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Investir pour y voir clair
            </h2>
            <p className="mt-1 text-sm text-muted">
              Niveau actuel : {gameState.visibilityLevel} / 3
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowVisibilityPanel(false)}
            className="rounded-md p-1 text-muted hover:bg-white/10"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {visibilityInvestments.map((inv) => {
            const owned = gameState.visibilityLevel >= inv.level;
            const decision = exampleDecisions.find(
              (d) => d.visibilityUpgrade === inv.level
            );
            return (
              <div
                key={inv.level}
                className={cn(
                  "rounded-xl border p-4",
                  owned
                    ? "border-ok/40 bg-ok/10"
                    : "border-white/10 bg-panel-2"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Niveau {inv.level}
                    </p>
                    <h3 className="font-display text-base font-semibold">
                      {inv.label}
                    </h3>
                    <p className="mt-1 text-xs text-muted">{inv.description}</p>
                    <p className="mt-2 text-sm font-semibold text-accent-warm">
                      {inv.cost.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                  {owned ? (
                    <span className="text-xs font-bold text-ok">Actif</span>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!decision || inv.level > gameState.visibilityLevel + 1}
                      onClick={() => {
                        if (!decision) return;
                        setShowVisibilityPanel(false);
                        setSelectedDecisionId(decision.id);
                        applyDecision(decision);
                      }}
                    >
                      Investir
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button
          variant="ghost"
          className="mt-4 w-full"
          onClick={() => {
            setShowVisibilityPanel(false);
            setSelectedDecisionId("dec-vis-1");
            const decide = exampleActions.find((a) => a.type === "DECIDE");
            if (decide) setActiveAction({ ...decide, timeCostMinutes: 0 });
          }}
        >
          Voir toutes les décisions de visibilité
        </Button>
      </div>
    </div>
  );
}
