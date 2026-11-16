"use client";

/**
 * Coach Jour 0 OS — chrome OnboardingCoach (Étape 12).
 */

import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  osFinishOnboarding,
  osOnboardingCurrentMeta,
  osOnboardingNeedsFlow,
  osOrdinateurSetAction,
  type OsPlayState,
  type OsPlayerAction,
} from "@/lib/keyberOs";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

export function OsOnboardingCoach({ play, setPlay }: Props) {
  if (!osOnboardingNeedsFlow(play) || play.world.onboardingDone) return null;
  if (!play.world.introSeen) return null;

  const meta = osOnboardingCurrentMeta(play);
  const step = Math.min(4, play.world.onboardingStep || 1);

  return (
    <div className="reward-pop mb-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            <Compass className="h-3.5 w-3.5" />
            Jour 0 · Étape {step}/4 · {meta.titre}
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold text-accent">Mentor :</span>{" "}
            {meta.mentorLine}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {step < 4 ? (
            <Button
              size="sm"
              onClick={() =>
                setPlay(
                  osOrdinateurSetAction(
                    play,
                    meta.actionHint as OsPlayerAction
                  )
                )
              }
            >
              Y aller
            </Button>
          ) : (
            <Button size="sm" onClick={() => setPlay(osFinishOnboarding(play))}>
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
              step > n || play.world.onboardingDone
                ? "bg-accent"
                : step === n
                  ? "bg-accent/50"
                  : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
