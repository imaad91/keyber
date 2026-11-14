"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EquipeIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/equipe/utilisateurs");
  }, [router]);
  return <p className="text-sm text-slate-500">Redirection…</p>;
}
