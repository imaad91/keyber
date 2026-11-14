"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
} from "@/components/admin/AdminPrimitives";
import {
  COMPETENCE_TYPE_LABELS,
  isTechniqueVague,
  slugifyCompetenceId,
  useAtelierStore,
  type CompetenceType,
} from "@/lib/atelierStore";

type Filter = "toutes" | CompetenceType;

export default function AtelierCompetencesPage() {
  const router = useRouter();
  const {
    competences,
    contextes,
    createCompetence,
    toast,
    clearToast,
  } = useAtelierStore();
  const [filter, setFilter] = useState<Filter>("toutes");
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [idDraft, setIdDraft] = useState("");
  const [type, setType] = useState<CompetenceType>("technique");
  const [contexteId, setContexteId] = useState(contextes[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const list = useMemo(() => {
    return competences.filter((c) =>
      filter === "toutes" ? true : c.type === filter
    );
  }, [competences, filter]);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/contextes"
        backLabel="← Atelier"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Compétences" },
        ]}
        title="Atelier — Compétences"
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Couche 2 — référentiel à travailler dans un contexte. Générales =
        transverses. Techniques = hyper précises (formule, indicateurs,
        erreurs).
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
        <div className="flex gap-2 text-xs font-semibold">
          {(
            [
              ["toutes", "Toutes"],
              ["generale", "Générales"],
              ["technique", "Techniques"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={
                filter === k
                  ? "rounded-md bg-slate-900 px-3 py-1.5 text-white"
                  : "rounded-md bg-slate-100 px-3 py-1.5 text-slate-600"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <AdminButton onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Créer une compétence
        </AdminButton>
      </div>

      {open ? (
        <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Nouvelle compétence</h2>
          {error ? (
            <p className="text-sm text-rose-700">{error}</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom">
              <input
                className={inputClass}
                value={nom}
                onChange={(e) => {
                  setNom(e.target.value);
                  if (!idDraft || idDraft === slugifyCompetenceId(nom)) {
                    setIdDraft(slugifyCompetenceId(e.target.value));
                  }
                }}
              />
            </Field>
            <Field label="Id (unique, non modifiable ensuite)">
              <input
                className={inputClass}
                value={idDraft}
                onChange={(e) => setIdDraft(slugifyCompetenceId(e.target.value))}
              />
            </Field>
            <Field label="Type">
              <select
                className={selectClass}
                value={type}
                onChange={(e) => setType(e.target.value as CompetenceType)}
              >
                <option value="generale">Générale</option>
                <option value="technique">Technique</option>
              </select>
            </Field>
            <Field label="Contexte lié (obligatoire)">
              <select
                className={selectClass}
                value={contexteId}
                onChange={(e) => setContexteId(e.target.value)}
              >
                {contextes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex gap-2">
            <AdminButton
              onClick={() => {
                const res = createCompetence({
                  id: idDraft,
                  nom,
                  type,
                  contexteId,
                });
                if ("error" in res) {
                  setError(res.error);
                  return;
                }
                setOpen(false);
                router.push(`/admin/atelier/competences/${res.id}`);
              }}
            >
              Créer
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </AdminButton>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Id</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Contexte</th>
              <th className="px-4 py-3">Niveau</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const ctx = contextes.find((x) => x.id === c.contexteId);
              const vague = isTechniqueVague(c);
              return (
                <tr key={c.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    <Link
                      href={`/admin/atelier/competences/${c.id}`}
                      className="hover:underline"
                    >
                      {c.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link
                      href={`/admin/atelier/competences/${c.id}`}
                      className="hover:underline"
                    >
                      {c.nom}
                    </Link>
                    {vague ? (
                      <span className="ml-2 text-[11px] font-semibold text-amber-700">
                        trop vague
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {COMPETENCE_TYPE_LABELS[c.type]}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {ctx?.nom ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    D / I / E
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
