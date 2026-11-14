"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { slug: "logique", label: "Workflow", hint: "Yeux — lecture seule" },
  { slug: "coeur", label: "Cœur", hint: "Essence verrouillée + Agents" },
  { slug: "", label: "Fiche", hint: "Voie d'édition autorisée" },
] as const;

export function ScenarioWorkspaceNav({
  scenarioId,
  titre,
}: {
  scenarioId: string;
  titre: string;
}) {
  const pathname = usePathname();
  const base = `/admin/scenarios/${scenarioId}`;

  return (
    <div className="mb-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Scénario
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {titre}
      </h1>
      <div className="mt-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        {TABS.map((tab) => {
          const href = tab.slug ? `${base}/${tab.slug}` : base;
          const active =
            tab.slug === ""
              ? pathname === base
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "min-w-[8rem] flex-1 rounded-lg px-4 py-2.5 transition",
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className="block text-[11px] opacity-70">{tab.hint}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
