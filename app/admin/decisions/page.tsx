"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DecisionsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/logique");
  }, [router]);
  return <p className="text-sm text-slate-500">Redirection vers Logique…</p>;
}
