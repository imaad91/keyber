"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OS_LIVE_HISTOIRE_PATH } from "@/lib/keyberOs/bookBridge";

/** Legacy → /jouer/live/histoire */
export default function StoryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(OS_LIVE_HISTOIRE_PATH);
  }, [router]);
  return (
    <p className="p-8 text-sm text-muted">Redirection Mode Histoire Live…</p>
  );
}
