"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ModeBadge } from "@/components/admin/BookEntryCard";
import {
  listVisibleLivePlayCatalog,
  setAdminPlaySession,
  type PlayCatalogEntry,
} from "@/lib/playCatalog";
import { useBookStore } from "@/lib/bookStore";
import { cn } from "@/lib/utils";

/**
 * Catalogue joueur Book Live — lit keyber-play-catalog-v1 + fichiers param.
 * Pas d'Atelier. Scénarios / Histoires séparés.
 */
export default function JouerLiveBookPage() {
  const { syncPlayerCatalog } = useBookStore();
  const [entries, setEntries] = useState<PlayCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    syncPlayerCatalog();
    setAdminPlaySession(null);
    void listVisibleLivePlayCatalog().then((list) => {
      setEntries(list);
      setLoading(false);
    });
    // syncPlayerCatalog n'est pas stable (nouveau fn à chaque render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scenarios = entries.filter((e) => e.mode === "competence");
  const histoires = entries.filter((e) => e.mode === "histoire");

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Accueil
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Book Live
        </p>
        <h1 className="font-display text-3xl font-semibold">
          Créations disponibles
        </h1>
        <p className="mt-2 text-sm text-muted">
          Uniquement les versions Live avec fichier de paramétrage. Piloté par
          Keyber OS — pas d&apos;Atelier.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-muted">Chargement…</p>
        ) : (
          <>
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold text-sky-700">
                S&apos;entraîner — Mode Compétence
              </h2>
              <p className="mt-1 text-sm text-muted">
                Catégorie → Compétence → Cours + Scénario.
              </p>
              {scenarios.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">
                  Aucun scénario Live.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {scenarios.map((e) => (
                    <CatalogCard key={e.id} entry={e} />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-10">
              <h2 className="font-display text-xl font-semibold text-violet-700">
                Jouer une histoire — Mode Histoire
              </h2>
              <p className="mt-1 text-sm text-muted">
                Rôle → Secteur → Entreprise → Histoire.
              </p>
              {histoires.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">
                  Aucune histoire Live.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {histoires.map((e) => (
                    <CatalogCard key={e.id} entry={e} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function CatalogCard({ entry }: { entry: PlayCatalogEntry }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/40 p-5",
        entry.mode === "competence"
          ? "border-sky-500/30"
          : "border-violet-500/30"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold">
          {entry.nom} V{entry.version}
        </p>
        <ModeBadge mode={entry.mode} />
        <span className="inline-flex rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          LIVE
        </span>
      </div>
      {entry.mode === "competence" ? (
        <p className="mt-2 text-sm text-muted">
          Compétence : {entry.competenceName || "—"}
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">
            Rôle : {entry.roleName || "—"}
          </p>
          <p className="mt-1 text-sm text-muted">
            Secteur : {entry.secteur || "—"}
          </p>
        </>
      )}
      <p className="mt-1 text-sm text-muted">
        Entreprise : {entry.entrepriseNom || "—"}
      </p>
      <Link
        href={`/jouer/book/${entry.id}`}
        className="mt-3 inline-block text-accent underline"
        onClick={() => setAdminPlaySession(null)}
      >
        Jouer
      </Link>
    </div>
  );
}
