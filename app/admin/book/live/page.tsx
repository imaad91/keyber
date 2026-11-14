"use client";

import { useRouter } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { BookEntryCard } from "@/components/admin/BookEntryCard";
import { BookTabs } from "@/components/admin/BookTabs";
import { useAtelierCreationStore } from "@/lib/atelierCreationStore";
import { useBookStore } from "@/lib/bookStore";

export default function BookLivePage() {
  const router = useRouter();
  const { entriesByStatus, familyHistory, setStatus, toast, clearToast } =
    useBookStore();
  const { returnFromBookToCreation } = useAtelierCreationStore();
  const entries = entriesByStatus("live");

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Book", href: "/admin/book/en-cours-de-test" },
          { label: "Live" },
        ]}
        title="Book — Live"
      />

      <BookTabs />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Créations testées et disponibles pour les joueurs (Mode Compétence ou
        Mode Histoire). Lecture seule ici — pour modifier : « Retourner en
        Création » (nouvelle version).
      </p>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Aucune création Live. Depuis « En cours de test », cliquez sur «
          Passer en Live ».
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <BookEntryCard
              key={entry.id}
              entry={entry}
              history={familyHistory(entry.familyId)}
              onRetirerDuLive={() => {
                const res = setStatus(entry.id, "en_test");
                if (res.error) window.alert(res.error);
              }}
              onRetournerEnCreation={() => {
                const res = returnFromBookToCreation(entry);
                if ("error" in res) {
                  window.alert(res.error);
                  return;
                }
                router.push(`/admin/atelier/creation/${res.id}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
