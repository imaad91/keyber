"use client";

import { CharacterPortrait } from "@/components/characters/CharacterPortrait";
import {
  resolveCharacterId,
  type CharacterVisualId,
} from "@/lib/characterStyle";
import { cn } from "@/lib/utils";

type CharacterAvatarProps = {
  id?: CharacterVisualId | null;
  name?: string;
  trust?: number;
  size?: number;
  className?: string;
};

/** Round flat avatar for emails, chat, feed — never a large portrait. */
export function CharacterAvatar({
  id,
  name,
  trust = 55,
  size = 36,
  className,
}: CharacterAvatarProps) {
  const resolved = id ?? resolveCharacterId(name);

  if (!resolved) {
    const initials = (name ?? "?")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-[#0C3B38] bg-[#F5F1E8] font-display text-[10px] font-bold text-[#0C3B38]",
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    <CharacterPortrait
      id={resolved}
      trust={trust}
      size={size}
      rounded="full"
      showBadge={false}
      animateOnTrustChange={false}
      className={cn("shrink-0 border-2 border-[#0C3B38]", className)}
    />
  );
}
