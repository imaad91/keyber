"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { eventPreviewEntries } from "@/lib/atelierEventsExcel";
import { useAtelierEventsStore } from "@/lib/atelierEventsStore";
import {
  creationVersionLabel,
  useAtelierCreationStore,
} from "@/lib/atelierCreationStore";

export default function CreationEventDetailPage() {
  const { id, eventId } = useParams<{ id: string; eventId: string }>();
  const { getCreation } = useAtelierCreationStore();
  const { getEvent } = useAtelierEventsStore();
  const creation = getCreation(id);
  const event = getEvent(eventId);

  if (!creation) {
    return (
      <p className="text-sm text-slate-500">
        Création introuvable.{" "}
        <Link href="/admin/atelier/creation" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  if (!event || event.familyId !== creation.familyId) {
    return (
      <p className="text-sm text-slate-500">
        Événement introuvable pour cette entreprise.{" "}
        <Link href={`/admin/atelier/creation/${id}`} className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const entries = eventPreviewEntries(event.fields);

  return (
    <div>
      <AdminBreadcrumb
        backHref={`/admin/atelier/creation/${id}`}
        backLabel="← Retour à la création"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Création", href: "/admin/atelier/creation" },
          {
            label: creationVersionLabel(creation),
            href: `/admin/atelier/creation/${id}`,
          },
          { label: event.nom },
        ]}
        title={event.nom}
      />

      <p className="mb-4 text-sm text-slate-600">
        Lecture seule — événement lié uniquement à{" "}
        <strong>{creation.nom}</strong>. Pas partagé avec d&apos;autres
        entreprises.
      </p>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {entries.map((e) => (
          <div
            key={e.label}
            className="border-b border-slate-50 pb-3 last:border-0"
          >
            <p className="text-xs font-medium text-slate-500">{e.label}</p>
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
    </div>
  );
}
