"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Book : 2 sous-onglets uniquement — redirection vers En cours de test. */
export default function BookIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/book/en-cours-de-test");
  }, [router]);
  return (
    <p className="text-sm text-slate-500">Redirection vers le Book…</p>
  );
}
