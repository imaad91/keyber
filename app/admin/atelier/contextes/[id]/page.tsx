"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import {
  isRoleUsedInPlayedScenario,
  useAtelierStore,
  type AtelierRole,
} from "@/lib/atelierStore";

type RoleForm = {
  nom: string;
  description: string;
  responsabilites: string;
  infosErp: string;
  competenceIds: string[];
};

const emptyRoleForm = (): RoleForm => ({
  nom: "",
  description: "",
  responsabilites: "",
  infosErp: "",
  competenceIds: [],
});

export default function AtelierContexteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getContexte,
    updateContexte,
    secteurs,
    getSecteur,
    rolesForContexte,
    competencesForContexte,
    createRole,
    updateRole,
    deleteRole,
    scenarios,
    toast,
    clearToast,
  } = useAtelierStore();
  const ctx = getContexte(id);
  const roles = rolesForContexte(id);
  const competences = competencesForContexte(id);

  const [nom, setNom] = useState("");
  const [secteurId, setSecteurId] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [stock, setStock] = useState("");
  const [contrats, setContrats] = useState("");
  const [comptabilite, setComptabilite] = useState("");
  const [problematiques, setProblematiques] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [rolePanel, setRolePanel] = useState<
    null | { mode: "create" } | { mode: "edit"; role: AtelierRole }
  >(null);
  const [roleForm, setRoleForm] = useState<RoleForm>(emptyRoleForm);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    if (!ctx) return;
    setNom(ctx.nom);
    setSecteurId(ctx.secteurId);
    setOrganisation(ctx.organisation);
    setStock(ctx.stock);
    setContrats(ctx.contrats);
    setComptabilite(ctx.comptabilite);
    setProblematiques(ctx.problematiques);
  }, [ctx]);

  if (!ctx) {
    return (
      <p className="text-sm text-slate-500">
        Contexte introuvable.{" "}
        <Link href="/admin/atelier/contextes" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const secteur = secteurId ? getSecteur(secteurId) : undefined;

  function openCreateRole() {
    setRoleError(null);
    setRoleForm(emptyRoleForm());
    setRolePanel({ mode: "create" });
  }

  function openEditRole(role: AtelierRole) {
    setRoleError(null);
    setRoleForm({
      nom: role.nom,
      description: role.description,
      responsabilites: role.responsabilites,
      infosErp: role.infosErp,
      competenceIds: [...role.competenceIds],
    });
    setRolePanel({ mode: "edit", role });
  }

  function toggleCompetence(cid: string) {
    setRoleForm((f) => ({
      ...f,
      competenceIds: f.competenceIds.includes(cid)
        ? f.competenceIds.filter((x) => x !== cid)
        : [...f.competenceIds, cid],
    }));
  }

  function submitRole() {
    setRoleError(null);
    if (rolePanel?.mode === "create") {
      const res = createRole({
        contexteId: id,
        ...roleForm,
      });
      if ("error" in res) {
        setRoleError(res.error);
        return;
      }
      setRolePanel(null);
      return;
    }
    if (rolePanel?.mode === "edit") {
      const res = updateRole(rolePanel.role.id, roleForm);
      if (res.error) {
        setRoleError(res.error);
        return;
      }
      setRolePanel(null);
    }
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/contextes"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Contextes", href: "/admin/atelier/contextes" },
          { label: ctx.nom },
        ]}
        title={ctx.nom}
      />

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4">
        <AdminButton
          onClick={() => {
            setSaveError(null);
            const res = updateContexte(id, {
              nom,
              secteurId,
              organisation,
              stock,
              contrats,
              comptabilite,
              problematiques,
            });
            if (res.error) setSaveError(res.error);
          }}
        >
          Enregistrer
        </AdminButton>
        {saveError ? (
          <p className="mt-2 text-sm text-rose-600">{saveError}</p>
        ) : null}
      </div>

      <div className="space-y-5">
        <Field label="Nom">
          <input
            className={inputClass}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </Field>
        <Field
          label="Secteur d'activité *"
          hint={
            secteurs.length === 0
              ? "Créez un secteur depuis la liste des contextes"
              : undefined
          }
        >
          <select
            className={selectClass}
            value={secteurId}
            onChange={(e) => setSecteurId(e.target.value)}
            required
          >
            <option value="">Choisir un secteur…</option>
            {secteurs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>
          {secteur?.contraintes ? (
            <p className="mt-1 text-xs text-slate-500">
              Contraintes du secteur : {secteur.contraintes}
            </p>
          ) : null}
        </Field>
        <Field
          label="Organisation"
          hint="Organigramme, qui fait quoi"
        >
          <textarea
            className={textareaClass}
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        </Field>
        <Field label="Stock" hint="Quantités réelles, kg / unités">
          <textarea
            className={textareaClass}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </Field>
        <Field label="Contrats" hint="Clients, délais, pénalités">
          <textarea
            className={textareaClass}
            value={contrats}
            onChange={(e) => setContrats(e.target.value)}
          />
        </Field>
        <Field label="Comptabilité" hint="Trésorerie, marges, coûts">
          <textarea
            className={textareaClass}
            value={comptabilite}
            onChange={(e) => setComptabilite(e.target.value)}
          />
        </Field>
        <Field
          label="Problématiques"
          hint="Tensions, machines en panne, fournisseur en retard"
        >
          <textarea
            className={textareaClass}
            value={problematiques}
            onChange={(e) => setProblematiques(e.target.value)}
          />
        </Field>
      </div>

      {/* Rôles jouables */}
      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Rôles jouables dans ce contexte
          </h2>
          <AdminButton type="button" onClick={openCreateRole}>
            <Plus className="h-4 w-4" />
            Ajouter un rôle
          </AdminButton>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Aucun rôle par défaut — c&apos;est vous qui les définissez pour ce
          contexte.
        </p>

        {roles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Aucun rôle jouable pour l&apos;instant.
          </p>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => {
              const locked = isRoleUsedInPlayedScenario(role.id, scenarios);
              const linked = competences.filter((c) =>
                role.competenceIds.includes(c.id)
              );
              return (
                <div
                  key={role.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{role.nom}</p>
                      {role.description ? (
                        <p className="mt-1 text-sm text-slate-600">
                          {role.description}
                        </p>
                      ) : null}
                      {role.responsabilites ? (
                        <p className="mt-2 text-xs text-slate-500">
                          <span className="font-medium">Responsabilités :</span>{" "}
                          {role.responsabilites}
                        </p>
                      ) : null}
                      {role.infosErp ? (
                        <p className="mt-1 text-xs text-slate-500">
                          <span className="font-medium">
                            Infos accessibles dans l&apos;ERP :
                          </span>{" "}
                          {role.infosErp}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-slate-500">
                        <span className="font-medium">Compétences liées :</span>{" "}
                        {linked.length
                          ? linked.map((c) => c.nom).join(", ")
                          : "—"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <AdminButton
                        variant="ghost"
                        type="button"
                        onClick={() => openEditRole(role)}
                        aria-label="Modifier le rôle"
                      >
                        <Pencil className="h-4 w-4" />
                        Modifier
                      </AdminButton>
                      <AdminButton
                        variant="ghost"
                        type="button"
                        disabled={locked}
                        title={
                          locked
                            ? "Impossible : rôle utilisé dans un scénario joué"
                            : "Supprimer"
                        }
                        onClick={() => {
                          if (locked) return;
                          if (
                            !window.confirm(
                              `Supprimer le rôle « ${role.nom} » ?`
                            )
                          )
                            return;
                          const res = deleteRole(role.id);
                          if (res.error) window.alert(res.error);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                        Supprimer
                      </AdminButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {rolePanel ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {rolePanel.mode === "create"
                ? "Ajouter un rôle"
                : "Modifier le rôle"}
            </h3>
            <div className="mt-4 space-y-4">
              <Field label="Nom du rôle *">
                <input
                  className={inputClass}
                  value={roleForm.nom}
                  onChange={(e) =>
                    setRoleForm((f) => ({ ...f, nom: e.target.value }))
                  }
                  placeholder="Ex. Responsable Planification"
                />
              </Field>
              <Field label="Description">
                <textarea
                  className={textareaClass}
                  value={roleForm.description}
                  onChange={(e) =>
                    setRoleForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Responsabilités">
                <textarea
                  className={textareaClass}
                  value={roleForm.responsabilites}
                  onChange={(e) =>
                    setRoleForm((f) => ({
                      ...f,
                      responsabilites: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Infos accessibles dans l'ERP">
                <textarea
                  className={textareaClass}
                  value={roleForm.infosErp}
                  onChange={(e) =>
                    setRoleForm((f) => ({ ...f, infosErp: e.target.value }))
                  }
                />
              </Field>
              <Field
                label="Compétences liées"
                hint="Parmi les compétences de ce contexte"
              >
                {competences.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Aucune compétence dans ce contexte pour l&apos;instant.
                  </p>
                ) : (
                  <ul className="space-y-2 rounded-lg border border-slate-200 p-3">
                    {competences.map((c) => (
                      <li key={c.id}>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                          <input
                            type="checkbox"
                            checked={roleForm.competenceIds.includes(c.id)}
                            onChange={() => toggleCompetence(c.id)}
                          />
                          {c.nom}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>
              {roleError ? (
                <p className="text-sm text-rose-600">{roleError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => setRolePanel(null)}
              >
                Annuler
              </AdminButton>
              <AdminButton type="button" onClick={submitRole}>
                Enregistrer
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
