"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import type { GlossaireUsage } from "@/lib/adminGlossaire";
import { useAdminStore } from "@/lib/adminStore";

const USAGE_OPTIONS: GlossaireUsage[] = [
  "Décisions",
  "ERP",
  "Dialogues",
  "Cœur",
  "Compétences",
  "GameState",
  "Workflow",
  "Agents",
];

const USAGE_HREF: Partial<Record<GlossaireUsage, string>> = {
  Décisions: "/admin/atelier/creation",
  ERP: "/erp",
  Dialogues: "/admin/atelier/creation",
  Cœur: "/admin/systeme/coeur",
  Compétences: "/admin/atelier/competences",
  GameState: "/admin/systeme/architecture",
  Workflow: "/admin/systeme/architecture",
  Agents: "/admin/controle/agents",
};

export default function SystèmeGlossaireDetailPage() {
  const params = useParams<{ terme: string }>();
  const termeId = decodeURIComponent(params.terme);
  const router = useRouter();
  const {
    glossaire,
    updateGlossaireTerme,
    createGlossaireTerme,
    deleteGlossaireTerme,
  } = useAdminStore();

  const entry = glossaire.find((t) => t.terme === termeId);

  const [nomLisible, setNomLisible] = useState(entry?.nomLisible ?? "");
  const [definitionPrecise, setDefinitionPrecise] = useState(
    entry?.definitionPrecise ?? ""
  );
  const [definitionCourte, setDefinitionCourte] = useState(
    entry?.definitionCourte ?? ""
  );
  const [exempleConcret, setExempleConcret] = useState(
    entry?.exempleConcret ?? ""
  );
  const [utilisations, setUtilisations] = useState<GlossaireUsage[]>(
    entry?.utilisations ?? []
  );
  const [synonymes, setSynonymes] = useState(
    (entry?.synonymesInterdits ?? []).join(", ")
  );

  useEffect(() => {
    if (!entry) return;
    setNomLisible(entry.nomLisible);
    setDefinitionPrecise(entry.definitionPrecise);
    setDefinitionCourte(entry.definitionCourte);
    setExempleConcret(entry.exempleConcret);
    setUtilisations(entry.utilisations);
    setSynonymes(entry.synonymesInterdits.join(", "));
  }, [entry]);

  if (!entry) {
    return (
      <p className="text-sm text-slate-500">
        Terme introuvable.{" "}
        <Link href="/admin/systeme/glossaire" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  function toggleUsage(u: GlossaireUsage) {
    setUtilisations((cur) =>
      cur.includes(u) ? cur.filter((x) => x !== u) : [...cur, u]
    );
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/systeme/glossaire"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Système", href: "/admin/systeme/coeur" },
          { label: "Glossaire", href: "/admin/systeme/glossaire" },
          { label: entry.terme },
        ]}
        title={`Glossaire — ${entry.terme}`}
      />

      <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        L&apos;IA ne peut pas modifier le Glossaire — lecture seule pour
        l&apos;IA. Les humains enregistrent ici les définitions exactes.
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <AdminButton
          onClick={() => {
            updateGlossaireTerme(entry.terme, {
              nomLisible,
              definitionPrecise,
              definitionCourte: definitionCourte || definitionPrecise,
              exempleConcret,
              utilisations,
              synonymesInterdits: synonymes
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            });
          }}
        >
          <Save className="h-4 w-4" />
          Enregistrer les modifications
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() => {
            const raw = window.prompt(
              "Identifiant technique du nouveau terme (ex: besoin_brut)"
            );
            if (!raw) return;
            const def = window.prompt("Définition précise (obligatoire)");
            if (!def) return;
            const created = createGlossaireTerme({
              terme: raw,
              nomLisible: raw,
              definitionPrecise: def,
            });
            if (created) {
              router.push(
                `/admin/systeme/glossaire/${encodeURIComponent(created.terme)}`
              );
            }
          }}
        >
          <Plus className="h-4 w-4" />
          Ajouter un terme
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() => {
            if (
              !window.confirm(
                `Supprimer « ${entry.terme} » ? Refusé si utilisé dans un Cœur publié.`
              )
            ) {
              return;
            }
            if (deleteGlossaireTerme(entry.terme)) {
              router.push("/admin/systeme/glossaire");
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer ce terme
        </AdminButton>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Terme (identifiant technique, non modifiable)
          </label>
          <p className="mt-2 font-mono text-lg font-semibold text-slate-900">
            {entry.terme}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Nom lisible
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={nomLisible}
            onChange={(e) => setNomLisible(e.target.value)}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Définition précise (obligatoire)
          </label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={definitionPrecise}
            onChange={(e) => setDefinitionPrecise(e.target.value)}
          />
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Définition courte (liste)
          </label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={2}
            value={definitionCourte}
            onChange={(e) => setDefinitionCourte(e.target.value)}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Exemple concret
          </label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={exempleConcret}
            onChange={(e) => setExempleConcret(e.target.value)}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Où il est utilisé
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {USAGE_OPTIONS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => toggleUsage(u)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  utilisations.includes(u)
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
          <ul className="mt-4 space-y-1 text-sm">
            {utilisations.map((u) => (
              <li key={u}>
                {USAGE_HREF[u] ? (
                  <Link
                    href={USAGE_HREF[u]!}
                    className="font-medium text-slate-800 underline"
                  >
                    {u}
                  </Link>
                ) : (
                  u
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Synonymes interdits (séparés par des virgules)
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={synonymes}
            onChange={(e) => setSynonymes(e.target.value)}
            placeholder="amitié, affinité…"
          />
        </section>
      </div>
    </div>
  );
}
