"use client";

import Link from "next/link";
import {
  Database,
  Factory,
  LayoutDashboard,
  Mail,
  MessageCircle,
  MessagesSquare,
  Package,
  Scale,
  Table2,
  User,
  type LucideIcon,
} from "lucide-react";
import { exampleActions } from "@/lib/mock";
import { formatGameClock, remainingDayMinutes } from "@/lib/engine";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Action } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  Database,
  LayoutDashboard,
  Table2,
  MessagesSquare,
  Scale,
  Factory,
  Mail,
  MessageCircle,
  Package,
};

export function ActionSidebar() {
  const { activeAction, setActiveAction, gameState } = useGameStore();
  const clock = formatGameClock(gameState.minutesSinceStart);
  const left = remainingDayMinutes(gameState);

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-white/10 bg-panel">
      <div className="border-b border-white/10 px-4 py-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-accent"
        >
          KEYBER
        </Link>
        <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
          {clock}
        </p>
        <p className="text-[11px] text-muted">
          Jour {gameState.day} · {left} min restantes
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

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2" aria-label="Actions">
        <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Actions
        </p>
        {exampleActions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            active={activeAction?.id === action.id}
            onSelect={() => setActiveAction(action)}
          />
        ))}
      </nav>

      <div className="border-t border-white/10 p-2">
        <Link
          href="/profil"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
        >
          <User className="h-4 w-4" />
          Mon profil
        </Link>
      </div>
    </aside>
  );
}

function ActionButton({
  action,
  active,
  onSelect,
}: {
  action: Action;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = ICONS[action.icone] ?? Package;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
        active
          ? "bg-accent/15 text-foreground shadow-glow ring-1 ring-accent/40"
          : "text-muted hover:bg-white/5 hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 transition-colors",
          active ? "text-accent" : "text-muted group-hover:text-accent"
        )}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-foreground">
          {action.titre}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted">
          {action.description} · {action.timeCostMinutes} min
        </span>
      </span>
    </button>
  );
}
