"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useBookStore } from "@/lib/bookStore";
import type { KeyberOsComposanteId } from "@/lib/keyberOsDocs";
import {
  getModuleArchitecture,
  type OsArchNodeState,
} from "@/lib/keyberOs/moduleArchitecture";
import { useOsModuleChangeLog } from "@/lib/keyberOs/moduleChangeLog";
import {
  diagnoseOsModule,
  formatRelativeFr,
  type OsHealthTone,
} from "@/lib/keyberOs/moduleDiagnostics";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";

function toneClasses(tone: OsHealthTone) {
  switch (tone) {
    case "green":
      return {
        badge: "bg-emerald-100 text-emerald-900 ring-emerald-300",
        dot: "bg-emerald-500",
        border: "border-emerald-200",
        label: "VERT",
      };
    case "yellow":
      return {
        badge: "bg-amber-100 text-amber-950 ring-amber-300",
        dot: "bg-amber-400",
        border: "border-amber-200",
        label: "JAUNE",
      };
    case "red":
      return {
        badge: "bg-rose-100 text-rose-950 ring-rose-300",
        dot: "bg-rose-500",
        border: "border-rose-200",
        label: "ROUGE",
      };
  }
}

function nodeClasses(state: OsArchNodeState) {
  switch (state) {
    case "ok":
      return "border-emerald-400 bg-emerald-50 text-emerald-950";
    case "warn":
      return "border-amber-400 bg-amber-50 text-amber-950";
    case "missing":
      return "border-rose-400 bg-rose-50 text-rose-950";
    case "off":
      return "border-slate-300 bg-slate-100 text-slate-500";
    case "optional":
      return "border-dashed border-slate-300 bg-white text-slate-600";
  }
}

function ArchitectureGraph({
  moduleId,
  signals,
}: {
  moduleId: KeyberOsComposanteId;
  signals: Record<string, OsArchNodeState>;
}) {
  const arch = getModuleArchitecture(moduleId);
  const nodeIndex = useMemo(() => {
    const m = new Map<string, number>();
    arch.nodes.forEach((n, i) => m.set(n.id, i));
    return m;
  }, [arch.nodes]);

  return (
    <div>
      <p className="mb-3 text-xs leading-relaxed text-slate-600">
        {arch.summary}
      </p>
      <div className="flex flex-col items-stretch gap-0">
        {arch.nodes.map((node, i) => {
          const state = node.signal
            ? signals[node.signal] ?? "optional"
            : "ok";
          const outs = arch.edges.filter((e) => e.from === node.id);
          return (
            <div key={node.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-full max-w-sm rounded-xl border-2 px-3 py-2 text-center text-sm font-medium",
                  nodeClasses(state)
                )}
                title={node.signal ? `signal: ${node.signal}` : undefined}
              >
                {node.label}
              </div>
              {i < arch.nodes.length - 1 || outs.length > 0 ? (
                <div className="flex flex-col items-center py-1" aria-hidden>
                  {outs.length > 0 || i < arch.nodes.length - 1 ? (
                    <>
                      <div className="h-4 w-0.5 bg-slate-300" />
                      <svg
                        width="18"
                        height="10"
                        viewBox="0 0 20 12"
                        className="text-slate-400"
                      >
                        <path
                          d="M2 2 L10 10 L18 2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  ) : null}
                  {outs.length > 1 ? (
                    <p className="mb-1 text-[10px] text-slate-400">
                      →{" "}
                      {outs
                        .map((e) => arch.nodes[nodeIndex.get(e.to) ?? -1]?.label)
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
        <li className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-emerald-400 bg-emerald-50" />
          OK
        </li>
        <li className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-amber-400 bg-amber-50" />
          Attention
        </li>
        <li className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-rose-400 bg-rose-50" />
          Manquant
        </li>
        <li className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-dashed border-slate-300 bg-white" />
          Optionnel
        </li>
      </ul>
    </div>
  );
}

/**
 * Dashboard architecture + santé pour une composante Keyber OS.
 * Se met à jour à chaque save runtime / changement Book Live.
 */
export function OsModuleDashboard({
  moduleId,
}: {
  moduleId: KeyberOsComposanteId;
}) {
  const { config } = useKeyberOsRuntime();
  const book = useBookStore();
  const live = book.entriesByStatus("live");
  const diag = useMemo(
    () => diagnoseOsModule(moduleId, config, live),
    [moduleId, config, live]
  );
  const changes = useOsModuleChangeLog(moduleId, 5);
  const tone = toneClasses(diag.tone);

  return (
    <section
      className={cn(
        "mb-6 overflow-hidden rounded-2xl border-2 bg-white shadow-sm",
        tone.border
      )}
      aria-label={`Dashboard ${moduleId}`}
    >
      {/* Zone 1 — santé */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset",
              tone.badge
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", tone.dot)} />
            {tone.label}
          </span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
              diag.enabled
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-600"
            )}
          >
            {diag.enabled ? "ON" : "OFF"}
          </span>
          <span className="text-xs text-slate-500">
            maj runtime {formatRelativeFr(config.updatedAt)}
          </span>
        </div>
        <Link
          href="/admin/systeme/vue-globale"
          className="text-xs font-semibold text-slate-700 underline-offset-2 hover:underline"
        >
          Vue Globale →
        </Link>
      </header>

      <p className="border-b border-slate-100 px-4 py-2 text-sm text-slate-700">
        {diag.headline}
      </p>

      <div className="grid gap-0 lg:grid-cols-2">
        {/* Zone 2 — architecture */}
        <div className="border-b border-slate-100 p-4 lg:border-b-0 lg:border-r">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Architecture
          </h3>
          <ArchitectureGraph moduleId={moduleId} signals={diag.signals} />
        </div>

        {/* Zone 3 — diagnostic */}
        <div className="p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Diagnostic — ce qui manque
          </h3>
          <ul className="space-y-1.5 text-sm">
            {diag.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold",
                    c.ok
                      ? "bg-emerald-100 text-emerald-800"
                      : c.soft
                        ? "bg-amber-100 text-amber-900"
                        : "bg-rose-100 text-rose-900"
                  )}
                  aria-hidden
                >
                  {c.ok ? "✓" : "!"}
                </span>
                <span
                  className={cn(
                    c.ok ? "text-slate-700" : "font-medium text-slate-900"
                  )}
                >
                  {c.label}
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Derniers changements
          </h3>
          {changes.length === 0 ? (
            <p className="text-xs text-slate-500">
              Aucun changement runtime encore — bascule un toggle ci-dessous.
            </p>
          ) : (
            <ul className="space-y-1.5 text-xs text-slate-700">
              {changes.map((e) => (
                <li
                  key={e.id}
                  className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5"
                >
                  <span className="shrink-0 font-mono text-[10px] text-slate-500">
                    {formatRelativeFr(e.at)}
                  </span>
                  <span>{e.summary}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/** Pastille compacte pour Vue Globale. */
export function OsModuleHealthPill({
  moduleId,
}: {
  moduleId: KeyberOsComposanteId;
}) {
  const { config } = useKeyberOsRuntime();
  const book = useBookStore();
  const live = book.entriesByStatus("live");
  const diag = useMemo(
    () => diagnoseOsModule(moduleId, config, live),
    [moduleId, config, live]
  );
  const tone = toneClasses(diag.tone);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset",
        tone.badge
      )}
      title={diag.headline}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {tone.label}
    </span>
  );
}
