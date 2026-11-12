"use client";

import type { ReactNode } from "react";
import { CharacterPortrait } from "@/components/characters/CharacterPortrait";
import {
  CHARACTER_META,
  expressionFromTrust,
  expressionLabel,
  type CharacterVisualId,
} from "@/lib/characterStyle";
import { cn } from "@/lib/utils";

type CharacterCardProps = {
  id: CharacterVisualId;
  trust: number;
  momentLine?: string;
  roleOverride?: string;
  paper?: boolean;
  className?: string;
  action?: ReactNode;
};

/** Large square portrait left · name, role, trust, moment line right. */
export function CharacterCard({
  id,
  trust,
  momentLine,
  roleOverride,
  paper = false,
  className,
  action,
}: CharacterCardProps) {
  const meta = CHARACTER_META[id];
  const expression = expressionFromTrust(trust);

  return (
    <article
      className={cn(
        "flex gap-4 rounded-2xl border p-4",
        paper
          ? "border-emerald-100 bg-white"
          : "border-white/10 bg-panel-2",
        className
      )}
    >
      <CharacterPortrait
        id={id}
        trust={trust}
        size="lg"
        rounded="2xl"
        showBadge
        className="shrink-0 border-2 border-[#0C3B38] shadow-sm"
      />
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "font-display text-lg font-semibold",
            paper ? "text-slate-900" : "text-foreground"
          )}
        >
          {meta.displayName}
        </h3>
        <p
          className={cn(
            "text-xs",
            paper ? "text-slate-500" : "text-muted"
          )}
        >
          {roleOverride ?? meta.role}
        </p>
        <div className="mt-3">
          <div
            className={cn(
              "mb-1 flex justify-between text-[10px] uppercase tracking-wider",
              paper ? "text-slate-500" : "text-muted"
            )}
          >
            <span>Confiance · {expressionLabel(expression)}</span>
            <span className="tabular-nums">{trust}/100</span>
          </div>
          <div
            className={cn(
              "h-2 overflow-hidden rounded-full transition-all duration-500",
              paper ? "bg-slate-100" : "bg-white/10"
            )}
          >
            <div
              className="h-full rounded-full bg-[#2FD67E] transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, trust))}%` }}
            />
          </div>
        </div>
        {momentLine ? (
          <p
            className={cn(
              "mt-3 text-sm italic leading-relaxed",
              paper ? "text-slate-600" : "text-muted"
            )}
          >
            « {momentLine} »
          </p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </article>
  );
}
