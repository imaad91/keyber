"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IntroNarrative } from "@/components/IntroNarrative";
import { OS_LIVE_CATALOG_PATH } from "@/lib/keyberOs/bookBridge";
import { useGameStore } from "@/lib/store";

/**
 * Intro legacy uniquement pour archive `/play?archive=1`.
 * Sans rôle POC → catalogue Live (narration Book = OsIntroNarrative).
 */
export default function IntroPage() {
  const router = useRouter();
  const { gameState } = useGameStore();

  useEffect(() => {
    if (!gameState.roleId) router.replace(OS_LIVE_CATALOG_PATH);
  }, [gameState.roleId, router]);

  if (!gameState.roleId) {
    return (
      <p className="p-8 text-sm text-muted">
        Redirection vers le catalogue Live…
      </p>
    );
  }

  return <IntroNarrative />;
}
