"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Compétences vivent dans Atelier (couche 2), plus dans Système. */
export default function SystemeCompetencesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/atelier/competences");
  }, [router]);
  return (
    <p className="text-sm text-slate-500">
      Redirection vers Atelier → Compétences…
    </p>
  );
}
