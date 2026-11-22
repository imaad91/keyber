"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  BookEntryCard,
  BookSection,
} from "@/components/admin/BookEntryCard";
import { BookLiveGovernanceNote } from "@/components/admin/BookLiveGovernanceNote";
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

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/book/generer">
          <AdminButton type="button">
            <Sparkles className="h-4 w-4" />
            Générer des scénarios
          </AdminButton>
        </Link>
        <Link href="/admin/book/demo-lumiere">
          <AdminButton type="button" variant="secondary">
            Démo Lumière & Co
          </AdminButton>
        </Link>
        <Link href="/admin/book/demo-novacier">
          <AdminButton type="button" variant="secondary">
            Pack Novacier (Étape 41)
          </AdminButton>
        </Link>
      </div>

      <BookTabs />

      <BookLiveGovernanceNote />

      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Visible <strong>uniquement</strong> pour l&apos;Admin. Les joueurs ne
        voient pas ces cartes. Scénarios (Mode Compétence) et Histoires (Mode
        Histoire) sont séparés — jamais mélangés. La génération se fait dans le
        Book (bouton ci-dessus).
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
