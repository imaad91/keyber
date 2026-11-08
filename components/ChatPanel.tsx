"use client";

import { MessageCircle } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ChatPanel() {
  const { gameState } = useGameStore();

  return (
    <section className="view-enter flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-soft">
      <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <MessageCircle className="h-4 w-4 text-accent" />
        <h2 className="font-display text-lg font-semibold">Chat interne</h2>
        <span className="ml-auto rounded-full bg-ok/20 px-2 py-0.5 text-[10px] font-bold text-ok">
          En ligne
        </span>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {gameState.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "reward-pop max-w-[90%] rounded-2xl rounded-tl-md border px-3 py-2",
              msg.alert
                ? "border-danger/40 bg-danger/10"
                : "border-white/10 bg-panel-2"
            )}
          >
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-foreground">
                {msg.from}
              </span>
              <span className="text-[10px] text-muted">{msg.role}</span>
              <span className="ml-auto text-[10px] tabular-nums text-muted">
                {msg.time}
              </span>
            </div>
            <p className="text-sm leading-snug text-foreground/90">{msg.text}</p>
            {msg.alert ? (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-danger">
                Alerte faible
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
