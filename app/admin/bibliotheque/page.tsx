"use client";

import Link from "next/link";
import { Building2, Target, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminPrimitives";

const ITEMS = [
  {
    href: "/admin/entreprises",
    label: "Entreprises",
    hint: "Fiches entreprise, glossaire, chiffres clés",
    icon: Building2,
  },
  {
    href: "/admin/personnages",
    label: "Personnages",
    hint: "Cast, dialogues, confiance de départ",
    icon: Users,
  },
  {
    href: "/admin/competences",
    label: "Compétences",
    hint: "Catalogue verrouillé — générales & ciblées, traçabilité",
    icon: Target,
  },
  {
    href: "/admin/consultants",
    label: "Consultants",
    hint: "Soumissions et validation",
    icon: UserCheck,
  },
];

export default function BibliothequePage() {
  return (
    <div>
      <PageHeader
        title="Bibliothèque"
        subtitle="Ressources partagées — une liste, un clic, une page."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
            >
              <Icon className="mb-3 h-5 w-5 text-slate-700" />
              <h2 className="font-semibold text-slate-900">{item.label}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.hint}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
