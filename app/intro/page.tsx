"use client";

/**
 * Intro legacy retirée — narration Book = OsIntroNarrative sur `/jouer/book/[id]`.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OS_LIVE_CATALOG_PATH } from "@/lib/keyberOs/bookBridge";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(OS_LIVE_CATALOG_PATH);
  }, [router]);

  return (
    <p className="p-8 text-sm text-muted">
      Redirection vers le catalogue Live…
    </p>
  );
}
