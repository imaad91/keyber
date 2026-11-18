/**
 * Keyber OS — Analytics ERP (agrégations pour graphes joueur).
 * Générique : lit OsComputerPack, aucun métier hardcodé.
 */

import type { ErpModuleId } from "@/lib/computerTypes";
import type { OsComputerPack } from "@/lib/keyberOs/types";

export type ErpAnalyticsSource =
  | "stock"
  | "commandes"
  | "production"
  | "factures"
  | "machines"
  | "clients"
  | "employes"
  | "fournisseurs"
  | "maintenance"
  | "serie";

export type ErpChartKind = "bar" | "line" | "area" | "pie";

export type ErpMetricId =
  | "qte"
  | "valeur"
  | "montant"
  | "qteCommandee"
  | "qteProduite"
  | "reste"
  | "objectif"
  | "produit"
  | "ecart"
  | "count"
  | "prod"
  | "panne"
  | "pct";

export type ErpDimensionId =
  | "label"
  | "statut"
  | "client"
  | "fournisseur"
  | "piece"
  | "ligne"
  | "etat"
  | "equipe"
  | "relation"
  | "priorite"
  | "type";

export type ErpAnalyticsPoint = {
  name: string;
  value: number;
  value2?: number;
};

export type ErpAnalyticsKpi = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type ErpAnalyticsPreset = {
  id: string;
  label: string;
  source: ErpAnalyticsSource;
  metric: ErpMetricId;
  dimension: ErpDimensionId;
  chart: ErpChartKind;
  metric2?: ErpMetricId;
};

const SOURCE_LABELS: Record<ErpAnalyticsSource, string> = {
  stock: "Stock",
  commandes: "Commandes",
  production: "Production",
  factures: "Factures",
  machines: "Machines",
  clients: "Clients",
  employes: "Employés",
  fournisseurs: "Fournisseurs",
  maintenance: "Maintenance",
  serie: "Série temporelle",
};

export function erpAnalyticsSourceLabel(s: ErpAnalyticsSource) {
  return SOURCE_LABELS[s];
}

export function erpAnalyticsSources(pack: OsComputerPack): ErpAnalyticsSource[] {
  const out: ErpAnalyticsSource[] = [];
  if (pack.stock?.length) out.push("stock");
  if (pack.commandes?.length) out.push("commandes");
  if (pack.production?.length) out.push("production");
  if (pack.factures?.length) out.push("factures");
  if (pack.machines?.length) out.push("machines");
  if (pack.clients?.length) out.push("clients");
  if (pack.employes?.length) out.push("employes");
  if (pack.fournisseurs?.length) out.push("fournisseurs");
  if (pack.maintenance?.length) out.push("maintenance");
  if (pack.dashboardSeries?.length) out.push("serie");
  return out.length ? out : ["serie"];
}

type FieldSpec = {
  id: ErpMetricId | ErpDimensionId;
  label: string;
  kind: "metric" | "dimension";
};

const FIELDS: Record<ErpAnalyticsSource, FieldSpec[]> = {
  stock: [
    { id: "label", label: "Référence / nom", kind: "dimension" },
    { id: "statut", label: "Statut", kind: "dimension" },
    { id: "fournisseur", label: "Fournisseur", kind: "dimension" },
    { id: "qte", label: "Quantité", kind: "metric" },
    { id: "valeur", label: "Valeur stock (€)", kind: "metric" },
    { id: "count", label: "Nb lignes", kind: "metric" },
  ],
  commandes: [
    { id: "label", label: "N° commande", kind: "dimension" },
    { id: "statut", label: "Statut", kind: "dimension" },
    { id: "client", label: "Client", kind: "dimension" },
    { id: "piece", label: "Pièce", kind: "dimension" },
    { id: "montant", label: "Montant (€)", kind: "metric" },
    { id: "qteCommandee", label: "Qté commandée", kind: "metric" },
    { id: "qteProduite", label: "Qté produite", kind: "metric" },
    { id: "reste", label: "Reste à produire", kind: "metric" },
    { id: "count", label: "Nb commandes", kind: "metric" },
  ],
  production: [
    { id: "ligne", label: "Ligne", kind: "dimension" },
    { id: "etat", label: "État", kind: "dimension" },
    { id: "piece", label: "Pièce", kind: "dimension" },
    { id: "produit", label: "Produit aujourd'hui", kind: "metric" },
    { id: "objectif", label: "Objectif jour", kind: "metric" },
    { id: "ecart", label: "Écart vs objectif", kind: "metric" },
    { id: "count", label: "Nb lignes", kind: "metric" },
  ],
  factures: [
    { id: "label", label: "N° facture", kind: "dimension" },
    { id: "statut", label: "Statut", kind: "dimension" },
    { id: "client", label: "Client", kind: "dimension" },
    { id: "montant", label: "Montant (€)", kind: "metric" },
    { id: "count", label: "Nb factures", kind: "metric" },
  ],
  machines: [
    { id: "label", label: "Machine", kind: "dimension" },
    { id: "etat", label: "État", kind: "dimension" },
    { id: "type", label: "Type", kind: "dimension" },
    { id: "count", label: "Nb machines", kind: "metric" },
  ],
  clients: [
    { id: "label", label: "Client", kind: "dimension" },
    { id: "relation", label: "Relation", kind: "dimension" },
    { id: "pct", label: "% CA (num)", kind: "metric" },
    { id: "count", label: "Nb clients", kind: "metric" },
  ],
  employes: [
    { id: "label", label: "Nom", kind: "dimension" },
    { id: "equipe", label: "Équipe", kind: "dimension" },
    { id: "statut", label: "Statut", kind: "dimension" },
    { id: "count", label: "Nb employés", kind: "metric" },
  ],
  fournisseurs: [
    { id: "label", label: "Fournisseur", kind: "dimension" },
    { id: "piece", label: "Pièce", kind: "dimension" },
    { id: "count", label: "Nb fournisseurs", kind: "metric" },
  ],
  maintenance: [
    { id: "label", label: "Équipement", kind: "dimension" },
    { id: "statut", label: "Statut", kind: "dimension" },
    { id: "priorite", label: "Priorité", kind: "dimension" },
    { id: "type", label: "Type", kind: "dimension" },
    { id: "count", label: "Nb interventions", kind: "metric" },
  ],
  serie: [
    { id: "label", label: "Période", kind: "dimension" },
    { id: "prod", label: "Production", kind: "metric" },
    { id: "panne", label: "Pannes", kind: "metric" },
  ],
};

export function erpAnalyticsMetrics(source: ErpAnalyticsSource) {
  return FIELDS[source].filter((f) => f.kind === "metric");
}

export function erpAnalyticsDimensions(source: ErpAnalyticsSource) {
  return FIELDS[source].filter((f) => f.kind === "dimension");
}

export const ERP_ANALYTICS_PRESETS: ErpAnalyticsPreset[] = [
  {
    id: "stock-par-ref",
    label: "Stock par référence",
    source: "stock",
    metric: "qte",
    dimension: "label",
    chart: "bar",
  },
  {
    id: "valeur-stock",
    label: "Valeur stock (€)",
    source: "stock",
    metric: "valeur",
    dimension: "label",
    chart: "bar",
  },
  {
    id: "cmd-montant-client",
    label: "CA commandes par client",
    source: "commandes",
    metric: "montant",
    dimension: "client",
    chart: "bar",
  },
  {
    id: "cmd-statut",
    label: "Commandes par statut",
    source: "commandes",
    metric: "count",
    dimension: "statut",
    chart: "pie",
  },
  {
    id: "prod-vs-obj",
    label: "Production vs objectif",
    source: "production",
    metric: "produit",
    metric2: "objectif",
    dimension: "ligne",
    chart: "bar",
  },
  {
    id: "serie-prod",
    label: "Série production / pannes",
    source: "serie",
    metric: "prod",
    metric2: "panne",
    dimension: "label",
    chart: "line",
  },
  {
    id: "factures-statut",
    label: "Factures par statut",
    source: "factures",
    metric: "montant",
    dimension: "statut",
    chart: "pie",
  },
  {
    id: "machines-etat",
    label: "Machines par état",
    source: "machines",
    metric: "count",
    dimension: "etat",
    chart: "pie",
  },
];

function parsePct(raw: string): number {
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

type RowBag = Record<string, string | number>;

function rowsForSource(pack: OsComputerPack, source: ErpAnalyticsSource): RowBag[] {
  if (source === "stock") {
    return pack.stock.map((r) => ({
      label: `${r.ref} · ${r.nom}`,
      statut: r.statut,
      fournisseur: r.fournisseur,
      qte: r.qte,
      valeur: Math.round(r.qte * (r.prixUnitaire || 0)),
      count: 1,
    }));
  }
  if (source === "commandes") {
    return pack.commandes.map((r) => ({
      label: r.numero,
      statut: r.statut,
      client: r.client,
      piece: r.piece,
      montant: r.montant,
      qteCommandee: r.qteCommandee,
      qteProduite: r.qteProduite,
      reste: Math.max(0, r.qteCommandee - r.qteProduite),
      count: 1,
    }));
  }
  if (source === "production") {
    return pack.production.map((r) => ({
      ligne: r.ligne,
      label: r.ligne,
      etat: r.etat,
      piece: r.piece,
      produit: r.produitAujourdhui,
      objectif: r.objectifJour,
      ecart: r.produitAujourdhui - r.objectifJour,
      count: 1,
    }));
  }
  if (source === "factures") {
    return pack.factures.map((r) => ({
      label: r.numero,
      statut: r.statut,
      client: r.client,
      montant: r.montant,
      count: 1,
    }));
  }
  if (source === "machines") {
    return pack.machines.map((r) => ({
      label: r.nom,
      etat: r.etat,
      type: r.type,
      count: 1,
    }));
  }
  if (source === "clients") {
    return pack.clients.map((r) => ({
      label: r.nom,
      relation: r.relation,
      pct: parsePct(r.pctCa),
      count: 1,
    }));
  }
  if (source === "employes") {
    return pack.employes.map((r) => ({
      label: r.nom,
      equipe: r.equipe,
      statut: r.statut,
      count: 1,
    }));
  }
  if (source === "fournisseurs") {
    return pack.fournisseurs.map((r) => ({
      label: r.nom,
      piece: r.piece,
      count: 1,
    }));
  }
  if (source === "maintenance") {
    return (pack.maintenance ?? []).map((r) => ({
      label: r.equipement,
      statut: r.statut,
      priorite: r.priorite,
      type: r.type,
      count: 1,
    }));
  }
  return (pack.dashboardSeries ?? []).map((r) => ({
    label: r.name,
    prod: r.prod,
    panne: r.panne,
    count: 1,
  }));
}

function dimValue(row: RowBag, dim: ErpDimensionId): string {
  const v = row[dim] ?? row.label ?? "—";
  return String(v || "—");
}

function metricValue(row: RowBag, metric: ErpMetricId): number {
  const v = row[metric];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (metric === "count") return 1;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function buildErpAnalyticsSeries(args: {
  pack: OsComputerPack;
  source: ErpAnalyticsSource;
  metric: ErpMetricId;
  dimension: ErpDimensionId;
  metric2?: ErpMetricId;
  statutFilter?: string;
}): ErpAnalyticsPoint[] {
  const { pack, source, metric, dimension, metric2, statutFilter } = args;
  let rows = rowsForSource(pack, source);
  if (statutFilter && statutFilter !== "all") {
    rows = rows.filter((r) => String(r.statut ?? r.etat ?? "") === statutFilter);
  }

  const bag = new Map<string, { value: number; value2: number }>();
  for (const row of rows) {
    const key = dimValue(row, dimension);
    const cur = bag.get(key) ?? { value: 0, value2: 0 };
    cur.value += metricValue(row, metric);
    if (metric2) cur.value2 += metricValue(row, metric2);
    bag.set(key, cur);
  }

  return Array.from(bag.entries())
    .map(([name, v]) => ({
      name,
      value: Math.round(v.value * 100) / 100,
      ...(metric2 ? { value2: Math.round(v.value2 * 100) / 100 } : {}),
    }))
    .sort((a, b) => b.value - a.value);
}

export function buildErpAnalyticsKpis(
  pack: OsComputerPack,
  fog: boolean
): ErpAnalyticsKpi[] {
  if (fog) {
    return [
      { id: "fog", label: "Visibilité", value: "???", hint: "Capteur requis" },
    ];
  }
  const stockVal = pack.stock.reduce(
    (s, r) => s + r.qte * (r.prixUnitaire || 0),
    0
  );
  const cmdOpen = pack.commandes.filter(
    (c) => c.statut === "En cours" || c.statut === "En retard"
  );
  const cmdCa = cmdOpen.reduce((s, c) => s + c.montant, 0);
  const prodSum = pack.production.reduce((s, p) => s + p.produitAujourdhui, 0);
  const objSum = pack.production.reduce((s, p) => s + p.objectifJour, 0);
  const ruptures = pack.stock.filter((s) => s.statut === "Rupture").length;
  const pannes = pack.production.filter((p) => p.etat === "En panne").length;
  const facRetard = pack.factures.filter((f) => f.statut === "En retard");
  const facRetardSum = facRetard.reduce((s, f) => s + f.montant, 0);

  return [
    {
      id: "stock-val",
      label: "Valeur stock",
      value: `${Math.round(stockVal).toLocaleString("fr-FR")} €`,
      hint: `${pack.stock.length} refs`,
    },
    {
      id: "cmd-ca",
      label: "CA commandes ouvertes",
      value: `${Math.round(cmdCa).toLocaleString("fr-FR")} €`,
      hint: `${cmdOpen.length} ouvertes`,
    },
    {
      id: "prod-taux",
      label: "Taux prod / objectif",
      value:
        objSum > 0
          ? `${Math.round((prodSum / objSum) * 100)} %`
          : "—",
      hint: `${prodSum} / ${objSum}`,
    },
    {
      id: "risk",
      label: "Risques",
      value: String(ruptures + pannes),
      hint: `${ruptures} ruptures · ${pannes} pannes`,
    },
    {
      id: "fac-retard",
      label: "Factures en retard",
      value: `${Math.round(facRetardSum).toLocaleString("fr-FR")} €`,
      hint: `${facRetard.length} factures`,
    },
  ];
}

export function erpAnalyticsStatutOptions(
  pack: OsComputerPack,
  source: ErpAnalyticsSource
): string[] {
  const rows = rowsForSource(pack, source);
  const set = new Set<string>();
  for (const r of rows) {
    const s = r.statut ?? r.etat;
    if (s) set.add(String(s));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
}

export function metricLabel(source: ErpAnalyticsSource, id: ErpMetricId) {
  return (
    erpAnalyticsMetrics(source).find((m) => m.id === id)?.label || String(id)
  );
}

export function dimensionLabel(source: ErpAnalyticsSource, id: ErpDimensionId) {
  return (
    erpAnalyticsDimensions(source).find((d) => d.id === id)?.label ||
    String(id)
  );
}

/** Modules table liés (pour deep-link depuis Analyse). */
export function analyticsSourceToModule(
  source: ErpAnalyticsSource
): ErpModuleId | null {
  if (source === "serie") return "dashboard";
  return source;
}
