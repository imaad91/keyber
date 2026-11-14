"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ancien chemin Workflow → Système / Architecture. */
export default function WorkflowArchitectureRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/systeme/architecture");
  }, [router]);
  return (
    <p className="text-sm text-slate-500">
      Redirection vers Système → Architecture…
    </p>
  );
}
