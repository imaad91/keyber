"use client";

/**
 * Panneau Objectifs OS — feeling ObjectivePanel POC (Étape 17).
 */

import { Target } from "lucide-react";
import type { OsPlayState } from "@/lib/keyberOs";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  JOURNALIER: "Journalier",
  HEBDOMADAIRE: "Hebdomadaire",
  ANNUEL: "Annuel",
};

type Props = {
  play: OsPlayState;
};

export function OsObjectivePanel({ play }: Props) {
  const { config } = useKeyberOsRuntime();
  if (!config.objectifs?.enabled) return null;

  const objectives = play.objectives ?? [];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-accent" />
        <h2 className="font-display text-sm font-semibold text-foreground">
          Objectifs
        </h2>
      </div>

      <div className="space-y-2">
        {objectives.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-muted">
            Aucun objectif dans le paramétrage.
          </p>
        ) : (
          objectives.map((obj) => {
            const cibleN =
              typeof obj.cibleNombre === "number" && obj.cibleNombre > 0
                ? obj.cibleNombre
                : 1;
            const prog = obj.progression ?? 0;
            const pct =
              obj.status === "COMPLETE"
                ? 100
                : obj.status === "ECHOUE"
                  ? Math.min(100, (prog / cibleN) * 100)
                  : Math.min(100, (prog / cibleN) * 100);

            return (
              <article
                key={obj.id}
                className={cn(
                  "rounded-xl border border-slate-200 bg-panel-2 p-3 transition",
                  obj.status === "COMPLETE" && "border-ok/40 bg-ok/10",
                  obj.status === "ECHOUE" && "border-danger/40 bg-danger/10"
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    {LABELS[String(obj.type).toUpperCase()] ?? obj.type}
                  </span>
                  <span className="text-[10px] text-muted">
                    {obj.status === "ECHOUE"
                      ? "Échoué"
                      : obj.xp
                        ? `+${obj.xp} XP`
                        : obj.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold leading-snug text-foreground">
                  {obj.status === "COMPLETE" ? "✓ " : ""}
                  {obj.titre}
                </h3>
                {obj.description ? (
                  <p className="mt-1 text-[11px] leading-snug text-muted">
                    {obj.description}
                  </p>
                ) : obj.cible ? (
                  <p className="mt-1 text-[11px] leading-snug text-muted">
                    {obj.cible}
                  </p>
                ) : null}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      obj.status === "COMPLETE"
                        ? "bg-ok"
                        : obj.status === "ECHOUE"
                          ? "bg-danger"
                          : "bg-accent"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] tabular-nums text-muted">
                  {prog}/{cibleN}
                  {obj.status === "COMPLETE"
                    ? " · Terminé"
                    : obj.status === "ECHOUE"
                      ? " · Échoué"
                      : ""}
                </p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
