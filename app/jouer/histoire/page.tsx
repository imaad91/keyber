"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Crown,
  Factory,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { SCENARIO_ID, SCENARIO_TITLE } from "@/data/scenarioNovacier";
import { roles } from "@/lib/mock";
import { setMode, setRole, useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Factory,
  Briefcase,
  Crown,
  Truck,
};

export default function JouerHistoirePage() {
  const router = useRouter();
  const { gameState } = useGameStore();
  const nego = gameState.skillProgress.negociation?.niveau ?? 1;

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Accueil
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Mode Histoire
        </p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          Histoires
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          5 jours, mêmes compétences et XP que le Mode Compétence. Négociation
          Niveau {nego}
          {nego >= 2
            ? " — le choix agressif du Jour 5 est débloqué."
            : " — entraîne-toi pour débloquer « Négociation agressive »."}
        </p>

        <article className="mt-8 rounded-2xl border border-white/10 bg-panel p-6 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Scénario disponible
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            {SCENARIO_TITLE}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Novacier · 5 jours · Contrat AutoVolt. Les décisions partagent le
            même GameState que tes entraînements.
          </p>
        </article>

        <h2 className="mt-10 font-display text-xl font-semibold">
          Choisis ton rôle
        </h2>
        <p className="mt-1 text-sm text-muted">
          Ensuite : cinématique d&apos;intro, puis Jour 0 avec le mentor Henri.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {roles.map((role, i) => {
            const Icon = ICONS[role.icone] ?? Factory;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  if (role.id !== "prod") return;
                  setMode("histoire");
                  setRole(role.id);
                  // ensure scenario id is tracked
                  void SCENARIO_ID;
                  router.push("/intro");
                }}
                className={cn(
                  "value-enter group rounded-2xl border border-white/10 bg-panel p-6 text-left shadow-soft transition",
                  role.id === "prod"
                    ? "hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow"
                    : "cursor-not-allowed opacity-45"
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-warm/15 text-accent-warm transition group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {role.titre}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {role.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {role.focus.map((f) => (
                    <span
                      key={f}
                      className="rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-muted"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
