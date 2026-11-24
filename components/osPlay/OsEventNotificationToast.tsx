"use client";

/**
 * Toast événement OS — feeling EventNotificationToast POC (Étape 15).
 */

import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  osDismissEventNotification,
  osOrdinateurOpenApp,
  osOrdinateurSetAction,
  type OsPlayState,
} from "@/lib/keyberOs";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

export function OsEventNotificationToast({ play, setPlay }: Props) {
  const { config } = useKeyberOsRuntime();
  const enabled = config.notifications?.enabled !== false;
  const latest = enabled ? play.world?.eventNotifications?.[0] : undefined;
  const duration = config.notifications?.toastDurationMs ?? 5000;

  useEffect(() => {
    if (!latest) return;
    const snapshot = play;
    const id = latest.id;
    const t = window.setTimeout(() => {
      setPlay(osDismissEventNotification(snapshot, id));
    }, duration);
    return () => window.clearTimeout(t);
  }, [latest?.id, duration, play, setPlay]);

  if (!enabled || !latest) return null;

  return (
    <div className="pointer-events-auto fixed right-4 top-4 z-[60] w-[min(360px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-panel p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-accent">
          <Bell className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Nouvel évènement · {latest.at}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {latest.titre}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                let next = osDismissEventNotification(play, latest.id);
                if (latest.type === "message") {
                  next = osOrdinateurOpenApp(next, "mail");
                } else if (latest.type === "panne") {
                  next = osOrdinateurSetAction(next, "atelier-live");
                } else {
                  next = osOrdinateurOpenApp(next, "dashboard");
                }
                setPlay(next);
              }}
            >
              Voir
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setPlay(osDismissEventNotification(play, latest.id))
              }
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
