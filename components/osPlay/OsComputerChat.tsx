"use client";

/**
 * Chat interne OS — chrome exact ComputerChat (Étape 6).
 * Contacts + fils = play.computer. Aucun useGameStore / PNJ hardcodé.
 */

import { useMemo, useState } from "react";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import type { OsPlayState } from "@/lib/keyberOs";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

type LocalReply = { id: string; from: "you" | "them"; text: string };

export function OsComputerChat({ play, setPlay }: Props) {
  const contacts = play.computer.chatContacts;
  const [threadId, setThreadId] = useState(contacts[0]?.id ?? "");
  const [localReplies, setLocalReplies] = useState<LocalReply[]>([]);

  const thread =
    contacts.find((t) => t.id === threadId) ?? contacts[0] ?? null;

  const feed = useMemo(() => {
    if (!thread) return [];
    const stored = play.computer.chatThreads.find(
      (t) => t.contactId === thread.id
    );
    return stored?.messages ?? [];
  }, [play.computer.chatThreads, thread]);

  const trust = thread ? play.relations[thread.id] ?? 55 : 55;

  const interview = play.interviews.find(
    (i) =>
      thread &&
      (i.id === thread.id ||
        i.nom.toLowerCase().includes(thread.name.split(" ")[0]!.toLowerCase()))
  );
  const quickLine = interview?.lines[0];

  function sendQuick(q: string, a: string) {
    if (!thread) return;
    const youId = `you-${Date.now()}`;
    const themId = `them-${Date.now()}`;
    setLocalReplies((prev) => [
      ...prev,
      { id: youId, from: "you", text: q },
      { id: themId, from: "them", text: a },
    ]);
    const nextThreads = play.computer.chatThreads.map((t) => {
      if (t.contactId !== thread.id) return t;
      return {
        ...t,
        messages: [
          ...t.messages,
          { from: "me" as const, text: q },
          { from: "them" as const, text: a },
        ],
      };
    });
    const hasThread = play.computer.chatThreads.some(
      (t) => t.contactId === thread.id
    );
    setPlay({
      ...play,
      relations: {
        ...play.relations,
        [thread.id]: Math.min(100, trust + 2),
      },
      computer: {
        ...play.computer,
        chatThreads: hasThread
          ? nextThreads
          : [
              ...play.computer.chatThreads,
              {
                contactId: thread.id,
                messages: [
                  { from: "me" as const, text: q },
                  { from: "them" as const, text: a },
                ],
              },
            ],
      },
    });
  }

  if (!thread) {
    return (
      <div className="flex h-full min-h-[440px] items-center justify-center bg-white text-sm text-slate-400">
        Aucun contact chat dans le pack Ordinateur.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[440px] bg-white text-slate-900">
      <aside className="w-52 shrink-0 border-r border-slate-200 bg-slate-50">
        <p className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Conversations
        </p>
        {contacts.map((t) => {
          const tFeed =
            play.computer.chatThreads.find((x) => x.contactId === t.id)
              ?.messages ?? [];
          const hasAlert = tFeed.some((m) => m.alert);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setThreadId(t.id);
                setLocalReplies([]);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-left transition",
                threadId === t.id ? "bg-white shadow-sm" : "hover:bg-slate-100"
              )}
            >
              <CharacterAvatar
                name={t.name}
                size={36}
                trust={play.relations[t.id]}
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1">
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {t.name.split(" ")[0]}
                  </span>
                  {hasAlert ? (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  ) : null}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {t.role}
                </span>
              </span>
            </button>
          );
        })}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <CharacterAvatar name={thread.name} size={40} trust={trust} />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {thread.name}
            </p>
            <p className="text-xs text-slate-500">
              {thread.role} · Confiance {trust}
            </p>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {feed.map((msg, i) => (
            <div
              key={`${thread.id}-${i}-${msg.text.slice(0, 12)}`}
              className={cn(
                "flex max-w-[90%] gap-2 rounded-2xl border px-3 py-2",
                msg.from === "me"
                  ? "ml-auto rounded-tr-md border-slate-800 bg-slate-900 text-white"
                  : msg.alert
                    ? "rounded-tl-md border-rose-200 bg-rose-50"
                    : "rounded-tl-md border-slate-200 bg-slate-50"
              )}
            >
              {msg.from !== "me" ? (
                <CharacterAvatar
                  name={thread.name}
                  size={28}
                  className="mt-0.5"
                />
              ) : null}
              <div>
                {msg.from !== "me" ? (
                  <p className="text-[11px] font-semibold text-slate-500">
                    {thread.name}
                    {msg.time ? ` · ${msg.time}` : ""}
                  </p>
                ) : null}
                <p
                  className={cn(
                    "text-sm",
                    msg.from === "me" ? "text-white" : "text-slate-800"
                  )}
                >
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
          {localReplies.map((r) => (
            <div
              key={r.id}
              className={cn(
                "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                r.from === "you"
                  ? "ml-auto rounded-tr-md bg-slate-900 text-white"
                  : "rounded-tl-md border border-slate-200 bg-slate-50 text-slate-800"
              )}
            >
              {r.text}
            </div>
          ))}
        </div>

        {quickLine ? (
          <div className="border-t border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Réponses rapides — {quickLine.q}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => sendQuick(quickLine.q, quickLine.a)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500"
              >
                Poser la question
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
