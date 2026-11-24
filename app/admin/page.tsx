"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminHomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Clear Campus : hub Production = entrée Studio visible (pas l'ancien Création seul).
    router.replace("/admin/atelier/production");
  }, [router]);
  return (
    <p className="text-sm text-slate-500">
      Redirection vers Atelier → Production (Clear Campus)…
    </p>
  );
}
