"use client";

import Link from "next/link";
import {
  BookMarked,
  BookOpen,
  Factory,
  Lock,
  MessagesSquare,
  Monitor,
  Package,
  Scale,
  Settings2,
  User,
  type LucideIcon,
} from "lucide-react";
import { getContexteActif } from "@/data/registry";
import { exampleActions } from "@/lib/mock";
import { formatRemainingLabel } from "@/lib/evenements";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Action } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  Monitor,
  MessagesSquare,
  Scale,
  Factory,
  Package,
};

export function ActionSidebar() {
  const { activeAction, setActiveAction, gameState } = useGameStore();
  const chapter = gameState.chapters.find((c) => c.id === gameState.chapterId);
  const clockLabel =
    gameState.day >= 1
      ? `Jour ${gameState.day} - ${gameState.heureActuelle} - Il te reste ${formatRemainingLabel(gameState.tempsRestantMinutes)}`
      : gameState.heureActuelle;

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-white/10 bg-panel">
      <div className="border-b border-white/10 px-4 py-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-accent"
        >
          KEYBER
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">
          {chapter ? `Ch.${chapter.numero} · ${chapter.titre}` : getContexteActif().nom}
        </p>
        <p className="mt-2 font-display text-sm font-semibold leading-snug tabular-nums text-foreground">
          {clockLabel}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{
              width: `${(gameState.minutesSinceStart / gameState.dayLengthMinutes) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="border-b border-white/10 p-2">
        <Link
          href="/livre"
          className="flex items-center gap-2 rounded-xl bg-accent/15 px-3 py-2.5 text-sm font-semibold text-accent ring-1 ring-accent/30 transition hover:bg-accent/25"
        >
          <BookOpen className="h-4 w-4" />
          Livre de l&apos;Entreprise
        </Link>
        <Link
          href="/journal"
          className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
        >
          <BookMarked className="h-4 w-4" />
          Journal de bord
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2" aria-label="Actions">
        <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Actions
        </p>
        {exampleActions.map((action) => {
          const gated = gameState.mode === "story" && !gameState.onboardingDone;
          const locked =
            gated && !gameState.unlockedActions.includes(action.type);
          return (
            <ActionButton
              key={action.id}
              action={action}
              active={activeAction?.id === action.id}
              locked={locked}
              onSelect={() => setActiveAction(action)}
            />
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <Link
          href="/profil"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
        >
          <User className="h-4 w-4" />
          Mon profil
        </Link>
        <Link
          href="/admin"
          className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-accent"
        >
          <Settings2 className="h-4 w-4" />
          Mode Admin
        </Link>
      </div>
    </aside>
  );
}

function ActionButton({
  action,
  active,
  locked,
  onSelect,
}: {
  action: Action;
  active: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  const Icon = ICONS[action.icone] ?? Package;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
        locked && "opacity-45",
        active
          ? "bg-accent/15 text-foreground shadow-glow ring-1 ring-accent/40"
          : "text-muted hover:bg-white/5 hover:text-foreground"
      )}
    >
      {locked ? (
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      ) : (
        <Icon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 transition-colors",
            active ? "text-accent" : "text-muted group-hover:text-accent"
          )}
        />
      )}
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-foreground">
          {action.titre}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted">
          {locked
            ? "Verrouillé — suis le mentor"
            : `${action.description} · ${action.timeCostMinutes} min`}
        </span>
      </span>
    </button>
  );
}
