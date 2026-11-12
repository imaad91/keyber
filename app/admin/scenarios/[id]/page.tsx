"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  AdminButton,
  Field,
  PageHeader,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
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
  const { scenarios, entreprises, updateScenario } = useAdminStore();
  const existing = scenarios.find((s) => s.id === id);

  const [form, setForm] = useState<AdminScenario | null>(null);

  useEffect(() => {
    if (existing) setForm({ ...existing });
  }, [existing]);

  if (!existing || !form) {
    return (
      <div>
        <p className="text-sm text-slate-500">Scénario introuvable.</p>
        <Link href="/admin/scenarios" className="mt-2 inline-block text-sm text-slate-900 underline">
          Retour
        </Link>
      </div>
    );
  }

  function set<K extends keyof AdminScenario>(key: K, value: AdminScenario[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  return (
    <div>
      <Link
        href="/admin/scenarios"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Scénarios
      </Link>
      <PageHeader
        title={form.titre || "Scénario"}
        subtitle="Formulaire de paramétrage — n'affecte pas la partie en cours du joueur."
        actions={
          <AdminButton
            onClick={() => {
              updateScenario(form.id, form);
              router.push("/admin/scenarios");
            }}
          >
            Enregistrer
          </AdminButton>
        }
      />

      <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-2">
        <Field label="Titre">
          <input
            className={inputClass}
            value={form.titre}
            onChange={(e) => set("titre", e.target.value)}
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
        <Field label="Compétence travaillée" hint="Ex. Pilotage de production, Négociation…">
          <input
            className={inputClass}
            value={form.competence}
            onChange={(e) => set("competence", e.target.value)}
          />
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
        <Field label="Entreprise liée">
          <select
            className={selectClass}
            value={form.entrepriseId ?? ""}
            onChange={(e) =>
              set("entrepriseId", e.target.value || null)
            }
          >
            <option value="">— Aucune —</option>
            {entreprises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ordre bibliothèque joueur">
          <input
            type="number"
            min={1}
            className={inputClass}
            value={form.order}
            onChange={(e) => set("order", Number(e.target.value) || 1)}
          />
        </Field>
        <Field label="Description" className="lg:col-span-2">
          <textarea
            className={textareaClass}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
