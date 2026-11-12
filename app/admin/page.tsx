"use client";

import Link from "next/link";
import { Network, ScrollText, Shield, Bot } from "lucide-react";
import {
  PageHeader,
  StatCard,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";

export default function AdminDashboardPage() {
  const { scenarios, agents, entreprises, personnages } = useAdminStore();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Liste → clic → page plein écran. Jamais de double panneau."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Scénarios" value={scenarios.length} />
        <StatCard label="Agents" value={agents.length} />
        <StatCard label="Entreprises" value={entreprises.length} />
        <StatCard label="Personnages" value={personnages.length} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashLink
          href="/admin/scenarios"
          icon={ScrollText}
          title="Scénarios"
          hint="Liste des fiches"
        />
        <DashLink
          href="/admin/logique"
          icon={Network}
          title="Logique"
          hint="Liste → schéma BPMN"
        />
        <DashLink
          href="/admin/coeur/langage"
          icon={Shield}
          title="Langage Cœur"
          hint="Liste → JSON verrouillé"
        />
        <DashLink
          href="/admin/coeur/agents"
          icon={Bot}
          title="Agents"
          hint="Liste → code agent"
        />
      </div>
    </div>
  );
}

function DashLink({
  href,
  icon: Icon,
  title,
  hint,
}: {
  href: string;
  icon: typeof ScrollText;
  title: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
    >
      <Icon className="mb-3 h-5 w-5 text-slate-700" />
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </Link>
  );
}
