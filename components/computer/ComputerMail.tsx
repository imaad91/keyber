"use client";

import { useState } from "react";
import { Mail, MailOpen } from "lucide-react";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ComputerMail() {
  const { gameState, markEmailRead } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(
    gameState.emails[0]?.id ?? null
  );
  const selected =
    gameState.emails.find((e) => e.id === selectedId) ?? null;
  const unread = gameState.emails.filter((e) => !e.read).length;

  return (
    <div className="flex h-full min-h-[440px] bg-white text-slate-900">
      <div className="flex w-full min-h-0 flex-col md:flex-row">
        <ul className="w-full overflow-y-auto border-b border-slate-200 md:w-[320px] md:border-b-0 md:border-r">
          <li className="sticky top-0 z-10 flex items-center justify-between bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Boîte de réception
            </span>
            {unread > 0 ? (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unread}
              </span>
            ) : (
              <span className="text-slate-400">0 non lu</span>
            )}
          </li>
          {gameState.emails.map((email) => (
            <li key={email.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(email.id);
                  markEmailRead(email.id);
                }}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-slate-100 px-3 py-3 text-left transition hover:bg-slate-50",
                  selectedId === email.id && "bg-sky-50",
                  !email.read && "bg-rose-50/40"
                )}
              >
                <CharacterAvatar name={email.from} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-sm",
                        email.read
                          ? "font-medium text-slate-600"
                          : "font-semibold text-slate-900"
                      )}
                    >
                      {email.from}
                    </span>
                    <span className="shrink-0 text-[10px] tabular-nums text-slate-400">
                      {email.time}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block truncate text-sm",
                      email.urgent ? "text-red-600" : "text-slate-800"
                    )}
                  >
                    {email.subject}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                    {email.preview}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="min-w-0 flex-1 overflow-y-auto p-5">
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <MailOpen className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">Sélectionnez un email</p>
            </div>
          ) : (
            <article>
              <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                <CharacterAvatar name={selected.from} size={44} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selected.from}
                  </p>
                  <p className="text-xs text-slate-500">{selected.time}</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                {selected.subject}
              </h3>
              <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {selected.body}
              </pre>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
