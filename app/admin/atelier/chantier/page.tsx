"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
} from "@/components/admin/AdminPrimitives";
import {
  countEtapesValidees,
  useAtelierChantierStore,
} from "@/lib/atelierChantierStore";
import { useAtelierStore } from "@/lib/atelierStore";
import { relativeTimeFr } from "@/lib/coeurHistory";

export default function AtelierChantierListPage() {
  const router = useRouter();
  const { chantiers, createChantier, deleteChantier, toast, clearToast } =
    useAtelierChantierStore();
  const { secteurs, getSecteur } = useAtelierStore();

  const [showCreate, setShowCreate] = useState(false);
  const [nom, setNom] = useState("");
  const [secteurId, setSecteurId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    const res = createChantier({ nom, secteurId });
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setShowCreate(false);
    setNom("");
    setSecteurId("");
    router.push(`/admin/atelier/chantier/${res.id}`);
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/chantier" },
          { label: "Chantier / Création" },
        ]}
        title="Atelier — Chantier / Création"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          Un chantier = la création d&apos;un nouveau contexte d&apos;entreprise,
          en 6 étapes. Aucun contenu métier inventé ici — vous saisissez tout.
        </p>
        <AdminButton
          onClick={() => {
            setError(null);
            setNom("");
            setSecteurId(secteurs[0]?.id ?? "");
            setShowCreate(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Créer un nouveau Chantier
        </AdminButton>
      </div>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      {chantiers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Aucun chantier pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-3">
          {chantiers.map((c) => {
            const secteur = c.secteurId ? getSecteur(c.secteurId) : undefined;
            const done = countEtapesValidees(c);
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{c.nom}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Secteur : {secteur?.nom ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Créé {relativeTimeFr(c.createdAt)}
                    {c.publie ? " · Publié" : ""}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Progression : {done} étape{done > 1 ? "s" : ""} validée
                    {done > 1 ? "s" : ""} sur 6
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/atelier/chantier/${c.id}`}>
                    <AdminButton variant="secondary" type="button">
                      Ouvrir
                    </AdminButton>
                  </Link>
                  <AdminButton
                    variant="ghost"
                    type="button"
                    disabled={c.publie}
                    title={
                      c.publie
                        ? "Impossible : chantier déjà publié"
                        : "Supprimer"
                    }
                    onClick={() => {
                      if (c.publie) return;
                      if (
                        !window.confirm(
                          `Supprimer le chantier « ${c.nom} » ?`
                        )
                      )
                        return;
                      const res = deleteChantier(c.id);
                      if (res.error) window.alert(res.error);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    Supprimer
                  </AdminButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Créer un nouveau Chantier
            </h3>
            <div className="mt-4 space-y-4">
              <Field label="Nom du contexte à créer *">
                <input
                  className={inputClass}
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex. AgriBio"
                />
              </Field>
              <Field label="Secteur *">
                <select
                  className={selectClass}
                  value={secteurId}
                  onChange={(e) => setSecteurId(e.target.value)}
                >
                  <option value="">Choisir un secteur…</option>
                  {secteurs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </Field>
              {secteurs.length === 0 ? (
                <p className="text-sm text-amber-700">
                  Créez d&apos;abord un secteur dans Atelier → Contextes.
                </p>
              ) : null}
              {error ? (
                <p className="text-sm text-rose-600">{error}</p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => setShowCreate(false)}
              >
                Annuler
              </AdminButton>
              <AdminButton
                type="button"
                onClick={submit}
                disabled={secteurs.length === 0}
              >
                Créer
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
