"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { useAdminStore } from "@/lib/adminStore";
import {
  ADMIN_NIVEAUX,
  ADMIN_SECTEURS,
  ADMIN_STATUTS,
  type AdminNiveau,
  type AdminScenario,
  type AdminScenarioStatus,
} from "@/lib/adminTypes";

export default function AdminScenarioEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { scenarios, entreprises, personnages, updateScenario } =
    useAdminStore();
  const existing = scenarios.find((s) => s.id === id);

  const [form, setForm] = useState<AdminScenario | null>(null);

  useEffect(() => {
    if (existing) setForm({ ...existing });
  }, [existing]);

  if (!existing || !form) {
    return (
      <div>
        <p className="text-sm text-slate-500">Scénario introuvable.</p>
        <Link
          href="/admin/scenarios"
          className="mt-2 inline-block text-sm text-slate-900 underline"
        >
          Retour
        </Link>
      </div>
    );
  }

  function set<K extends keyof AdminScenario>(key: K, value: AdminScenario[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  const linkedPersonnages = personnages.filter((p) =>
    p.scenarioIds.includes(form.id)
  );
  const entreprise = entreprises.find((e) => e.id === form.entrepriseId);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/scenarios"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Scénarios", href: "/admin/scenarios" },
          { label: form.titre || "Scénario" },
        ]}
        title={form.titre || "Scénario"}
      />

      <div className="mb-4 flex justify-end">
        <AdminButton
          onClick={() => {
            updateScenario(form.id, form);
            router.push("/admin/scenarios");
          }}
        >
          Enregistrer la fiche
        </AdminButton>
      </div>

      <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-2">
        <Field label="Titre">
          <input
            className={inputClass}
            value={form.titre}
            onChange={(e) => set("titre", e.target.value)}
          />
        </Field>
        <Field label="Entreprise">
          <select
            className={selectClass}
            value={form.entrepriseId ?? ""}
            onChange={(e) => set("entrepriseId", e.target.value || null)}
          >
            <option value="">— Aucune —</option>
            {entreprises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rôle / compétence travaillée">
          <input
            className={inputClass}
            value={form.competence}
            onChange={(e) => set("competence", e.target.value)}
          />
        </Field>
        <Field label="Secteur">
          <select
            className={selectClass}
            value={form.secteur}
            onChange={(e) => set("secteur", e.target.value)}
          >
            {ADMIN_SECTEURS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Niveau">
          <select
            className={selectClass}
            value={form.niveau}
            onChange={(e) => set("niveau", e.target.value as AdminNiveau)}
          >
            {ADMIN_NIVEAUX.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Durée (jours)">
          <input
            type="number"
            min={1}
            max={30}
            className={inputClass}
            value={form.dureeJours}
            onChange={(e) => set("dureeJours", Number(e.target.value) || 1)}
          />
        </Field>
        <Field label="Statut">
          <select
            className={selectClass}
            value={form.statut}
            onChange={(e) =>
              set("statut", e.target.value as AdminScenarioStatus)
            }
          >
            {ADMIN_STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description" className="lg:col-span-2">
          <textarea
            className={textareaClass}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Personnages liés
        </h2>
        {entreprise ? (
          <p className="mt-1 text-xs text-slate-500">
            Entreprise : {entreprise.nom}
          </p>
        ) : null}
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {linkedPersonnages.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/personnages/${p.id}`}
                className="hover:underline"
              >
                {p.prenom} {p.nom}
              </Link>
              <span className="text-slate-400"> — {p.poste}</span>
            </li>
          ))}
          {linkedPersonnages.length === 0 ? (
            <li className="text-slate-500">Aucun personnage lié.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
