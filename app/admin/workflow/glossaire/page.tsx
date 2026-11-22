"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ancien chemin Workflow → Système / Glossaire. */
export default function WorkflowGlossaireRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/systeme/glossaire");
  }, [router]);
  return (
    <p className="text-sm text-slate-500">
      Redirection vers Système → Glossaire…
    </p>
  );
}
