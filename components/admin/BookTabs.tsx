"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/admin/book/en-cours-de-test",
    label: "En cours de test",
  },
  {
    href: "/admin/book/live",
    label: "Live",
  },
] as const;

export function BookTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
