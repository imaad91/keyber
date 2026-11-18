"use client";

/**
 * ERP Ordinateur OS — feeling plant-manager (tables vivantes).
 * Alertes · fiche détail · liens croisés · export CSV · filtres dynamiques.
 * Données = play.computer. Fog = Visibilité OS. Aucun useGameStore.
 */

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  Filter,
  Link2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { ErpModuleId } from "@/lib/computerTypes";
import {
  collectErpAlerts,
  downloadErpCsv,
  ERP_MODULE_HEADERS,
  erpCrossLinks,
  erpRowsAsRecords,
  type ErpAlert,
} from "@/lib/keyberOs/erpFeeling";
import type { OsComputerPack, OsPlayState } from "@/lib/keyberOs/types";
import { cn } from "@/lib/utils";

type ModuleId = ErpModuleId;
type TableModule = Exclude<ModuleId, "dashboard">;

type Props = {
  play: OsPlayState;
  fog: boolean;
};

const MODULE_LABELS: { id: ModuleId; label: string }[] = [
  { id: "dashboard", label: "Tableau de bord ERP" },
  { id: "stock", label: "Stock" },
  { id: "commandes", label: "Commandes" },
  { id: "production", label: "Production" },
  { id: "employes", label: "Employés" },
  { id: "factures", label: "Factures" },
  { id: "machines", label: "Machines" },
  { id: "clients", label: "Clients" },
  { id: "fournisseurs", label: "Fournisseurs" },
  { id: "maintenance", label: "Maintenance" },
];

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

function formatCell(v: string | number) {
  if (typeof v === "number") return v.toLocaleString("fr-FR");
  return v;
}

function shouldFogColumn(module: ModuleId, col: number) {
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

function statusTone(statut: string | undefined) {
  if (!statut) return "bg-slate-100 text-slate-700";
  if (/rupture|panne|critique|retard/i.test(statut))
    return "bg-rose-100 text-rose-800";
  if (/bas|attente|tendu|haute|arr[eê]t/i.test(statut))
    return "bg-amber-100 text-amber-900";
  if (/ok|livr|pay|marche|pr[eé]sent|bon|termin/i.test(statut))
    return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-700";
}

function osErpModuleList(pack: OsComputerPack) {
  return MODULE_LABELS.filter(
    (m) => m.id !== "maintenance" || (pack.maintenance?.length ?? 0) > 0
  );
}

export function OsComputerErp({ play, fog }: Props) {
  const pack = play.computer;
  const modules = osErpModuleList(pack);
  const alerts = useMemo(() => collectErpAlerts(pack), [pack]);
  const [module, setModule] = useState<ModuleId>("stock");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(0);
  const [sortAsc, setSortAsc] = useState(true);
  const [unlockFlash, setUnlockFlash] = useState(false);
  const [filterStatut, setFilterStatut] = useState("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const sensorInstalled =
    play.visibilite?.sensorInstalled ?? play.sensorInstalled;

  useEffect(() => {
    if (!fog && sensorInstalled) {
      setUnlockFlash(true);
      const t = window.setTimeout(() => setUnlockFlash(false), 3500);
      return () => window.clearTimeout(t);
    }
  }, [fog, sensorInstalled]);

  useEffect(() => {
    setFilterStatut("all");
    setQuery("");
    setSortKey(0);
    setSelectedKey(null);
  }, [module]);

  const statutOptions = useMemo(() => {
    if (module === "dashboard") return [] as string[];
    const rows = erpRowsAsRecords(pack, module as TableModule);
    const set = new Set<string>();
    for (const r of rows) {
      if (r.statut) set.add(r.statut);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [pack, module]);

  const statutFilter = statutOptions.length > 0;

  function openAlert(a: ErpAlert) {
    setModule(a.module);
    setSelectedKey(a.rowKey);
    setFilterStatut("all");
    setQuery("");
  }

  function jumpLink(targetModule: ErpModuleId, rowKey: string) {
    setModule(targetModule);
    setSelectedKey(rowKey);
    setFilterStatut("all");
    setQuery("");
  }

  return (
    <div className="flex h-full min-h-[480px] bg-white text-slate-900">
      <aside className="w-48 shrink-0 border-r border-slate-200 bg-slate-50">
        <p className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Modules
        </p>
        <nav className="flex flex-col gap-0.5 px-2 pb-3">
          {modules.map((m) => {
            const count =
              m.id === "dashboard"
                ? alerts.length
                : m.id === "maintenance"
                  ? pack.maintenance?.length ?? 0
                  : erpRowsAsRecords(pack, m.id).length;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setModule(m.id)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium transition",
                  module === m.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-200/70"
                )}
              >
                <span>{m.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    module === m.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
          {statutFilter ? (
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              {statutOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : null}
          {module !== "dashboard" ? (
            <button
              type="button"
              onClick={() => downloadErpCsv(pack, module as TableModule)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Exporter
            </button>
          ) : null}
        </div>

        {alerts.length > 0 ? (
          <div className="border-b border-rose-200 bg-rose-50 px-4 py-2">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-rose-800">
              <AlertTriangle className="h-3.5 w-3.5" />
              Alertes ERP · {alerts.length}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {alerts.slice(0, 6).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => openAlert(a)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-90",
                    a.severity === "critique"
                      ? "bg-rose-600 text-white"
                      : a.severity === "haute"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-600 text-white"
                  )}
                >
                  {a.label}
                </button>
              ))}
              {alerts.length > 6 ? (
                <span className="px-2 py-1 text-[11px] text-rose-700">
                  +{alerts.length - 6}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {unlockFlash ? (
          <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            <Sparkles className="h-4 w-4" />
            Données débloquées — le capteur remonte les chiffres réels.
          </div>
        ) : null}

        {fog ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
            Visibilité insuffisante — certaines colonnes affichent ???. Installe
            un capteur depuis le shell pour lever le brouillard.
          </div>
        ) : null}

        <div className="relative min-h-0 flex-1 overflow-auto p-4">
          {module === "dashboard" ? (
            <ErpDashboard
              pack={pack}
              fog={fog}
              alerts={alerts}
              onAlert={openAlert}
            />
          ) : (
            <ErpModuleTable
              pack={pack}
              module={module as TableModule}
              fog={fog}
              query={query}
              filterStatut={filterStatut}
              sortKey={sortKey}
              sortAsc={sortAsc}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              onSort={(k) => {
                if (k === sortKey) setSortAsc(!sortAsc);
                else {
                  setSortKey(k);
                  setSortAsc(true);
                }
              }}
            />
          )}

          {selectedKey && module !== "dashboard" ? (
            <ErpDetailDrawer
              pack={pack}
              module={module as TableModule}
              rowKey={selectedKey}
              fog={fog}
              onClose={() => setSelectedKey(null)}
              onJump={jumpLink}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ErpDashboard({
  pack,
  fog,
  alerts,
  onAlert,
}: {
  pack: OsComputerPack;
  fog: boolean;
  alerts: ErpAlert[];
  onAlert: (a: ErpAlert) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pack.dashboardCards.map((c) => (
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
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Exceptions à traiter
        </p>
        {alerts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Aucune alerte — stocks, commandes et lignes stables.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {alerts.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onAlert(a)}
                  className="text-left text-sm font-medium text-slate-800 underline-offset-2 hover:underline"
                >
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ErpModuleTable({
  pack,
  module,
  fog,
  query,
  filterStatut,
  sortKey,
  sortAsc,
  selectedKey,
  onSelect,
  onSort,
}: {
  pack: OsComputerPack;
  module: TableModule;
  fog: boolean;
  query: string;
  filterStatut: string;
  sortKey: number;
  sortAsc: boolean;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onSort: (k: number) => void;
}) {
  const q = query.trim().toLowerCase();
  const headers = ERP_MODULE_HEADERS[module];

  const rows = useMemo(() => {
    let list = erpRowsAsRecords(pack, module);
    if (filterStatut !== "all") {
      list = list.filter((r) => r.statut === filterStatut);
    }
    if (q) {
      list = list.filter((r) =>
        Object.values(r.record).some((v) =>
          String(v).toLowerCase().includes(q)
        )
      );
    }
    list = [...list].sort((a, b) => {
      const av = a.cells[sortKey] ?? "";
      const bv = b.cells[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv), "fr")
        : String(bv).localeCompare(String(av), "fr");
    });
    return list;
  }, [pack, module, filterStatut, sortKey, sortAsc, q]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {headers.map((h, i) => (
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
          {rows.map((row) => (
            <tr
              key={row.key}
              onClick={() => onSelect(row.key)}
              className={cn(
                "cursor-pointer border-t border-slate-100 transition hover:bg-sky-50/80",
                selectedKey === row.key && "bg-sky-50"
              )}
            >
              {row.cells.map((cell, ci) => {
                const isStatus =
                  headers[ci]?.toLowerCase().includes("statut") ||
                  headers[ci]?.toLowerCase() === "état";
                return (
                  <td key={ci} className="px-3 py-2.5 text-slate-800">
                    {fog && shouldFogColumn(module, ci) ? (
                      <FogCell fog value={cell} />
                    ) : isStatus ? (
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          statusTone(String(cell))
                        )}
                      >
                        {formatCell(cell)}
                      </span>
                    ) : (
                      formatCell(cell)
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-3 py-8 text-center text-slate-500"
              >
                Aucune ligne
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <p className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        {rows.length} ligne{rows.length > 1 ? "s" : ""} · clique pour ouvrir la
        fiche
        {fog ? " · brouillard actif" : ""}
      </p>
    </div>
  );
}

function ErpDetailDrawer({
  pack,
  module,
  rowKey,
  fog,
  onClose,
  onJump,
}: {
  pack: OsComputerPack;
  module: TableModule;
  rowKey: string;
  fog: boolean;
  onClose: () => void;
  onJump: (module: ErpModuleId, rowKey: string) => void;
}) {
  const rows = erpRowsAsRecords(pack, module);
  const row = rows.find((r) => r.key === rowKey) ?? rows[0];
  const headers = ERP_MODULE_HEADERS[module];
  const links = row
    ? erpCrossLinks(pack, module, row.record).filter(
        (l) => !(l.module === module && l.rowKey === row.key)
      )
    : [];

  if (!row) return null;

  return (
    <div className="absolute inset-y-0 right-0 z-20 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Fiche · {MODULE_LABELS.find((m) => m.id === module)?.label}
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-slate-900">
            {row.label}
          </h2>
          {row.statut ? (
            <span
              className={cn(
                "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                statusTone(row.statut)
              )}
            >
              {row.statut}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
        <dl className="space-y-2.5">
          {headers.map((h, i) => (
            <div
              key={h}
              className="grid grid-cols-[7.5rem_1fr] gap-2 border-b border-slate-100 pb-2 text-sm"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {h}
              </dt>
              <dd className="font-medium text-slate-800">
                {fog && shouldFogColumn(module, i) ? (
                  <FogCell fog value={row.cells[i] ?? "—"} />
                ) : (
                  formatCell(row.cells[i] ?? "—")
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <Link2 className="h-3.5 w-3.5" />
            Liens ERP
          </p>
          {links.length === 0 ? (
            <p className="text-xs text-slate-500">
              Aucun lien croisé détecté pour cette fiche.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {links.map((l) => (
                <button
                  key={`${l.module}-${l.rowKey}`}
                  type="button"
                  onClick={() => onJump(l.module, l.rowKey)}
                  className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-900 hover:bg-sky-100"
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
