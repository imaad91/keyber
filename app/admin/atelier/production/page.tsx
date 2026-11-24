"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { useAtelierCreationStore } from "@/lib/atelierCreationStore";
import {
  PRODUCTION_HUB_COLUMNS,
  buildProductionHubCards,
  groupHubCardsByColumn,
} from "@/lib/atelierProductionHub";
import { downloadMondeTemplate } from "@/lib/atelierMondeExcel";
import { useBookStore } from "@/lib/bookStore";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

export default function AtelierProductionHubPage() {
  const { creations } = useAtelierCreationStore();
  const { entries } = useBookStore();
  const cards = buildProductionHubCards(creations, entries);
  const byColumn = groupHubCardsByColumn(cards);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Production" },
        ]}
        title="Atelier — Production"
      />

      <p className="mb-4 max-w-3xl text-sm text-slate-600">
        Hub chaîne Clear Campus : de la fiche Création (Campus + Vue Live
        Production) jusqu&apos;au Book Test / Live. Tu configures ici ; le
        joueur vit le monde. Thème clair obligatoire.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <AdminButton type="button" onClick={() => downloadMondeTemplate()}>
          <Download className="h-4 w-4" />
          Template Monde Clear Campus
        </AdminButton>
        <Link
          href="/admin/atelier/creation"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Ouvrir Création
        </Link>
        <Link
          href="/admin/atelier/workflow"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Workflow
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {PRODUCTION_HUB_COLUMNS.map((col) => {
          const list = byColumn[col.id];
          return (
            <section
              key={col.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm"
              aria-label={col.label}
            >
              <header className="mb-3 border-b border-slate-200 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">
                  {col.label}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">{col.hint}</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {list.length} carte{list.length === 1 ? "" : "s"}
                </p>
              </header>
              <ul className="flex flex-col gap-2">
                {list.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-6 text-center text-xs text-slate-400">
                    Vide
                  </li>
                ) : (
                  list.map((card) => (
                    <li
                      key={card.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {card.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {card.secteur}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold">
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5",
                            card.campusRows > 0
                              ? "bg-teal-50 text-teal-900"
                              : "bg-amber-50 text-amber-900"
                          )}
                        >
                          Campus {card.campusRows}
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5",
                            card.productionRows > 0
                              ? "bg-sky-50 text-sky-900"
                              : "bg-amber-50 text-amber-900"
                          )}
                        >
                          Prod {card.productionRows}
                        </span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-700">
                          Ready {card.readinessPct}%
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {card.creationId ? (
                          <Link
                            href={`/admin/atelier/creation/${card.creationId}`}
                            className="text-xs font-medium text-teal-800 underline"
                          >
                            Fiche
                          </Link>
                        ) : null}
                        {card.bookEntryId ? (
                          <Link
                            href={`/admin/book/${card.bookEntryId}`}
                            className="text-xs font-medium text-slate-700 underline"
                          >
                            Book
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
