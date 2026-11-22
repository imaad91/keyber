"use client";

/**
 * Intro Jour 0 OS — chrome IntroNarrative (Étape 12).
 * Lignes = param / génériques. Aucun useGameStore.
 */

import { Button } from "@/components/ui/button";
import { osIntroLines, osMarkIntroSeen, type OsPlayState } from "@/lib/keyberOs";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

export function OsIntroNarrative({ play, setPlay }: Props) {
  if (play.world?.introSeen) return null;

  const entreprise = play.param.Entreprise || play.param.Nom || "Entreprise";
  const lines = osIntroLines(play.param);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden atmosphere-landing px-6 py-12 text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, rgba(47,214,126,0.2), transparent 35%)",
        }}
      />
      <div className="relative z-10 w-full max-w-2xl">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Chapitre 1 — L&apos;arrivée · {entreprise}
        </p>
        <div className="space-y-5">
          {lines.map((line, i) => (
            <p
              key={`${i}-${line.slice(0, 24)}`}
              className="intro-line font-display text-2xl font-semibold leading-snug md:text-3xl"
              style={{ animationDelay: `${i * 280}ms` }}
            >
              {line}
            </p>
          ))}
        </div>
        <div
          className="intro-line mt-12"
          style={{ animationDelay: `${lines.length * 280 + 200}ms` }}
        >
          <Button
            size="lg"
            className="cta-pulse"
            onClick={() => setPlay(osMarkIntroSeen(play))}
          >
            Commencer mon premier jour
          </Button>
        </div>
      </div>
    </div>
  );
}
