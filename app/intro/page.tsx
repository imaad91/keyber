"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IntroNarrative } from "@/components/IntroNarrative";
import { useGameStore } from "@/lib/store";

export default function IntroPage() {
  const router = useRouter();
  const { gameState } = useGameStore();

  useEffect(() => {
    if (!gameState.roleId) router.replace("/story");
  }, [gameState.roleId, router]);

  if (!gameState.roleId) return null;
  return <IntroNarrative />;
}
