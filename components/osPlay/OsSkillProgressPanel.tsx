"use client";

/**
 * Jauges compétences session — ids/noms depuis le param (Étape 19).
 */

import { osSkillProgressList, type OsPlayState } from "@/lib/keyberOs";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
};

export function OsSkillProgressPanel({ play }: Props) {
  const { config } = useKeyberOsRuntime();
  if (!config.progression?.enabled) return null;
  if (config.progression.skillXpEnabled === false) return null;

  const skills = osSkillProgressList(play);
  if (!skills.length) return null;

  return (
    <section className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        Compétences
      </p>
      <ul className="space-y-2">
        {skills.map((s) => {
          const pct = Math.min(100, (s.xp / Math.max(1, s.threshold)) * 100);
          return (
            <li
              key={s.id}
              className="rounded-xl border border-white/10 bg-panel-2 px-3 py-2"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  {s.type === "ciblee" ? "Ciblée" : "Générale"}
                </span>
                <span className="text-[10px] tabular-nums text-muted">
                  Niv. {s.niveau}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">{s.nom}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full bg-accent transition-all duration-500"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] tabular-nums text-muted">
                {s.xp}/{s.threshold} XP
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
