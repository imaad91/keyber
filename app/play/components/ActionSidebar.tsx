"use client";

import {
  LayoutDashboard,
  MessagesSquare,
  Package,
  Scale,
  Table2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exampleActions } from "@/lib/mock-data";
import { useGameStore } from "@/lib/store";
import type { Action } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  Package,
  LayoutDashboard,
  Table2,
  MessagesSquare,
  Scale,
};

export function ActionSidebar() {
  const { activeAction, setActiveAction } = useGameStore();

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="border-b border-slate-100 px-4 py-4">
        <p className="font-display text-lg font-semibold tracking-tight text-navy">
          KEYBER
        </p>
        <p className="text-xs text-slate-500">Actions</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="Actions">
        {exampleActions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            active={activeAction?.id === action.id}
            onSelect={() => setActiveAction(action)}
          />
        ))}
      </nav>
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
        "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
        active
          ? "bg-navy text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 transition-colors",
          active ? "text-accent" : "text-slate-400 group-hover:text-navy"
        )}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight">
          {action.titre}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[11px] leading-snug",
            active ? "text-white/70" : "text-slate-400"
          )}
        >
          {action.description}
        </span>
      </span>
    </button>
  );
}
