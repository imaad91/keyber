"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import {
  formatCoeurJson,
  highlightJson,
  isValidCible,
  type ScenarioCoeur,
} from "@/lib/adminCoeur";
import type { CoeurAuditEntry, CoeurVersion } from "@/lib/coeurHistory";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { COEUR_LOCKED_MESSAGE } from "@/lib/adminStore";

type Props = {
  coeur: ScenarioCoeur;
  version?: CoeurVersion;
  lastOriginLabel?: string;
  audit: CoeurAuditEntry[];
};

export function CoeurLangageLocked({
  coeur,
  version,
  lastOriginLabel,
  audit,
}: Props) {
  const [healthOpen, setHealthOpen] = useState(false);
  const pretty = useMemo(() => formatCoeurJson(coeur), [coeur]);
  const html = useMemo(() => highlightJson(pretty), [pretty]);

  const health = useMemo(() => {
    let bad = 0;
    const errors: string[] = [];
    for (const d of coeur.decisions) {
      for (const c of d.choix) {
        for (const cons of c.consequences) {
          if (!isValidCible(cons.cible)) {
            bad++;
            errors.push(`${d.id}/${c.id}: cible '${cons.cible}' invalide`);
          }
        }
      }
    }
    return {
      decisions: coeur.decisions.length,
      evenements: coeur.evenements.length,
      ciblesOk: bad === 0,
      errors,
    };
  }, [coeur]);

  function block(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.alert(COEUR_LOCKED_MESSAGE);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <Lock className="h-4 w-4 shrink-0" />
        <span className="font-semibold">
          🔒 CŒUR VERROUILLÉ — Lecture seule — Modifications uniquement via
          Agents ou Fiche Scénario
        </span>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Meta
          label="Version"
          value={version ? `v${version.version}` : "—"}
        />
        <Meta
          label="Dernière modification"
          value={
            version
              ? new Date(version.createdAt).toLocaleString("fr-FR")
              : "—"
          }
        />
        <Meta
          label="Modifié par"
          value={lastOriginLabel ?? version?.originLabel ?? "—"}
        />
        <Meta label="Hash" value={version?.hash ?? "—"} mono />
        <div className="sm:col-span-2 lg:col-span-4">
          <span className="inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Synchronisé avec Logique ✓
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <AdminButton variant="secondary" onClick={() => setHealthOpen((v) => !v)}>
          <ShieldCheck className="h-4 w-4" />
          Voir le rapport de santé du Cœur
        </AdminButton>
        <AdminButton
          variant="ghost"
          onClick={() => window.alert(COEUR_LOCKED_MESSAGE)}
        >
          Modifier / Copier / Exporter…
        </AdminButton>
      </div>

      {healthOpen ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p>
            Décisions : <strong>{health.decisions}</strong> · Événements :{" "}
            <strong>{health.evenements}</strong> · Cibles :{" "}
            <strong className={health.ciblesOk ? "text-emerald-700" : "text-red-600"}>
              {health.ciblesOk ? "toutes valides" : `${health.errors.length} erreur(s)`}
            </strong>
          </p>
          {health.errors.length ? (
            <ul className="mt-2 list-disc pl-5 text-xs text-red-700">
              {health.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div
        className="relative select-none"
        onCopy={block}
        onCut={block}
        onPaste={block}
        onContextMenu={block}
        onDragStart={block}
      >
        <pre className="max-h-[560px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-[12px] leading-5">
          <code
            className="coeur-json block font-mono text-slate-100"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </pre>
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Journal d&apos;audit (lecture seule, non effaçable)
        </h2>
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {audit.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
            >
              <p className="font-semibold text-slate-800">
                {new Date(a.at).toLocaleString("fr-FR")} · {a.originLabel}
              </p>
              <p className="text-slate-600">{a.description}</p>
              {a.oldValue || a.newValue ? (
                <p className="mt-1 font-mono text-[10px] text-slate-500">
                  {a.oldValue ?? "—"} → {a.newValue ?? "—"}
                </p>
              ) : null}
              {a.validatedBy ? (
                <p className="text-[10px] text-slate-400">
                  Validé par {a.validatedBy}
                </p>
              ) : null}
            </li>
          ))}
          {audit.length === 0 ? (
            <p className="text-xs text-slate-500">Aucune entrée.</p>
          ) : null}
        </ul>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .coeur-json .json-key { color: #7dd3fc; }
        .coeur-json .json-string { color: #86efac; }
        .coeur-json .json-number { color: #fcd34d; }
        .coeur-json .json-lit { color: #f9a8d4; }
      `,
        }}
      />
    </div>
  );
}

function Meta({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-slate-900 ${mono ? "font-mono text-xs" : "font-medium"}`}>
        {value}
      </p>
    </div>
  );
}
