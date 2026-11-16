"use client";

/**
 * Documents Ordinateur OS — chrome exact ComputerDocs (Étape 8).
 * Liste + lecteur depuis play.computer.documents. Aucun useGameStore.
 */

import { useState } from "react";
import { FileText } from "lucide-react";
import type { OsPlayState } from "@/lib/keyberOs";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
};

export function OsComputerDocs({ play }: Props) {
  const docs = play.computer.documents;
  const [selectedId, setSelectedId] = useState(docs[0]?.id ?? null);
  const doc = docs.find((d) => d.id === selectedId) ?? docs[0] ?? null;

  return (
    <div className="flex h-full min-h-[440px] bg-white text-slate-900">
      <ul className="w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50">
        <li className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Documents
        </li>
        {docs.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => setSelectedId(d.id)}
              className={cn(
                "flex w-full items-start gap-2 px-3 py-2.5 text-left transition",
                selectedId === d.id
                  ? "bg-white shadow-sm"
                  : "hover:bg-slate-100"
              )}
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  {d.titre}
                </span>
                <span className="text-[11px] text-slate-500">{d.type}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <article className="min-w-0 flex-1 overflow-y-auto p-6">
        {doc ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {doc.type}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              {doc.titre}
            </h3>
            <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
              {doc.contenu}
            </pre>
          </>
        ) : (
          <p className="text-sm text-slate-500">Aucun document.</p>
        )}
      </article>
    </div>
  );
}
