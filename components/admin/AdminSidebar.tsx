"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Briefcase,
  LayoutDashboard,
  Play,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  children: { href: string; label: string }[];
};

const NAV: NavItem[] = [
  {
    href: "/admin/atelier",
    label: "Atelier",
    icon: Briefcase,
    children: [
      { href: "/admin/atelier/contextes", label: "Contextes d'entreprise" },
      { href: "/admin/atelier/competences", label: "Compétences" },
      { href: "/admin/atelier/scenarios", label: "Scénarios" },
    ],
  },
  {
    href: "/admin/systeme",
    label: "Système",
    icon: Shield,
    children: [
      { href: "/admin/systeme/coeur", label: "Cœur" },
      { href: "/admin/systeme/architecture", label: "Architecture" },
      { href: "/admin/systeme/glossaire", label: "Glossaire" },
      { href: "/admin/systeme/journal-decisions", label: "Journal des décisions" },
    ],
  },
  {
    href: "/admin/controle",
    label: "Contrôle",
    icon: Bot,
    children: [
      { href: "/admin/controle/agents", label: "Agents" },
      { href: "/admin/controle/prompt", label: "Prompt" },
      { href: "/admin/controle/rapports", label: "Rapports" },
    ],
  },
  {
    href: "/admin/equipe",
    label: "Équipe",
    icon: Users,
    children: [
      { href: "/admin/equipe/utilisateurs", label: "Utilisateurs" },
      { href: "/admin/equipe/suivi", label: "Suivi des parties" },
    ],
  },
];

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          KEYBER
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          Studio
        </p>
        <p className="mt-1 text-[11px] leading-snug text-slate-400">
          OS · pas le jeu
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Admin">
        {NAV.map((item) => {
          const active =
            pathMatches(pathname, item.href) ||
            item.children.some((c) => pathMatches(pathname, c.href));
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <Link
                href={item.children[0]!.href}
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
              {active ? (
                <div className="mb-1 ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-3">
                  {item.children.map((child) => {
                    const childActive = pathMatches(pathname, child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-xs font-medium transition",
                          childActive
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-500 hover:text-slate-800"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
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
