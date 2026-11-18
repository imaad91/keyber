"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OS_LIVE_HISTOIRE_PATH } from "@/lib/keyberOs/bookBridge";

/** Legacy → porte Live Histoire (fence post Étape 42). */
export default function JouerHistoireRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(OS_LIVE_HISTOIRE_PATH);
  }, [router]);
  return (
    <p className="p-8 text-sm text-muted">
      Redirection vers le catalogue Histoire Live…
    </p>
  );
}
