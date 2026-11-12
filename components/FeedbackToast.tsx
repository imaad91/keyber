"use client";

import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useGameStore } from "@/lib/store";

export function FeedbackToast() {
  const { gameState, clearFeedback } = useGameStore();

  useEffect(() => {
    if (!gameState.feedbackFlash) return;
    const t = window.setTimeout(() => clearFeedback(), 3200);
    return () => window.clearTimeout(t);
  }, [gameState.feedbackFlash, clearFeedback]);

  if (!gameState.feedbackFlash) return null;

  return (
    <div className="flash-banner pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-accent/40 bg-panel px-4 py-2.5 shadow-glow">
        <Sparkles className="h-4 w-4 text-accent" />
        <p className="text-sm font-semibold text-foreground">
          {gameState.feedbackFlash}
        </p>
      </div>
    </div>
  );
}
