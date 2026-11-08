"use client";

import { Building2, HelpCircle } from "lucide-react";
import { RumorCard } from "@/components/RumorCard";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function EventFeed() {
  const { gameState } = useGameStore();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-accent-warm" />
        <h2 className="font-display text-sm font-semibold text-foreground">
          Fil de l&apos;entreprise
        </h2>
      </div>

      <div className="space-y-2">
        {gameState.events.map((event) =>
          event.isRumor ? (
            <RumorCard key={event.id} event={event} />
          ) : (
            <article
              key={event.id}
              className="rounded-xl border border-white/10 bg-panel-2 p-3"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  {event.kind}
                </span>
                <span className="text-[10px] tabular-nums text-muted">
                  {event.timestamp}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {event.titre}
              </h3>
              <p className="mt-1 text-[11px] leading-snug text-muted">
                {event.description}
              </p>
            </article>
          )
        )}
      </div>
    </section>
  );
}

export function EventKindIcon({ rumor }: { rumor?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full",
        rumor ? "bg-accent-warm/20 text-accent-warm" : "bg-white/10 text-muted"
      )}
    >
      <HelpCircle className="h-3.5 w-3.5" />
    </span>
  );
}
