"use client";

import { useState } from "react";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import { CharacterPortrait } from "@/components/characters/CharacterPortrait";
import { examplePersonnages } from "@/lib/mock";
import {
  CHARACTER_META,
  expressionFromTrust,
  expressionLabel,
  type CharacterVisualId,
} from "@/lib/characterStyle";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { DialogueChoice } from "@/lib/types";

export function InterviewView() {
  const {
    selectedPersonnageId,
    setSelectedPersonnageId,
    gameState,
    applyDialogueChoice,
  } = useGameStore();
  const personnage =
    examplePersonnages.find((p) => p.id === selectedPersonnageId) ??
    examplePersonnages[0];
  const visualId = personnage.id as CharacterVisualId;
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [lastChoice, setLastChoice] = useState<DialogueChoice | null>(null);
  const trust =
    gameState.relations[personnage.id] ?? personnage.relationConfiance;
  const expression = expressionFromTrust(trust);
  const question = personnage.questions.find((q) => q.id === activeQ);
  const meta = CHARACTER_META[visualId];

  return (
    <section className="view-enter flex h-full min-h-[480px] flex-col gap-4">
      {/* Selector: small round avatars only */}
      <div className="flex flex-wrap gap-2">
        {examplePersonnages.map((p) => {
          const t = gameState.relations[p.id] ?? p.relationConfiance;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPersonnageId(p.id);
                setActiveQ(null);
                setLastChoice(null);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-2 py-1.5 transition",
                p.id === personnage.id
                  ? "border-accent bg-accent/15"
                  : "border-white/10 bg-panel-2 hover:bg-white/5"
              )}
              aria-label={p.nom}
            >
              <CharacterAvatar
                id={p.id as CharacterVisualId}
                trust={t}
                size={32}
              />
              <span className="pr-1 text-xs font-semibold text-foreground">
                {CHARACTER_META[p.id as CharacterVisualId]?.shortName ?? p.nom}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual novel: ONE large portrait + dialogue */}
      <div className="grid min-h-0 flex-1 gap-6 rounded-3xl border border-white/10 bg-[#F5F1E8] p-5 text-[#0C3B38] shadow-soft md:grid-cols-[minmax(220px,320px)_1fr] md:p-8">
        <div className="flex flex-col items-center gap-3">
          <CharacterPortrait
            id={visualId}
            trust={trust}
            size="xl"
            rounded="2xl"
            showBadge
            className="border-[3px] border-[#0C3B38] shadow-sm"
          />
          <div className="w-full text-center">
            <h2 className="font-display text-xl font-semibold">
              {meta?.displayName ?? personnage.nom}
            </h2>
            <p className="text-xs text-[#6B7280]">
              {meta?.role ?? personnage.role}
            </p>
            <div className="mx-auto mt-3 max-w-[220px]">
              <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                <span>{expressionLabel(expression)}</span>
                <span className="tabular-nums">{trust}/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#0C3B38]/15">
                <div
                  className="h-full rounded-full bg-[#2FD67E] transition-all duration-500 ease-out"
                  style={{ width: `${trust}%` }}
                />
              </div>
            </div>
            <p className="mt-3 text-sm italic text-[#6B7280]">
              « {personnage.phrase} »
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="rounded-2xl border-2 border-[#0C3B38] bg-white p-4 shadow-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Dialogue
            </p>
            <p className="text-sm leading-relaxed text-[#0C3B38]">
              {lastChoice?.reponse ??
                personnage.bio ??
                "Choisis une question pour lancer l'échange."}
            </p>
            {lastChoice?.unlockInfo ? (
              <p className="mt-2 text-xs font-semibold text-[#3B6FB5]">
                Info : {lastChoice.unlockInfo}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Questions
            </p>
            {personnage.questions.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setActiveQ(q.id);
                  setLastChoice(null);
                }}
                className={cn(
                  "w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm transition",
                  activeQ === q.id
                    ? "border-[#0C3B38] bg-[#0C3B38] text-[#F5F1E8]"
                    : "border-[#0C3B38]/20 bg-white text-[#0C3B38] hover:border-[#2FD67E]"
                )}
              >
                {q.texte}
              </button>
            ))}
          </div>

          {question ? (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0C3B38]">
                Tes réponses
              </p>
              {question.choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    applyDialogueChoice(personnage.id, c);
                    setLastChoice(c);
                  }}
                  className="w-full rounded-xl border-2 border-[#2FD67E] bg-[#E7F8EE] px-3 py-2.5 text-left text-sm font-medium text-[#0C3B38] transition hover:bg-[#2FD67E]/25"
                >
                  {c.texte}
                  <span className="mt-1 block text-[11px] font-normal text-[#6B7280]">
                    Confiance {c.confianceDelta >= 0 ? "+" : ""}
                    {c.confianceDelta}
                    {c.xp ? ` · +${c.xp} XP` : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
