"use client";

import {
  CLEAR_CAMPUS_FORBIDDEN,
  CLEAR_CAMPUS_GLOSSARY,
  CLEAR_CAMPUS_LIGHT_TOKENS,
  CLEAR_CAMPUS_THEME,
  CLEAR_CAMPUS_CHARACTER_STYLE_DEFAULT,
} from "@/lib/clearCampus/charter";
import { summarizeClearCampusBlocks } from "@/lib/clearCampus/schema";
import { normalizeScenarioParamFile } from "@/lib/scenarioParamSchema";

type Props = {
  /** Param brut ou normalisé — lecture seule. */
  param?: unknown | null;
};

/**
 * Phase 1 — aperçu schéma Clear Campus (Admin Données).
 * Aucun moteur runtime ici.
 */
export function ClearCampusSchemaPanel({ param }: Props) {
  const normalized = param ? normalizeScenarioParamFile(param) : null;
  const rows = normalized
    ? summarizeClearCampusBlocks(normalized)
    : summarizeClearCampusBlocks({});

  return (
    <section className="mb-6 rounded-2xl border border-teal-200 bg-teal-50/40 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">
            Clear Campus · Phase 0–1
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">
            Schéma monde + Vue Live Production
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Contrats param uniquement. Thème{" "}
            <span className="font-medium text-teal-800">{CLEAR_CAMPUS_THEME}</span>{" "}
            obligatoire · personnages défaut{" "}
            <span className="font-medium text-teal-800">
              {CLEAR_CAMPUS_CHARACTER_STYLE_DEFAULT}
            </span>
            . Suite outils = alias d&apos;Ordinateur.
          </p>
        </div>
        <div
          className="flex gap-1.5 rounded-lg border border-slate-200 bg-white p-2"
          title="Tokens light"
        >
          {Object.entries(CLEAR_CAMPUS_LIGHT_TOKENS)
            .slice(0, 6)
            .map(([name, hex]) => (
              <span
                key={name}
                className="h-6 w-6 rounded-md border border-slate-200"
                style={{ backgroundColor: hex }}
                title={`${name} ${hex}`}
              />
            ))}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li
            key={r.key}
            className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium text-slate-900">
                {r.label}{" "}
                <span className="font-mono text-[11px] text-slate-400">
                  <code>{r.key}</code>
                </span>
              </p>
              <p className="text-xs text-slate-500">{r.detail}</p>
            </div>
            <span
              className={
                r.filled
                  ? "shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                  : "shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500"
              }
            >
              {r.filled ? "OK" : "Vide"}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Glossaire
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
            {CLEAR_CAMPUS_GLOSSARY.map((g) => (
              <li key={g.id}>
                <span className="font-medium text-slate-800">{g.label}</span>
                {" — "}
                {g.def}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">
            Interdit
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-rose-800/80">
            {CLEAR_CAMPUS_FORBIDDEN.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
