"use client";

import { useMemo, useState } from "react";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import { getChatContacts } from "@/lib/computerData";
import { getPersonnagesActifs } from "@/lib/scenario";
import { useGameStore } from "@/lib/store";
import type { DialogueChoice } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ComputerChat() {
  const { gameState, applyDialogueChoice } = useGameStore();
  const [threadId, setThreadId] = useState<string>("pers-karim");
  const [localReplies, setLocalReplies] = useState<
    { id: string; from: "you" | "them"; text: string }[]
  >([]);

  const threads = getChatContacts();
  const thread = threads.find((t) => t.id === threadId) ?? threads[0]!;
  const personnage = getPersonnagesActifs().find((p) => p.id === threadId);

  const feed = useMemo(() => {
    const first = thread.name.split(" ")[0] ?? "";
    const fromStore = gameState.messages.filter((m) =>
      m.from.includes(first)
    );
    return fromStore;
  }, [gameState.messages, thread.name, threadId]);

  const question = personnage?.questions[0];
  const trust = gameState.relations[threadId] ?? personnage?.relationConfiance ?? 50;

  function sendChoice(choice: DialogueChoice) {
    applyDialogueChoice(threadId, choice);
    setLocalReplies((prev) => [
      ...prev,
      { id: `you-${choice.id}`, from: "you", text: choice.texte },
      { id: `them-${choice.id}`, from: "them", text: choice.reponse },
    ]);
  }

  return (
    <div className="flex h-full min-h-[440px] bg-white text-slate-900">
      <aside className="w-52 shrink-0 border-r border-slate-200 bg-slate-50">
        <p className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Conversations
        </p>
        {threads.map((t) => {
          const hasAlert = gameState.messages.some(
            (m) => m.alert && m.from.includes(t.name.split(" ")[0])
          );
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
              <CharacterAvatar name={t.name} size={36} trust={gameState.relations[t.id]} />
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
            <p className="text-sm font-semibold text-slate-900">{thread.name}</p>
            <p className="text-xs text-slate-500">
              {thread.role} · Confiance {trust}
            </p>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {feed.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex max-w-[90%] gap-2 rounded-2xl rounded-tl-md border px-3 py-2",
                msg.alert
                  ? "border-rose-200 bg-rose-50"
                  : "border-slate-200 bg-slate-50"
              )}
            >
              <CharacterAvatar name={msg.from} size={28} className="mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-slate-500">
                  {msg.from} · {msg.time}
                </p>
                <p className="text-sm text-slate-800">{msg.text}</p>
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

        {question ? (
          <div className="border-t border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Réponses rapides — {question.texte}
            </p>
            <div className="flex flex-wrap gap-2">
              {question.choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => sendChoice(c)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500"
                >
                  {c.texte}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
