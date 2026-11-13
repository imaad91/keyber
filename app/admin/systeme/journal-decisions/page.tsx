"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { type JournalModuleLie } from "@/lib/adminJournalDecisions";
import { useAdminStore } from "@/lib/adminStore";

const MODULES: JournalModuleLie[] = [
  "Cœur",
  "Workflow",
  "Compétences",
  "Fiches",
  "Agents",
  "Architecture",
  "Glossaire",
  "Système",
];

export default function WorkflowJournalDecisionsListPage() {
  const { journalDecisions, addJournalDecision } = useAdminStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState("");
  const [decision, setDecision] = useState("");
  const [pourquoi, setPourquoi] = useState("");
  const [consequence, setConsequence] = useState("");
  const [moduleLie, setModuleLie] = useState<JournalModuleLie>("Workflow");

  const list = [...(journalDecisions ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  function submit() {
    const created = addJournalDecision({
      titre,
      decision,
      pourquoi,
      consequenceSiChange: consequence,
      moduleLie,
    });
    if (created) {
      setOpen(false);
      setTitre("");
      setDecision("");
      setPourquoi("");
      setConsequence("");
      router.push(`/admin/systeme/journal-decisions/${created.id}`);
    }
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/systeme/coeur"
        backLabel="← Système"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Système", href: "/admin/systeme/coeur" },
          { label: "Journal des décisions" },
        ]}
        title="Système — Journal des décisions"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          Mémoire du « pourquoi ». Une décision enregistrée est verrouillée :
          impossible de la modifier ou de la supprimer.
        </p>
        <AdminButton onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter une décision
        </AdminButton>
      </div>

      {open ? (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Nouvelle décision
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3">
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
            <textarea
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={2}
              placeholder="Décision (texte exact)"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            />
            <textarea
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={2}
              placeholder="Pourquoi"
              value={pourquoi}
              onChange={(e) => setPourquoi(e.target.value)}
            />
            <textarea
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={2}
              placeholder="Conséquence si on change"
              value={consequence}
              onChange={(e) => setConsequence(e.target.value)}
            />
            <label className="text-xs font-semibold text-slate-500">
              Module lié
              <select
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                value={moduleLie}
                onChange={(e) =>
                  setModuleLie(e.target.value as JournalModuleLie)
                }
              >
                {MODULES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <AdminButton onClick={submit}>Enregistrer (verrouillage)</AdminButton>
              <AdminButton variant="secondary" onClick={() => setOpen(false)}>
                Annuler
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((d) => (
          <Link
            key={d.id}
            href={`/admin/systeme/journal-decisions/${d.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <p className="text-xs tabular-nums text-slate-400">
              {new Date(d.date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "Europe/Paris",
              })}{" "}
              · {d.moduleLie}
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {d.titre}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-semibold">Décision :</span> {d.decision}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-semibold">Pourquoi :</span> {d.pourquoi}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
