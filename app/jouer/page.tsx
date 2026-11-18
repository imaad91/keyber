"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OS_LIVE_CATALOG_PATH } from "@/lib/keyberOs/bookBridge";

/** Anciens 3 slots legacy → catalogue Live (saves Book OS). */
export default function JouerSlotsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(OS_LIVE_CATALOG_PATH);
  }, [router]);
  return (
    <p className="p-8 text-sm text-muted">Redirection vers le catalogue Live…</p>
  );
}
