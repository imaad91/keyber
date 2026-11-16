"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { useBookStore } from "@/lib/bookStore";
import { useControleRapportsStore } from "@/lib/controleRapportsStore";
import {
  buildControleParityReport,
  type ControleParityReport,
} from "@/lib/controleParityReport";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";

function severityClass(s: string) {
  switch (s) {
    case "critique":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "majeure":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "mineure":
      return "border-sky-200 bg-sky-50 text-sky-950";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function ControleParitePage() {
  const { entries } = useBookStore();
  // Ensure runtime store is hydrated for isOsModuleEnabled reads.
  useKeyberOsRuntime();
  const { addRapport, toast, clearToast } = useControleRapportsStore();
  const [report, setReport] = useState<ControleParityReport | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const livePreview = useMemo(
    () => buildControleParityReport(entries),
    [entries]
  );

  function lancer() {
    const r = buildControleParityReport(entries);
    setReport(r);
    setSavedId(null);
  }

  function enregistrer() {
    if (!report) return;
    const res = addRapport({
      agentId: "orchestra",
      titre: `Parité feeling — ${report.score}/100`,
      texte: report.texte,
      score: report.score,
    });
    if ("error" in res) {
      window.alert(res.error);
      return;
    }
    setSavedId(res.id);
  }

  const view = report ?? livePreview;

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/controle/rapports"
        backLabel="← Rapports"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Contrôle", href: "/admin/controle/agents" },
          { label: "Rapports", href: "/admin/controle/rapports" },
          { label: "Parité feeling" },
        ]}
        title="Rapport parité feeling"
      />

      <p className="mb-4 max-w-3xl text-sm text-slate-600">
        Étape 25 — Contrôle rend visibles les trous (checklist Book, modules OS
        OFF, double moteur). <strong>Propose, ne patche pas.</strong>
      </p>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <AdminButton type="button" onClick={lancer}>
          Lancer le rapport
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={!report}
          onClick={enregistrer}
        >
          Enregistrer dans Rapports (Orchestra)
        </AdminButton>
        {savedId ? (
          <Link
            href={`/admin/controle/rapports/${savedId}`}
            className="text-sm font-medium text-violet-700 underline-offset-2 hover:underline"
          >
            Voir le rapport enregistré
          </Link>
        ) : null}
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Synthèse</h2>
            <p className="mt-1 text-xs text-slate-500">
              Score {view.score}/100 · généré{" "}
              {new Date(view.generatedAt).toLocaleString("fr-FR", {
                timeZone: "Europe/Paris",
              })}{" "}
              (Europe/Paris)
              {!report ? " · aperçu live (relancer pour figer)" : ""}
            </p>
          </div>
          <div
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-bold",
              view.score >= 80
                ? "bg-emerald-100 text-emerald-900"
                : view.score >= 50
                  ? "bg-amber-100 text-amber-950"
                  : "bg-rose-100 text-rose-950"
            )}
          >
            {view.score}/100
          </div>
        </div>
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {view.summaryLines.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Double moteur :{" "}
          <code className="rounded bg-slate-100 px-1">
            {view.dualEngine.officialPath}
          </code>{" "}
          vs{" "}
          <code className="rounded bg-slate-100 px-1">
            {view.dualEngine.legacyPath}
          </code>{" "}
          — {view.dualEngine.note}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Findings ({view.findings.length})
        </h2>
        <ul className="space-y-2">
          {view.findings.map((f, i) => (
            <li
              key={`${f.title}-${i}`}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                severityClass(f.severity)
              )}
            >
              <p className="font-semibold">
                <span className="mr-2 text-[10px] font-bold uppercase tracking-wide opacity-70">
                  {f.severity}
                </span>
                {f.title}
              </p>
              <p className="mt-0.5 text-xs opacity-90">{f.detail}</p>
              <p className="mt-1 text-xs opacity-70">
                Proposition : {f.proposal}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Book — checklist
        </h2>
        {view.books.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune carte Book.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Carte</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Manques</th>
                </tr>
              </thead>
              <tbody>
                {view.books.map((b) => (
                  <tr key={b.entryId} className="border-b border-slate-50">
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/book/${b.entryId}`}
                        className="font-medium hover:underline"
                      >
                        {b.label}
                      </Link>
                      <span className="ml-2 text-xs text-slate-400">
                        {b.status} · {b.mode}
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {b.okCount}/{b.total} ({b.scorePct}%)
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {b.missing.length ? b.missing.join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Texte brut (copiable)
        </h2>
        <textarea
          readOnly
          className="min-h-[220px] w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-emerald-100"
          value={view.texte}
        />
      </section>
    </div>
  );
}
