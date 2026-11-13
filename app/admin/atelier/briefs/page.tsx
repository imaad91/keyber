"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ancien Briefs → Contextes (3 couches Atelier). */
export default function AtelierBriefsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/atelier/contextes");
  }, [router]);
  return <p className="text-sm text-slate-500">Redirection vers Contextes…</p>;
}
