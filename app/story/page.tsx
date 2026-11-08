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
import { roles } from "@/lib/mock";
import { setRole } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Factory,
  Briefcase,
  Crown,
  Truck,
};

export default function StoryPage() {
  const router = useRouter();

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
          Choisis ton rôle
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Ensuite tu entres dans le quotidien /play avec timeline
          Jour/Semaine.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {roles.map((role, i) => {
            const Icon = ICONS[role.icone] ?? Factory;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setRole(role.id);
                  router.push("/play");
                }}
                className={cn(
                  "value-enter group rounded-2xl border border-white/10 bg-panel p-6 text-left shadow-soft transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow"
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
