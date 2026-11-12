"use client";

import Link from "next/link";
import {
  AdminButton,
  Field,
  PageHeader,
  StatusBadge,
  inputClass,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";

export default function AdminConsultantsPage() {
  const {
    consultants,
    scenarios,
    validateConsultant,
    refuseConsultant,
    updateConsultantPercent,
  } = useAdminStore();

  const pending = consultants.filter((c) => c.status === "en_attente");
  const others = consultants.filter((c) => c.status !== "en_attente");

  return (
    <div>
      <PageHeader
        title="Consultants"
        subtitle="Validation des scénarios soumis par des consultants (préparation future)."
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Scénarios en attente
        </h2>

        {pending.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              Aucun scénario en attente
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Les soumissions consultants apparaîtront ici avec Voir / Valider /
              Refuser / Modifier et un pourcentage consultant.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {pending.map((c) => {
              const scn = scenarios.find((s) => s.id === c.scenarioId);
              return (
                <li
                  key={c.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {c.titre || scn?.titre || "Scénario"}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {c.consultantName} · soumis le {c.submittedAt}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status="en_attente" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <Field label="Pourcentage consultant" className="w-36">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className={inputClass}
                          value={c.percent}
                          onChange={(e) =>
                            updateConsultantPercent(
                              c.id,
                              Number(e.target.value) || 0
                            )
                          }
                        />
                      </Field>
                      {scn ? (
                        <Link href={`/admin/scenarios/${scn.id}`}>
                          <AdminButton variant="secondary">Voir</AdminButton>
                        </Link>
                      ) : null}
                      {scn ? (
                        <Link href={`/admin/scenarios/${scn.id}`}>
                          <AdminButton variant="ghost">Modifier</AdminButton>
                        </Link>
                      ) : null}
                      <AdminButton onClick={() => validateConsultant(c.id)}>
                        Valider
                      </AdminButton>
                      <AdminButton
                        variant="danger"
                        onClick={() => refuseConsultant(c.id)}
                      >
                        Refuser
                      </AdminButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {others.length > 0 ? (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Historique
          </h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {others.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between py-2 text-slate-600"
              >
                <span>
                  {c.titre} — {c.consultantName} ({c.percent} %)
                </span>
                <span className="capitalize text-slate-400">{c.status}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
