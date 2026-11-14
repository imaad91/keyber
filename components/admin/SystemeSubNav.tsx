"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/systeme/coeur", label: "Cœur" },
  { href: "/admin/systeme/architecture", label: "Architecture" },
  { href: "/admin/systeme/glossaire", label: "Glossaire" },
  { href: "/admin/systeme/journal-decisions", label: "Journal des décisions" },
] as const;

function tabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Sous-onglets Système — toujours visibles dans le contenu (pas seulement la sidebar). */
export function SystemeSubNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sous-onglets Système"
      className="mb-6 flex flex-wrap gap-1 border-b border-slate-200 pb-3"
    >
      {TABS.map((tab) => {
        const active = tabActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
