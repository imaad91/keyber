"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WorkflowGlossaireTermeRedirect() {
  const { terme } = useParams<{ terme: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/admin/systeme/glossaire/${encodeURIComponent(terme)}`);
  }, [router, terme]);
  return (
    <p className="text-sm text-slate-500">
      Redirection vers Système → Glossaire…
    </p>
  );
}
