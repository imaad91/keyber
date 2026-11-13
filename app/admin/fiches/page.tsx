"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Search } from "lucide-react";
import {
  AdminButton,
  Field,
  PageHeader,
  inputClass,
} from "@/components/admin/AdminPrimitives";
import {
  ficheFillPercent,
  ficheStatusLabel,
  type AdminFicheStatus,
} from "@/lib/adminFiches";
import { useAdminStore } from "@/lib/adminStore";
import { cn } from "@/lib/utils";

function FicheStatusBadge({ status }: { status: AdminFicheStatus }) {
  const styles: Record<AdminFicheStatus, string> = {
    brouillon: "bg-slate-100 text-slate-700",
    en_cours: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
    complete: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    validee: "bg-violet-50 text-violet-800 ring-1 ring-violet-200",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
        styles[status]
      )}
    >
      {ficheStatusLabel(status)}
    </span>
  );
}

export default function AdminFichesPage() {
  const router = useRouter();
  const { fiches, scenarios, createFiche } = useAdminStore();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return [...fiches]
      .filter((f) =>
        q
          ? `${f.titre} ${f.entrepriseNom} ${f.role}`
              .toLowerCase()
              .includes(q.toLowerCase())
          : true
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [fiches, q]);

  return (
    <div>
      <PageHeader
        title="Fiches"
        subtitle="Porte d'entrée du réel — une ligne par fiche, ouverture en plein écran."
        actions={
          <AdminButton
            onClick={() => {
              const id = createFiche(scenarios[0]?.id);
              router.push(`/admin/fiches/${id}`);
            }}
          >
            <Plus className="h-4 w-4" />
            Créer une fiche
          </AdminButton>
        }
      />

      <div className="mb-4 max-w-md">
        <Field label="Recherche">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Titre, entreprise, rôle…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </Field>
      </div>

      <div className="space-y-3">
        {list.map((f) => {
          const pct = ficheFillPercent(f);
          const scn = scenarios.find((s) => s.id === f.scenarioId);
          const date = new Date(f.updatedAt).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Paris",
          });
          return (
            <Link
              key={f.id}
              href={`/admin/fiches/${f.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {f.titre}
                  <span className="font-normal text-slate-500">
                    {" "}
                    — {f.entrepriseNom || "—"} — {f.role || "—"}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Scénario : {scn?.titre ?? "Non lié"} · Modifiée {date}
                  {f.coeurGenere ? " · Cœur généré" : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <FicheStatusBadge status={f.statut} />
                <span className="tabular-nums text-sm font-semibold text-slate-700">
                  {pct}%
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                  Ouvrir
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
            Aucune fiche. Créez la première avec « + Créer une fiche ».
          </div>
        ) : null}
      </div>
    </div>
  );
}
