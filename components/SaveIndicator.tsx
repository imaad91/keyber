"use client";

import { useEffect, useState } from "react";
import { formatClockSave } from "@/lib/sauvegarde";
import { useGameStore } from "@/lib/store";

export function SaveIndicator() {
  const { lastSavedAt } = useGameStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastSavedAt) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 4000);
    return () => window.clearTimeout(t);
  }, [lastSavedAt]);

  if (!lastSavedAt) return null;

  return (
    <div
      className={`pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-panel/95 px-4 py-2 text-xs font-medium text-foreground shadow-soft backdrop-blur transition ${
        visible ? "opacity-100" : "opacity-60"
      }`}
      aria-live="polite"
    >
      Sauvegardé ✓ — {formatClockSave(lastSavedAt)}
    </div>
  );
}
