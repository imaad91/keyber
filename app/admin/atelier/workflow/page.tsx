"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { cn } from "@/lib/utils";

const PIPELINE = [
  "Bibliothèques",
  "Contexte",
  "Événements OS",
  "Ordinateur",
  "Jours",
  "Fins",
  "Book génère",
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
    body: "Tu prépares tes bibliothèques, une fois pour toutes. Template Rôles → Excel → import → valide. Template Compétences + Cours (2 onglets) → Excel → import → valide. Réutilisable pour toutes les entreprises. Aucun contenu inventé par l'OS.",
    accent: "bg-slate-50 border-slate-300",
    ring: "bg-slate-700",
    badge: "text-slate-800",
  },
  {
    n: 1,
    title: "Excel Contexte",
    body: "Tu crées le contexte entreprise en Excel (Template Contexte). Import + validation dans Atelier → Création. Tu ne remplis jamais les champs métier à la main dans l'Admin. Ce contexte alimente le Book et le Livre (structure).",
    accent: "bg-sky-50 border-sky-200",
    ring: "bg-sky-600",
    badge: "text-sky-900",
  },
  {
    n: 2,
    title: "Événements de cette entreprise (pont OS)",
    body: "Atelier → Événements : Template Excel avec colonnes OS (jour, heure, urgent, deadline, condition, conséquences). Un fichier = une entreprise. L'import mappe vers « Événements entreprise » du param → Moteur d'Événements Keyber OS. Pas de coches dans Création : l'import les lie.",
    accent: "bg-rose-50 border-rose-200",
    ring: "bg-rose-600",
    badge: "text-rose-950",
  },
  {
    n: 3,
    title: "Sélectionner rôles & compétences",
    body: "Dans la fiche Création, tu coches les rôles et compétences possibles parmi tes bibliothèques. Tu ne recrées rien. Ces coches + événements + contexte partent dans le Prompt Book.",
    accent: "bg-violet-50 border-violet-200",
    ring: "bg-violet-600",
    badge: "text-violet-900",
  },
  {
    n: 4,
    title: "Book — génération structure complète",
    body: "Book → « Générer des scénarios » → Assembler Atelier → Book (Étape 34). Fusion déterministe : Contexte + Événements + Excel Ordinateur / Narration staging + coches → param (Vue Code). Journal d'assemblage Admin. Blocs vides OK si rien importé. Prompt Cursor en option. L'IA / le Studio n'inventent pas hors de ce que tu as fourni.",
    accent: "bg-amber-50 border-amber-200",
    ring: "bg-amber-500",
    badge: "text-amber-950",
  },
  {
    n: 5,
    title: "Ordinateur · Jours · Fins (param / Excel)",
    body: "Pour le feeling POC, le param doit porter Ordinateur (apps ERP, mail, chat, docs, browser…), Jours (timeline), Interviews / Objectifs / Kpis, Décisions et Fins (conditions + écrans). Templates Excel : KEYBER_Template_Ordinateur.xlsx (étape 32) + KEYBER_Template_Narration_Decisions.xlsx (étape 33) — download + import dry-run sur la fiche Création. Démo remplie Lumière sous data/scenarios/lumiere-co/. L'OS n'invente pas. Checklist « parité feeling » sur la carte Book te montre ce qui est encore rouge.",
    accent: "bg-indigo-50 border-indigo-200",
    ring: "bg-indigo-600",
    badge: "text-indigo-950",
  },
  {
    n: 6,
    title: "Discussion & ajustements",
    body: "Tu discutes avec l'IA, tu modifies les coquilles / le param (Vue Texte · Graphique · Code), jusqu'à ce que tu sois content. Tu gardes, tu modifies, tu supprimes. Contrôle → rapport parité feeling propose les trous sans patcher.",
    accent: "bg-orange-50 border-orange-200",
    ring: "bg-orange-500",
    badge: "text-orange-950",
  },
  {
    n: 7,
    title: "Test — En cours de test → /jouer/book",
    body: "Les cartes partent en Book → En cours de test (Admin seul). Tu lances « Tester » : shell Keyber OS officiel `/jouer/book/[id]`. Tu vérifies Ordinateur, mail, events, journal, livre, profil, fins. Droit « publier Live » visible dans Équipe (affichage V1).",
    accent: "bg-emerald-50 border-emerald-200",
    ring: "bg-emerald-600",
    badge: "text-emerald-950",
  },
  {
    n: 8,
    title: "Live — joueurs",
    body: "C'est bon ? « Passer en Live ». Les joueurs voient la carte via `/jouer/live` et jouent le même shell OS. Pour modifier : « Retourner en Création » → V2 → re-test → Live. Historique V1, V2 conservé.",
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

      <p className="mb-2 max-w-3xl text-sm text-slate-600">
        Mode d&apos;emploi V1 — des bibliothèques jusqu&apos;au feeling POC
        (Ordinateur · Jours · Fins · Test · Live). Toujours visible,{" "}
        <strong>lecture seule</strong> : tu ne le modifies pas ici (relecture /
        validation du texte bienvenue).
      </p>

      <section
        className="mt-4 overflow-x-auto rounded-2xl border border-violet-200 bg-violet-50/80 p-4"
        aria-label="Chaîne feeling POC"
      >
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
          Chaîne jusqu&apos;au feeling POC
        </p>
        <ol className="flex min-w-max items-center gap-1.5 text-xs font-semibold text-violet-950">
          {PIPELINE.map((label, i) => (
            <li key={label} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1.5",
                  label === "Ordinateur" ||
                    label === "Jours" ||
                    label === "Fins" ||
                    label === "Test" ||
                    label === "Live"
                    ? "border-violet-500 bg-white shadow-sm"
                    : "border-violet-200 bg-violet-100/80"
                )}
              >
                {label}
              </span>
              {i < PIPELINE.length - 1 ? (
                <span className="text-violet-400" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[11px] text-violet-800/80">
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
          Toi = Chef : tu décides, tu donnes les inputs Excel / coches, tu
          valides, tu bloques. IA = Constructeur : elle assemble la structure,
          elle n&apos;invente jamais le contenu métier.
        </p>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">
            Mode Compétence
          </p>
          <p className="mt-2 text-sm leading-relaxed text-sky-950">
            Entraînement intensif : Catégorie → Compétence → Cours + Scénarios
            précis. Pas de rôle. Param + Ordinateur / Fins quand même pour le
            feeling shell.
          </p>
        </section>
        <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
            Mode Histoire
          </p>
          <p className="mt-2 text-sm leading-relaxed text-violet-950">
            Mise en pratique : Rôle → Secteur → Entreprise → Histoire, avec les
            événements OS de cette entreprise, Jours, Fins, Livre. Pas de choix
            de compétence au début.
          </p>
        </section>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Voir aussi{" "}
        <Link href="/admin/systeme/vue-globale" className="underline">
          Keyber OS → Vue Globale
        </Link>{" "}
        et{" "}
        <Link href="/admin/controle/rapports/parite" className="underline">
          Contrôle → Parité feeling
        </Link>
        .
      </p>
    </div>
  );
}
