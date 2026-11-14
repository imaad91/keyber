"use client";

import { Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";

export function UrgentEventBanner() {
  const { gameState, clearUrgentBanner, setActiveAction } = useGameStore();
  const banner = gameState.urgentBanner;
  if (!banner) return null;

  return (
    <div className="border-b border-danger/40 bg-danger/15 px-4 py-2.5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-danger">
          <Siren className="h-4 w-4 machine-fault" />
          ⚠️ {banner.message}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setActiveAction({
                id: "act-decide",
                type: "DECIDE",
                titre: "Décider",
                icone: "Scale",
                description: "",
                timeCostMinutes: 30,
              })
            }
          >
            Décider
          </Button>
          <Button size="sm" variant="ghost" onClick={() => clearUrgentBanner()}>
            Masquer
          </Button>
        </div>
      </div>
    </div>
  );
}
