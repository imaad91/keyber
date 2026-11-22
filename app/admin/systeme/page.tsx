"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeyberOsIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/systeme/vue-globale");
  }, [router]);
  return <p className="text-sm text-slate-500">Redirection vers Keyber OS…</p>;
}
