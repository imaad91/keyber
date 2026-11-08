"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Personnage } from "@/lib/types";

type InterviewViewProps = {
  personnage: Personnage;
};

export function InterviewView({ personnage }: InterviewViewProps) {
  const [index, setIndex] = useState(0);
  const dialogue = personnage.dialogues[index] ?? "…";

  const next = () => {
    setIndex((i) => (i + 1) % personnage.dialogues.length);
  };

  return (
    <section className="view-enter flex h-full flex-col gap-6">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          Entretien
        </p>
        <h2 className="font-display text-2xl font-semibold text-navy">
          Interview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Personnage d&apos;exemple — dialogue placeholder.
        </p>
      </header>

      <div className="grid flex-1 gap-6 md:grid-cols-[240px_1fr]">
        <aside className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-2xl font-semibold text-white shadow-inner">
            {personnage.avatar}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-navy">
              {personnage.nom}
            </p>
            <p className="text-sm text-slate-500">{personnage.role}</p>
          </div>
        </aside>

        <div className="flex flex-col justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="relative rounded-2xl bg-slate-50 px-5 py-4 text-slate-700">
            <span
              className="absolute -left-2 top-6 hidden h-4 w-4 rotate-45 bg-slate-50 md:block"
              aria-hidden
            />
            <p className="text-[15px] leading-relaxed">{dialogue}</p>
          </div>

          <div className="flex justify-end">
            <Button variant="accent" onClick={next}>
              Question suivante
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
