"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { CONTROLE_AGENT_IDS, DEFAULT_AGENTS } from "@/lib/agents";
import {
  agentLabel,
  useControleRapportsStore,
} from "@/lib/controleRapportsStore";

type Filter = "tous" | string;

export default function ControleRapportsPage() {
  const { rapports, toast, clearToast } = useControleRapportsStore();
  const [filter, setFilter] = useState<Filter>("tous");

  const list = useMemo(() => {
    const sorted = [...rapports].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (filter === "tous") return sorted;
    return sorted.filter((r) => r.agentId === filter);
  }, [rapports, filter]);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/controle/agents"
        backLabel="← Contrôle"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Contrôle", href: "/admin/controle/agents" },
          { label: "Rapports" },
        ]}
        title="Rapports"
      />

      <p className="mb-4 text-sm text-slate-600">
        Stockage par agent — colle ici les rapports Cursor (Audit). Lecture
        seule après enregistrement.
      </p>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter("tous")}
            className={
              filter === "tous"
                ? "rounded-md bg-slate-900 px-2.5 py-1 text-white"
                : "rounded-md bg-slate-100 px-2.5 py-1 text-slate-600"
            }
          >
            Tous
          </button>
          {CONTROLE_AGENT_IDS.map((id) => {
            const nom =
              DEFAULT_AGENTS.find((a) => a.id === id)?.nom_affiche ?? id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={
                  filter === id
                    ? "rounded-md bg-slate-900 px-2.5 py-1 text-white"
                    : "rounded-md bg-slate-100 px-2.5 py-1 text-slate-600"
                }
              >
                {nom}
              </button>
            );
          })}
        </div>
        <Link
          href="/admin/controle/rapports/nouveau"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Ajouter un rapport
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
          Aucun rapport pour ce filtre.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(r.date).toLocaleString("fr-FR", {
                      timeZone: "Europe/Paris",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link
                      href={`/admin/controle/rapports/${r.id}`}
                      className="hover:underline"
                    >
                      {r.titre}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{agentLabel(r.agentId)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {r.score == null ? "—" : `${r.score}/100`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
