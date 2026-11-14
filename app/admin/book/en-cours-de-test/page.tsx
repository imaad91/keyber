"use client";

import { useRouter } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { BookEntryCard } from "@/components/admin/BookEntryCard";
import { BookTabs } from "@/components/admin/BookTabs";
import { useAtelierCreationStore } from "@/lib/atelierCreationStore";
import { useBookStore } from "@/lib/bookStore";

export default function BookEnCoursDeTestPage() {
  const router = useRouter();
  const { entriesByStatus, familyHistory, setStatus, toast, clearToast } =
    useBookStore();
  const { returnFromBookToCreation } = useAtelierCreationStore();
  const entries = entriesByStatus("en_test");

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Book", href: "/admin/book/en-cours-de-test" },
          { label: "En cours de test" },
        ]}
        title="Book — En cours de test"
      />

      <BookTabs />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Créations validées en cours de test — visibles <strong>uniquement</strong>{" "}
        pour l&apos;Admin. Les joueurs ne les voient pas. On ne crée rien ici :
        tout vient de Création.
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
          Aucune création en cours de test. Validez une création dans Atelier →
          Création pour qu&apos;elle apparaisse ici.
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <BookEntryCard
              key={entry.id}
              entry={entry}
              history={familyHistory(entry.familyId)}
              onPasserEnLive={() => {
                const res = setStatus(entry.id, "live");
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
