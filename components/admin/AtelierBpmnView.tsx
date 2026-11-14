"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type {
  BpmnDiagram,
  BpmnNode,
  BpmnTone,
} from "@/lib/atelierWorkflow";
import { NODE_H, NODE_W, ROW_H } from "@/lib/atelierWorkflow";
import { cn } from "@/lib/utils";

type Filter = "all" | "critical" | "ends";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const PAN_STEP = 48;

const TONE_STROKE: Record<BpmnTone, string> = {
  success: "#16a34a",
  fail: "#dc2626",
  neutral: "#64748b",
  partial: "#ea580c",
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function Legend() {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 w-52 rounded-xl border border-slate-200 bg-white/95 p-3 text-[11px] shadow-sm backdrop-blur">
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

function edgePath(
  from: BpmnNode,
  to: BpmnNode,
  fromY: number,
  toY: number
): string {
  const x1 = from.x + NODE_W;
  const y1 = fromY + NODE_H / 2;
  const x2 = to.x;
  const y2 = toY + NODE_H / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function NodeShape({
  node,
  selected,
  searchHit,
  dimmed,
  onSelect,
  onHover,
}: {
  node: BpmnNode;
  selected: boolean;
  searchHit: boolean;
  dimmed: boolean;
  onSelect: () => void;
  onHover: (id: string | null) => void;
}) {
  const ring = selected
    ? "ring-2 ring-slate-900 ring-offset-2"
    : searchHit
      ? "ring-2 ring-amber-400 ring-offset-2"
      : "";
  const opacity = dimmed ? "opacity-35" : "opacity-100";

  if (node.kind === "start") {
    return (
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        className={cn(
          "absolute flex flex-col items-center justify-center rounded-full border-[3px] border-emerald-600 bg-emerald-50 px-2 text-center shadow-sm transition",
          ring,
          opacity
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
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        className={cn(
          "absolute flex items-center justify-center rounded-full border-[5px] shadow-sm transition",
          border,
          ring,
          opacity
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
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        className={cn("absolute transition", ring, opacity)}
        style={{ left: node.x + 40, top: node.y + 8, width: 64, height: 64 }}
        title={node.label}
      >
        <span
          className={cn(
            "flex h-14 w-14 rotate-45 items-center justify-center border-[3px] shadow-sm",
            isEx
              ? "border-orange-500 bg-orange-100"
              : "border-violet-500 bg-violet-100",
            searchHit && "bg-amber-200"
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

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "absolute overflow-hidden rounded-xl border-2 border-sky-600 bg-sky-50 p-2 text-left shadow-sm transition",
        searchHit && "bg-amber-100 border-amber-500",
        ring,
        opacity
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
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchHits, setSearchHits] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [collapsedLanes, setCollapsedLanes] = useState<Set<string>>(new Set());
  const [showMinimap, setShowMinimap] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [decisionIndex, setDecisionIndex] = useState(-1);
  const [panning, setPanning] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null
  );
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);

  const decisions = useMemo(
    () =>
      diagram.nodes
        .filter((n) => n.kind === "exclusiveGateway")
        .sort((a, b) => a.x - b.x || a.y - b.y),
    [diagram.nodes]
  );

  const startNode = useMemo(
    () => diagram.nodes.find((n) => n.kind === "start"),
    [diagram.nodes]
  );

  const laneLayout = useMemo(() => {
    const map = new Map<
      string,
      { top: number; height: number; collapsed: boolean; index: number }
    >();
    let y = 16;
    diagram.lanes.forEach((lane, index) => {
      const collapsed = collapsedLanes.has(lane);
      const height = collapsed ? 40 : ROW_H;
      map.set(lane, { top: y, height, collapsed, index });
      y += height;
    });
    return { map, totalH: Math.max(y + 80, 420) };
  }, [diagram.lanes, collapsedLanes]);

  const displayY = useCallback(
    (node: BpmnNode) => {
      const lane = node.lane ?? diagram.lanes[0] ?? "Joueur";
      const layout = laneLayout.map.get(lane);
      if (!layout) return node.y;
      const base = 40 + layout.index * ROW_H;
      return layout.top + (node.y - base);
    },
    [diagram.lanes, laneLayout]
  );

  const contentBounds = useMemo(() => {
    const nodes = diagram.nodes;
    if (!nodes.length) return { w: 900, h: 420 };
    return {
      w: Math.max(900, ...nodes.map((n) => n.x + NODE_W + 120)),
      h: Math.max(laneLayout.totalH, ...nodes.map((n) => displayY(n) + NODE_H + 100)),
    };
  }, [diagram.nodes, laneLayout.totalH, displayY]);

  const visible = useMemo(() => {
    let nodes = diagram.nodes.filter(
      (n) => !n.lane || !collapsedLanes.has(n.lane)
    );
    if (filter === "ends") {
      nodes = nodes.filter(
        (n) =>
          n.kind === "start" ||
          n.kind === "end" ||
          n.kind === "exclusiveGateway"
      );
    } else if (filter === "critical") {
      const gates = nodes.filter((n) => n.kind === "exclusiveGateway");
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
      nodes = nodes.filter((n) => ids.has(n.id));
    }
    const ids = new Set(nodes.map((n) => n.id));
    const edges = diagram.edges.filter(
      (e) => ids.has(e.from) && ids.has(e.to)
    );
    return { nodes, edges };
  }, [diagram, filter, collapsedLanes]);

  const nodeById = useMemo(() => {
    const m = new Map<string, BpmnNode>();
    visible.nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [visible.nodes]);

  const connectedEdgeIds = useMemo(() => {
    const focus = hoverId ?? selectedId;
    if (!focus) return null;
    const set = new Set<string>();
    diagram.edges.forEach((e) => {
      if (e.from === focus || e.to === focus) set.add(e.id);
    });
    return set;
  }, [hoverId, selectedId, diagram.edges]);

  const centerOnNode = useCallback(
    (node: BpmnNode | undefined, nextZoom?: number) => {
      const vp = viewportRef.current;
      if (!vp || !node) return;
      const z = nextZoom ?? zoom;
      const vw = vp.clientWidth;
      const vh = vp.clientHeight;
      const cx = node.x + NODE_W / 2;
      const cy = displayY(node) + NODE_H / 2;
      setPan({
        x: vw / 2 - cx * z,
        y: vh / 2 - cy * z,
      });
      if (nextZoom !== undefined) setZoom(nextZoom);
    },
    [zoom, displayY]
  );

  const setZoomAround = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      const vp = viewportRef.current;
      if (!vp) {
        setZoom(z);
        return;
      }
      const rect = vp.getBoundingClientRect();
      const mx = (clientX ?? rect.left + rect.width / 2) - rect.left;
      const my = (clientY ?? rect.top + rect.height / 2) - rect.top;
      const worldX = (mx - pan.x) / zoom;
      const worldY = (my - pan.y) / zoom;
      setZoom(z);
      setPan({
        x: mx - worldX * z,
        y: my - worldY * z,
      });
    },
    [pan.x, pan.y, zoom]
  );

  const resetView = useCallback(() => {
    setZoom(1);
    if (startNode) {
      // defer center after zoom state
      requestAnimationFrame(() => centerOnNode(startNode, 1));
    } else {
      setPan({ x: 24, y: 24 });
    }
  }, [startNode, centerOnNode]);

  const overview = useCallback(() => {
    const vp = viewportRef.current;
    const z = MIN_ZOOM;
    setZoom(z);
    if (!vp) {
      setPan({ x: 24, y: 24 });
      return;
    }
    setPan({
      x: (vp.clientWidth - contentBounds.w * z) / 2,
      y: (vp.clientHeight - contentBounds.h * z) / 2,
    });
  }, [contentBounds]);

  // Search
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setSearchHits([]);
      return;
    }
    const hits = diagram.nodes
      .filter((n) => {
        const blob = `${n.label} ${(n.meta ?? []).join(" ")} ${n.competenceNom ?? ""} ${n.lane ?? ""}`.toLowerCase();
        return blob.includes(q);
      })
      .map((n) => n.id);
    setSearchHits(hits);
    if (hits[0]) {
      const node = diagram.nodes.find((n) => n.id === hits[0]);
      if (node) {
        setSelectedId(node.id);
        centerOnNode(node, Math.max(zoom, 1.25));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- center only when query changes
  }, [search]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPan((p) => ({ ...p, x: p.x + PAN_STEP }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPan((p) => ({ ...p, x: p.x - PAN_STEP }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setPan((p) => ({ ...p, y: p.y + PAN_STEP }));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setPan((p) => ({ ...p, y: p.y - PAN_STEP }));
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          setZoomAround(zoom + ZOOM_STEP);
        } else if (e.key === "-") {
          e.preventDefault();
          setZoomAround(zoom - ZOOM_STEP);
        } else if (e.key === "0") {
          e.preventDefault();
          resetView();
        }
      }
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, setZoomAround, resetView, fullscreen]);

  // Initial center on start
  useEffect(() => {
    requestAnimationFrame(() => {
      if (startNode) centerOnNode(startNode, 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram.scenarioId]);

  function onWheel(e: ReactWheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoomAround(zoom + delta, e.clientX, e.clientY);
  }

  function onPointerDown(e: ReactPointerEvent) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    setPanning(true);
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent) {
    // pinch zoom (touch)
    if (e.nativeEvent instanceof PointerEvent === false) {
      /* noop */
    }
    if (panStart.current && panning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({
        x: panStart.current.panX + dx,
        y: panStart.current.panY + dy,
      });
    }
  }

  function onPointerUp(e: ReactPointerEvent) {
    setPanning(false);
    panStart.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  // Touch pinch
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    function onTouchMove(ev: TouchEvent) {
      if (ev.touches.length !== 2) return;
      ev.preventDefault();
      const a = ev.touches[0]!;
      const b = ev.touches[1]!;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (!pinchRef.current) {
        pinchRef.current = { dist, zoom };
        return;
      }
      const ratio = dist / pinchRef.current.dist;
      const midX = (a.clientX + b.clientX) / 2;
      const midY = (a.clientY + b.clientY) / 2;
      setZoomAround(pinchRef.current.zoom * ratio, midX, midY);
    }
    function onTouchEnd() {
      pinchRef.current = null;
    }
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [zoom, setZoomAround]);

  function goDecision(delta: number) {
    if (!decisions.length) return;
    const base = decisionIndex < 0 ? (delta > 0 ? -1 : 0) : decisionIndex;
    const next = clamp(base + delta, 0, decisions.length - 1);
    setDecisionIndex(next);
    const node = decisions[next]!;
    setSelectedId(node.id);
    centerOnNode(node, Math.max(zoom, 1.1));
  }

  function jumpBreadcrumb(id: string) {
    const node = diagram.nodes.find((n) => n.id === id);
    if (!node) return;
    if (node.kind === "exclusiveGateway") {
      const idx = decisions.findIndex((d) => d.id === id);
      if (idx >= 0) setDecisionIndex(idx);
    }
    setSelectedId(id);
    centerOnNode(node, Math.max(zoom, 1.1));
  }

  function toggleLane(lane: string) {
    setCollapsedLanes((prev) => {
      const next = new Set(prev);
      if (next.has(lane)) next.delete(lane);
      else next.add(lane);
      return next;
    });
  }

  function exportPng() {
    const svg = worldRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const html = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([html], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = contentBounds.w;
      canvas.height = contentBounds.h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `workflow-${diagram.scenarioId}.png`;
      a.click();
    };
    img.src = url;
  }

  const selected = diagram.nodes.find((n) => n.id === selectedId) ?? null;

  const crumbItems = useMemo(() => {
    const items: { id: string; label: string }[] = [];
    if (startNode) items.push({ id: startNode.id, label: "Début" });
    decisions.forEach((d, i) =>
      items.push({ id: d.id, label: `Décision ${i + 1}` })
    );
    const ends = diagram.nodes.filter((n) => n.kind === "end");
    if (ends[0]) items.push({ id: ends[0].id, label: "Fin" });
    return items;
  }, [startNode, decisions, diagram.nodes]);

  // Minimap viewport rect in world coords
  const minimap = useMemo(() => {
    const vp = viewportRef.current;
    const vw = vp?.clientWidth ?? 800;
    const vh = vp?.clientHeight ?? 500;
    const scale = Math.min(180 / contentBounds.w, 110 / contentBounds.h);
    const worldLeft = -pan.x / zoom;
    const worldTop = -pan.y / zoom;
    const worldW = vw / zoom;
    const worldH = vh / zoom;
    return {
      scale,
      mapW: contentBounds.w * scale,
      mapH: contentBounds.h * scale,
      rect: {
        x: worldLeft * scale,
        y: worldTop * scale,
        w: worldW * scale,
        h: worldH * scale,
      },
    };
  }, [pan, zoom, contentBounds]);

  function onMinimapPointer(e: ReactPointerEvent<HTMLDivElement>) {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const worldX = mx / minimap.scale;
    const worldY = my / minimap.scale;
    setPan({
      x: vp.clientWidth / 2 - worldX * zoom,
      y: vp.clientHeight / 2 - worldY * zoom,
    });
  }

  const shellClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-white p-3"
    : "flex flex-col";

  return (
    <div className={shellClass}>
      {/* Top toolbar */}
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
          onClick={overview}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Vue d&apos;ensemble
        </button>
        <button
          type="button"
          onClick={exportPng}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
        >
          Exporter en image (PNG)
        </button>
        <button
          type="button"
          onClick={() => setFullscreen((v) => !v)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          {fullscreen ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              Quitter le plein écran
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              Plein écran
            </>
          )}
        </button>
      </div>

      {/* Search + decision nav */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une tâche, une décision, une composante…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <button
          type="button"
          onClick={() => goDecision(-1)}
          disabled={decisionIndex <= 0 || !decisions.length}
          className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Décision précédente
        </button>
        <button
          type="button"
          onClick={() => goDecision(1)}
          disabled={
            !decisions.length ||
            decisionIndex >= decisions.length - 1
          }
          className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
        >
          Décision suivante
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Breadcrumb */}
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-500">
        {crumbItems.map((c, i) => (
          <span key={c.id} className="inline-flex items-center gap-1">
            {i > 0 ? <span aria-hidden>→</span> : null}
            <button
              type="button"
              onClick={() => jumpBreadcrumb(c.id)}
              className={cn(
                "rounded px-1.5 py-0.5 font-medium hover:bg-slate-100 hover:text-slate-900",
                selectedId === c.id && "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
              )}
            >
              {c.label}
            </button>
          </span>
        ))}
      </nav>

      {/* Viewport */}
      <div
        ref={viewportRef}
        className={cn(
          "relative min-h-[480px] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] bg-slate-50",
          panning ? "cursor-grabbing" : "cursor-grab",
          fullscreen && "min-h-0"
        )}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Legend />

        <div
          ref={worldRef}
          className="origin-top-left will-change-transform"
          style={{
            width: contentBounds.w,
            height: contentBounds.h,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Swimlane bands + fold */}
          {diagram.lanes.map((lane, i) => {
            const layout = laneLayout.map.get(lane);
            if (!layout) return null;
            const folded = layout.collapsed;
            return (
              <div
                key={lane}
                className={cn(
                  "absolute left-0 border-b border-slate-200/80",
                  i % 2 === 0 ? "bg-slate-100/40" : "bg-white/30"
                )}
                style={{
                  top: layout.top,
                  width: contentBounds.w,
                  height: layout.height,
                }}
              >
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    toggleLane(lane);
                  }}
                  onPointerDown={(ev) => ev.stopPropagation()}
                  className="absolute left-1 top-1 z-10 rounded-md bg-white/95 px-1.5 py-1 text-[9px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                  title={folded ? `Déplier ${lane}` : `Plier ${lane}`}
                >
                  {folded ? "▸" : "▾"} {lane}
                </button>
              </div>
            );
          })}

          <svg
            width={contentBounds.w}
            height={contentBounds.h}
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
              const fromY = displayY(from);
              const toY = displayY(to);
              const focus = connectedEdgeIds;
              const isHot = !focus || focus.has(e.id);
              const stroke = isHot ? TONE_STROKE[e.tone] : "#cbd5e1";
              const width = isHot && focus ? 3.5 : isHot ? 2.25 : 1.25;
              const d = edgePath(from, to, fromY, toY);
              const mx = (from.x + NODE_W + to.x) / 2;
              const my = (fromY + toY) / 2 + NODE_H / 2;
              return (
                <g key={e.id} opacity={isHot ? 1 : 0.35}>
                  <path
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={width}
                    markerEnd="url(#bpmn-arrow)"
                  />
                  {isHot ? (
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
                  ) : null}
                </g>
              );
            })}
          </svg>

          {visible.nodes.map((n) => {
            const dy = displayY(n);
            const positioned = { ...n, y: dy };
            const dimmed = Boolean(
              connectedEdgeIds &&
                hoverId &&
                n.id !== hoverId &&
                !diagram.edges.some(
                  (e) =>
                    (e.from === hoverId && e.to === n.id) ||
                    (e.to === hoverId && e.from === n.id)
                )
            );
            return (
              <div key={n.id}>
                <NodeShape
                  node={positioned}
                  selected={selectedId === n.id}
                  searchHit={searchHits.includes(n.id)}
                  dimmed={dimmed}
                  onSelect={() => {
                    setSelectedId(n.id);
                    centerOnNode(n);
                  }}
                  onHover={setHoverId}
                />
                {(n.kind === "start" ||
                  n.kind === "end" ||
                  n.kind === "exclusiveGateway") && (
                  <p
                    className="pointer-events-none absolute max-w-[160px] text-center text-[9px] font-medium leading-snug text-slate-600"
                    style={{
                      left: n.x - 10,
                      top: dy + NODE_H + 4,
                      width: n.kind === "exclusiveGateway" ? 140 : NODE_W,
                    }}
                  >
                    {n.label}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Minimap + zoom controls */}
        <div className="absolute bottom-3 right-3 z-30 flex flex-col items-end gap-2">
          {showMinimap ? (
            <div
              className="relative overflow-hidden rounded-lg border border-slate-300 bg-white/95 shadow-md"
              style={{ width: minimap.mapW, height: minimap.mapH }}
              onPointerDown={onMinimapPointer}
              title="Minimap — cliquer pour se déplacer"
            >
              <svg width={minimap.mapW} height={minimap.mapH} className="block">
                {diagram.nodes
                  .filter((n) => !n.lane || !collapsedLanes.has(n.lane))
                  .map((n) => (
                  <rect
                    key={n.id}
                    x={n.x * minimap.scale}
                    y={displayY(n) * minimap.scale}
                    width={Math.max(2, NODE_W * minimap.scale * 0.35)}
                    height={Math.max(2, NODE_H * minimap.scale * 0.35)}
                    fill={
                      n.kind === "exclusiveGateway"
                        ? "#f97316"
                        : n.kind === "task"
                          ? "#0ea5e9"
                          : n.kind === "start"
                            ? "#16a34a"
                            : "#e11d48"
                    }
                    opacity={0.85}
                  />
                ))}
                <rect
                  x={clamp(minimap.rect.x, 0, minimap.mapW)}
                  y={clamp(minimap.rect.y, 0, minimap.mapH)}
                  width={clamp(minimap.rect.w, 8, minimap.mapW)}
                  height={clamp(minimap.rect.h, 8, minimap.mapH)}
                  fill="rgba(15,23,42,0.12)"
                  stroke="#0f172a"
                  strokeWidth={1.5}
                />
              </svg>
            </div>
          ) : null}

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-md backdrop-blur">
            <button
              type="button"
              onClick={() => setShowMinimap((v) => !v)}
              className="rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
            >
              {showMinimap ? "Masquer carte" : "Carte"}
            </button>
            <button
              type="button"
              onClick={() => setZoomAround(zoom - ZOOM_STEP)}
              className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100"
              aria-label="Dézoomer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-xs font-semibold tabular-nums text-slate-800">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomAround(zoom + ZOOM_STEP)}
              className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100"
              aria-label="Zoomer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
            >
              Réinitialiser
            </button>
          </div>
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
          {selected.meta?.length ? (
            <ul className="mt-2 list-inside list-disc text-xs text-slate-600">
              {selected.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {!fullscreen ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Ce scénario contient{" "}
          <strong>{diagram.summary.portes}</strong> portes exclusives (points de
          décision), <strong>{diagram.summary.taches}</strong> tâches (actions),{" "}
          <strong>{diagram.summary.fins}</strong> fins possibles. La compétence
          la plus travaillée est{" "}
          <strong>{diagram.summary.competencePlusTravaillee}</strong>. Le point
          le plus critique est « {diagram.summary.pointCritique} ».
        </p>
      ) : null}
    </div>
  );
}
