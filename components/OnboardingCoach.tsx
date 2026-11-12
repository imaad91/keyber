"use client";

import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exampleActions, onboardingStepsMeta } from "@/lib/mock";
import { useGameStore } from "@/lib/store";

export function OnboardingCoach() {
  const { gameState, setActiveAction, finishOnboarding } = useGameStore();

  if (gameState.onboardingDone || gameState.mode !== "story") return null;

  const meta =
    onboardingStepsMeta.find((s) => s.step === gameState.onboardingStep) ??
    onboardingStepsMeta[0];

  return (
    <div className="reward-pop mb-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            <Compass className="h-3.5 w-3.5" />
            Jour 0 · Étape {Math.min(4, gameState.onboardingStep)}/4 ·{" "}
            {meta.titre}
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold text-accent">Henri :</span>{" "}
            {meta.mentorLine}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {gameState.onboardingStep < 4 ? (
            <Button
              size="sm"
              onClick={() => {
                const action = exampleActions.find(
                  (a) => a.type === meta.actionHint
                );
                if (action) setActiveAction(action);
              }}
            >
              Y aller
            </Button>
          ) : (
            <Button size="sm" onClick={() => finishOnboarding()}>
              Terminer la visite
            </Button>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1.5 flex-1 rounded-full ${
              gameState.onboardingStep > n || gameState.onboardingDone
                ? "bg-accent"
                : gameState.onboardingStep === n
                  ? "bg-accent/50"
                  : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
