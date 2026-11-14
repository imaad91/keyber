"use client";

import { useRouter } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  BookEntryCard,
  BookSection,
} from "@/components/admin/BookEntryCard";
import { BookTabs } from "@/components/admin/BookTabs";
import { useAtelierCreationStore } from "@/lib/atelierCreationStore";
import { useBookStore } from "@/lib/bookStore";

export default function BookLivePage() {
  const router = useRouter();
  const {
    entriesByStatusAndMode,
    familyHistory,
    setStatus,
    toast,
    clearToast,
  } = useBookStore();
  const { returnFromBookToCreation } = useAtelierCreationStore();

  const scenarios = entriesByStatusAndMode("live", "competence");
  const histoires = entriesByStatusAndMode("live", "histoire");

  function goRetourCreation(entry: (typeof scenarios)[number]) {
    const res = returnFromBookToCreation(entry);
    if ("error" in res) {
      window.alert(res.error);
      return;
    }
    router.push(`/admin/atelier/creation/${res.id}`);
  }

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

      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Disponible pour les joueurs. Scénarios et Histoires restent séparés.
        Lecture seule ici — pour modifier : Retourner en Création (V2).
      </p>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <BookSection
        title="Scénarios — Entraînement Compétence"
        subtitle="Entraînement intensif sur une compétence précise."
        accent="sky"
        isEmpty={scenarios.length === 0}
        emptyLabel="Aucun scénario Live."
      >
        {scenarios.map((entry) => (
          <BookEntryCard
            key={entry.id}
            entry={entry}
            history={familyHistory(entry.familyId)}
            variant="live"
            onRetournerEnTest={() => {
              const res = setStatus(entry.id, "en_test");
              if (res.error) window.alert(res.error);
            }}
            onRetournerEnCreation={() => goRetourCreation(entry)}
          />
        ))}
      </BookSection>

      <BookSection
        title="Histoires — Mode Histoire"
        subtitle="Mise en pratique. Rôle → Secteur → Entreprise → Histoire libre."
        accent="violet"
        isEmpty={histoires.length === 0}
        emptyLabel="Aucune histoire Live."
      >
        {histoires.map((entry) => (
          <BookEntryCard
            key={entry.id}
            entry={entry}
            history={familyHistory(entry.familyId)}
            variant="live"
            onRetournerEnTest={() => {
              const res = setStatus(entry.id, "en_test");
              if (res.error) window.alert(res.error);
            }}
            onRetournerEnCreation={() => goRetourCreation(entry)}
          />
        ))}
      </BookSection>
    </div>
  );
}
