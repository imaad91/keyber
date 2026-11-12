"use client";

import { useEffect, useMemo, useState } from "react";
import { ScenarioCoeurDualView } from "@/components/admin/ScenarioCoeurDualView";
import {
  Field,
  PageHeader,
  selectClass,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";
import { SCENARIO_ID } from "@/data/scenarioNovacier";

/**
 * Décisions & événements — Vue Graphique + Vue CŒUR directement ici.
 */
export default function AdminDecisionsHubPage() {
  const { scenarios } = useAdminStore();
  const sorted = useMemo(
    () => [...scenarios].sort((a, b) => a.order - b.order),
    [scenarios]
  );

  const defaultId =
    sorted.find((s) => s.id === SCENARIO_ID)?.id ?? sorted[0]?.id ?? "";

  const [scenarioId, setScenarioId] = useState(defaultId);

  useEffect(() => {
    if (!scenarioId && defaultId) setScenarioId(defaultId);
    if (scenarioId && !sorted.some((s) => s.id === scenarioId) && defaultId) {
      setScenarioId(defaultId);
    }
  }, [scenarioId, defaultId, sorted]);

  return (
    <div>
      <PageHeader
        title="Décisions & événements"
        subtitle="Onglets Vue Graphique et Vue CŒUR — une seule source de vérité par scénario."
      />

      <div className="mb-5 max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Field label="Scénario">
          <select
            className={selectClass}
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
          >
            {sorted.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titre}
              </option>
            ))}
          </select>
        </Field>
        <p className="mt-2 text-xs text-slate-500">
          Les vues ci-dessous s’ouvrent ici, dans cet onglet Admin — pas dans le
          Mode Joueur.
        </p>
      </div>

      {scenarioId ? (
        <ScenarioCoeurDualView scenarioId={scenarioId} />
      ) : (
        <p className="text-sm text-slate-500">Aucun scénario disponible.</p>
      )}
    </div>
  );
}
