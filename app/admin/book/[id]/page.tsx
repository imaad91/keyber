"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { ModeBadge } from "@/components/admin/BookEntryCard";
import { useAtelierCreationStore } from "@/lib/atelierCreationStore";
import { fieldsPreviewEntries } from "@/lib/atelierCreationExcel";
import {
  bookStatusLabel,
  bookVersionLabel,
  isPlayerVisible,
  useBookStore,
} from "@/lib/bookStore";

function formatDateFr(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getEntry, familyHistory, setStatus, deleteEntry } = useBookStore();
  const { returnFromBookToCreation } = useAtelierCreationStore();
  const entry = getEntry(id);

  if (!entry) {
    return (
      <p className="text-sm text-slate-500">
        Entrée Book introuvable.{" "}
        <Link href="/admin/book/en-cours-de-test" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const history = familyHistory(entry.familyId);
  const filled = fieldsPreviewEntries(entry.fields).filter((e) => e.filled);
  const playHref =
    entry.mode === "competence" ? "/jouer/competence" : "/jouer/histoire";

  return (
    <div>
      <AdminBreadcrumb
        backHref={
          entry.status === "live"
            ? "/admin/book/live"
            : "/admin/book/en-cours-de-test"
        }
        backLabel="← Retour au Book"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Book", href: "/admin/book/en-cours-de-test" },
          { label: bookVersionLabel(entry) },
        ]}
        title={bookVersionLabel(entry)}
      />

      <p className="mb-4 text-sm text-slate-600">
        Lecture seule —{" "}
        {entry.mode === "competence"
          ? "Scénario (Mode Compétence)"
          : "Histoire (Mode Histoire)"}
        . Pour modifier : Retourner en Création (nouvelle version).
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <ModeBadge mode={entry.mode} />
        <Link href={playHref}>
          <AdminButton variant="secondary" type="button">
            {entry.status === "live" ? "Jouer" : "Tester"}
          </AdminButton>
        </Link>
        {entry.status === "en_test" ? (
          <AdminButton
            type="button"
            onClick={() => {
              const res = setStatus(entry.id, "live");
              if (res.error) window.alert(res.error);
            }}
          >
            Passer en Live
          </AdminButton>
        ) : (
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => {
              const res = setStatus(entry.id, "en_test");
              if (res.error) window.alert(res.error);
            }}
          >
            Retourner en En cours de test
          </AdminButton>
        )}
        <AdminButton
          type="button"
          variant="ghost"
          onClick={() => {
            const res = returnFromBookToCreation(entry);
            if ("error" in res) {
              window.alert(res.error);
              return;
            }
            router.push(`/admin/atelier/creation/${res.id}`);
          }}
        >
          Retourner en Création
        </AdminButton>
        {entry.status === "en_test" ? (
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => {
              if (!window.confirm(`Supprimer « ${bookVersionLabel(entry)} » ?`))
                return;
              const res = deleteEntry(entry.id);
              if (res.error) window.alert(res.error);
              else router.push("/admin/book/en-cours-de-test");
            }}
          >
            Supprimer
          </AdminButton>
        ) : null}
      </div>

      <div className="mb-6 space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
        {entry.mode === "competence" ? (
          <p>
            <span className="font-medium text-slate-500">
              Compétence travaillée :
            </span>{" "}
            {entry.competenceName || entry.competenceNames[0] || "—"}
          </p>
        ) : (
          <>
            <p>
              <span className="font-medium text-slate-500">Rôle joué :</span>{" "}
              {entry.roleName || entry.roleNames[0] || "—"}
            </p>
            <p>
              <span className="font-medium text-slate-500">Secteur :</span>{" "}
              {entry.secteur || "—"}
            </p>
          </>
        )}
        <p>
          <span className="font-medium text-slate-500">
            Entreprise / Contexte :
          </span>{" "}
          {entry.entrepriseNom || "—"}
        </p>
        <p>
          <span className="font-medium text-slate-500">Version :</span> V
          {entry.version}
        </p>
        <p>
          <span className="font-medium text-slate-500">Date de validation :</span>{" "}
          {formatDateFr(entry.validatedAt)}
        </p>
        <p>
          <span className="font-medium text-slate-500">Statut :</span>{" "}
          {bookStatusLabel(entry.status)}
          {isPlayerVisible(entry)
            ? " · visible joueurs"
            : " · Admin uniquement"}
        </p>
        <div>
          <p className="font-medium text-slate-500">Historique :</p>
          <p className="mt-1">
            {history.map((h) => `V${h.version}`).join(", ") || `V${entry.version}`}
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Contexte (snapshot)
      </h2>
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {filled.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun champ rempli.</p>
        ) : (
          filled.map((e) => (
            <div
              key={e.label}
              className="border-b border-slate-50 pb-2 last:border-0"
            >
              <p className="text-xs font-medium text-slate-500">{e.label}</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-900">
                {e.value}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
