"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ControleIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/controle/agents");
  }, [router]);
  return <p className="text-sm text-slate-500">Redirection…</p>;
}
