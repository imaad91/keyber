"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { useAtelierStore } from "@/lib/atelierStore";
import { relativeTimeFr } from "@/lib/coeurHistory";

type SecteurForm = {
  nom: string;
  description: string;
  contraintes: string;
};

const emptySecteurForm = (): SecteurForm => ({
  nom: "",
  description: "",
  contraintes: "",
});

export default function AtelierContextesPage() {
  const router = useRouter();
  const {
    secteurs,
    contextes,
    createSecteur,
    updateSecteur,
    deleteSecteur,
    createContexte,
    getSecteur,
    contextesUsingSecteur,
    toast,
    clearToast,
  } = useAtelierStore();

  const [showCreateContexte, setShowCreateContexte] = useState(false);
  const [newContexteNom, setNewContexteNom] = useState("");
  const [newContexteSecteurId, setNewContexteSecteurId] = useState("");
  const [contexteError, setContexteError] = useState<string | null>(null);

  const [secteurPanel, setSecteurPanel] = useState<
    null | { mode: "create" } | { mode: "edit"; id: string }
  >(null);
  const [secteurForm, setSecteurForm] = useState<SecteurForm>(emptySecteurForm);
  const [secteurError, setSecteurError] = useState<string | null>(null);

  function openCreateSecteur() {
    setSecteurError(null);
    setSecteurForm(emptySecteurForm());
    setSecteurPanel({ mode: "create" });
  }

  function openEditSecteur(id: string) {
    const s = getSecteur(id);
    if (!s) return;
    setSecteurError(null);
    setSecteurForm({
      nom: s.nom,
      description: s.description,
      contraintes: s.contraintes,
    });
    setSecteurPanel({ mode: "edit", id });
  }

  function submitSecteur() {
    setSecteurError(null);
    if (secteurPanel?.mode === "create") {
      const res = createSecteur(secteurForm);
      if ("error" in res) {
        setSecteurError(res.error);
        return;
      }
      setSecteurPanel(null);
      return;
    }
    if (secteurPanel?.mode === "edit") {
      const res = updateSecteur(secteurPanel.id, secteurForm);
      if (res.error) {
        setSecteurError(res.error);
        return;
      }
      setSecteurPanel(null);
    }
  }

  function submitContexte() {
    setContexteError(null);
    const res = createContexte({
      nom: newContexteNom,
      secteurId: newContexteSecteurId,
    });
    if ("error" in res) {
      setContexteError(res.error);
      return;
    }
    setShowCreateContexte(false);
    setNewContexteNom("");
    setNewContexteSecteurId("");
    router.push(`/admin/atelier/contextes/${res.id}`);
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Contextes d'entreprise" },
        ]}
        title="Atelier — Contextes d'entreprise"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          Couche 1 — la vraie entreprise, créée une fois, réutilisée par
          plusieurs scénarios. Secteurs, organisation, stock, contrats,
          comptabilité, problématiques, rôles jouables.
        </p>
        <div className="flex flex-wrap gap-2">
          <AdminButton variant="secondary" onClick={openCreateSecteur}>
            <Plus className="h-4 w-4" />
            Créer un secteur
          </AdminButton>
          <AdminButton
            onClick={() => {
              setContexteError(null);
              setNewContexteNom("");
              setNewContexteSecteurId(secteurs[0]?.id ?? "");
              setShowCreateContexte(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Créer un contexte
          </AdminButton>
        </div>
      </div>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      {/* Secteurs */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Secteurs d&apos;activité
        </h2>
        {secteurs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Aucun secteur pour l&apos;instant. Créez-en un avant d&apos;ajouter
            un contexte.
          </p>
        ) : (
          <div className="space-y-2">
            {secteurs.map((s) => {
              const used = contextesUsingSecteur(s.id).length;
              return (
                <div
                  key={s.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{s.nom}</p>
                    {s.description ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {s.description}
                      </p>
                    ) : null}
                    {s.contraintes ? (
                      <p className="mt-1 text-xs text-slate-500">
                        <span className="font-medium">Contraintes :</span>{" "}
                        {s.contraintes}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-400">
                      {used === 0
                        ? "Aucun contexte"
                        : `${used} contexte${used > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <AdminButton
                      variant="ghost"
                      type="button"
                      onClick={() => openEditSecteur(s.id)}
                      aria-label="Modifier le secteur"
                    >
                      <Pencil className="h-4 w-4" />
                    </AdminButton>
                    <AdminButton
                      variant="ghost"
                      type="button"
                      disabled={used > 0}
                      title={
                        used > 0
                          ? "Impossible : un contexte utilise ce secteur"
                          : "Supprimer"
                      }
                      onClick={() => {
                        if (used > 0) return;
                        if (
                          !window.confirm(
                            `Supprimer le secteur « ${s.nom} » ?`
                          )
                        )
                          return;
                        const res = deleteSecteur(s.id);
                        if (res.error) window.alert(res.error);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </AdminButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Contextes */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Contextes d&apos;entreprise
        </h2>
        <div className="space-y-3">
          {contextes.map((c) => {
            const secteur = c.secteurId ? getSecteur(c.secteurId) : undefined;
            return (
              <Link
                key={c.id}
                href={`/admin/atelier/contextes/${c.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{c.nom}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Secteur : {secteur?.nom ?? "À renseigner"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {c.organisation || "Organisation à renseigner"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {relativeTimeFr(c.updatedAt)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Panel secteur */}
      {secteurPanel ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {secteurPanel.mode === "create"
                ? "Créer un secteur"
                : "Modifier le secteur"}
            </h3>
            <div className="mt-4 space-y-4">
              <Field label="Nom *">
                <input
                  className={inputClass}
                  value={secteurForm.nom}
                  onChange={(e) =>
                    setSecteurForm((f) => ({ ...f, nom: e.target.value }))
                  }
                  placeholder="Ex. Agroalimentaire"
                />
              </Field>
              <Field label="Description">
                <textarea
                  className={textareaClass}
                  value={secteurForm.description}
                  onChange={(e) =>
                    setSecteurForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field
                label="Contraintes spécifiques du secteur"
                hint="Ex. chaîne du froid, dates de péremption, normes sanitaires"
              >
                <textarea
                  className={textareaClass}
                  value={secteurForm.contraintes}
                  onChange={(e) =>
                    setSecteurForm((f) => ({
                      ...f,
                      contraintes: e.target.value,
                    }))
                  }
                />
              </Field>
              {secteurError ? (
                <p className="text-sm text-rose-600">{secteurError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => setSecteurPanel(null)}
              >
                Annuler
              </AdminButton>
              <AdminButton type="button" onClick={submitSecteur}>
                Enregistrer
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {/* Panel contexte */}
      {showCreateContexte ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Créer un contexte
            </h3>
            <div className="mt-4 space-y-4">
              <Field label="Nom *">
                <input
                  className={inputClass}
                  value={newContexteNom}
                  onChange={(e) => setNewContexteNom(e.target.value)}
                  placeholder="Ex. AgriBio"
                />
              </Field>
              <Field label="Secteur d'activité *">
                <select
                  className={selectClass}
                  value={newContexteSecteurId}
                  onChange={(e) => setNewContexteSecteurId(e.target.value)}
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
                  Créez d&apos;abord un secteur avant de créer un contexte.
                </p>
              ) : null}
              {contexteError ? (
                <p className="text-sm text-rose-600">{contexteError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => setShowCreateContexte(false)}
              >
                Annuler
              </AdminButton>
              <AdminButton
                type="button"
                onClick={submitContexte}
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
