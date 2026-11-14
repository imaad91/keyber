"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookPlayStatusBanner } from "@/components/BookPlayStatusBanner";
import { ModeBadge } from "@/components/admin/BookEntryCard";
import { BookScenarioGraph } from "@/components/admin/BookScenarioGraph";
import {
  bookVersionLabel,
  useBookStore,
} from "@/lib/bookStore";

/**
 * Lecture / « jeu » d'une carte Book Studio (test ou Live).
 * Ne touche pas aux parcours Novacier en dur (/jouer/histoire, /jouer/competence).
 */
export default function JouerBookEntryPage() {
  const { id } = useParams<{ id: string }>();
  const { getEntry } = useBookStore();
  const entry = getEntry(id);

  if (!entry) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-600">
        Scénario Book introuvable.{" "}
        <Link href="/admin/book/en-cours-de-test" className="underline">
          Retour Book
        </Link>
      </div>
    );
  }

  const backHref =
    entry.status === "live"
      ? "/admin/book/live"
      : "/admin/book/en-cours-de-test";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <BookPlayStatusBanner status={entry.status} />

      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour Book
        </Link>

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <ModeBadge mode={entry.mode} />
          <span className="text-xs text-slate-500">
            {entry.entrepriseNom} · V{entry.version}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {bookVersionLabel(entry)}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {entry.mode === "competence"
            ? `Compétence : ${entry.competenceName || "—"}`
            : `Rôle : ${entry.roleName || "—"}`}
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Vue Texte
          </h2>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
            {entry.textContent || "—"}
          </pre>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Vue Graphique
          </h2>
          <BookScenarioGraph
            graph={entry.graph}
            title={`${entry.nom} — flux`}
          />
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-200/80">
            Fichier de paramétrage
          </h2>
          <p className="mt-1 font-mono text-xs text-emerald-300/70">
            {entry.paramFileName || "—"}
          </p>
          <pre className="mt-3 max-h-[320px] overflow-auto whitespace-pre-wrap font-mono text-xs text-emerald-100">
            {entry.paramFile
              ? JSON.stringify(entry.paramFile, null, 2)
              : "—"}
          </pre>
        </section>

        <p className="mt-8 text-center text-xs text-slate-500">
          Démo Studio — contenu Lumière & Co. Novacier n&apos;est pas modifié.
        </p>
      </div>
    </div>
  );
}
