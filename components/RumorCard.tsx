"use client";

import { HelpCircle } from "lucide-react";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
export function RumorCard({
  event,
}: {
  event: {
    id: string;
    titre: string;
    description: string;
    timestamp: string;
    isRumor?: boolean;
  };
}) {
  const { gameState, resolveRumor } = useGameStore();
  const rumor = gameState.rumors.find((r) => r.eventId === event.id);

  return (
    <article className="flex gap-2.5 rounded-xl border border-dashed border-accent-warm/50 bg-accent-warm/10 p-3">
      <CharacterAvatar name="Marie" size={28} className="mt-0.5" />
      <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent-warm">
          <HelpCircle className="h-3 w-3" />
          Rumeur
        </span>
        <span className="text-[10px] tabular-nums text-muted">
          {event.timestamp}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-foreground">{event.titre}</h3>
      <p className="mt-1 text-[11px] leading-snug text-muted">
        {event.description}
      </p>
      {rumor?.verified === null ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => resolveRumor(rumor.id, true)}
          >
            Confirmer
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => resolveRumor(rumor.id, false)}
          >
            Infirmer
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-[11px] font-semibold text-accent">
          {rumor?.verified ? "Confirmée" : "Infirmée"} — via interview / analyse
        </p>
      )}
      </div>
    </article>
  );
}
