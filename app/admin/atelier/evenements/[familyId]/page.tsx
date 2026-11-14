"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  eventPreviewEntries,
  parseEventsExcel,
  type EventExcelFields,
} from "@/lib/atelierEventsExcel";
import { useAtelierEventsStore } from "@/lib/atelierEventsStore";

export default function AtelierEvenementsDetailPage() {
  const { familyId } = useParams<{ familyId: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    getEventsForFamily,
    validateEventsSubmission,
    deleteEvent,
    toast,
    clearToast,
  } = useAtelierEventsStore();

  const events = getEventsForFamily(familyId);
  const entrepriseNom = events[0]?.entrepriseNom || "Entreprise";

  useEffect(() => {
    clearToast();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear stale toast once on mount
  }, []);

  const [preview, setPreview] = useState<EventExcelFields[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Aucun événement pour cette entreprise.{" "}
        <Link href="/admin/atelier/evenements" className="underline">
          Retour au listing
        </Link>
      </p>
    );
  }

  async function onFileChange(file: File | null) {
    setParseError(null);
    setPreview(null);
    if (!file) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const res = parseEventsExcel(buf);
      if (!res.ok) {
        setParseError(res.error);
        return;
      }
      setPreview(res.rows);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function confirmSubmit() {
    if (!preview?.length) return;
    const res = validateEventsSubmission(familyId, entrepriseNom, preview);
    if (res.error && res.added === 0) {
      setParseError(res.error);
      return;
    }
    setPreview(null);
    setParseError(null);
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/evenements"
        backLabel="← Retour aux Événements"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Événements", href: "/admin/atelier/evenements" },
          { label: entrepriseNom },
        ]}
        title={`Événements — ${entrepriseNom}`}
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Uniquement les événements de <strong>{entrepriseNom}</strong>. Pas
        ceux d&apos;une autre entreprise.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Réimporter un nouvel Excel Événements
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

      {preview ? (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">Aperçu de l&apos;import</h2>
          <p className="mt-1 text-sm text-slate-600">
            {preview.length} événement(s) à ajouter pour {entrepriseNom}{" "}
            (additif).
          </p>
          <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto">
            {preview.map((f, i) => (
              <p key={`${f["Nom"]}-${i}`} className="text-sm">
                · {f["Nom"]}
              </p>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
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

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Liste ({events.length})
      </h2>
      <div className="space-y-3">
        {events.map((ev) => {
          const open = openId === ev.id;
          const entries = eventPreviewEntries(ev.fields);
          return (
            <div
              key={ev.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{ev.nom}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {ev.type || "Type —"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {ev.description || "—"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={() => setOpenId(open ? null : ev.id)}
                  >
                    {open ? "Masquer" : "Voir"}
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Supprimer l'événement « ${ev.nom} » ?`
                        )
                      )
                        return;
                      const res = deleteEvent(ev.id, familyId);
                      if (res.error) window.alert(res.error);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    Supprimer
                  </AdminButton>
                </div>
              </div>
              {open ? (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {entries.map((e) => (
                    <div key={e.label}>
                      <p className="text-xs font-medium text-slate-500">
                        {e.label}
                      </p>
                      <p
                        className={
                          e.filled
                            ? "mt-0.5 whitespace-pre-wrap text-sm text-slate-900"
                            : "mt-0.5 text-sm text-slate-400"
                        }
                      >
                        {e.filled ? e.value : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
