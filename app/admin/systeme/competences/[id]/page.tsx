"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SystemeCompetenceDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/admin/atelier/competences/${id}`);
  }, [router, id]);
  return <p className="text-sm text-slate-500">Redirection…</p>;
}