"use client";

/**
 * Module Analyse ERP — le joueur choisit dataset, métrique, axe, type de graphe.
 */

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";
import {
  buildErpAnalyticsKpis,
  buildErpAnalyticsSeries,
  dimensionLabel,
  ERP_ANALYTICS_PRESETS,
  erpAnalyticsDimensions,
  erpAnalyticsMetrics,
  erpAnalyticsSourceLabel,
  erpAnalyticsSources,
  erpAnalyticsStatutOptions,
  metricLabel,
  type ErpAnalyticsSource,
  type ErpChartKind,
  type ErpDimensionId,
  type ErpMetricId,
} from "@/lib/keyberOs/erpAnalytics";
import type { OsComputerPack } from "@/lib/keyberOs/types";
import { cn } from "@/lib/utils";

const PIE_COLORS = [
  "#0f766e",
  "#0369a1",
  "#b45309",
  "#be123c",
  "#7c3aed",
  "#15803d",
  "#0e7490",
  "#a16207",
];

type Props = {
  pack: OsComputerPack;
  fog: boolean;
};

export function OsErpAnalytics({ pack, fog }: Props) {
  const sources = useMemo(() => erpAnalyticsSources(pack), [pack]);
  const [source, setSource] = useState<ErpAnalyticsSource>(
    sources.includes("stock") ? "stock" : sources[0]!
  );
  const metrics = erpAnalyticsMetrics(source);
  const dimensions = erpAnalyticsDimensions(source);
  const [metric, setMetric] = useState<ErpMetricId>(
    (metrics.find((m) => m.id === "qte")?.id ||
      metrics.find((m) => m.id === "montant")?.id ||
      metrics[0]?.id ||
      "count") as ErpMetricId
  );
  const [metric2, setMetric2] = useState<ErpMetricId | "">("");
  const [dimension, setDimension] = useState<ErpDimensionId>(
    (dimensions.find((d) => d.id === "label")?.id ||
      dimensions[0]?.id ||
      "label") as ErpDimensionId
  );
  const [chart, setChart] = useState<ErpChartKind>("bar");
  const [statutFilter, setStatutFilter] = useState("all");
  const [sortAsc, setSortAsc] = useState(false);

  const statutOptions = useMemo(
    () => erpAnalyticsStatutOptions(pack, source),
    [pack, source]
  );

  // Reset incompatible fields when source changes
  function onSource(next: ErpAnalyticsSource) {
    setSource(next);
    const mets = erpAnalyticsMetrics(next);
    const dims = erpAnalyticsDimensions(next);
    setMetric((mets[0]?.id || "count") as ErpMetricId);
    setMetric2("");
    setDimension((dims[0]?.id || "label") as ErpDimensionId);
    setStatutFilter("all");
    if (next === "serie") setChart("line");
  }

  function applyPreset(id: string) {
    const p = ERP_ANALYTICS_PRESETS.find((x) => x.id === id);
    if (!p) return;
    if (!sources.includes(p.source)) return;
    setSource(p.source);
    setMetric(p.metric);
    setMetric2(p.metric2 || "");
    setDimension(p.dimension);
    setChart(p.chart);
    setStatutFilter("all");
  }

  const seriesRaw = useMemo(
    () =>
      fog
        ? []
        : buildErpAnalyticsSeries({
            pack,
            source,
            metric,
            dimension,
            metric2: metric2 || undefined,
            statutFilter,
          }),
    [pack, source, metric, dimension, metric2, statutFilter, fog]
  );

  const series = useMemo(() => {
    const list = [...seriesRaw];
    list.sort((a, b) => (sortAsc ? a.value - b.value : b.value - a.value));
    return list;
  }, [seriesRaw, sortAsc]);

  const kpis = useMemo(() => buildErpAnalyticsKpis(pack, fog), [pack, fog]);

  const m1Label = metricLabel(source, metric);
  const m2Label = metric2 ? metricLabel(source, metric2) : "";
  const dLabel = dimensionLabel(source, dimension);

  const total = series.reduce((s, p) => s + p.value, 0);
  const max = series[0]?.value ?? 0;

  return (
    <div className="space-y-4 text-slate-900">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Analyse ERP
        </p>
        <h3 className="text-lg font-semibold">Explorer &amp; comparer</h3>
        <p className="mt-1 text-sm text-slate-500">
          Choisis une source, une métrique et un axe — le graphe se met à jour
          pour t&apos;aider à décider.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <div
            key={k.id}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {k.label}
            </p>
            <p className="mt-0.5 text-base font-semibold tabular-nums">
              {k.value}
            </p>
            {k.hint ? (
              <p className="text-[11px] text-slate-400">{k.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="mr-1 self-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Presets
        </span>
        {ERP_ANALYTICS_PRESETS.filter((p) => sources.includes(p.source)).map(
          (p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-teal-300 hover:bg-teal-50"
            >
              {p.label}
            </button>
          )
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="block text-xs font-semibold text-slate-600">
            Source
            <select
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={source}
              onChange={(e) => onSource(e.target.value as ErpAnalyticsSource)}
              disabled={fog}
            >
              {sources.map((s) => (
                <option key={s} value={s}>
                  {erpAnalyticsSourceLabel(s)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-slate-600">
            Métrique
            <select
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={metric}
              onChange={(e) => setMetric(e.target.value as ErpMetricId)}
              disabled={fog}
            >
              {metrics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-slate-600">
            Comparer (optionnel)
            <select
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={metric2}
              onChange={(e) =>
                setMetric2((e.target.value || "") as ErpMetricId | "")
              }
              disabled={fog || chart === "pie"}
            >
              <option value="">—</option>
              {metrics
                .filter((m) => m.id !== metric)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-slate-600">
            Axe / regroupement
            <select
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={dimension}
              onChange={(e) => setDimension(e.target.value as ErpDimensionId)}
              disabled={fog}
            >
              {dimensions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-slate-600">
            Filtre statut / état
            <select
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              disabled={fog || statutOptions.length === 0}
            >
              <option value="all">Tous</option>
              {statutOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <div className="block text-xs font-semibold text-slate-600">
            Type de graphe
            <div className="mt-1 flex h-9 overflow-hidden rounded-lg border border-slate-200">
              {(
                [
                  ["bar", BarChart3],
                  ["line", LineIcon],
                  ["area", LineIcon],
                  ["pie", PieIcon],
                ] as const
              ).map(([kind, Icon]) => (
                <button
                  key={kind}
                  type="button"
                  disabled={fog}
                  onClick={() => {
                    setChart(kind);
                    if (kind === "pie") setMetric2("");
                  }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1 text-[11px] font-semibold capitalize",
                    chart === kind
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  )}
                  title={kind}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {kind}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          <button
            type="button"
            className="underline-offset-2 hover:underline"
            onClick={() => setSortAsc((v) => !v)}
            disabled={fog}
          >
            Tri : {sortAsc ? "croissant" : "décroissant"}
          </button>
          <span>
            {series.length} points · total {m1Label} ={" "}
            {fog ? "???" : total.toLocaleString("fr-FR")}
            {!fog && max ? ` · max ${max.toLocaleString("fr-FR")}` : ""}
          </span>
          <span>
            {dLabel} × {m1Label}
            {m2Label ? ` vs ${m2Label}` : ""}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        {fog ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
            Graphiques masqués — brouillard actif. Installe un capteur pour
            analyser.
          </div>
        ) : series.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
            Aucune donnée pour cette combinaison.
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chart === "pie" ? (
                <PieChart>
                  <Pie
                    data={series}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${Math.round((percent || 0) * 100)}%`
                    }
                  >
                    {series.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : chart === "line" ? (
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    interval={0}
                    angle={series.length > 6 ? -25 : 0}
                    textAnchor={series.length > 6 ? "end" : "middle"}
                    height={series.length > 6 ? 60 : 30}
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={m1Label}
                    stroke="#0f766e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  {metric2 ? (
                    <Line
                      type="monotone"
                      dataKey="value2"
                      name={m2Label}
                      stroke="#b45309"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ) : null}
                </LineChart>
              ) : chart === "area" ? (
                <AreaChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={m1Label}
                    stroke="#0f766e"
                    fill="#99f6e4"
                  />
                  {metric2 ? (
                    <Area
                      type="monotone"
                      dataKey="value2"
                      name={m2Label}
                      stroke="#b45309"
                      fill="#fde68a"
                    />
                  ) : null}
                </AreaChart>
              ) : (
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    interval={0}
                    angle={series.length > 6 ? -25 : 0}
                    textAnchor={series.length > 6 ? "end" : "middle"}
                    height={series.length > 6 ? 60 : 30}
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name={m1Label}
                    fill="#0f766e"
                    radius={[6, 6, 0, 0]}
                  />
                  {metric2 ? (
                    <Bar
                      dataKey="value2"
                      name={m2Label}
                      fill="#b45309"
                      radius={[6, 6, 0, 0]}
                    />
                  ) : null}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {!fog && series.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">{dLabel}</th>
                <th className="px-3 py-2">{m1Label}</th>
                {metric2 ? <th className="px-3 py-2">{m2Label}</th> : null}
                <th className="px-3 py-2">Part</th>
              </tr>
            </thead>
            <tbody>
              {series.map((p) => (
                <tr key={p.name} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {p.value.toLocaleString("fr-FR")}
                  </td>
                  {metric2 ? (
                    <td className="px-3 py-2 tabular-nums">
                      {(p.value2 ?? 0).toLocaleString("fr-FR")}
                    </td>
                  ) : null}
                  <td className="px-3 py-2 tabular-nums text-slate-500">
                    {total
                      ? `${Math.round((p.value / total) * 100)} %`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
