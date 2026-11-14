"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getContexteActif } from "@/data/registry";
import { roles } from "@/lib/mock";
import { useGameStore } from "@/lib/store";

export function IntroNarrative() {
  const router = useRouter();
  const { gameState, markIntroSeen } = useGameStore();
  const role = roles.find((r) => r.id === gameState.roleId) ?? roles[0];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden atmosphere-landing px-6 py-16 text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, rgba(47,214,126,0.2), transparent 35%)",
        }}
      />
      <div className="relative z-10 w-full max-w-2xl">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {"Chapitre 1 — L'arrivée · " + getContexteActif().nom}
        </p>
        <div className="space-y-5">
          {(getContexteActif().runtime.roleIntroLines.length
            ? getContexteActif().runtime.roleIntroLines
            : role.introLines
          ).map((line, i) => (
            <p
              key={line}
              className="intro-line font-display text-2xl font-semibold leading-snug md:text-3xl"
              style={{ animationDelay: `${i * 280}ms` }}
            >
              {line}
            </p>
          ))}
        </div>
        <div
          className="intro-line mt-12"
          style={{ animationDelay: `${role.introLines.length * 280 + 200}ms` }}
        >
          <Button
            size="lg"
            className="cta-pulse"
            onClick={() => {
              markIntroSeen();
              router.push("/play");
            }}
          >
            Commencer mon premier jour
          </Button>
        </div>
      </div>
    </div>
  );
}
