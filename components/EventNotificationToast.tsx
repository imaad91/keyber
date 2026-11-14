"use client";

import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";

export function EventNotificationToast() {
  const {
    gameState,
    dismissEventNotification,
    setActiveAction,
    focusComputerApp,
  } = useGameStore();
  const latest = gameState.eventNotifications[0];

  useEffect(() => {
    if (!latest) return;
    const t = window.setTimeout(() => dismissEventNotification(latest.id), 5000);
    return () => window.clearTimeout(t);
  }, [latest, dismissEventNotification]);

  if (!latest) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] w-[min(360px,calc(100vw-2rem))] rounded-xl border border-white/15 bg-panel p-4 shadow-glow">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-accent">
          <Bell className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            🔔 Nouvel évènement · {latest.at}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {latest.titre}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                dismissEventNotification(latest.id);
                if (latest.type === "message") {
                  focusComputerApp("mail");
                } else if (latest.type === "panne") {
                  setActiveAction({
                    id: "act-atelier",
                    type: "VIEW_ATELIER_LIVE",
                    titre: "Atelier Live",
                    icone: "Factory",
                    description: "",
                    timeCostMinutes: 0,
                  });
                } else {
                  focusComputerApp("dashboard");
                }
              }}
            >
              Voir
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dismissEventNotification(latest.id)}
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
