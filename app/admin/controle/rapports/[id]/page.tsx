"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  agentLabel,
  useControleRapportsStore,
} from "@/lib/controleRapportsStore";

export default function ControleRapportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getRapport, deleteRapport } = useControleRapportsStore();
  const rapport = getRapport(id);
  const [copied, setCopied] = useState(false);

  if (!rapport) {
    return (
      <p className="text-sm text-slate-500">
        Rapport introuvable.{" "}
        <Link href="/admin/controle/rapports" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/controle/rapports"
        backLabel="← Retour"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Contrôle", href: "/admin/controle/agents" },
          { label: "Rapports", href: "/admin/controle/rapports" },
          { label: rapport.titre },
        ]}
        title={rapport.titre}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/controle/rapports"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        >
          ← Retour
        </Link>
        <AdminButton
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(rapport.texte);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              window.prompt("Copiez le rapport :", rapport.texte);
            }
          }}
        >
          {copied ? "Copié ✓" : "Copier le rapport"}
        </AdminButton>
        <AdminButton
          variant="danger"
          onClick={() => {
            if (!window.confirm("Supprimer ce rapport ?")) return;
            deleteRapport(rapport.id);
            router.push("/admin/controle/rapports");
          }}
        >
          Supprimer
        </AdminButton>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
        <p>
          <span className="font-semibold">Agent :</span>{" "}
          <Link
            href={`/admin/controle/agents/${rapport.agentId}`}
            className="underline"
          >
            {agentLabel(rapport.agentId)}
          </Link>
        </p>
        <p className="mt-1">
          <span className="font-semibold">Date :</span>{" "}
          {new Date(rapport.date).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
          })}
        </p>
        <p className="mt-1">
          <span className="font-semibold">Score :</span>{" "}
          {rapport.score == null ? "—" : `${rapport.score}/100`}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Lecture seule — impossible de modifier après enregistrement.
        </p>
      </div>

      <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-900 shadow-sm">
        {rapport.texte}
      </pre>
    </div>
  );
}
