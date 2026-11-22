"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ancien chemin Workflow → Système / Journal. */
export default function WorkflowJournalRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/systeme/journal-decisions");
  }, [router]);
  return (
    <p className="text-sm text-slate-500">
      Redirection vers Système → Journal des décisions…
    </p>
  );
}
