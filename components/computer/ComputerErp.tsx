"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";
import {
  getDesktopCopy,
  getErpClients,
  getErpCommandes,
  getErpDashboardCards,
  getErpEmployes,
  getErpFactures,
  getErpFournisseurs,
  getErpMachines,
  getErpMaintenance,
  getErpModuleList,
  getErpProduction,
  getErpStockRows,
} from "@/lib/computerData";
import type { ErpModuleId } from "@/lib/computerTypes";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type ModuleId = ErpModuleId;

function fogActive(sensorInstalled: boolean, visibilityLevel: number) {
  return !sensorInstalled && visibilityLevel < 2;
}

function FogCell({ fog, value }: { fog: boolean; value: string | number }) {
  if (fog) {
    return (
      <span className="font-mono text-slate-400" title="Données indisponibles">
        ???
      </span>
    );
  }
  return <>{value}</>;
}

export function ComputerErp() {
  const { gameState } = useGameStore();
  const fog = fogActive(gameState.sensorInstalled, gameState.visibilityLevel);
  const modules = getErpModuleList();
  const [module, setModule] = useState<ModuleId>("stock");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(0);
  const [sortAsc, setSortAsc] = useState(true);
  const [unlockFlash, setUnlockFlash] = useState(false);

  useEffect(() => {
    if (!fog && gameState.sensorInstalled) {
      setUnlockFlash(true);
      const t = window.setTimeout(() => setUnlockFlash(false), 3500);
      return () => window.clearTimeout(t);
    }
  }, [fog, gameState.sensorInstalled]);

  const statutFilter = useMemo(() => {
    if (module !== "stock" && module !== "commandes" && module !== "factures")
      return null;
    return "all";
  }, [module]);
  const [filterStatut, setFilterStatut] = useState("all");

  useEffect(() => {
    setFilterStatut("all");
    setQuery("");
    setSortKey(0);
  }, [module]);

  return (
    <div className="flex h-full min-h-[480px] bg-white text-slate-900">
      <aside className="w-48 shrink-0 border-r border-slate-200 bg-slate-50">
        <p className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Modules
        </p>
        <nav className="flex flex-col gap-0.5 px-2 pb-3">
          {modules.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModule(m.id)}
              className={cn(
                "rounded-md px-2.5 py-2 text-left text-xs font-medium transition",
                module === m.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-200/70"
              )}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Recherche globale…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Filtres
          </div>
          {statutFilter !== null ? (
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              {module === "stock" ? (
                <>
                  <option value="OK">OK</option>
                  <option value="Stock bas">Stock bas</option>
                  <option value="Rupture">Rupture</option>
                </>
              ) : null}
              {module === "commandes" ? (
                <>
                  <option value="En cours">En cours</option>
                  <option value="En retard">En retard</option>
                  <option value="Livrée">Livrée</option>
                  <option value="Annulée">Annulée</option>
                </>
              ) : null}
              {module === "factures" ? (
                <>
                  <option value="Payée">Payée</option>
                  <option value="En attente">En attente</option>
                  <option value="En retard">En retard</option>
                </>
              ) : null}
            </select>
          ) : null}
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Exporter
          </button>
        </div>

        {unlockFlash ? (
          <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            <Sparkles className="h-4 w-4" />
            Données débloquées — le capteur remonte les chiffres réels.
          </div>
        ) : null}

        {fog ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
            {getDesktopCopy().fogHint}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {module === "dashboard" ? (
            <ErpDashboard fog={fog} />
          ) : (
            <ErpModuleTable
              module={module}
              fog={fog}
              query={query}
              filterStatut={filterStatut}
              sortKey={sortKey}
              sortAsc={sortAsc}
              onSort={(k) => {
                if (k === sortKey) setSortAsc(!sortAsc);
                else {
                  setSortKey(k);
                  setSortAsc(true);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ErpDashboard({ fog }: { fog: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {getErpDashboardCards().map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {c.label}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {fog ? "???" : c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ErpModuleTable({
  module,
  fog,
  query,
  filterStatut,
  sortKey,
  sortAsc,
  onSort,
}: {
  module: ModuleId;
  fog: boolean;
  query: string;
  filterStatut: string;
  sortKey: number;
  sortAsc: boolean;
  onSort: (k: number) => void;
}) {
  const q = query.trim().toLowerCase();

  const table = useMemo(() => {
    if (module === "stock") {
      let rows = getErpStockRows().filter(
        (r) =>
          (filterStatut === "all" || r.statut === filterStatut) &&
          Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
      const keys: (keyof typeof rows[0])[] = [
        "ref",
        "nom",
        "qte",
        "seuil",
        "emplacement",
        "fournisseur",
        "prixUnitaire",
        "derniereEntree",
        "statut",
      ];
      const k = keys[sortKey] ?? "ref";
      rows = [...rows].sort((a, b) => {
        const av = a[k];
        const bv = b[k];
        if (typeof av === "number" && typeof bv === "number")
          return sortAsc ? av - bv : bv - av;
        return sortAsc
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
      return {
        headers: [
          "Référence",
          "Nom pièce",
          "Quantité",
          "Seuil d'alerte",
          "Emplacement",
          "Fournisseur",
          "Prix unitaire €",
          "Dernière entrée",
          "Statut",
        ],
        rows: rows.map((r) => [
          r.ref,
          r.nom,
          r.qte,
          r.seuil,
          r.emplacement,
          r.fournisseur,
          r.prixUnitaire,
          r.derniereEntree,
          r.statut,
        ]),
      };
    }
    if (module === "commandes") {
      let rows = getErpCommandes().filter(
        (r) =>
          (filterStatut === "all" || r.statut === filterStatut) &&
          Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
      rows = [...rows].sort((a, b) =>
        sortAsc
          ? a.numero.localeCompare(b.numero)
          : b.numero.localeCompare(a.numero)
      );
      return {
        headers: [
          "N° commande",
          "Client",
          "Pièce",
          "Qté commandée",
          "Qté produite",
          "Date limite",
          "Statut",
          "Montant €",
        ],
        rows: rows.map((r) => [
          r.numero,
          r.client,
          r.piece,
          r.qteCommandee,
          r.qteProduite,
          r.dateLimite,
          r.statut,
          r.montant,
        ]),
      };
    }
    if (module === "production") {
      let rows = getErpProduction().filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
      rows = [...rows].sort((a, b) =>
        sortAsc ? a.ligne.localeCompare(b.ligne) : b.ligne.localeCompare(a.ligne)
      );
      return {
        headers: [
          "Ligne/Machine",
          "Pièce en cours",
          "Objectif jour",
          "Produit aujourd'hui",
          "Taux rebut %",
          "Vitesse",
          "État",
        ],
        rows: rows.map((r) => [
          r.ligne,
          r.piece,
          r.objectifJour,
          r.produitAujourdhui,
          r.tauxRebut,
          r.vitesse,
          r.etat,
        ]),
      };
    }
    if (module === "employes") {
      let rows = getErpEmployes().filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
      rows = [...rows].sort((a, b) =>
        sortAsc ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom)
      );
      return {
        headers: [
          "Nom",
          "Poste",
          "Équipe",
          "Ancienneté",
          "Heures sup semaine",
          "Taux absence",
          "Statut",
        ],
        rows: rows.map((r) => [
          r.nom,
          r.poste,
          r.equipe,
          r.anciennete,
          r.heuresSup,
          r.tauxAbsence,
          r.statut,
        ]),
      };
    }
    if (module === "factures") {
      let rows = getErpFactures().filter(
        (r) =>
          (filterStatut === "all" || r.statut === filterStatut) &&
          Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
      rows = [...rows].sort((a, b) =>
        sortAsc
          ? a.numero.localeCompare(b.numero)
          : b.numero.localeCompare(a.numero)
      );
      return {
        headers: [
          "N° facture",
          "Client",
          "Montant €",
          "Date émission",
          "Date échéance",
          "Statut",
        ],
        rows: rows.map((r) => [
          r.numero,
          r.client,
          r.montant,
          r.emission,
          r.echeance,
          r.statut,
        ]),
      };
    }
    if (module === "machines") {
      let rows = getErpMachines().filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
      rows = [...rows].sort((a, b) =>
        sortAsc ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom)
      );
      return {
        headers: [
          "Nom",
          "Type",
          "État",
          "Vitesse actuelle",
          "Taux rebut %",
          "Dernière maintenance",
          "Prochaine maintenance",
        ],
        rows: rows.map((r) => [
          r.nom,
          r.type,
          r.etat,
          r.vitesse,
          r.tauxRebut,
          r.derniereMaint,
          r.prochaineMaint,
        ]),
      };
    }
    if (module === "clients") {
      let rows = getErpClients().filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
      rows = [...rows].sort((a, b) =>
        sortAsc ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom)
      );
      return {
        headers: [
          "Nom",
          "% du CA",
          "Dernière commande",
          "Statut relation",
          "Contact",
        ],
        rows: rows.map((r) => [
          r.nom,
          r.pctCa,
          r.derniereCommande,
          r.relation,
          r.contact,
        ]),
      };
    }
    if (module === "maintenance") {
      let rows = getErpMaintenance().filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
      rows = [...rows].sort((a, b) =>
        sortAsc
          ? a.equipement.localeCompare(b.equipement)
          : b.equipement.localeCompare(a.equipement)
      );
      return {
        headers: [
          "Équipement",
          "Type",
          "Échéance",
          "Technicien",
          "Statut",
          "Priorité",
        ],
        rows: rows.map((r) => [
          r.equipement,
          r.type,
          r.echeance,
          r.technicien,
          r.statut,
          r.priorite,
        ]),
      };
    }
    let rows = getErpFournisseurs().filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q))
    );
    rows = [...rows].sort((a, b) =>
      sortAsc ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom)
    );
    return {
      headers: ["Nom", "Pièce fournie", "Délai livraison", "Prix", "Fiabilité"],
      rows: rows.map((r) => [r.nom, r.piece, r.delai, r.prix, r.fiabilite]),
    };
  }, [module, filterStatut, sortKey, sortAsc, q]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {table.headers.map((h, i) => (
              <th key={h} className="px-3 py-2.5 font-semibold">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-slate-800"
                  onClick={() => onSort(i)}
                >
                  {h}
                  {sortKey === i ? (sortAsc ? " ↑" : " ↓") : ""}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-t border-slate-100 hover:bg-slate-50/80"
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2.5 text-slate-800">
                  {fog && shouldFogColumn(module, ci) ? (
                    <FogCell fog value={cell} />
                  ) : (
                    formatCell(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
          {table.rows.length === 0 ? (
            <tr>
              <td
                colSpan={table.headers.length}
                className="px-3 py-8 text-center text-slate-500"
              >
                Aucune ligne
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {fog ? (
        <p className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Données indisponibles — Visibilité : Aucune
        </p>
      ) : null}
    </div>
  );
}

function shouldFogColumn(module: ModuleId, col: number) {
  // Keep identity columns readable; fog operational numbers
  if (module === "stock") return col >= 2;
  if (module === "commandes") return col >= 3;
  if (module === "production") return col >= 2;
  if (module === "employes") return col >= 4;
  if (module === "factures") return col >= 2;
  if (module === "machines") return col >= 2;
  if (module === "clients") return col >= 1;
  if (module === "fournisseurs") return col >= 2;
  if (module === "maintenance") return col >= 2;
  return true;
}

function formatCell(v: string | number) {
  if (typeof v === "number") return v.toLocaleString("fr-FR");
  return v;
}
