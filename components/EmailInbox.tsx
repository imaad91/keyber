"use client";

import { useState } from "react";
import { Mail, MailOpen } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function EmailInbox() {
  const { gameState, markEmailRead } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = gameState.emails.find((e) => e.id === selectedId) ?? null;

  return (
    <section className="view-enter flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-soft">
      <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <Mail className="h-4 w-4 text-accent" />
        <h2 className="font-display text-lg font-semibold">Emails</h2>
        <span className="ml-auto text-xs text-muted">
          {gameState.emails.filter((e) => !e.read).length} non lus
        </span>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[280px_1fr]">
        <ul className="overflow-y-auto border-b border-white/10 md:border-b-0 md:border-r">
          {gameState.emails.map((email) => (
            <li key={email.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(email.id);
                  markEmailRead(email.id);
                }}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5",
                  selectedId === email.id && "bg-accent/10",
                  !email.read && "bg-white/[0.03]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      email.read
                        ? "font-medium text-muted"
                        : "font-semibold text-foreground"
                    )}
                  >
                    {email.from}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted">
                    {email.time}
                  </span>
                </div>
                <span
                  className={cn(
                    "truncate text-sm",
                    email.urgent ? "text-danger" : "text-foreground"
                  )}
                >
                  {email.subject}
                </span>
                <span className="truncate text-[11px] text-muted">
                  {email.preview}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="overflow-y-auto p-5">
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center text-muted">
              <MailOpen className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">Sélectionnez un email</p>
            </div>
          ) : (
            <article className="reward-pop">
              <p className="text-xs text-muted">{selected.from}</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                {selected.subject}
              </h3>
              <p className="mt-1 text-xs text-muted">{selected.time}</p>
              <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {selected.body}
              </pre>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
