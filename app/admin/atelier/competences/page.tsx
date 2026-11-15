"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  competencePreviewEntries,
  coursPreviewEntries,
  downloadCompetencesTemplate,
  parseCompetencesExcel,
  type CompetenceExcelFields,
  type CoursExcelFields,
} from "@/lib/atelierCompetencesExcel";
import { useAtelierCompetencesStore } from "@/lib/atelierCompetencesStore";

export default function AtelierCompetencesPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    competences,
    cours,
    getCoursForCompetence,
    checkImportLinks,
    validateCompetencesSubmission,
    deleteCompetence,
    toast,
    clearToast,
  } = useAtelierCompetencesStore();

  const [previewCompetences, setPreviewCompetences] = useState<
    CompetenceExcelFields[] | null
  >(null);
  const [previewCours, setPreviewCours] = useState<CoursExcelFields[] | null>(
    null
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof competences>();
    for (const c of competences) {
      const cat = c.categorie.trim() || "Sans catégorie";
      const list = map.get(cat) ?? [];
      list.push(c);
      map.set(cat, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [competences]);

  async function onFileChange(file: File | null) {
    setParseError(null);
    setPreviewCompetences(null);
    setPreviewCours(null);
    if (!file) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const res = parseCompetencesExcel(buf);
      if (!res.ok) {
        setParseError(res.error);
        return;
      }
      const link = checkImportLinks(res.competences, res.cours);
      if (!link.ok) {
        setParseError(link.error);
        return;
      }
      setPreviewCompetences(res.competences);
      setPreviewCours(res.cours);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function confirmSubmit() {
    if (!previewCompetences || !previewCours) return;
    const res = validateCompetencesSubmission(
      previewCompetences,
      previewCours
    );
    if (res.error && res.addedCompetences === 0 && res.addedCours === 0) {
      setParseError(res.error);
      return;
    }
    setPreviewCompetences(null);
    setPreviewCours(null);
    setParseError(null);
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Compétences" },
        ]}
        title="Atelier — Compétences"
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Bibliothèque globale : une compétence (et ses cours) se définit{" "}
        <strong>une fois</strong> ici, pour toutes les entreprises. Import Excel
        unique à 2 onglets (Compétences + Cours). Un nouvel import ajoute sans
        effacer l&apos;existant.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <AdminButton
          type="button"
          onClick={() => downloadCompetencesTemplate()}
        >
          <Download className="h-4 w-4" />
          Télécharger le Template Compétences + Cours
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Importer mon Excel Compétences + Cours
        </AdminButton>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}
      {parseError ? (
        <p className="mb-3 text-sm text-rose-600">{parseError}</p>
      ) : null}

      {previewCompetences && previewCours ? (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Aperçu de l&apos;import
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Voilà les compétences que j&apos;ai comprises, voilà les cours,
            voilà à quelles compétences ils sont liés.
          </p>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">
            Compétences ({previewCompetences.length})
          </h3>
          <div className="mt-2 max-h-[240px] space-y-3 overflow-y-auto">
            {previewCompetences.map((fields, i) => {
              const entries = competencePreviewEntries(fields).filter(
                (e) => e.filled
              );
              return (
                <div
                  key={`${fields["Nom de la compétence"]}-${i}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {fields["Nom de la compétence"]}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {fields["Catégorie"] || "Sans catégorie"}
                    {fields["Type (Transverse ou Ciblée)"]
                      ? ` · ${fields["Type (Transverse ou Ciblée)"]}`
                      : ""}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {entries.slice(0, 4).map((e) => (
                      <li key={e.label}>
                        <span className="font-medium text-slate-500">
                          {e.label} :
                        </span>{" "}
                        {e.value}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <h3 className="mt-5 text-sm font-semibold text-slate-800">
            Cours ({previewCours.length})
          </h3>
          <div className="mt-2 max-h-[240px] space-y-3 overflow-y-auto">
            {previewCours.map((fields, i) => {
              const entries = coursPreviewEntries(fields).filter((e) => e.filled);
              return (
                <div
                  key={`${fields["Titre du cours"]}-${i}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {fields["Titre du cours"]}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-700">
                    Lié à : {fields["Nom de la compétence liée"]}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {entries.slice(0, 4).map((e) => (
                      <li key={e.label}>
                        <span className="font-medium text-slate-500">
                          {e.label} :
                        </span>{" "}
                        {e.value}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {previewCours.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun cours dans ce fichier.</p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <AdminButton type="button" onClick={confirmSubmit}>
              Valider la soumission
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => {
                setPreviewCompetences(null);
                setPreviewCours(null);
              }}
            >
              Annuler
            </AdminButton>
          </div>
        </div>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Bibliothèque de compétences ({competences.length}) · cours ({cours.length})
      </h2>
      {competences.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Aucune compétence pour l&apos;instant. Importez un Excel Compétences +
          Cours.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([categorie, list]) => (
            <section key={categorie}>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                {categorie}
              </h3>
              <div className="space-y-3">
                {list.map((comp) => {
                  const linked = getCoursForCompetence(comp.id);
                  return (
                    <div
                      key={comp.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">
                            {comp.nom}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {comp.type || "Type non renseigné"}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                            {comp.description || "Description non renseignée"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/admin/atelier/competences/${comp.id}`}>
                            <AdminButton variant="secondary" type="button">
                              Voir
                            </AdminButton>
                          </Link>
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
                      </div>
                      {linked.length > 0 ? (
                        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-700">
                          {linked.map((c) => (
                            <li key={c.id} className="flex flex-wrap gap-2">
                              <span className="font-medium">{c.titre}</span>
                              {c.niveau ? (
                                <span className="text-xs text-slate-400">
                                  · {c.niveau}
                                </span>
                              ) : null}
                              {c.description ? (
                                <span className="text-slate-500">
                                  — {c.description}
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                          Aucun cours lié
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
