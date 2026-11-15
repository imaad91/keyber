"use client";

import Link from "next/link";
import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { OS_FLUX_EDGES, OS_FLUX_NODES } from "@/lib/keyberOsDocs";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { cn } from "@/lib/utils";

const VIEW_W = 860;
const VIEW_H = 860;

function nodeCenter(id: string) {
  const n = OS_FLUX_NODES.find((x) => x.id === id);
  if (!n) return { x: 0, y: 0 };
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

/**
 * Grand graphique lecture seule (zoom / pan / plein écran).
 * Boîtes cliquables → sous-onglet de la composante.
 */
export function KeyberOsFluxGraph() {
  const [scale, setScale] = useState(0.85);
  const [tx, setTx] = useState(20);
  const [ty, setTy] = useState(10);
  const [fullscreen, setFullscreen] = useState(false);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null
  );
  const shellRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
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
          Flux Keyber OS — lecture seule
        </p>
        <div className="flex flex-wrap gap-1">
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => setScale((s) => Math.min(1.6, s + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => setScale((s) => Math.max(0.45, s - 0.1))}
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
        className="relative h-[520px] cursor-grab overflow-hidden active:cursor-grabbing sm:h-[640px]"
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
          <svg
            width={VIEW_W}
            height={VIEW_H}
            className="absolute inset-0"
            aria-hidden
          >
            <defs>
              <marker
                id="os-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
              </marker>
            </defs>
            {OS_FLUX_EDGES.map((e) => {
              const a = nodeCenter(e.from);
              const b = nodeCenter(e.to);
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              return (
                <g key={`${e.from}-${e.to}-${e.label}`}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    markerEnd="url(#os-arrow)"
                  />
                  {e.label ? (
                    <text
                      x={mx}
                      y={my - 6}
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px]"
                    >
                      {e.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>

          {OS_FLUX_NODES.map((n) => {
            const clickable = Boolean(n.href);
            const className = cn(
              "absolute flex items-center justify-center rounded-xl border-2 px-2 text-center text-xs font-semibold leading-snug shadow-sm",
              clickable
                ? "border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
                : "border-slate-300 bg-slate-100 text-slate-700"
            );
            const style = {
              left: n.x,
              top: n.y,
              width: n.w,
              height: n.h,
            } as const;
            if (n.href) {
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  className={className}
                  style={style}
                  title={`Ouvrir ${n.label}`}
                >
                  {n.label}
                </Link>
              );
            }
            return (
              <div key={n.id} className={className} style={style}>
                {n.label}
              </div>
            );
          })}
        </div>
      </div>
      <p className="border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
        Glisser pour déplacer · zoom · clic sur une boîte composante pour ouvrir
        son sous-onglet.
      </p>
    </div>
  );
}
