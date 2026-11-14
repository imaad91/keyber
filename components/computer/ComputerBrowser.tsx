"use client";

import { useMemo, useState } from "react";
import { Globe, Search } from "lucide-react";
import { getBrowserCorpus, getDesktopCopy } from "@/lib/computerData";
import { cn } from "@/lib/utils";

export function ComputerBrowser() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    if (!q) return getBrowserCorpus();
    return getBrowserCorpus().filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.snippet.toLowerCase().includes(q) ||
        r.tags.some((t) => t.includes(q) || q.includes(t)) ||
        q.split(/\s+/).some((token) =>
          r.tags.some((t) => t.includes(token) || token.includes(t))
        )
    );
  }, [submitted]);

  const article = getBrowserCorpus().find((r) => r.id === openId) ?? null;

  return (
    <div className="flex h-full min-h-[440px] flex-col bg-white text-slate-900">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(query);
            setOpenId(null);
          }}
        >
          <Globe className="h-4 w-4 text-slate-400" />
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getDesktopCopy().browserPlaceholder}
              className="h-10 w-full rounded-full border border-slate-200 bg-white pl-8 pr-4 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            Chercher
          </button>
        </form>
        <p className="mt-2 text-[11px] text-slate-500">
          {getDesktopCopy().browserSuggestions}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {article ? (
          <article>
            <button
              type="button"
              className="mb-3 text-xs font-semibold text-sky-700 hover:underline"
              onClick={() => setOpenId(null)}
            >
              ← Résultats
            </button>
            <p className="text-xs text-emerald-700">{article.url}</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              {article.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              {article.body}
            </p>
          </article>
        ) : (
          <ul className="space-y-4">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(r.id)}
                  className={cn("block w-full text-left")}
                >
                  <p className="text-xs text-emerald-700">{r.url}</p>
                  <p className="text-base font-semibold text-sky-800 hover:underline">
                    {r.title}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">{r.snippet}</p>
                </button>
              </li>
            ))}
            {results.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucun résultat pour « {submitted} ».
              </p>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}
