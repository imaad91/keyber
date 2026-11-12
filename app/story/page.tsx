"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route → /jouer/histoire */
export default function StoryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/jouer/histoire");
  }, [router]);
  return <p className="p-8 text-sm text-muted">Redirection Mode Histoire…</p>;
}
