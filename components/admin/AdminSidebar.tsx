"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Network,
  Play,
  ScrollText,
  Settings,
  Shield,
  Bot,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  children?: { href: string; label: string; icon?: typeof Bot }[];
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/scenarios", label: "Scénarios", icon: ScrollText },
  {
    href: "/admin/fiches",
    label: "Fiches",
    icon: FileText,
    children: [
      { href: "/admin/fiches", label: "Liste des Fiches" },
      { href: "/admin/fiches/suivi", label: "Suivi Validation" },
    ],
  },
  {
    href: "/admin/competences",
    label: "Compétences",
    icon: Target,
    children: [
      { href: "/admin/competences/generales", label: "Générales" },
      { href: "/admin/competences/ciblees", label: "Ciblées" },
    ],
  },
  {
    href: "/admin/workflow",
    label: "Workflow",
    icon: Network,
    children: [
      { href: "/admin/workflow/scenarios", label: "Scénarios" },
      {
        href: "/admin/workflow/architecture",
        label: "Architecture de l'application",
      },
      { href: "/admin/workflow/glossaire", label: "Glossaire" },
      {
        href: "/admin/workflow/journal-decisions",
        label: "Journal des décisions",
      },
    ],
  },
  {
    href: "/admin/coeur",
    label: "Cœur",
    icon: Shield,
    children: [
      { href: "/admin/coeur/langage", label: "Langage Cœur" },
      { href: "/admin/coeur/agents", label: "Agents", icon: Bot },
      { href: "/admin/coeur/rapport", label: "Rapport", icon: ClipboardList },
    ],
  },
  {
    href: "/admin/bibliotheque",
    label: "Bibliothèque",
    icon: BookOpen,
    children: [
      { href: "/admin/entreprises", label: "Entreprises" },
      { href: "/admin/personnages", label: "Personnages" },
      { href: "/admin/consultants", label: "Consultants" },
    ],
  },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function itemIsActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  if (pathMatches(pathname, item.href)) return true;
  // Children may live outside the parent prefix (ex: Bibliothèque → /admin/entreprises)
  return Boolean(
    item.children?.some((c) => pathMatches(pathname, c.href))
  );
}

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
          const active = itemIsActive(pathname, item);
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <Link
                href={item.children?.[0]?.href ?? item.href}
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
              {item.children && active ? (
                <div className="mb-1 ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-3">
                  {item.children.map((child) => {
                    const childActive =
                      child.href === item.href
                        ? pathname === child.href ||
                          (pathname.startsWith(child.href + "/") &&
                            !item.children!.some(
                              (c) =>
                                c.href !== child.href &&
                                pathMatches(pathname, c.href)
                            ))
                        : pathMatches(pathname, child.href);
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition",
                          childActive
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-500 hover:text-slate-800"
                        )}
                      >
                        {ChildIcon ? <ChildIcon className="h-3 w-3" /> : null}
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
