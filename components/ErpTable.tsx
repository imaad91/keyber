"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  getErpCommandes,
  getErpEmployes,
  getErpFactures,
  getErpMachines,
  getErpStockRows,
} from "@/lib/computerData";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "stock", label: "Stock" },
  { id: "commandes", label: "Commandes" },
  { id: "employes", label: "Employés" },
  { id: "factures", label: "Factures" },
  { id: "machines", label: "Machines" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ErpTable({ embedded = false }: { embedded?: boolean }) {
  const [tab, setTab] = useState<TabId>("stock");
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filterRows = <T extends Record<string, unknown>>(list: T[]) =>
      list.filter((row) =>
        Object.values(row).some((v) => String(v).toLowerCase().includes(q))
      );

    if (tab === "stock") {
      const data = filterRows(
        getErpStockRows().map((r) => ({
          id: r.ref,
          article: r.nom,
          qty: r.qte,
          seuil: r.seuil,
          statut: r.statut,
        }))
      );
      return [...data].sort((a, b) =>
        sortAsc
          ? a.article.localeCompare(b.article)
          : b.article.localeCompare(a.article)
      );
    }
    if (tab === "commandes") {
      const data = filterRows(
        getErpCommandes().map((r) => ({
          id: r.numero,
          client: r.client,
          montant: r.montant,
          statut: r.statut,
          echeance: r.dateLimite,
        }))
      );
      return [...data].sort((a, b) =>
        sortAsc
          ? a.client.localeCompare(b.client)
          : b.client.localeCompare(a.client)
      );
    }
    if (tab === "employes") {
      const data = filterRows(
        getErpEmployes().map((r) => ({
          id: r.nom,
          nom: r.nom,
          poste: r.poste,
          shift: r.equipe,
        }))
      );
      return [...data].sort((a, b) =>
        sortAsc ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom)
      );
    }
    if (tab === "factures") {
      const data = filterRows(
        getErpFactures().map((r) => ({
          id: r.numero,
          client: r.client,
          montant: r.montant,
          statut: r.statut,
        }))
      );
      return [...data].sort((a, b) =>
        sortAsc
          ? a.client.localeCompare(b.client)
          : b.client.localeCompare(a.client)
      );
    }
    const data = filterRows(
      getErpMachines().map((r) => ({
        id: r.nom,
        nom: r.nom,
        etat: r.etat,
        oee: r.vitesse,
      }))
    );
    return [...data].sort((a, b) =>
      sortAsc ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom)
    );
  }, [tab, query, sortAsc]);

  return (
    <section
      className={cn(
        "view-enter flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 erp-surface shadow-soft",
        !embedded && "min-h-[480px]"
      )}
    >
      <header className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              KEYBER ERP
            </p>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Console entreprise
            </h2>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="h-9 w-52 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-800 outline-none ring-accent/30 focus:ring-2"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                tab === t.id
                  ? "bg-navy text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              )}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSortAsc((v) => !v)}
            className="ml-auto rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Tri {sortAsc ? "A→Z" : "Z→A"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="sticky top-0 bg-white text-[11px] uppercase tracking-wider text-slate-500">
            <tr className="border-b border-slate-200">
              {columnsFor(tab).map((c) => (
                <th key={c} className="px-4 py-2 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={String(row.id)}
                className="border-b border-slate-100 transition hover:bg-slate-50"
              >
                {Object.values(row).map((cell, i) => (
                  <td key={i} className="px-4 py-2.5 text-slate-800">
                    {typeof cell === "number"
                      ? cell.toLocaleString("fr-FR")
                      : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function columnsFor(tab: TabId): string[] {
  switch (tab) {
    case "stock":
      return ["ID", "Article", "Qté", "Seuil", "Statut"];
    case "commandes":
      return ["ID", "Client", "Montant", "Statut", "Échéance"];
    case "employes":
      return ["ID", "Nom", "Poste", "Shift"];
    case "factures":
      return ["ID", "Client", "Montant", "Statut"];
    case "machines":
      return ["ID", "Nom", "État", "OEE"];
  }
}
