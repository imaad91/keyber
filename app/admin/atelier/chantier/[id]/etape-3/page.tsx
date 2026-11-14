"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
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
  CHANTIER_COMPETENCE_TYPE_LABELS,
  useAtelierChantierStore,
  type ChantierCompetence,
  type ChantierCompetenceType,
  type ChantierCours,
} from "@/lib/atelierChantierStore";

type CompForm = {
  nom: string;
  categorie: string;
  description: string;
  type: ChantierCompetenceType;
};

type CoursForm = {
  titre: string;
  contenu: string;
  formule: string;
  exempleChiffre: string;
  erreursFrequentes: string;
};

const emptyComp = (): CompForm => ({
  nom: "",
  categorie: "Logistique",
  description: "",
  type: "ciblee",
});

const emptyCours = (): CoursForm => ({
  titre: "",
  contenu: "",
  formule: "",
  exempleChiffre: "",
  erreursFrequentes: "",
});

export default function ChantierEtape3Page() {
  const { id } = useParams<{ id: string }>();
  const {
    getChantier,
    competencesForChantier,
    listCategories,
    addCategorieCustom,
    createCompetence,
    updateCompetence,
    deleteCompetence,
    createCours,
    updateCours,
    deleteCours,
    toast,
    clearToast,
  } = useAtelierChantierStore();

  const chantier = getChantier(id);
  const competences = competencesForChantier(id);
  const categories = listCategories();

  const [compPanel, setCompPanel] = useState<
    null | { mode: "create" } | { mode: "edit"; comp: ChantierCompetence }
  >(null);
  const [compForm, setCompForm] = useState<CompForm>(emptyComp);
  const [compError, setCompError] = useState<string | null>(null);
  const [newCat, setNewCat] = useState("");

  const [coursPanel, setCoursPanel] = useState<
    | null
    | { mode: "create"; competenceId: string }
    | { mode: "edit"; competenceId: string; cours: ChantierCours }
  >(null);
  const [coursForm, setCoursForm] = useState<CoursForm>(emptyCours);
  const [coursError, setCoursError] = useState<string | null>(null);

  const byCategory = useMemo(() => {
    const map = new Map<string, ChantierCompetence[]>();
    for (const c of competences) {
      const key = c.categorie.trim() || "Sans catégorie";
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b, "fr")
    );
  }, [competences]);

  if (!chantier) {
    return (
      <p className="text-sm text-slate-500">
        Chantier introuvable.{" "}
        <Link href="/admin/atelier/chantier" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const readOnly = chantier.publie;

  function openCreateComp() {
    setCompError(null);
    setNewCat("");
    setCompForm(emptyComp());
    setCompPanel({ mode: "create" });
  }

  function openEditComp(comp: ChantierCompetence) {
    setCompError(null);
    setNewCat("");
    setCompForm({
      nom: comp.nom,
      categorie: comp.categorie,
      description: comp.description,
      type: comp.type,
    });
    setCompPanel({ mode: "edit", comp });
  }

  function submitComp() {
    setCompError(null);
    let categorie = compForm.categorie.trim();
    if (categorie === "__new__") {
      const res = addCategorieCustom(newCat);
      if (res.error) {
        setCompError(res.error);
        return;
      }
      categorie = newCat.trim();
    }
    if (compPanel?.mode === "create") {
      const res = createCompetence({
        chantierId: id,
        nom: compForm.nom,
        categorie,
        description: compForm.description,
        type: compForm.type,
      });
      if ("error" in res) {
        setCompError(res.error);
        return;
      }
      setCompPanel(null);
      return;
    }
    if (compPanel?.mode === "edit") {
      const res = updateCompetence(compPanel.comp.id, {
        nom: compForm.nom,
        categorie,
        description: compForm.description,
        type: compForm.type,
      });
      if (res.error) {
        setCompError(res.error);
        return;
      }
      setCompPanel(null);
    }
  }

  function openCreateCours(competenceId: string) {
    setCoursError(null);
    setCoursForm(emptyCours());
    setCoursPanel({ mode: "create", competenceId });
  }

  function openEditCours(competenceId: string, cours: ChantierCours) {
    setCoursError(null);
    setCoursForm({
      titre: cours.titre,
      contenu: cours.contenu,
      formule: cours.formule,
      exempleChiffre: cours.exempleChiffre,
      erreursFrequentes: cours.erreursFrequentes,
    });
    setCoursPanel({ mode: "edit", competenceId, cours });
  }

  function submitCours() {
    setCoursError(null);
    if (!coursPanel) return;
    if (coursPanel.mode === "create") {
      const res = createCours(coursPanel.competenceId, coursForm);
      if ("error" in res) {
        setCoursError(res.error);
        return;
      }
      setCoursPanel(null);
      return;
    }
    const res = updateCours(
      coursPanel.competenceId,
      coursPanel.cours.id,
      coursForm
    );
    if (res.error) {
      setCoursError(res.error);
      return;
    }
    setCoursPanel(null);
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref={`/admin/atelier/chantier/${id}`}
        backLabel="← Retour au Chantier"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/chantier" },
          { label: "Chantier", href: `/admin/atelier/chantier/${id}` },
          { label: "Étape 3" },
        ]}
        title={`Étape 3 — Compétences + Cours · ${chantier.nom}`}
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Brouillon du Chantier uniquement — pas encore visible dans Atelier →
        Compétences. Aucun cours inventé : vous saisissez vos connaissances.
      </p>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          Compétences
        </h2>
        {!readOnly ? (
          <AdminButton type="button" onClick={openCreateComp}>
            <Plus className="h-4 w-4" />
            Ajouter une compétence
          </AdminButton>
        ) : (
          <p className="text-xs text-slate-500">
            Chantier publié — consultation seule
          </p>
        )}
      </div>

      {byCategory.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Aucune compétence pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-8">
          {byCategory.map(([categorie, comps]) => (
            <section key={categorie}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {categorie}
              </h3>
              <div className="space-y-4">
                {comps.map((comp) => (
                  <div
                    key={comp.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">
                          {comp.nom}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Type :{" "}
                          {CHANTIER_COMPETENCE_TYPE_LABELS[comp.type]}
                        </p>
                        {comp.description ? (
                          <p className="mt-2 text-sm text-slate-600">
                            {comp.description}
                          </p>
                        ) : null}
                      </div>
                      {!readOnly ? (
                        <div className="flex gap-1">
                          <AdminButton
                            variant="ghost"
                            type="button"
                            onClick={() => openEditComp(comp)}
                          >
                            <Pencil className="h-4 w-4" />
                            Modifier
                          </AdminButton>
                          <AdminButton
                            variant="ghost"
                            type="button"
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `Supprimer la compétence « ${comp.nom} » et ses cours ?`
                                )
                              )
                                return;
                              const res = deleteCompetence(comp.id);
                              if (res.error) window.alert(res.error);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                            Supprimer
                          </AdminButton>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          Cours autour de cette compétence
                        </p>
                        {!readOnly ? (
                          <AdminButton
                            variant="secondary"
                            type="button"
                            onClick={() => openCreateCours(comp.id)}
                          >
                            <Plus className="h-4 w-4" />
                            Ajouter un cours
                          </AdminButton>
                        ) : null}
                      </div>
                      {comp.cours.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          Aucun cours — ajoutez-en un si besoin.
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {comp.cours.map((cours) => (
                            <li
                              key={cours.id}
                              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-slate-900">
                                    {cours.titre}
                                  </p>
                                  {cours.contenu ? (
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                                      {cours.contenu}
                                    </p>
                                  ) : null}
                                  {cours.formule ? (
                                    <p className="mt-2 text-xs text-slate-500">
                                      <span className="font-medium">
                                        Formule :
                                      </span>{" "}
                                      {cours.formule}
                                    </p>
                                  ) : null}
                                  {cours.exempleChiffre ? (
                                    <p className="mt-1 text-xs text-slate-500">
                                      <span className="font-medium">
                                        Exemple chiffré :
                                      </span>{" "}
                                      {cours.exempleChiffre}
                                    </p>
                                  ) : null}
                                  {cours.erreursFrequentes ? (
                                    <p className="mt-1 text-xs text-slate-500">
                                      <span className="font-medium">
                                        Erreurs fréquentes :
                                      </span>{" "}
                                      {cours.erreursFrequentes}
                                    </p>
                                  ) : null}
                                </div>
                                {!readOnly ? (
                                  <div className="flex gap-1">
                                    <AdminButton
                                      variant="ghost"
                                      type="button"
                                      onClick={() =>
                                        openEditCours(comp.id, cours)
                                      }
                                    >
                                      <Pencil className="h-4 w-4" />
                                      Modifier
                                    </AdminButton>
                                    <AdminButton
                                      variant="ghost"
                                      type="button"
                                      onClick={() => {
                                        if (
                                          !window.confirm(
                                            `Supprimer le cours « ${cours.titre} » ?`
                                          )
                                        )
                                          return;
                                        const res = deleteCours(
                                          comp.id,
                                          cours.id
                                        );
                                        if (res.error)
                                          window.alert(res.error);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-rose-600" />
                                      Supprimer
                                    </AdminButton>
                                  </div>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Panel compétence */}
      {compPanel ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {compPanel.mode === "create"
                ? "Ajouter une compétence"
                : "Modifier la compétence"}
            </h3>
            <div className="mt-4 space-y-4">
              <Field label="Nom *">
                <input
                  className={inputClass}
                  value={compForm.nom}
                  onChange={(e) =>
                    setCompForm((f) => ({ ...f, nom: e.target.value }))
                  }
                  placeholder="Ex. Gestion de la chaîne du froid"
                />
              </Field>
              <Field label="Catégorie *">
                <select
                  className={selectClass}
                  value={
                    compForm.categorie === "__new__"
                      ? "__new__"
                      : categories.includes(compForm.categorie)
                        ? compForm.categorie
                        : categories[0] ?? "__new__"
                  }
                  onChange={(e) =>
                    setCompForm((f) => ({ ...f, categorie: e.target.value }))
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__new__">
                    + Créer une nouvelle catégorie…
                  </option>
                </select>
              </Field>
              {compForm.categorie === "__new__" ? (
                <Field label="Nouvelle catégorie *">
                  <input
                    className={inputClass}
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    placeholder="Nom de la catégorie"
                  />
                </Field>
              ) : null}
              <Field label="Description">
                <textarea
                  className={textareaClass}
                  value={compForm.description}
                  onChange={(e) =>
                    setCompForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Type *">
                <select
                  className={selectClass}
                  value={compForm.type}
                  onChange={(e) =>
                    setCompForm((f) => ({
                      ...f,
                      type: e.target.value as ChantierCompetenceType,
                    }))
                  }
                >
                  <option value="transverse">Transverse</option>
                  <option value="ciblee">Ciblée</option>
                </select>
              </Field>
              {compError ? (
                <p className="text-sm text-rose-600">{compError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => setCompPanel(null)}
              >
                Annuler
              </AdminButton>
              <AdminButton type="button" onClick={submitComp}>
                Enregistrer
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {/* Panel cours */}
      {coursPanel ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {coursPanel.mode === "create"
                ? "Ajouter un cours"
                : "Modifier le cours"}
            </h3>
            <div className="mt-4 space-y-4">
              <Field label="Titre *">
                <input
                  className={inputClass}
                  value={coursForm.titre}
                  onChange={(e) =>
                    setCoursForm((f) => ({ ...f, titre: e.target.value }))
                  }
                />
              </Field>
              <Field label="Contenu">
                <textarea
                  className={textareaClass}
                  value={coursForm.contenu}
                  onChange={(e) =>
                    setCoursForm((f) => ({ ...f, contenu: e.target.value }))
                  }
                />
              </Field>
              <Field label="Formule">
                <textarea
                  className={textareaClass}
                  value={coursForm.formule}
                  onChange={(e) =>
                    setCoursForm((f) => ({ ...f, formule: e.target.value }))
                  }
                />
              </Field>
              <Field label="Exemple chiffré">
                <textarea
                  className={textareaClass}
                  value={coursForm.exempleChiffre}
                  onChange={(e) =>
                    setCoursForm((f) => ({
                      ...f,
                      exempleChiffre: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Erreurs fréquentes">
                <textarea
                  className={textareaClass}
                  value={coursForm.erreursFrequentes}
                  onChange={(e) =>
                    setCoursForm((f) => ({
                      ...f,
                      erreursFrequentes: e.target.value,
                    }))
                  }
                />
              </Field>
              {coursError ? (
                <p className="text-sm text-rose-600">{coursError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => setCoursPanel(null)}
              >
                Annuler
              </AdminButton>
              <AdminButton type="button" onClick={submitCours}>
                Enregistrer
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
