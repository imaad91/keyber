"use client";

import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import type { Decision } from "@/lib/types";

type DecisionViewProps = {
  decision: Decision;
};

export function DecisionView({ decision }: DecisionViewProps) {
  const { applyDecision } = useGameStore();

  return (
    <section className="view-enter flex h-full flex-col gap-6">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          Décision
        </p>
        <h2 className="font-display text-2xl font-semibold text-navy">
          {decision.titre}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Décision d&apos;exemple — validation stub.
        </p>
      </header>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
          Impact
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
          {decision.impact}
        </p>

        <div className="mt-8 flex justify-end">
          <Button variant="accent" onClick={() => applyDecision(decision)}>
            Valider
          </Button>
        </div>
      </div>
    </section>
  );
}
