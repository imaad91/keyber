"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SCENARIO_ID } from "@/data/scenarioNovacier";
import { useAdminStore } from "@/lib/adminStore";

/** Legacy hub → Logique (read-only BPMN). */
export default function AdminDecisionsRedirectPage() {
  const router = useRouter();
  const { scenarios } = useAdminStore();

  useEffect(() => {
    const id =
      scenarios.find((s) => s.id === SCENARIO_ID)?.id ?? scenarios[0]?.id;
    if (id) router.replace(`/admin/scenarios/${id}/logique`);
    else router.replace("/admin/scenarios");
  }, [router, scenarios]);

  return (
    <p className="text-sm text-slate-500">
      Redirection vers l&apos;onglet Logique…
    </p>
  );
}
