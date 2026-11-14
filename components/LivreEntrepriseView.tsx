"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Factory,
  Hash,
  HeartHandshake,
  Network,
} from "lucide-react";
import { Organigramme } from "@/components/Organigramme";
import { getLivreActif } from "@/lib/scenario";
import { markLivreOpened } from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "histoire", label: "Histoire", icon: BookOpen },
  { id: "activite", label: "Activité", icon: Factory },
  { id: "organigramme", label: "Organigramme", icon: Network },
  { id: "chiffres", label: "Chiffres clés", icon: Hash },
  { id: "valeurs", label: "Valeurs", icon: HeartHandshake },
  { id: "glossaire", label: "Glossaire", icon: Building2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function LivreEntrepriseView() {
  const [tab, setTab] = useState<TabId>("histoire");
  const livre = getLivreActif();

  useEffect(() => {
    markLivreOpened();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a2a27] px-4 py-8 text-[#0C3B38] md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/play"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[#9bc4bb] hover:text-[#2FD67E]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au jeu
        </Link>

        <div className="overflow-hidden rounded-3xl border border-emerald-100/80 shadow-[0_20px_60px_rgba(0,0,0,0.35)] livre-paper">
          <header className="border-b border-emerald-100 px-6 py-8 md:px-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0C3B38]/80">
              Livre de l&apos;Entreprise
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#0C3B38]">
              {livre.nom}
            </h1>
            <p className="mt-2 max-w-xl text-base text-slate-600">
              {livre.slogan}
            </p>
          </header>

          <nav className="flex flex-wrap gap-1 border-b border-emerald-100 bg-white/70 px-4 py-3 md:px-6">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  tab === id
                    ? "bg-[#0C3B38] text-[#2FD67E]"
                    : "text-slate-600 hover:bg-emerald-50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </nav>

          <div className="px-6 py-8 md:px-10 md:py-10">
            {tab === "histoire" ? (
              <section className="view-enter space-y-6">
                <p className="text-lg leading-relaxed text-slate-700">
                  {livre.histoire.narratif}
                </p>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    Fondation
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {livre.histoire.fondation}
                  </p>
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    Dates clés
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {livre.histoire.datesCles.map((d) => (
                      <li
                        key={d.annee}
                        className="flex gap-4 border-b border-emerald-50 py-2 text-sm"
                      >
                        <span className="w-14 font-bold text-[#0C3B38]">
                          {d.annee}
                        </span>
                        <span className="text-slate-600">{d.fait}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50/80 p-4">
                    <h3 className="font-semibold">Anecdotes</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                      {livre.histoire.anecdotes.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-amber-50/80 p-4">
                    <h3 className="font-semibold">Crises passées</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                      {livre.histoire.crisesPassees.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            ) : null}

            {tab === "activite" ? (
              <section className="view-enter space-y-6">
                <p className="text-base leading-relaxed text-slate-700">
                  {livre.activite.ceQuOnFabrique}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Pour qui :</strong> {livre.activite.pourQui}
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  {livre.activite.produitsPhares.map((p) => (
                    <article
                      key={p.nom}
                      className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                    >
                      <h3 className="font-display text-lg font-semibold">
                        {p.nom}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {p.description}
                      </p>
                    </article>
                  ))}
                </div>
                <div>
                  <h3 className="font-semibold">Clients principaux</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {livre.activite.clientsPrincipaux.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-[#0C3B38] px-3 py-1 text-xs font-semibold text-[#2FD67E]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {tab === "organigramme" ? (
              <section className="view-enter">
                <p className="mb-6 text-sm text-slate-600">
                  Clique sur un collaborateur pour l&apos;interviewer dans le
                  jeu.
                </p>
                <Organigramme paper />
              </section>
            ) : null}

            {tab === "chiffres" ? (
              <section className="view-enter grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["CA", livre.chiffresCles.ca],
                    ["Employés", String(livre.chiffresCles.employes)],
                    ["Machines", String(livre.chiffresCles.machines)],
                    ["Clients", String(livre.chiffresCles.clients)],
                    ["Satisfaction", livre.chiffresCles.satisfaction],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold text-[#0C3B38]">
                      {value}
                    </p>
                  </div>
                ))}
              </section>
            ) : null}

            {tab === "valeurs" ? (
              <section className="view-enter grid gap-4 md:grid-cols-2">
                {livre.valeurs.map((v) => (
                  <article
                    key={v.titre}
                    className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                  >
                    <h3 className="font-display text-xl font-semibold text-[#0C3B38]">
                      {v.titre}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {v.description}
                    </p>
                  </article>
                ))}
              </section>
            ) : null}

            {tab === "glossaire" ? (
              <section className="view-enter space-y-3">
                {livre.glossaire.map((g) => (
                  <div
                    key={g.terme}
                    className="rounded-xl border border-emerald-100 bg-white px-4 py-3"
                  >
                    <p className="font-semibold text-[#0C3B38]">{g.terme}</p>
                    <p className="mt-1 text-sm text-slate-600">{g.definition}</p>
                  </div>
                ))}
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
