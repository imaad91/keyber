"use client";

import { useEffect, useState } from "react";
import { formatClockSave } from "@/lib/sauvegarde";
import {
  OS_SAVE_EVENT,
  type OsSaveEventDetail,
} from "@/lib/osSaveEvents";

/**
 * Toast sauvegarde — Keyber OS uniquement (plus de useGameStore legacy).
 */
export function SaveIndicator() {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onSave(ev: Event) {
      const detail = (ev as CustomEvent<OsSaveEventDetail>).detail;
      if (!detail?.at) return;
      setLastSavedAt(detail.at);
      setVisible(true);
    }
    window.addEventListener(OS_SAVE_EVENT, onSave);
    return () => window.removeEventListener(OS_SAVE_EVENT, onSave);
  }, []);

  useEffect(() => {
    if (!lastSavedAt) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 4000);
    return () => window.clearTimeout(t);
  }, [lastSavedAt]);

  if (!lastSavedAt) return null;

  return (
    <div
      className={`pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-medium text-slate-800 shadow-soft backdrop-blur transition ${
        visible ? "opacity-100" : "opacity-60"
      }`}
      aria-live="polite"
    >
      Sauvegardé ✓ — {formatClockSave(lastSavedAt)}
    </div>
  );
}
