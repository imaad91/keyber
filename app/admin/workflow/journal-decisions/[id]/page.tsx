"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WorkflowJournalDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/admin/systeme/journal-decisions/${id}`);
  }, [router, id]);
  return (
    <p className="text-sm text-slate-500">
      Redirection vers Système → Journal…
    </p>
  );
}
