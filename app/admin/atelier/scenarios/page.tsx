"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
} from "@/components/admin/AdminPrimitives";
import {
  SCENARIO_STATUT_LABELS,
  useAtelierStore,
} from "@/lib/atelierStore";

export default function AtelierScenariosPage() {
  const router = useRouter();
  const {
    scenarios,
    contextes,
    competencesForContexte,
    createScenario,
    toast,
    clearToast,
  } = useAtelierStore();
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState("");
  const [contexteId, setContexteId] = useState(contextes[0]?.id ?? "");
  const [competenceIds, setCompetenceIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const comps = competencesForContexte(contexteId);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/contextes"
        backLabel="← Atelier"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Scénarios" },
        ]}
        title="Atelier — Scénarios"
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Couche 3 — situation dans un contexte, pour travailler des compétences
        précises de ce contexte. Pas de génération de Cœur ici.
      </p>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4 flex justify-end">
        <AdminButton onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Créer un scénario
        </AdminButton>
      </div>

      {open ? (
        <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Nouveau scénario</h2>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <Field label="Titre">
            <input
              className={inputClass}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
          </Field>
          <Field label="Contexte lié (obligatoire)">
            <select
              className={selectClass}
              value={contexteId}
              onChange={(e) => {
                setContexteId(e.target.value);
                setCompetenceIds([]);
              }}
            >
              {contextes.length === 0 ? (
                <option value="">Aucun contexte — créez-en un d&apos;abord</option>
              ) : null}
              {contextes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Compétences travaillées (du contexte)">
            <div className="space-y-1 rounded-lg border border-slate-200 p-3">
              {comps.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Aucune compétence dans ce contexte.
                </p>
              ) : (
                comps.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={competenceIds.includes(c.id)}
                      onChange={(e) => {
                        setCompetenceIds((prev) =>
                          e.target.checked
                            ? [...prev, c.id]
                            : prev.filter((x) => x !== c.id)
                        );
                      }}
                    />
                    <span className="font-mono text-xs text-slate-400">
                      {c.id}
                    </span>
                    {c.nom}
                  </label>
                ))
              )}
            </div>
          </Field>
          <div className="flex gap-2">
            <AdminButton
              onClick={() => {
                if (!contexteId) {
                  setError("Impossible de créer un scénario sans contexte");
                  return;
                }
                const res = createScenario({
                  titre,
                  contexteId,
                  competenceIds,
                });
                if ("error" in res) {
                  setError(res.error);
                  return;
                }
                setOpen(false);
                router.push(`/admin/atelier/scenarios/${res.id}`);
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

      <div className="space-y-3">
        {scenarios.map((s) => {
          const ctx = contextes.find((c) => c.id === s.contexteId);
          return (
            <Link
              key={s.id}
              href={`/admin/atelier/scenarios/${s.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{s.titre}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Contexte : {ctx?.nom ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Compétences :{" "}
                    {s.competenceIds.length
                      ? s.competenceIds.join(", ")
                      : "—"}
                  </p>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {SCENARIO_STATUT_LABELS[s.statut]}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
