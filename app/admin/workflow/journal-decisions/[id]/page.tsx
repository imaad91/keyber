"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { JOURNAL_MODULE_HREFS } from "@/lib/adminJournalDecisions";
import { useAdminStore } from "@/lib/adminStore";

export default function WorkflowJournalDecisionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { journalDecisions } = useAdminStore();
  const entry = journalDecisions.find((d) => d.id === id);

  if (!entry) {
    return (
      <p className="text-sm text-slate-500">
        Décision introuvable.{" "}
        <Link href="/admin/workflow/journal-decisions" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const href = entry.moduleHref ?? JOURNAL_MODULE_HREFS[entry.moduleLie];

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/workflow/journal-decisions"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workflow", href: "/admin/workflow/scenarios" },
          {
            label: "Journal des décisions",
            href: "/admin/workflow/journal-decisions",
          },
          { label: entry.titre },
        ]}
        title={entry.titre}
      />

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        🔒 <strong>Lecture seule</strong> — décision verrouillée. Impossible de
        modifier ou de supprimer. C&apos;est la mémoire : on ne réécrit pas
        l&apos;histoire.
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Date
          </p>
          <p className="mt-1 text-sm text-slate-800">
            {new Date(entry.date).toLocaleString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/Paris",
            })}{" "}
            (Europe/Paris)
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Décision
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
            {entry.decision}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pourquoi
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {entry.pourquoi}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Conséquence si on change
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {entry.consequenceSiChange}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Liée à
          </p>
          <p className="mt-2 text-sm">
            <Link
              href={href}
              className="font-semibold text-slate-900 underline underline-offset-2"
            >
              {entry.moduleLie}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
