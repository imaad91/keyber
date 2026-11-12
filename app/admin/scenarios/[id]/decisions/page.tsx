"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Legacy dual-view → Logique. */
export default function LegacyDecisionsRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/admin/scenarios/${id}/logique`);
  }, [id, router]);
  return (
    <p className="text-sm text-slate-500">Redirection vers Logique…</p>
  );
}
