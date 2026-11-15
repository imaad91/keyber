"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ancien Architecture → Vue Globale. */
export default function RedirectArchitecture() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/systeme/vue-globale");
  }, [router]);
  return <p className="text-sm text-slate-500">Redirection…</p>;
}
