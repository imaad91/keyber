"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { CoeurLangageLocked } from "@/components/admin/CoeurLangageLocked";
import { useAdminStore } from "@/lib/adminStore";

export default function CoeurLangageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { scenarios, getScenarioCoeur, getCoeurMeta, coeurMeta } =
    useAdminStore();
  const scenario = scenarios.find((s) => s.id === id);
  const coeur = getScenarioCoeur(id);
  const meta = coeurMeta[id] ?? getCoeurMeta(id);

  if (!scenario) {
    return (
      <p className="text-sm text-slate-500">
        Scénario introuvable.{" "}
        <Link href="/admin/coeur/langage" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/coeur/langage"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Cœur", href: "/admin/coeur/langage" },
          { label: "Langage Cœur", href: "/admin/coeur/langage" },
          { label: scenario.titre },
        ]}
        title={`Cœur — Langage Cœur — ${scenario.titre}`}
      />
      <CoeurLangageLocked
        coeur={coeur}
        version={meta.versions[0]}
        lastOriginLabel={meta.lastOriginLabel}
        audit={meta.audit}
      />
    </div>
  );
}
