"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { formatCoeurJson, highlightJson } from "@/lib/adminCoeur";
import { useAdminStore } from "@/lib/adminStore";

export default function SystemeCoeurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { scenarios, getScenarioCoeur } = useAdminStore();
  const scenario = scenarios.find((s) => s.id === id);
  const coeur = getScenarioCoeur(id);
  const json = useMemo(() => formatCoeurJson(coeur), [coeur]);
  const html = useMemo(() => highlightJson(json), [json]);

  if (!scenario) {
    return (
      <p className="text-sm text-slate-500">
        Scénario introuvable.{" "}
        <Link href="/admin/systeme/coeur" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  return (
    <div
      onCopy={(e) => {
        e.preventDefault();
        window.alert("Action refusée — le Cœur ne peut pas être copié.");
      }}
      onCut={(e) => {
        e.preventDefault();
        window.alert("Action refusée — le Cœur ne peut pas être coupé.");
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <AdminBreadcrumb
        backHref="/admin/systeme/coeur"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Système", href: "/admin/systeme/coeur" },
          { label: "Cœur", href: "/admin/systeme/coeur" },
          { label: scenario.titre },
        ]}
        title={`Cœur — ${scenario.titre}`}
      />

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        🔒 Lecture seule — modification, copier / coller / exporter refusés.
      </div>

      <pre
        className="max-h-[70vh] select-none overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-[12px] leading-5"
        onCopy={(e) => e.preventDefault()}
      >
        <code
          className="coeur-json block font-mono text-slate-100"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .coeur-json .json-key { color: #7dd3fc; }
        .coeur-json .json-string { color: #86efac; }
        .coeur-json .json-number { color: #fcd34d; }
        .coeur-json .json-lit { color: #f9a8d4; }
      `,
        }}
      />
    </div>
  );
}
