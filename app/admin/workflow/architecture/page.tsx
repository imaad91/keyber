"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Bot,
  Clock,
  Cpu,
  FileText,
  Gamepad2,
  HardDrive,
  LayoutDashboard,
  Monitor,
  Network,
  ScrollText,
  Shield,
  Target,
  User,
} from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  buildArchitectureModel,
  type ArchBlock,
  type ArchBlockId,
} from "@/lib/adminArchitecture";
import { useAdminStore } from "@/lib/adminStore";
import { cn } from "@/lib/utils";

const ICONS: Record<ArchBlockId, typeof Network> = {
  fiches: FileText,
  scenarios: ScrollText,
  competences: Target,
  coeur: Shield,
  agents: Bot,
  moteur: Cpu,
  gamestate: LayoutDashboard,
  temps: Clock,
  sauvegarde: HardDrive,
  mode_histoire: BookOpen,
  mode_competence: Gamepad2,
  ordinateur: Monitor,
  profil: User,
  journal: BookOpen,
};

export default function WorkflowArchitecturePage() {
  const state = useAdminStore();
  const model = useMemo(
    () =>
      buildArchitectureModel({
        scenarios: state.scenarios,
        entreprises: state.entreprises,
        personnages: state.personnages,
        decisions: state.decisions,
        events: state.events,
        fiches: state.fiches,
        coeurs: state.coeurs,
        coeurMeta: state.coeurMeta,
        agents: state.agents,
        agentReports: state.agentReports,
        consultants: state.consultants,
        glossaire: state.glossaire,
        journalDecisions: state.journalDecisions,
        toast: null,
      }),
    [state]
  );
  const [selected, setSelected] = useState<ArchBlock | null>(null);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/workflow/scenarios"
        backLabel="← Workflow"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workflow", href: "/admin/workflow/scenarios" },
          { label: "Architecture de l'application" },
        ]}
        title="Workflow — Architecture de l'application"
      />

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        🔒 <strong>LECTURE SEULE</strong> — Aucune modification possible ici.
        Pour modifier, passe par Fiches, Compétences ou Agents. Schéma généré
        automatiquement depuis la structure réelle.
      </div>

      <div className="mb-4 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
        <span>
          <span className="mr-1 inline-block h-3 w-5 rounded-sm border border-slate-400 bg-slate-50" />
          Rectangle = Bloc de fonctionnalité
        </span>
        <span>
          <span className="mr-1 inline-block w-6 border-t-2 border-slate-700" />
          Flèche pleine = Lit / Écrit / Génère
        </span>
        <span>
          <span className="mr-1 inline-block w-6 border-t-2 border-dashed border-slate-500" />
          Flèche pointillée = Teste / Vérifie
        </span>
        <span className="ml-auto text-slate-400">
          Généré{" "}
          {new Date(model.generatedAt).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
          })}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {model.blocks.map((b) => {
              const Icon = ICONS[b.id];
              const active = selected?.id === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelected(b)}
                  className={cn(
                    "rounded-2xl border bg-white p-4 text-left shadow-sm transition",
                    active
                      ? "border-slate-900 ring-2 ring-slate-200"
                      : "border-slate-200 hover:border-slate-400"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{b.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {b.role}
                      </p>
                      {b.meta ? (
                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                          {b.meta}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Liens & interactions
            </h2>
            <ul className="space-y-2">
              {model.links.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                >
                  <span
                    className={cn(
                      "w-10 shrink-0 border-t-2",
                      l.kind === "dashed"
                        ? "border-dashed border-slate-500"
                        : "border-slate-800"
                    )}
                    aria-hidden
                  />
                  <span>{l.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Dernières évolutions de l&apos;architecture
            </h2>
            <ul className="divide-y divide-slate-100">
              {model.journal.map((j) => (
                <li
                  key={j.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {j.modification}
                    </p>
                    <p className="text-xs text-slate-500">Origine : {j.origine}</p>
                  </div>
                  <p className="text-xs tabular-nums text-slate-400">
                    {new Date(j.at).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Paris",
                    })}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <Link
                href="/admin/workflow/journal-decisions"
                className="text-sm font-semibold text-slate-800 underline underline-offset-2 hover:text-slate-950"
              >
                Voir le Journal des décisions
              </Link>
            </p>
          </section>
        </div>

        <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-80">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Détail du bloc (lecture seule)
          </p>
          {selected ? (
            <div className="mt-3 space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                {selected.label}
              </h3>
              <p className="text-sm text-slate-600">{selected.role}</p>
              {selected.meta ? (
                <p className="text-xs text-slate-500">{selected.meta}</p>
              ) : null}
              <div>
                <p className="text-xs font-semibold text-slate-500">Fichiers</p>
                <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-slate-600">
                  {selected.files.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Liens</p>
                <ul className="mt-1 list-inside list-disc text-xs text-slate-600">
                  {selected.links.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Cliquez un bloc pour voir son rôle, ses fichiers et ses liens.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
