"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AdminBreadcrumb({
  backHref,
  backLabel = "Retour à la liste",
  crumbs,
  title,
}: {
  backHref: string;
  backLabel?: string;
  crumbs: { label: string; href?: string }[];
  title: string;
}) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <nav className="mb-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        {crumbs.map((c, i) => (
          <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {c.href ? (
              <Link href={c.href} className="hover:text-slate-700">
                {c.label}
              </Link>
            ) : (
              <span>{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
    </div>
  );
}
