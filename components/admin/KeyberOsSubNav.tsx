"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KEYBER_OS_NAV } from "@/lib/keyberOsDocs";
import { cn } from "@/lib/utils";

function tabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Sous-onglets Keyber OS — ordre fixe. */
export function KeyberOsSubNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sous-onglets Keyber OS"
      className="mb-6 flex flex-wrap gap-1 border-b border-slate-200 pb-3"
    >
      {KEYBER_OS_NAV.map((tab) => {
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
