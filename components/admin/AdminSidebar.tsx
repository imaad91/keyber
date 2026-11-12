"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Play,
  ScrollText,
  Users,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/scenarios", label: "Scénarios", icon: ScrollText },
  { href: "/admin/entreprises", label: "Entreprises", icon: Building2 },
  { href: "/admin/personnages", label: "Personnages", icon: Users },
  { href: "/admin/decisions", label: "Logique", icon: ClipboardList },
  { href: "/admin/consultants", label: "Consultants", icon: UserCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Keyber Studio
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          Administrateur
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Admin">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
        >
          <Play className="h-4 w-4" />
          Retour mode Joueur
        </Link>
      </div>
    </aside>
  );
}
