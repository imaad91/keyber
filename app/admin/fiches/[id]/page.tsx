"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import {
  ADMIN_FICHE_STATUTS,
  FICHE_SECTION_HINT,
  FICHE_SECTION_META,
  ficheFillPercent,
  ficheMissingSections,
  type AdminFicheSections,
  type AdminFicheStatus,
} from "@/lib/adminFiches";
import { useAdminStore } from "@/lib/adminStore";

export default function AdminFicheDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    fiches,
    scenarios,
    entreprises,
    updateFiche,
    generateCoeurFromFiche,
  } = useAdminStore();
  const fiche = fiches.find((f) => f.id === id);
  const [generating, setGenerating] = useState(false);

  const pct = fiche ? ficheFillPercent(fiche) : 0;
  const missing = fiche ? ficheMissingSections(fiche) : [];

  const scenarioOptions = useMemo(
    () => [...scenarios].sort((a, b) => a.order - b.order),
    [scenarios]
  );

  if (!fiche) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Fiche introuvable.{" "}
        <Link href="/admin/fiches" className="underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  function patchSections(partial: Partial<AdminFicheSections>) {
    updateFiche(fiche!.id, {
      sections: { ...fiche!.sections, ...partial },
    });
  }

  function onGenerate() {
    setGenerating(true);
    window.setTimeout(() => {
      const ok = generateCoeurFromFiche(fiche!.id);
      setGenerating(false);
      if (ok) {
        router.push(`/admin/coeur/langage/${fiche!.scenarioId}`);
      }
    }, 600);
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/fiches"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Fiches", href: "/admin/fiches" },
          { label: fiche.titre.replace(/^Fiche\s+/i, "") || fiche.titre },
        ]}
        title={`Fiche — ${fiche.titre.replace(/^Fiche\s+/i, "") || fiche.titre}`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <AdminButton
          onClick={() => {
            updateFiche(fiche.id, {
              titre: fiche.titre,
              scenarioId: fiche.scenarioId,
              entrepriseNom: fiche.entrepriseNom,
              role: fiche.role,
              statut: fiche.statut,
              sections: fiche.sections,
            });
          }}
        >
          Enregistrer la Fiche
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating
            ? "Génération du Cœur en cours…"
            : "Générer le Cœur à partir de cette Fiche"}
        </AdminButton>
        {fiche.coeurGenere && fiche.scenarioId ? (
          <>
            <Link
              href={`/admin/logique/${fiche.scenarioId}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Voir dans Logique
            </Link>
            <Link
              href={`/admin/coeur/langage/${fiche.scenarioId}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Voir dans Langage Cœur
            </Link>
          </>
        ) : null}
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">
            Fiche remplie à {pct}%
            {missing.length > 0
              ? ` — Il manque : ${missing.join(", ")}`
              : " — Toutes les sections sont renseignées"}
          </p>
          <span className="text-xs tabular-nums text-slate-500">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <Field label="Titre">
          <input
            className={inputClass}
            value={fiche.titre}
            onChange={(e) => updateFiche(fiche.id, { titre: e.target.value })}
          />
        </Field>
        <Field label="Scénario lié">
          <select
            className={selectClass}
            value={fiche.scenarioId}
            onChange={(e) => {
              const scn = scenarios.find((s) => s.id === e.target.value);
              const ent = entreprises.find((x) => x.id === scn?.entrepriseId);
              updateFiche(fiche.id, {
                scenarioId: e.target.value,
                entrepriseNom: ent?.nom ?? fiche.entrepriseNom,
                role: scn?.competence || fiche.role,
              });
            }}
          >
            <option value="">— Choisir —</option>
            {scenarioOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Entreprise">
          <input
            className={inputClass}
            value={fiche.entrepriseNom}
            onChange={(e) =>
              updateFiche(fiche.id, { entrepriseNom: e.target.value })
            }
          />
        </Field>
        <Field label="Rôle">
          <input
            className={inputClass}
            value={fiche.role}
            onChange={(e) => updateFiche(fiche.id, { role: e.target.value })}
          />
        </Field>
        <Field label="Statut">
          <select
            className={selectClass}
            value={fiche.statut}
            onChange={(e) =>
              updateFiche(fiche.id, {
                statut: e.target.value as AdminFicheStatus,
              })
            }
          >
            {ADMIN_FICHE_STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="space-y-8">
        {FICHE_SECTION_META.map((sec, i) => (
          <section
            key={sec.key}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Section {i + 1}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {sec.titre}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
              {FICHE_SECTION_HINT}
            </p>
            <textarea
              className={`${textareaClass} mt-4 min-h-[160px]`}
              value={fiche.sections[sec.key]}
              onChange={(e) => patchSections({ [sec.key]: e.target.value })}
              placeholder="Anecdotes, chiffres, exemples vrais…"
            />
          </section>
        ))}
      </div>

      {generating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="rounded-2xl bg-white px-6 py-5 text-sm font-semibold text-slate-900 shadow-lg">
            Génération du Cœur en cours…
          </div>
        </div>
      ) : null}
    </div>
  );
}
