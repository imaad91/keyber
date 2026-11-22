"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Brain } from "lucide-react";
import { useBookStore } from "@/lib/bookStore";
import {
  competenceNamesFromLive,
  scenariosForCompetence,
} from "@/lib/liveCatalogFunnel";
import {
  listVisibleLivePlayCatalog,
  setAdminPlaySession,
  type PlayCatalogEntry,
} from "@/lib/playCatalog";
import { cn } from "@/lib/utils";

/**
 * Parcours Mode Compétence Live — séparé de l'Histoire.
 * Compétence (catalogue Live) → scénario.
 */
export default function JouerLiveCompetenceFunnelPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { syncPlayerCatalog } = useBookStore();
  const [entries, setEntries] = useState<PlayCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const competence = (search.get("competence") || "").trim();

  useEffect(() => {
    syncPlayerCatalog();
    setAdminPlaySession(null);
    void listVisibleLivePlayCatalog().then((list) => {
      setEntries(list);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const competenceOptions = useMemo(
    () => competenceNamesFromLive(entries),
    [entries]
  );
  const scenarioOptions = useMemo(
    () =>
      competence ? scenariosForCompetence(entries, competence) : [],
    [entries, competence]
  );

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/jouer/live"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Modes Live
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">
          Mode Compétence · Book Live
        </p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          {competence ? "Scénario" : "Choisis une compétence"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Compétence → scénario Live. Uniquement les compétences présentes dans
          le catalogue Book Live.
        </p>

        <ol className="mt-6 flex flex-wrap gap-2">
          {["Compétence", "Scénario"].map((label, i) => {
            const active = competence ? i === 1 : i === 0;
            const done = competence ? i === 0 : false;
            return (
              <li
                key={label}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
                  active
                    ? "bg-sky-400/25 text-sky-100"
                    : done
                      ? "bg-white/10 text-accent"
                      : "bg-white/5 text-muted"
                )}
              >
                {i + 1}. {label}
              </li>
            );
          })}
        </ol>

        {competence ? (
          <p className="mt-3 text-xs text-muted">
            {competence} ·{" "}
            <Link href="/jouer/live/competence" className="underline">
              Changer
            </Link>
          </p>
        ) : null}

        {loading ? (
          <p className="mt-8 text-sm text-muted">Chargement du catalogue…</p>
        ) : !competence ? (
          competenceOptions.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-white/15 bg-panel/50 px-4 py-8 text-sm text-muted">
              Aucun scénario Live en Mode Compétence.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {competenceOptions.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/jouer/live/competence?competence=${encodeURIComponent(name)}`
                    )
                  }
                  className="value-enter rounded-2xl border border-sky-400/30 bg-panel p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-sky-300/50"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/15 text-sky-200">
                    <Brain className="h-5 w-5" />
                  </span>
                  <h2 className="font-display text-xl font-semibold">{name}</h2>
                  <p className="mt-2 text-[11px] text-sky-200/80">
                    {
                      scenariosForCompetence(entries, name).length
                    }{" "}
                    scénario
                    {scenariosForCompetence(entries, name).length > 1
                      ? "s"
                      : ""}{" "}
                    Live
                  </p>
                </button>
              ))}
            </div>
          )
        ) : scenarioOptions.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-white/15 bg-panel/50 px-4 py-8 text-sm text-muted">
            Aucun scénario Live pour cette compétence.
          </p>
        ) : (
          <div className="mt-8 space-y-3">
            {scenarioOptions.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-sky-400/25 bg-panel p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-semibold">
                    {s.nom}{" "}
                    <span className="text-sm font-normal text-muted">
                      V{s.version}
                    </span>
                  </p>
                  <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    LIVE
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {s.competenceName} · {s.entrepriseNom || "—"}
                </p>
                <Link
                  href={`/jouer/book/${s.id}?new=1`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent underline"
                  onClick={() => setAdminPlaySession(null)}
                >
                  Jouer
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
