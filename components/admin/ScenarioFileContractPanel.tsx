"use client";

import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  SCENARIO_FILE_CONTRACT,
  formatScenarioContractReport,
  validateScenarioFileContract,
  type ScenarioContractResult,
} from "@/lib/scenarioFileContract";
import { cn } from "@/lib/utils";

type Props = {
  rawParam: unknown;
  /** Affiche bouton écriture disque. */
  allowWrite?: boolean;
  className?: string;
  onWrote?: (path: string) => void;
};

export function ScenarioFileContractPanel({
  rawParam,
  allowWrite = false,
  className,
  onWrote,
}: Props) {
  const result: ScenarioContractResult =
    validateScenarioFileContract(rawParam);
  const errors = result.issues.filter((i) => i.level === "error");
  const warns = result.issues.filter((i) => i.level === "warn");

  async function writeToDisk() {
    try {
      const res = await fetch("/api/scenarios/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ param: rawParam }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        path?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        window.alert(data.error || "Écriture refusée");
        return;
      }
      onWrote?.(data.path || "");
      window.alert(`Écrit : ${data.path}`);
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Écriture impossible"
      );
    }
  }

  return (
    <section
      className={cn(
        "rounded-2xl border p-4 shadow-sm",
        result.ok
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-rose-200 bg-rose-50/70",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Contrat Étape 35 — {SCENARIO_FILE_CONTRACT.title}
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              result.ok ? "text-emerald-800" : "text-rose-800"
            )}
          >
            {result.ok ? "VERT ✓ — fichier unique OK" : "ROUGE ✕ — refus"}
          </p>
          {result.diskRelativePath ? (
            <p className="mt-1 font-mono text-[11px] text-slate-600">
              {result.diskRelativePath}
            </p>
          ) : null}
        </div>
        {allowWrite ? (
          <AdminButton
            type="button"
            variant="secondary"
            disabled={!result.ok}
            onClick={() => void writeToDisk()}
          >
            Écrire data/scenarios/…
          </AdminButton>
        ) : null}
      </div>

      <ul className="mt-3 list-inside list-disc text-xs text-slate-700">
        {SCENARIO_FILE_CONTRACT.rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      {errors.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-rose-800">
          {errors.map((e, i) => (
            <li key={`${e.code}-${i}`}>
              ✕ [{e.code}] {e.message}
            </li>
          ))}
        </ul>
      ) : null}
      {warns.length > 0 ? (
        <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-amber-900">
          {warns.map((w, i) => (
            <li key={`${w.code}-${i}`}>
              ! [{w.code}] {w.message}
            </li>
          ))}
        </ul>
      ) : null}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-slate-600">
          Rapport texte
        </summary>
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-white/80 p-2 font-mono text-[10px] text-slate-700">
          {formatScenarioContractReport(result)}
        </pre>
      </details>
    </section>
  );
}
