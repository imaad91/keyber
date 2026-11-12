"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route → /jouer/competence */
export default function SkillsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/jouer/competence");
  }, [router]);
  return <p className="p-8 text-sm text-muted">Redirection Mode Compétence…</p>;
}
