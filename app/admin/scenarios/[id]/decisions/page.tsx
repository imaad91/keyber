"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LegacyDecisionsRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/admin/logique/${id}`);
  }, [id, router]);
  return <p className="text-sm text-slate-500">Redirection…</p>;
}
