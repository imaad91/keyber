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

export default function BookEnCoursDeTestPage() {
  const router = useRouter();
  const {
    entriesByStatusAndMode,
    familyHistory,
    setStatus,
    deleteEntry,
    toast,
    clearToast,
  } = useBookStore();
  const { returnFromBookToCreation } = useAtelierCreationStore();

  const scenarios = entriesByStatusAndMode("en_test", "competence");
  const histoires = entriesByStatusAndMode("en_test", "histoire");

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
          { label: "En cours de test" },
        ]}
        title="Book — En cours de test"
      />

      <BookTabs />

      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Visible <strong>uniquement</strong> pour l&apos;Admin. Les joueurs ne
        voient pas ces cartes. Scénarios (Mode Compétence) et Histoires (Mode
        Histoire) sont séparés — jamais mélangés. Tout vient de Création.
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
        subtitle="Entraînement intensif sur une compétence précise. Pas de rôle. Catégorie → Compétence → Cours + Scénario."
        accent="sky"
        isEmpty={scenarios.length === 0}
        emptyLabel="Aucun scénario en cours de test."
      >
        {scenarios.map((entry) => (
          <BookEntryCard
            key={entry.id}
            entry={entry}
            history={familyHistory(entry.familyId)}
            variant="en_test"
            onPasserEnLive={() => {
              const res = setStatus(entry.id, "live");
              if (res.error) window.alert(res.error);
            }}
            onRetournerEnCreation={() => goRetourCreation(entry)}
            onSupprimer={() => {
              if (
                !window.confirm(
                  `Supprimer « ${entry.nom} V${entry.version} » du Book ?`
                )
              )
                return;
              const res = deleteEntry(entry.id);
              if (res.error) window.alert(res.error);
            }}
          />
        ))}
      </BookSection>

      <BookSection
        title="Histoires — Mode Histoire"
        subtitle="Mise en pratique. Rôle → Secteur → Entreprise → Histoire libre, avec les événements de cette entreprise, décisions qui influencent d'autres décisions."
        accent="violet"
        isEmpty={histoires.length === 0}
        emptyLabel="Aucune histoire en cours de test."
      >
        {histoires.map((entry) => (
          <BookEntryCard
            key={entry.id}
            entry={entry}
            history={familyHistory(entry.familyId)}
            variant="en_test"
            onPasserEnLive={() => {
              const res = setStatus(entry.id, "live");
              if (res.error) window.alert(res.error);
            }}
            onRetournerEnCreation={() => goRetourCreation(entry)}
            onSupprimer={() => {
              if (
                !window.confirm(
                  `Supprimer « ${entry.nom} V${entry.version} » du Book ?`
                )
              )
                return;
              const res = deleteEntry(entry.id);
              if (res.error) window.alert(res.error);
            }}
          />
        ))}
      </BookSection>
    </div>
  );
}
