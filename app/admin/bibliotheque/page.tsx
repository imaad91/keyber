"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Bibliothèque index → premier sous-onglet (Entreprises). */
export default function BibliothequeIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/entreprises");
  }, [router]);
  return (
    <p className="text-sm text-slate-500">
      Redirection vers Bibliothèque → Entreprises…
    </p>
  );
}
