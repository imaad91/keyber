"use client";

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import type { BookGraphView } from "@/lib/bookStore";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { cn } from "@/lib/utils";

const VIEW_W = 720;
const VIEW_H = 420;

function nodeCenter(graph: BookGraphView, id: string) {
  const n = graph.nodes.find((x) => x.id === id);
  if (!n) return { x: 0, y: 0 };
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

/** Vue Graphique scénario — zoom / pan / plein écran (style Workflow). */
export function BookScenarioGraph({
  graph,
  title = "Vue Graphique",
}: {
  graph: BookGraphView;
  title?: string;
}) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(24);
  const [ty, setTy] = useState(24);
  const [fullscreen, setFullscreen] = useState(false);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null
  );
  const shellRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      drag.current = { x: e.clientX, y: e.clientY, tx, ty };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [tx, ty]
  );

  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    if (!drag.current) return;
    setTx(drag.current.tx + (e.clientX - drag.current.x));
    setTy(drag.current.ty + (e.clientY - drag.current.y));
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  async function toggleFullscreen() {
    const el = shellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
      setFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setFullscreen(false);
    }
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "rounded-2xl border-2 border-slate-200 bg-slate-50 shadow-sm",
        fullscreen && "bg-white p-4"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <div className="flex flex-wrap gap-1">
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => setScale((s) => Math.min(1.8, s + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </AdminButton>
          <AdminButton type="button" variant="ghost" onClick={toggleFullscreen}>
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            {fullscreen ? "Quitter" : "Plein écran"}
          </AdminButton>
        </div>
      </div>

      <div
        className="relative h-[420px] cursor-grab overflow-hidden active:cursor-grabbing sm:h-[520px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="origin-top-left select-none"
          style={{
            width: VIEW_W,
            height: VIEW_H,
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          }}
        >
          <svg width={VIEW_W} height={VIEW_H} className="absolute inset-0">
            {graph.edges.map((ed, i) => {
              const a = nodeCenter(graph, ed.from);
              const b = nodeCenter(graph, ed.to);
              return (
                <g key={`${ed.from}-${ed.to}-${i}`}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="#94a3b8"
                    strokeWidth={2}
                    markerEnd="url(#arrow)"
                  />
                  {ed.label ? (
                    <text
                      x={(a.x + b.x) / 2}
                      y={(a.y + b.y) / 2 - 6}
                      textAnchor="middle"
                      className="fill-slate-500"
                      fontSize={11}
                    >
                      {ed.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
            <defs>
              <marker
                id="arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>
          {graph.nodes.map((n) => (
            <div
              key={n.id}
              className="absolute flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-2 text-center text-xs font-semibold text-slate-800 shadow-sm"
              style={{
                left: n.x,
                top: n.y,
                width: n.w,
                height: n.h,
              }}
            >
              {n.label}
            </div>
          ))}
        </div>
      </div>
      <p className="border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
        Glisser pour déplacer · zoom · plein écran
      </p>
    </div>
  );
}
