"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { useBookStore } from "@/lib/bookStore";
import { useControleRapportsStore } from "@/lib/controleRapportsStore";
import {
  buildV1LumiereProofReport,
  type V1LumiereProofReport,
} from "@/lib/keyberOs/v1Gel";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";

function verdictClass(v: V1LumiereProofReport["verdict"]) {
  switch (v) {
    case "VERT":
      return "border-emerald-300 bg-emerald-50 text-emerald-950";
    case "JAUNE":
      return "border-amber-300 bg-amber-50 text-amber-950";
    default:
      return "border-rose-300 bg-rose-50 text-rose-950";
  }
}

export default function ControleV1LumierePage() {
  const { entries } = useBookStore();
  useKeyberOsRuntime();
  const { addRapport, toast, clearToast } = useControleRapportsStore();
  const [report, setReport] = useState<V1LumiereProofReport | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const livePreview = useMemo(
    () => buildV1LumiereProofReport(entries),
    [entries]
  );

  function lancer() {
    setReport(buildV1LumiereProofReport(entries));
    setSavedId(null);
  }

  function enregistrer() {
    if (!report) return;
    const res = addRapport({
      agentId: "orchestra",
      titre: `V1 Lumière — ${report.verdict}`,
      texte: report.texte,
      score:
        report.verdict === "VERT" ? 100 : report.verdict === "JAUNE" ? 70 : 35,
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
          { label: "Gel V1 Lumière" },
        ]}
        title="Système prouvé avec Lumière"
      />

      <p className="mb-4 max-w-3xl text-sm text-slate-600">
        Étape 40 — preuve gel V1 via{" "}
        <strong>{view.entreprise}</strong> Live (Histoire + Compétence).{" "}
        <strong>Propose, ne patche pas.</strong> Novacier /{" "}
        <code className="rounded bg-slate-100 px-1">/play</code> restent hors
        scope jusqu&apos;aux étapes 41–42.
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
          Lancer la preuve V1
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={!report}
          onClick={enregistrer}
        >
          Enregistrer dans Rapports
        </AdminButton>
        <Link
          href="/admin/systeme/vue-globale"
          className="text-sm font-medium text-violet-700 underline-offset-2 hover:underline"
        >
          Voir gel V1 (Vue Globale)
        </Link>
        {savedId ? (
          <Link
            href={`/admin/controle/rapports/${savedId}`}
            className="text-sm font-medium text-violet-700 underline-offset-2 hover:underline"
          >
            Voir le rapport enregistré
          </Link>
        ) : null}
      </div>

      <section
        className={cn(
          "mb-6 rounded-2xl border p-5 shadow-sm",
          verdictClass(view.verdict)
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
          Verdict Étape 40
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold">
          {view.verdict}
        </h2>
        <p className="mt-1 text-sm">{view.verdictLabel}</p>
        <p className="mt-2 text-xs opacity-80">
          Généré{" "}
          {new Date(view.generatedAt).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
          })}{" "}
          (Europe/Paris)
          {!report ? " · aperçu live (relancer pour figer)" : ""}
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {view.summaryLines.slice(2).map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Histoire Live
          </p>
          {view.liveHistoire ? (
            <Link
              href={`/admin/book/${view.liveHistoire.id}`}
              className="mt-1 block font-semibold text-slate-900 hover:underline"
            >
              {view.liveHistoire.label} ({view.liveHistoire.scorePct}%)
            </Link>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Absente</p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Compétence Live
          </p>
          {view.liveCompetence ? (
            <Link
              href={`/admin/book/${view.liveCompetence.id}`}
              className="mt-1 block font-semibold text-slate-900 hover:underline"
            >
              {view.liveCompetence.label} ({view.liveCompetence.scorePct}%)
            </Link>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Absente</p>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Checks ({view.checks.filter((c) => c.ok).length}/{view.checks.length})
        </h2>
        <ul className="space-y-2">
          {view.checks.map((c) => (
            <li
              key={c.id}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                c.ok
                  ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                  : "border-rose-200 bg-rose-50 text-rose-950"
              )}
            >
              <p className="font-semibold">
                <span className="mr-2 text-[10px] font-bold uppercase tracking-wide opacity-70">
                  {c.ok ? "OK" : "KO"}
                </span>
                {c.label}
              </p>
              <p className="mt-0.5 text-xs opacity-90">{c.detail}</p>
            </li>
          ))}
        </ul>
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
