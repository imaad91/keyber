"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  downloadRolesTemplate,
  parseRolesExcel,
  rolePreviewEntries,
  type RoleExcelFields,
} from "@/lib/atelierRolesExcel";
import { useAtelierRolesStore } from "@/lib/atelierRolesStore";
import { relativeTimeFr } from "@/lib/coeurHistory";

export default function AtelierRolesPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { roles, validateRolesSubmission, deleteRole, toast, clearToast } =
    useAtelierRolesStore();

  const [previewRows, setPreviewRows] = useState<RoleExcelFields[] | null>(
    null
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFileChange(file: File | null) {
    setParseError(null);
    setPreviewRows(null);
    if (!file) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const res = parseRolesExcel(buf);
      if (!res.ok) {
        setParseError(res.error);
        return;
      }
      setPreviewRows(res.rows);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function confirmSubmit() {
    if (!previewRows?.length) return;
    const res = validateRolesSubmission(previewRows);
    if (res.error && res.added === 0) {
      setParseError(res.error);
      return;
    }
    setPreviewRows(null);
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
          { label: "Rôles" },
        ]}
        title="Atelier — Rôles"
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Bibliothèque globale : un rôle se définit <strong>une fois</strong>{" "}
        ici, pour toutes les entreprises. Dans Création, on le sélectionne —
        on ne le recrée pas. Import Excel uniquement (pas de saisie manuelle).
        Un nouvel import ajoute des rôles sans effacer les existants.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <AdminButton type="button" onClick={() => downloadRolesTemplate()}>
          <Download className="h-4 w-4" />
          Télécharger le Template Rôles
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Importer mon Excel Rôles
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

      {previewRows ? (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Aperçu de l&apos;import
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Voilà ce que j&apos;ai compris de ton Excel —{" "}
            {previewRows.length} rôle
            {previewRows.length > 1 ? "s" : ""} à ajouter (les noms déjà
            présents seront ignorés).
          </p>
          <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto">
            {previewRows.map((fields, i) => {
              const entries = rolePreviewEntries(fields).filter((e) => e.filled);
              return (
                <div
                  key={`${fields["Nom du rôle"]}-${i}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {fields["Nom du rôle"]}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {entries.slice(0, 6).map((e) => (
                      <li key={e.label}>
                        <span className="font-medium text-slate-500">
                          {e.label} :
                        </span>{" "}
                        {e.value}
                      </li>
                    ))}
                    {entries.length > 6 ? (
                      <li className="text-xs text-slate-400">
                        + {entries.length - 6} autre(s) champ(s)
                      </li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AdminButton type="button" onClick={confirmSubmit}>
              Valider la soumission
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => setPreviewRows(null)}
            >
              Annuler
            </AdminButton>
          </div>
        </div>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Bibliothèque de rôles ({roles.length})
      </h2>
      {roles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Aucun rôle pour l&apos;instant. Importez un Excel Rôles.
        </p>
      ) : (
        <div className="space-y-3">
          {roles.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{r.nom}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {r.description || "Description non renseignée"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  <span className="font-medium">Mission :</span>{" "}
                  {r.mission || "—"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {relativeTimeFr(r.updatedAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/atelier/roles/${r.id}`}>
                  <AdminButton variant="secondary" type="button">
                    Voir
                  </AdminButton>
                </Link>
                <AdminButton
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    if (
                      !window.confirm(`Supprimer le rôle « ${r.nom} » ?`)
                    )
                      return;
                    const res = deleteRole(r.id);
                    if (res.error) window.alert(res.error);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                  Supprimer
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
