"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { cn } from "@/lib/utils";

const PIPELINE = [
  "Bibliothèques",
  "Contexte",
  "Campus",
  "Vue Prod",
  "Suite",
  "Narration",
  "Assemblage",
  "Test",
  "Live",
] as const;

const STEPS: {
  n: number;
  title: string;
  body: string;
  accent: string;
  ring: string;
  badge: string;
}[] = [
  {
    n: 0,
    title: "Bibliothèques (une fois pour toutes)",
    body: "Template Rôles → Excel → import → valide. Template Compétences + Cours → Excel → import → valide. Réutilisable pour toutes les entreprises. Aucun contenu inventé par l'OS.",
    accent: "bg-slate-50 border-slate-300",
    ring: "bg-slate-700",
    badge: "text-slate-800",
  },
  {
    n: 1,
    title: "Excel Contexte",
    body: "Template Contexte → import + validation dans Atelier → Création. Tu ne remplis jamais les champs métier à la main dans l'Admin. Ce contexte alimente le Book et le Livre (structure).",
    accent: "bg-sky-50 border-sky-200",
    ring: "bg-sky-600",
    badge: "text-sky-900",
  },
  {
    n: 2,
    title: "Monde / Campus (Clear Campus)",
    body: "Sur la fiche Création (ou Hub Production) : Template Monde Clear Campus — ailes, salles, hotspots (suite · interview · décision · document · productionLive). Dry-run VERT/ROUGE puis staging. Thème clair forcé ; personnages vector ou aucun.",
    accent: "bg-teal-50 border-teal-200",
    ring: "bg-teal-600",
    badge: "text-teal-950",
  },
  {
    n: 3,
    title: "Vue Live Production",
    body: "Même Excel Monde : onglets ProdMeta / Zones / Nodes / Flows / Vehicles / Operators / ProdKpis. Le sol opérationnel dépend du contexte (entrepôt Lumière ≠ atelier Novacier ≠ file service). Import dry-run → staging.",
    accent: "bg-cyan-50 border-cyan-200",
    ring: "bg-cyan-600",
    badge: "text-cyan-950",
  },
  {
    n: 4,
    title: "Événements + rôles & compétences",
    body: "Atelier → Événements : Template Excel colonnes OS. Dans la fiche Création, tu coches rôles et compétences parmi tes bibliothèques. Optionnel : un événement peut référencer un lieu (roomId) plus tard.",
    accent: "bg-rose-50 border-rose-200",
    ring: "bg-rose-600",
    badge: "text-rose-950",
  },
  {
    n: 5,
    title: "Suite outils + Narration / Décisions",
    body: "Suite (ex-Ordinateur, étape 32) : ERP, mail, chat, docs… Narration (étape 33) : PNJ, Objectifs, Kpis, Jours, Décisions, Fins. Hotspots Campus lient lieux → suite / décision / interview / Vue Live Production.",
    accent: "bg-indigo-50 border-indigo-200",
    ring: "bg-indigo-600",
    badge: "text-indigo-950",
  },
  {
    n: 6,
    title: "Assemblage Book",
    body: "Book → Générer / Assembler Atelier → Book. Fusion déterministe : Contexte + Événements + Monde (Campus · Hotspots · ProductionLive) + Suite + Narration → param (Vue Code). Journal d'assemblage. Zéro invention hors Excel / staging.",
    accent: "bg-amber-50 border-amber-200",
    ring: "bg-amber-500",
    badge: "text-amber-950",
  },
  {
    n: 7,
    title: "Test — En cours de test → /jouer/book",
    body: "Cartes en Book → En cours de test. « Tester » ouvre le shell Clear Campus (carte / explore). Vérifie hotspots, Suite, Vue Live Production, décisions. Droit « publier Live » dans Équipe.",
    accent: "bg-emerald-50 border-emerald-200",
    ring: "bg-emerald-600",
    badge: "text-emerald-950",
  },
  {
    n: 8,
    title: "Live — joueurs",
    body: "« Passer en Live ». Les joueurs voient la carte via /jouer/live. Pour modifier : Retourner en Création → V2 → re-test → Live. Historique V1, V2 conservé.",
    accent: "bg-teal-50 border-teal-200",
    ring: "bg-teal-600",
    badge: "text-teal-950",
  },
];

export default function AtelierWorkflowPage() {
  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Workflow" },
        ]}
        title="Atelier — Workflow Clear Campus"
      />

      <p className="mb-2 max-w-3xl text-sm text-slate-600">
        Mode d&apos;emploi — bibliothèques → Campus → Vue Live Production →
        Suite → Book Test / Live. Lecture seule ici. Hub opérationnel :{" "}
        <Link
          href="/admin/atelier/production"
          className="font-medium text-teal-800 underline"
        >
          Atelier · Production
        </Link>
        .
      </p>

      <section
        className="mt-4 overflow-x-auto rounded-2xl border border-teal-200 bg-teal-50/80 p-4"
        aria-label="Chaîne Clear Campus"
      >
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
          Chaîne Clear Campus (thème clair)
        </p>
        <ol className="flex min-w-max items-center gap-1.5 text-xs font-semibold text-teal-950">
          {PIPELINE.map((label, i) => (
            <li key={label} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1.5",
                  label === "Campus" ||
                    label === "Vue Prod" ||
                    label === "Suite" ||
                    label === "Test" ||
                    label === "Live"
                    ? "border-teal-500 bg-white shadow-sm"
                    : "border-teal-200 bg-teal-100/80"
                )}
              >
                {label}
              </span>
              {i < PIPELINE.length - 1 ? (
                <span className="text-teal-400" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[11px] text-teal-800/80">
          Entrée joueur :{" "}
          <code className="rounded bg-white/80 px-1">/jouer/live</code> →{" "}
          <code className="rounded bg-white/80 px-1">/jouer/book/[id]</code>
        </p>
      </section>

      <section
        className="mt-6 select-none rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        aria-label="Workflow de création KEYBER — 9 étapes"
      >
        <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Des bibliothèques au Live — 9 étapes (0 → 8)
        </h2>

        <ol className="mx-auto flex max-w-2xl flex-col items-stretch">
          {STEPS.map((step, i) => (
            <li key={step.n} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-full rounded-2xl border-2 px-5 py-4 shadow-sm",
                  step.accent
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow",
                      step.ring
                    )}
                  >
                    {step.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-wider",
                        step.badge
                      )}
                    >
                      Étape {step.n}
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-slate-900">
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {step.body}
                    </p>
                  </div>
                </div>
              </div>
              {i < STEPS.length - 1 ? (
                <div
                  className="my-1 h-6 w-0.5 bg-slate-200"
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
