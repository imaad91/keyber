"use client";

import {
  OS_STATE_FIELD_FAMILIES,
  osStateSchemaFamilyCount,
  osStateSchemaFieldCount,
} from "@/lib/keyberOs/stateSchema";

/**
 * Aperçu lecture seule du schéma d'état OS (Étape 1 V1).
 * Visible Admin → Keyber OS → Données & Sauvegarde.
 */
export function OsStateSchemaPanel() {
  const families = osStateSchemaFamilyCount();
  const fields = osStateSchemaFieldCount();

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Schéma d&apos;état OS (champs)
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Familles de champs de la session joueur Keyber OS — générique,
            aucun nom d&apos;entreprise. Étape 1 du plan V1.
          </p>
        </div>
        <p className="text-xs font-medium tabular-nums text-slate-500">
          {families} familles · {fields} champs documentés
        </p>
      </div>

      <ul className="mt-5 space-y-4">
        {OS_STATE_FIELD_FAMILIES.map((fam) => (
          <li
            key={fam.id}
            className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {fam.label}
              </h3>
              <code className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] text-slate-600">
                {fam.id}
              </code>
            </div>
            <p className="mt-1 text-xs text-slate-600">{fam.role}</p>
            <ul className="mt-3 space-y-1.5">
              {fam.fields.map((f) => (
                <li
                  key={f.path}
                  className="grid gap-1 border-t border-slate-200/80 pt-1.5 text-xs sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
                >
                  <code className="break-all font-mono text-[11px] text-emerald-800">
                    {f.path}
                  </code>
                  <span className="text-slate-600">{f.meaning}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
