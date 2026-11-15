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
    n: 0,
    title: "Bibliothèques (une fois pour toutes)",
    body: "Tu prépares tes bibliothèques, une fois pour toutes. Tu télécharges le Template Rôles, tu le remplis en Excel, tu l'importes, tu valides. Tu télécharges le Template Compétences + Cours (un seul Excel, 2 onglets : Onglet 1 Compétences, Onglet 2 Cours), tu le remplis, tu l'importes, tu valides. C'est fait une fois, tu les réutilises pour toutes les entreprises.",
    accent: "bg-slate-50 border-slate-300",
    ring: "bg-slate-700",
    badge: "text-slate-800",
  },
  {
    n: 1,
    title: "Excel Contexte",
    body: "Tu crées ton contexte, en Excel. Tu télécharges le Template Contexte hyper complet, tu le remplis avec un maximum de détails, tu l'importes, tu valides la soumission. Tu ne remplis jamais les champs directement dans l'Admin.",
    accent: "bg-sky-50 border-sky-200",
    ring: "bg-sky-600",
    badge: "text-sky-900",
  },
  {
    n: 2,
    title: "Événements de cette entreprise",
    body: "Tu crées les événements de cette entreprise, en Excel, cas par cas. Dans Atelier → Événements (onglet unique), tu télécharges le Template Événements, tu choisis l'entreprise, tu remplis uniquement les événements de cette entreprise, tu importes, tu valides. Un fichier = une entreprise. On ne partage pas les événements entre entreprises (AgriBio ≠ Novacier), sinon ça devient lassant pour les joueurs. Pas de coches dans Création : l'import les lie automatiquement.",
    accent: "bg-rose-50 border-rose-200",
    ring: "bg-rose-600",
    badge: "text-rose-950",
  },
  {
    n: 3,
    title: "Sélectionner, ne pas recréer",
    body: "Tu sélectionnes, tu ne recrées pas. Dans la fiche de ta création, tu coches les rôles possibles parmi ta Bibliothèque Rôles, et tu coches les compétences possibles parmi ta Bibliothèque Compétences. Tu ne recrées rien, tu sélectionnes.",
    accent: "bg-violet-50 border-violet-200",
    ring: "bg-violet-600",
    badge: "text-violet-900",
  },
  {
    n: 4,
    title: "Scénarios provisoires (IA)",
    body: "Tu demandes à l'IA de générer des scénarios provisoires depuis le Book. Tu cliques sur « Générer des scénarios » en haut du Book, tu choisis le contexte, tu coches rôles et compétences, les événements de l'entreprise sont pris automatiquement, tu génères le Prompt, tu le copies dans Cursor / Claude Sonnet. L'IA n'invente aucun nouvel événement. Les coquilles arrivent en En cours de test, dans la bonne section.",
    accent: "bg-amber-50 border-amber-200",
    ring: "bg-amber-500",
    badge: "text-amber-950",
  },
  {
    n: 5,
    title: "Discussion & ajustements",
    body: "Tu discutes avec l'IA, tu modifies les provisoires, jusqu'à ce que tu sois content. Tu gardes, tu modifies, tu supprimes les provisoires.",
    accent: "bg-orange-50 border-orange-200",
    ring: "bg-orange-500",
    badge: "text-orange-950",
  },
  {
    n: 6,
    title: "Prototype → Book (test)",
    body: "Tu valides, l'IA implémente un prototype, tu testes. Si c'est bon, tu valides le prototype, ça part dans le Book, en En cours de test. Si ce n'est pas bon, tu retournes en provisoire, tu rediscutes avec l'IA.",
    accent: "bg-emerald-50 border-emerald-200",
    ring: "bg-emerald-600",
    badge: "text-emerald-950",
  },
  {
    n: 7,
    title: "Book : En cours de test → Live",
    body: "Dans le module Book, à part, ta création apparaît en En cours de test, visible uniquement pour toi, l'Admin. Tu testes une dernière fois. C'est bon ? Tu cliques sur « Passer en Live ». Maintenant, les joueurs peuvent y jouer. Plus tard, si tu veux modifier, tu cliques sur « Retourner en Création », ça crée une V2, tu modifies, tu valides, la V2 apparaît dans le Book, en En cours de test, avec l'historique V1, V2.",
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
        title="Atelier — Workflow"
      />

      <p className="mb-2 max-w-2xl text-sm text-slate-600">
        Mode d&apos;emploi de la création — des bibliothèques jusqu&apos;au
        Live. Toujours visible, <strong>lecture seule</strong> : tu ne le
        modifies pas.
      </p>

      <section
        className="mt-6 select-none rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        aria-label="Workflow de création KEYBER — 8 étapes"
      >
        <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Des bibliothèques au Live — 8 étapes (0 → 7)
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
            Histoire libre, avec tes événements de cette entreprise, décisions
            qui influencent d&apos;autres décisions. Pas de choix de compétence
            au début.
          </p>
        </section>
      </div>
    </div>
  );
}
