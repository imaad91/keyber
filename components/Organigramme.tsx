"use client";

import { useRouter } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { examplePersonnages, livreNovacier } from "@/lib/mock";
import { setSelectedPersonnageId, useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Organigramme({ paper = false }: { paper?: boolean }) {
  const router = useRouter();
  const { gameState } = useGameStore();

  const people = livreNovacier.organigramme
    .map((o) => examplePersonnages.find((p) => p.id === o.personnageId))
    .filter(Boolean);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => {
        if (!p) return null;
        const trust = gameState.relations[p.id] ?? p.relationConfiance;
        return (
          <article
            key={p.id}
            className={cn(
              "rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5",
              paper
                ? "border-emerald-100 bg-white"
                : "border-white/10 bg-panel-2"
            )}
          >
            <div className="mb-3 flex items-start gap-3">
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl font-display text-sm font-bold",
                  paper
                    ? "bg-[#0C3B38] text-[#2FD67E]"
                    : "bg-accent/15 text-accent"
                )}
              >
                {p.avatar}
              </span>
              <div>
                <h3
                  className={cn(
                    "font-display text-base font-semibold",
                    paper ? "text-slate-900" : "text-foreground"
                  )}
                >
                  {p.nom}
                </h3>
                <p
                  className={cn(
                    "text-xs",
                    paper ? "text-slate-500" : "text-muted"
                  )}
                >
                  {p.role}
                </p>
              </div>
            </div>
            <p
              className={cn(
                "text-sm italic leading-relaxed",
                paper ? "text-slate-600" : "text-muted"
              )}
            >
              « {p.phrase} »
            </p>
            <div className="mt-3">
              <div
                className={cn(
                  "mb-1 flex justify-between text-[10px] uppercase tracking-wider",
                  paper ? "text-slate-500" : "text-muted"
                )}
              >
                <span>Confiance</span>
                <span>{trust}/100</span>
              </div>
              <div
                className={cn(
                  "h-1.5 overflow-hidden rounded-full",
                  paper ? "bg-slate-100" : "bg-white/10"
                )}
              >
                <div
                  className="h-full rounded-full bg-[#2FD67E]"
                  style={{ width: `${trust}%` }}
                />
              </div>
            </div>
            <Button
              size="sm"
              variant={paper ? "erp" : "outline"}
              className="mt-4 w-full"
              onClick={() => {
                setSelectedPersonnageId(p.id);
                router.push("/play?action=interview");
              }}
            >
              <MessagesSquare className="h-3.5 w-3.5" />
              Aller interviewer
            </Button>
          </article>
        );
      })}
    </div>
  );
}
