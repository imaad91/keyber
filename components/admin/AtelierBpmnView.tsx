"use client";

import { useMemo, useRef, useState } from "react";
import type {
  BpmnDiagram,
  BpmnNode,
  BpmnTone,
} from "@/lib/atelierWorkflow";
import { NODE_H, NODE_W } from "@/lib/atelierWorkflow";
import { cn } from "@/lib/utils";

type Filter = "all" | "critical" | "ends";

const TONE_STROKE: Record<BpmnTone, string> = {
  success: "#16a34a",
  fail: "#dc2626",
  neutral: "#64748b",
  partial: "#ea580c",
};

function Legend() {
  return (
    <div className="absolute right-3 top-3 z-10 w-56 rounded-xl border border-slate-200 bg-white/95 p-3 text-[11px] shadow-sm backdrop-blur">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Légende BPMN 2.0
      </p>
      <ul className="space-y-1.5 text-slate-700">
        <li className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-full border-2 border-emerald-600 bg-emerald-100" />
          Événement de début
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3.5 w-8 rounded-md border-2 border-sky-600 bg-sky-100" />
          Tâche / activité
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex h-4 w-4 rotate-45 items-center justify-center border-2 border-orange-500 bg-orange-100 text-[8px] font-bold text-orange-700">
            <span className="-rotate-45">X</span>
          </span>
          Porte exclusive (décision)
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex h-4 w-4 rotate-45 items-center justify-center border-2 border-violet-500 bg-violet-100 text-[8px] font-bold text-violet-700">
            <span className="-rotate-45">+</span>
          </span>
          Porte parallèle
        </li>
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-6 bg-slate-800" />
          Flux de séquence
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-full border-4 border-rose-600 bg-rose-100" />
          Événement de fin
        </li>
      </ul>
    </div>
  );
}

function edgePath(from: BpmnNode, to: BpmnNode): string {
  const x1 = from.x + NODE_W;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_H / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function NodeShape({
  node,
  selected,
  onSelect,
}: {
  node: BpmnNode;
  selected: boolean;
  onSelect: () => void;
}) {
  const ring = selected ? "ring-2 ring-slate-900 ring-offset-2" : "";

  if (node.kind === "start") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "absolute flex flex-col items-center justify-center rounded-full border-[3px] border-emerald-600 bg-emerald-50 px-2 text-center shadow-sm",
          ring
        )}
        style={{ left: node.x, top: node.y, width: NODE_H, height: NODE_H }}
        title={node.label}
      >
        <span className="text-[10px] font-bold text-emerald-800">▶</span>
      </button>
    );
  }

  if (node.kind === "end") {
    const border =
      node.endKind === "success"
        ? "border-emerald-600 bg-emerald-50"
        : node.endKind === "partial"
          ? "border-orange-500 bg-orange-50"
          : "border-rose-600 bg-rose-50";
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "absolute flex items-center justify-center rounded-full border-[5px] shadow-sm",
          border,
          ring
        )}
        style={{ left: node.x, top: node.y, width: NODE_H, height: NODE_H }}
        title={node.label}
      >
        <span className="text-xs font-bold text-slate-800">✕</span>
      </button>
    );
  }

  if (node.kind === "exclusiveGateway" || node.kind === "parallelGateway") {
    const isEx = node.kind === "exclusiveGateway";
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn("absolute", ring)}
        style={{ left: node.x + 40, top: node.y + 8, width: 64, height: 64 }}
        title={node.label}
      >
        <span
          className={cn(
            "flex h-14 w-14 rotate-45 items-center justify-center border-[3px] shadow-sm",
            isEx
              ? "border-orange-500 bg-orange-100"
              : "border-violet-500 bg-violet-100"
          )}
        >
          <span
            className={cn(
              "-rotate-45 text-lg font-black",
              isEx ? "text-orange-700" : "text-violet-700"
            )}
          >
            {isEx ? "×" : "+"}
          </span>
        </span>
      </button>
    );
  }

  // task
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "absolute overflow-hidden rounded-xl border-2 border-sky-600 bg-sky-50 p-2 text-left shadow-sm",
        ring
      )}
      style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
    >
      <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-sky-950">
        {node.label}
      </p>
      {node.meta?.[0] ? (
        <p className="mt-1 line-clamp-1 text-[9px] text-sky-800/80">
          {node.meta[0]}
        </p>
      ) : null}
    </button>
  );
}

export function AtelierBpmnView({ diagram }: { diagram: BpmnDiagram }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selected = diagram.nodes.find((n) => n.id === selectedId) ?? null;

  const visible = useMemo(() => {
    if (filter === "all") return { nodes: diagram.nodes, edges: diagram.edges };
    if (filter === "ends") {
      const nodes = diagram.nodes.filter(
        (n) => n.kind === "start" || n.kind === "end" || n.kind === "exclusiveGateway"
      );
      const ids = new Set(nodes.map((n) => n.id));
      // keep path roughly: include edges between visible
      const edges = diagram.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
      return { nodes, edges };
    }
    // critical = gateways + adjacent
    const gates = diagram.nodes.filter((n) => n.kind === "exclusiveGateway");
    const gateIds = new Set(gates.map((g) => g.id));
    const edges = diagram.edges.filter(
      (e) => gateIds.has(e.from) || gateIds.has(e.to)
    );
    const ids = new Set<string>();
    gates.forEach((g) => ids.add(g.id));
    edges.forEach((e) => {
      ids.add(e.from);
      ids.add(e.to);
    });
    const nodes = diagram.nodes.filter((n) => ids.has(n.id));
    return { nodes, edges };
  }, [diagram, filter]);

  const width = Math.max(
    900,
    ...visible.nodes.map((n) => n.x + NODE_W + 80),
    0
  );
  const height = Math.max(
    420,
    ...visible.nodes.map((n) => n.y + NODE_H + 80),
    0
  );

  function exportPng() {
    const el = canvasRef.current;
    if (!el) return;
    const svg = el.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const html = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([html], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `workflow-${diagram.scenarioId}.png`;
      a.click();
    };
    img.src = url;
  }

  const nodeById = useMemo(() => {
    const m = new Map<string, BpmnNode>();
    visible.nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [visible.nodes]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "Voir tout"],
            ["critical", "Voir uniquement les décisions critiques"],
            ["ends", "Voir uniquement les fins"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              filter === id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            )}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={exportPng}
          className="ml-auto rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
        >
          Exporter en image (PNG)
        </button>
      </div>

      <div
        ref={canvasRef}
        className="relative overflow-x-auto rounded-2xl border border-slate-200 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:24px_24px] bg-white"
      >
        <Legend />
        {/* Swimlane labels */}
        {diagram.lanes.length > 1 ? (
          <div className="pointer-events-none absolute left-2 top-2 z-[5] space-y-2">
            {diagram.lanes.map((lane) => (
              <p
                key={lane}
                className="rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white"
              >
                {lane}
              </p>
            ))}
          </div>
        ) : null}

        <div className="relative" style={{ width, height, minHeight: 420 }}>
          <svg
            width={width}
            height={height}
            className="absolute inset-0"
            aria-hidden
          >
            <defs>
              <marker
                id="bpmn-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="#0f172a" />
              </marker>
            </defs>
            {visible.edges.map((e) => {
              const from = nodeById.get(e.from);
              const to = nodeById.get(e.to);
              if (!from || !to) return null;
              const stroke = TONE_STROKE[e.tone];
              const d = edgePath(from, to);
              const mx = (from.x + NODE_W + to.x) / 2;
              const my = (from.y + to.y) / 2 + NODE_H / 2;
              return (
                <g key={e.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={2.25}
                    markerEnd="url(#bpmn-arrow)"
                  />
                  <foreignObject
                    x={mx - 70}
                    y={my - 18}
                    width={140}
                    height={36}
                  >
                    <div className="rounded bg-white/95 px-1.5 py-0.5 text-center text-[9px] font-medium leading-tight text-slate-700 shadow-sm ring-1 ring-slate-200">
                      {e.label}
                      {e.impactSuite ? (
                        <span className="block text-[8px] text-slate-500">
                          {e.impactSuite}
                        </span>
                      ) : null}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {visible.nodes.map((n) => (
            <div key={n.id}>
              <NodeShape
                node={n}
                selected={selectedId === n.id}
                onSelect={() => setSelectedId(n.id)}
              />
              {(n.kind === "start" ||
                n.kind === "end" ||
                n.kind === "exclusiveGateway") && (
                <p
                  className="pointer-events-none absolute max-w-[160px] text-center text-[9px] font-medium leading-snug text-slate-600"
                  style={{
                    left: n.x - 10,
                    top: n.y + NODE_H + 4,
                    width: n.kind === "exclusiveGateway" ? 140 : NODE_W,
                  }}
                >
                  {n.label}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {selected.kind === "exclusiveGateway"
              ? "Porte exclusive — décision"
              : selected.kind === "task"
                ? "Tâche / activité"
                : selected.kind === "start"
                  ? "Événement de début"
                  : selected.kind === "end"
                    ? "Événement de fin"
                    : "Élément BPMN"}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            {selected.label}
          </h3>
          {selected.detail?.question &&
          selected.kind === "exclusiveGateway" ? (
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-semibold">Question :</span>{" "}
              {selected.detail.question}
            </p>
          ) : null}
          {selected.competenceNom ? (
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-semibold">Compétence :</span>{" "}
              {selected.competenceNom}
            </p>
          ) : null}
          {selected.jour ? (
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-semibold">Jour :</span> {selected.jour}
            </p>
          ) : null}
          {selected.detail?.requires ? (
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-semibold">Nécessite :</span>{" "}
              {selected.detail.requires}
            </p>
          ) : null}
          {selected.detail?.actor ? (
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-semibold">Qui :</span>{" "}
              {selected.detail.actor}
            </p>
          ) : null}
          {selected.detail?.feedbackBon ? (
            <p className="mt-2 text-sm text-emerald-800">
              {selected.detail.feedbackBon}
            </p>
          ) : null}
          {selected.detail?.feedbackMauvais ? (
            <p className="mt-1 text-sm text-rose-800">
              {selected.detail.feedbackMauvais}
            </p>
          ) : null}
          {selected.meta?.length ? (
            <ul className="mt-2 list-inside list-disc text-xs text-slate-600">
              {selected.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Ce scénario contient{" "}
        <strong>{diagram.summary.portes}</strong> portes exclusives (points de
        décision), <strong>{diagram.summary.taches}</strong> tâches (actions),{" "}
        <strong>{diagram.summary.fins}</strong> fins possibles. La compétence la
        plus travaillée est{" "}
        <strong>{diagram.summary.competencePlusTravaillee}</strong>. Le point le
        plus critique est « {diagram.summary.pointCritique} ».
      </p>
    </div>
  );
}
