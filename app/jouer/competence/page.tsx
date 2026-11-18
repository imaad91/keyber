"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OS_LIVE_COMPETENCE_PATH } from "@/lib/keyberOs/bookBridge";

/** Legacy → porte Live Compétence (fence post Étape 42). */
export default function JouerCompetenceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(OS_LIVE_COMPETENCE_PATH);
  }, [router]);
  return (
    <p className="p-8 text-sm text-muted">
      Redirection vers le catalogue Compétence Live…
    </p>
  );
}
