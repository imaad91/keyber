"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Database,
  Eye,
  Factory,
  Gamepad2,
  GraduationCap,
  Hand,
  Link2,
  MessageCircle,
  Network,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import { agentIconThemeKey, type AgentProfile } from "@/lib/agents";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  target: Target,
  factory: Factory,
  "graduation-cap": GraduationCap,
  link: Link2,
  "message-circle": MessageCircle,
  eye: Eye,
  shield: Shield,
  zap: Zap,
  database: Database,
  "book-open": BookOpen,
  "gamepad-2": Gamepad2,
  network: Network,
  hand: Hand,
};

/** Class strings must live here so Tailwind content scan keeps them. */
const THEME_CLASSES = {
  testeur: {
    box: "bg-black",
    icon: "text-[#D6F94C]",
  },
  metier: {
    box: "bg-slate-100",
    icon: "text-black",
  },
  pedagogue: {
    box: "bg-[#D6F94C]",
    icon: "text-black",
  },
  erp: {
    box: "border-2 border-black bg-white",
    icon: "text-black",
  },
  orchestra: {
    box: "bg-violet-600",
    icon: "text-white",
  },
  ergonomie: {
    box: "border-2 border-black bg-white",
    icon: "text-black",
  },
  default: {
    box: "bg-slate-900",
    icon: "text-[#D6F94C]",
  },
} as const;

export function resolveAgentLucide(icone: string): LucideIcon {
  return ICON_MAP[icone] ?? Target;
}

export function AgentIconBadge({
  agent,
  size = "md",
  className,
}: {
  agent: Pick<AgentProfile, "id" | "icone">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const Icon = resolveAgentLucide(agent.icone);
  const theme = THEME_CLASSES[agentIconThemeKey(agent)];
  const box =
    size === "sm"
      ? "h-8 w-8 rounded-md"
      : size === "md"
        ? "h-12 w-12 rounded-xl"
        : size === "lg"
          ? "h-16 w-16 rounded-2xl"
          : "h-20 w-20 rounded-2xl";
  const iconSize =
    size === "sm"
      ? "h-4 w-4"
      : size === "md"
        ? "h-6 w-6"
        : size === "lg"
          ? "h-8 w-8"
          : "h-10 w-10";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        box,
        theme.box,
        className
      )}
      aria-hidden
    >
      <Icon className={cn(iconSize, theme.icon)} strokeWidth={2.25} />
    </span>
  );
}
