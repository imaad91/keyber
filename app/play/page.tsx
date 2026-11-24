"use client";

/**
 * Ancien POC Novacier — retiré.
 * Toute URL `/play` (y compris `?archive=1`) → catalogue Live.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OS_LIVE_CATALOG_PATH } from "@/lib/keyberOs/bookBridge";

export default function PlayRedirectPage() {
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
