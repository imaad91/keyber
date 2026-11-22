"use client";

/**
 * Bannière urgente OS — feeling UrgentEventBanner POC (Étape 15).
 */

import { Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  osClearUrgentBanner,
  osOrdinateurSetAction,
  type OsPlayState,
} from "@/lib/keyberOs";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

export function OsUrgentEventBanner({ play, setPlay }: Props) {
  const { config } = useKeyberOsRuntime();
  if (!config.notifications?.enabled) return null;
  if (config.notifications.showUrgentBanner === false) return null;

  const banner = play.world?.urgentBanner;
  if (!banner) return null;

  return (
    <div className="border-b border-danger/40 bg-danger/15 px-4 py-2.5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-danger">
          <Siren className="h-4 w-4 machine-fault" />
          {banner.message}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPlay(osOrdinateurSetAction(play, "decide"))}
          >
            Décider
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPlay(osClearUrgentBanner(play))}
          >
            Masquer
          </Button>
        </div>
      </div>
    </div>
  );
}
