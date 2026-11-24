"use client";

/**
 * Interview OS — feeling InterviewView POC (Étape 16).
 * Dialogues + choix → relations. Données = param / pack. Aucun PNJ hardcodé.
 */

import { useState } from "react";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import {
  expressionFromTrust,
  expressionLabel,
  resolveCharacterId,
} from "@/lib/characterStyle";
import {
  osApplyDialogueChoice,
  osInterviewSelect,
  osRelationGet,
  type OsDialogueChoice,
  type OsPlayState,
} from "@/lib/keyberOs";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";
import { OsRelationsPanel } from "@/components/osPlay/OsRelationsPanel";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

export function OsInterviewView({ play, setPlay }: Props) {
  const { config } = useKeyberOsRuntime();
  const interviews = play.interviews;
  const current =
    interviews.find((i) => i.id === play.selectedInterviewId) ??
    interviews[0] ??
    null;

  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [lastChoice, setLastChoice] = useState<OsDialogueChoice | null>(null);

  if (!config.interviews?.enabled) {
    return (
      <p className="mt-4 text-sm text-muted">
        Module Interviews désactivé (Admin).
      </p>
    );
  }

  if (!current) {
    return (
      <p className="mt-4 text-sm text-muted">
        Aucun interlocuteur dans le paramétrage.
      </p>
    );
  }

  const trust = osRelationGet(play, current.id, current.relationConfiance);
  const expression = expressionFromTrust(trust);
  const question = (current.questions ?? []).find((q) => q.id === activeQ);
  const hasQuestions = (current.questions?.length ?? 0) > 0;

  return (
    <section className="view-enter mt-4 flex min-h-[480px] flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {interviews.map((p) => {
          const t = osRelationGet(play, p.id, p.relationConfiance);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPlay(osInterviewSelect(play, p.id));
                setActiveQ(null);
                setLastChoice(null);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-2 py-1.5 transition",
                p.id === current.id
                  ? "border-accent bg-accent/15"
                  : "border-slate-200 bg-panel-2 hover:bg-slate-50"
              )}
              aria-label={p.nom}
            >
              <CharacterAvatar
                id={resolveCharacterId(p.id) ?? undefined}
                name={p.nom}
                trust={t}
                size={32}
              />
              <span className="pr-1 text-xs font-semibold text-foreground">
                {p.nom.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {config.relations?.showGauges !== false ? (
        <OsRelationsPanel play={play} compact />
      ) : null}

      <div className="grid min-h-0 flex-1 gap-6 rounded-3xl border border-slate-200 bg-[#F5F1E8] p-5 text-[#0C3B38] shadow-soft md:grid-cols-[minmax(220px,320px)_1fr] md:p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border-[3px] border-[#0C3B38] bg-white p-3 shadow-sm">
            <CharacterAvatar
              id={resolveCharacterId(current.id) ?? undefined}
              name={current.nom}
              trust={trust}
              size={160}
            />
          </div>
          <div className="w-full text-center">
            <h2 className="font-display text-xl font-semibold">
              {current.nom}
            </h2>
            <p className="text-xs text-[#6B7280]">{current.role}</p>
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
            {current.phrase ? (
              <p className="mt-3 text-sm italic text-[#6B7280]">
                « {current.phrase} »
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="rounded-2xl border-2 border-[#0C3B38] bg-white p-4 shadow-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Dialogue
            </p>
            <p className="text-sm leading-relaxed text-[#0C3B38]">
              {lastChoice?.reponse ??
                current.bio ??
                "Choisis une question pour lancer l'échange."}
            </p>
            {lastChoice?.unlockInfo ? (
              <p className="mt-2 text-xs font-semibold text-[#3B6FB5]">
                Info : {lastChoice.unlockInfo}
              </p>
            ) : null}
          </div>

          {hasQuestions ? (
            <>
              <div className="space-y-2 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Questions
                </p>
                {current.questions!.map((q) => (
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
                        setPlay(osApplyDialogueChoice(play, current.id, c));
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
            </>
          ) : (
            <ul className="space-y-3">
              {current.lines.map((l, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-[#0C3B38]/15 bg-white px-3 py-2 text-sm"
                >
                  <p className="text-[#6B7280]">Toi : {l.q}</p>
                  <p className="mt-1 text-[#0C3B38]">
                    {current.nom} : {l.a}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
