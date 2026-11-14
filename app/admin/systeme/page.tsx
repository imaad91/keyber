"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SystemeIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/systeme/coeur");
  }, [router]);
  return <p className="text-sm text-slate-500">Redirection…</p>;
}
