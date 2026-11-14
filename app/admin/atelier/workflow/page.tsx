"use client";

import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { cn } from "@/lib/utils";

const STEPS: {
  n: number;
  title: string;
  body: string;
  accent: string;
  ring: string;
  badge: string;
}[] = [
  {
    n: 1,
    title: "Excel Contexte",
    body: "Tu remplis un Excel Contexte hyper complet, tu l'importes, tu valides.",
    accent: "bg-sky-50 border-sky-200",
    ring: "bg-sky-600",
    badge: "text-sky-900",
  },
  {
    n: 2,
    title: "Rôles & Compétences",
    body: "Tu sélectionnes les rôles et les compétences parmi tes bibliothèques. Tu ne recrées rien, tu coches.",
    accent: "bg-violet-50 border-violet-200",
    ring: "bg-violet-600",
    badge: "text-violet-900",
  },
  {
    n: 3,
    title: "Scénarios provisoires",
    body: "Tu demandes à l'IA de générer des scénarios provisoires. Tu copies le Prompt que l'Admin te donne, tu le colles dans Cursor / Claude.",
    accent: "bg-amber-50 border-amber-200",
    ring: "bg-amber-500",
    badge: "text-amber-950",
  },
  {
    n: 4,
    title: "Discussion & validation",
    body: "Tu discutes avec l'IA, tu modifies les provisoires, jusqu'à ce que tu sois content. Tu valides les scénarios que tu gardes.",
    accent: "bg-orange-50 border-orange-200",
    ring: "bg-orange-500",
    badge: "text-orange-950",
  },
  {
    n: 5,
    title: "Prototype → Book",
    body: "L'IA implémente un prototype. Tu testes le prototype. Si c'est bon, tu valides, ça part dans le Book. Si ce n'est pas bon, tu retournes en provisoire, tu rediscutes avec l'IA.",
    accent: "bg-emerald-50 border-emerald-200",
    ring: "bg-emerald-600",
    badge: "text-emerald-950",
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
        title="Atelier — Workflow"
      />

      <p className="mb-2 max-w-2xl text-sm text-slate-600">
        Mode d&apos;emploi de la création — du début jusqu&apos;à
        l&apos;implémentation. Toujours visible,{" "}
        <strong>lecture seule</strong> : tu ne le modifies pas.
      </p>

      {/* Workflow graphique */}
      <section
        className="mt-6 select-none rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        aria-label="Workflow de création KEYBER"
      >
        <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          De l&apos;Excel au Book — 5 étapes
        </h2>

        <ol className="mx-auto flex max-w-xl flex-col items-stretch">
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
                  className="flex flex-col items-center py-1"
                  aria-hidden
                >
                  <div className="h-6 w-0.5 bg-slate-300" />
                  <svg
                    width="20"
                    height="12"
                    viewBox="0 0 20 12"
                    className="text-slate-400"
                  >
                    <path
                      d="M2 2 L10 10 L18 2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {/* Règle d'or */}
      <section className="mt-8 rounded-2xl border-2 border-slate-900 bg-slate-900 px-5 py-5 text-white shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Règle d&apos;or
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          Toi = Chef : tu décides, tu donnes les inputs, tu valides, tu
          bloques. IA = Constructeur : elle construit, elle n&apos;invente
          jamais le contenu métier.
        </p>
      </section>

      {/* 2 règles de mode */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">
            Mode Compétence
          </p>
          <p className="mt-2 text-sm leading-relaxed text-sky-950">
            Mode Compétence = Entraînement intensif : Catégorie → Compétence →
            Cours + Scénarios très précis. Pas de rôle.
          </p>
        </section>
        <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
            Mode Histoire
          </p>
          <p className="mt-2 text-sm leading-relaxed text-violet-950">
            Mode Histoire = Mise en pratique : Rôle → Secteur → Entreprise →
            Histoire libre, événements aléatoires, décisions qui influencent
            d&apos;autres décisions. Pas de choix de compétence au début.
          </p>
        </section>
      </div>
    </div>
  );
}
