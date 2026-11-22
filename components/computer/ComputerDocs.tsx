"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { getComputerDocuments, getDesktopCopy } from "@/lib/computerData";
import { cn } from "@/lib/utils";

export function ComputerDocs() {
  const [selectedId, setSelectedId] = useState(getComputerDocuments()[0]?.id ?? null);
  const doc = getComputerDocuments().find((d) => d.id === selectedId) ?? null;

  return (
    <div className="flex h-full min-h-[440px] bg-white text-slate-900">
      <ul className="w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50">
        <li className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {getDesktopCopy().docsTitle}
        </li>
        {getComputerDocuments().map((d) => (
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
        ) : null}
      </article>
    </div>
  );
}
