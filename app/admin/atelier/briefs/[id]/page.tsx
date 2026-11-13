"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AtelierBriefDetailRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/atelier/contextes");
  }, [router]);
  return <p className="text-sm text-slate-500">Redirection…</p>;
}
