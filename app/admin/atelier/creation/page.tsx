"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  downloadContexteTemplate,
  fieldsPreviewEntries,
  parseContexteExcel,
  type ContexteExcelFields,
} from "@/lib/atelierCreationExcel";
import {
  creationPendingItems,
  creationProgress,
  creationVersionLabel,
  useAtelierCreationStore,
} from "@/lib/atelierCreationStore";
import { relativeTimeFr } from "@/lib/coeurHistory";

export default function AtelierCreationPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { creations, validateExcelSubmission, deleteCreation, toast, clearToast } =
    useAtelierCreationStore();

  const [preview, setPreview] = useState<ContexteExcelFields | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFileChange(file: File | null) {
    setParseError(null);
    setPreview(null);
    if (!file) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const res = parseContexteExcel(buf);
      if (!res.ok) {
        setParseError(res.error);
        return;
      }
      setPreview(res.fields);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function confirmSubmit() {
    if (!preview) return;
    const res = validateExcelSubmission(preview);
    if ("error" in res) {
      setParseError(res.error);
      return;
    }
    setPreview(null);
    router.push(`/admin/atelier/creation/${res.id}`);
  }

  const previewEntries = preview ? fieldsPreviewEntries(preview) : [];
  const filledCount = previewEntries.filter((e) => e.filled).length;

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Création" },
        ]}
        title="Atelier — Création"
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Vous ne remplissez jamais les champs ici. Vous téléchargez le template
        Excel, vous le remplissez, vous l&apos;importez, vous validez. C&apos;est
        la seule façon de créer un contexte. Pas encore dans le Book tant que
        le prototype n&apos;est pas validé.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <AdminButton type="button" onClick={() => downloadContexteTemplate()}>
          <Download className="h-4 w-4" />
          Télécharger le Template Contexte
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Importer mon Excel Contexte
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

      {/* Aperçu import */}
      {preview ? (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Aperçu de l&apos;import
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Voilà ce que j&apos;ai compris de ton Excel, voilà les champs que
            je vais remplir. ({filledCount} champ
            {filledCount > 1 ? "s" : ""} renseigné
            {filledCount > 1 ? "s" : ""} sur {previewEntries.length})
          </p>
          <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3">
            {previewEntries.map((e) => (
              <div
                key={e.label}
                className="grid gap-1 border-b border-slate-100 pb-2 text-sm last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
              >
                <p className="font-medium text-slate-700">{e.label}</p>
                <p
                  className={
                    e.filled
                      ? "whitespace-pre-wrap text-slate-900"
                      : "text-slate-400"
                  }
                >
                  {e.filled ? e.value : "— (vide)"}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AdminButton type="button" onClick={confirmSubmit}>
              Valider la soumission
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => setPreview(null)}
            >
              Annuler
            </AdminButton>
          </div>
        </div>
      ) : null}

      {/* Liste des créations */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Créations en cours
      </h2>
      {creations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Aucune création pour l&apos;instant. Importez un Excel Contexte pour
          commencer.
        </p>
      ) : (
        <div className="space-y-3">
          {creations.map((c) => {
            const { done, total } = creationProgress(c);
            const pending = creationPendingItems(c);
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {creationVersionLabel(c)}
                    {c.dansBook ? (
                      <span className="ml-2 text-xs font-normal text-emerald-700">
                        · Book
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Secteur : {c.secteur || "—"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Progression : {done} / {total} jalons
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    En attente :{" "}
                    {pending.length ? pending.join(" · ") : "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {relativeTimeFr(c.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/atelier/creation/${c.id}`}>
                    <AdminButton variant="secondary" type="button">
                      Ouvrir
                    </AdminButton>
                  </Link>
                  <AdminButton
                    variant="ghost"
                    type="button"
                    disabled={c.dansBook}
                    title={
                      c.dansBook
                        ? "Impossible : déjà dans le Book"
                        : "Supprimer"
                    }
                    onClick={() => {
                      if (c.dansBook) return;
                      if (
                        !window.confirm(
                          `Supprimer la création « ${c.nom} » ?`
                        )
                      )
                        return;
                      const res = deleteCreation(c.id);
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
    </div>
  );
}
