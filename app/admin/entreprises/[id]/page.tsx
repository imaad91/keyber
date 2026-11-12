"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  AdminButton,
  Field,
  PageHeader,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";
import { ADMIN_SECTEURS, type AdminEntreprise } from "@/lib/adminTypes";

export default function AdminEntrepriseEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { entreprises, scenarios, updateEntreprise } = useAdminStore();
  const existing = entreprises.find((e) => e.id === id);
  const [form, setForm] = useState<AdminEntreprise | null>(null);

  useEffect(() => {
    if (existing) setForm({ ...existing, produitsPhares: [...existing.produitsPhares] as [string, string, string], valeurs: [...existing.valeurs], glossaire: existing.glossaire.map((g) => ({ ...g })), scenarioIds: [...existing.scenarioIds] });
  }, [existing]);

  if (!existing || !form) {
    return (
      <div>
        <p className="text-sm text-slate-500">Entreprise introuvable.</p>
        <Link href="/admin/entreprises" className="text-sm underline">
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/entreprises"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Entreprises
      </Link>
      <PageHeader
        title={form.nom || "Entreprise"}
        subtitle="Livre de l'Entreprise — contenu éditorial pour le joueur."
        actions={
          <AdminButton
            onClick={() => {
              updateEntreprise(form.id, form);
              router.push("/admin/entreprises");
            }}
          >
            Enregistrer
          </AdminButton>
        }
      />

      <div className="space-y-5">
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-2">
          <Field label="Nom">
            <input
              className={inputClass}
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </Field>
          <Field label="Ville">
            <input
              className={inputClass}
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
            />
          </Field>
          <Field label="Secteur">
            <select
              className={selectClass}
              value={form.secteur}
              onChange={(e) => setForm({ ...form, secteur: e.target.value })}
            >
              {ADMIN_SECTEURS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Activité">
            <input
              className={inputClass}
              value={form.activite}
              onChange={(e) => setForm({ ...form, activite: e.target.value })}
            />
          </Field>
          <Field label="Histoire" className="lg:col-span-2" hint="Texte long — fondation, crises, narration.">
            <textarea
              className={`${textareaClass} min-h-[140px]`}
              value={form.histoire}
              onChange={(e) => setForm({ ...form, histoire: e.target.value })}
            />
          </Field>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            3 produits phares
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {form.produitsPhares.map((p, i) => (
              <Field key={i} label={`Produit ${i + 1}`}>
                <input
                  className={inputClass}
                  value={p}
                  onChange={(e) => {
                    const next = [...form.produitsPhares] as [string, string, string];
                    next[i] = e.target.value;
                    setForm({ ...form, produitsPhares: next });
                  }}
                />
              </Field>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Chiffres clés
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="CA">
              <input
                className={inputClass}
                value={form.chiffresCles.ca}
                onChange={(e) =>
                  setForm({
                    ...form,
                    chiffresCles: { ...form.chiffresCles, ca: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Employés">
              <input
                type="number"
                className={inputClass}
                value={form.chiffresCles.employes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    chiffresCles: {
                      ...form.chiffresCles,
                      employes: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
            <Field label="Machines">
              <input
                type="number"
                className={inputClass}
                value={form.chiffresCles.machines}
                onChange={(e) =>
                  setForm({
                    ...form,
                    chiffresCles: {
                      ...form.chiffresCles,
                      machines: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
            <Field label="Satisfaction">
              <input
                className={inputClass}
                value={form.chiffresCles.satisfaction}
                onChange={(e) =>
                  setForm({
                    ...form,
                    chiffresCles: {
                      ...form.chiffresCles,
                      satisfaction: e.target.value,
                    },
                  })
                }
              />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Valeurs (3–4)
          </h2>
          <div className="space-y-2">
            {form.valeurs.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputClass}
                  value={v}
                  onChange={(e) => {
                    const next = [...form.valeurs];
                    next[i] = e.target.value;
                    setForm({ ...form, valeurs: next });
                  }}
                />
                <AdminButton
                  variant="ghost"
                  onClick={() =>
                    setForm({
                      ...form,
                      valeurs: form.valeurs.filter((_, j) => j !== i),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </AdminButton>
              </div>
            ))}
            {form.valeurs.length < 4 ? (
              <AdminButton
                variant="secondary"
                onClick={() =>
                  setForm({ ...form, valeurs: [...form.valeurs, ""] })
                }
              >
                <Plus className="h-4 w-4" />
                Ajouter une valeur
              </AdminButton>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Glossaire</h2>
            <AdminButton
              variant="secondary"
              onClick={() =>
                setForm({
                  ...form,
                  glossaire: [...form.glossaire, { terme: "", definition: "" }],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Terme
            </AdminButton>
          </div>
          <div className="space-y-3">
            {form.glossaire.map((g, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                <input
                  className={inputClass}
                  placeholder="Terme"
                  value={g.terme}
                  onChange={(e) => {
                    const next = form.glossaire.map((x, j) =>
                      j === i ? { ...x, terme: e.target.value } : x
                    );
                    setForm({ ...form, glossaire: next });
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Définition"
                  value={g.definition}
                  onChange={(e) => {
                    const next = form.glossaire.map((x, j) =>
                      j === i ? { ...x, definition: e.target.value } : x
                    );
                    setForm({ ...form, glossaire: next });
                  }}
                />
                <AdminButton
                  variant="ghost"
                  onClick={() =>
                    setForm({
                      ...form,
                      glossaire: form.glossaire.filter((_, j) => j !== i),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </AdminButton>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Scénarios liés
          </h2>
          <div className="flex flex-col gap-2">
            {scenarios.map((s) => {
              const checked = form.scenarioIds.includes(s.id);
              return (
                <label
                  key={s.id}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...form.scenarioIds, s.id]
                        : form.scenarioIds.filter((x) => x !== s.id);
                      setForm({ ...form, scenarioIds: next });
                    }}
                  />
                  {s.titre}
                </label>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
