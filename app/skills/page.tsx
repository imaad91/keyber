"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OS_LIVE_COMPETENCE_PATH } from "@/lib/keyberOs/bookBridge";

/** Legacy → /jouer/live/competence */
export default function SkillsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(OS_LIVE_COMPETENCE_PATH);
  }, [router]);
  return (
    <p className="p-8 text-sm text-muted">Redirection Mode Compétence Live…</p>
  );
}
