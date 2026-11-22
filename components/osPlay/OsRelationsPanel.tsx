"use client";

/**
 * Jauges Relations PNJ — slots génériques (Étape 16).
 */

import { osRelationSlots, type OsPlayState } from "@/lib/keyberOs";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
  compact?: boolean;
};

export function OsRelationsPanel({ play, compact }: Props) {
  const { config } = useKeyberOsRuntime();
  if (config.relations?.enabled === false) return null;

  const slots = osRelationSlots(play);
  if (!slots.length) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-panel-2/80",
        compact ? "px-3 py-2" : "p-4"
      )}
    >
      <p
        className={cn(
          "font-semibold uppercase tracking-wider text-muted",
          compact ? "text-[10px]" : "text-xs"
        )}
      >
        Relations
      </p>
      <ul className={cn("mt-2", compact ? "flex flex-wrap gap-3" : "space-y-3")}>
        {slots.map((s) => (
          <li
            key={s.id}
            className={cn(compact ? "min-w-[140px] flex-1" : "w-full")}
          >
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="truncate text-xs font-semibold text-foreground">
                {s.nom}
              </span>
              <span className="shrink-0 tabular-nums text-[10px] text-muted">
                {s.trust}/100
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  s.trust >= 60
                    ? "bg-ok"
                    : s.trust >= 40
                      ? "bg-accent-warm"
                      : "bg-danger"
                )}
                style={{ width: `${s.trust}%` }}
              />
            </div>
            {!compact ? (
              <p className="mt-0.5 text-[10px] text-muted">{s.role}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
