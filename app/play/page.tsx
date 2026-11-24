"use client";

/**
 * `/play` n'est plus une entrée joueur (ni archive POC).
 * Redirection permanente vers le catalogue Live Keyber OS.
 */

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { osLegacyPlayRedirectHref } from "@/lib/keyberOs/bookBridge";

function PlayRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(osLegacyPlayRedirectHref());
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center atmosphere-play text-sm text-muted">
      Redirection vers le catalogue Live…
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-muted">
          Chargement…
        </div>
      }
    >
      <PlayRedirect />
    </Suspense>
  );
}
