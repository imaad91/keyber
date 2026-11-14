"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ancien onglet Cœur → Vue Globale. */
export default function RedirectCoeur() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/systeme/vue-globale");
  }, [router]);
  return <p className="text-sm text-slate-500">Redirection…</p>;
}
