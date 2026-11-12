"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import {
  Field,
  PageHeader,
  StatusBadge,
  inputClass,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";

/**
 * Hub Décisions & événements → dual views (CŒUR / Graphique) per scenario.
 * Legacy timeline editor replaced by /admin/scenarios/[id]/decisions.
 */
export default function AdminDecisionsHubPage() {
  const { scenarios, coeurs } = useAdminStore();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return [...scenarios]
      .filter((s) =>
        q ? s.titre.toLowerCase().includes(q.toLowerCase()) : true
      )
      .sort((a, b) => a.order - b.order);
  }, [scenarios, q]);

  return (
    <div>
      <PageHeader
        title="Décisions & événements"
        subtitle="Choisissez un scénario pour ouvrir la Vue Graphique et la Vue CŒUR (une seule source de vérité)."
      />

      <div className="mb-4 max-w-md">
        <Field label="Rechercher un scénario">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Novacier…"
            />
          </div>
        </Field>
      </div>

      <div className="space-y-2">
        {list.map((s) => {
          const coeur = coeurs[s.id];
          const nDec = coeur?.decisions.length ?? 0;
          const nEv = coeur?.evenements.length ?? 0;
          return (
            <Link
              key={s.id}
              href={`/admin/scenarios/${s.id}/decisions`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{s.titre}</p>
                  <StatusBadge status={s.statut} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {nDec} décision{nDec === 1 ? "" : "s"} · {nEv} événement
                  {nEv === 1 ? "" : "s"} · CŒUR{" "}
                  {coeur ? "prêt" : "à générer"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                Ouvrir CŒUR / Graphique
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
        {list.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun scénario.</p>
        ) : null}
      </div>
    </div>
  );
}
