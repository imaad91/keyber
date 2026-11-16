"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Briefcase } from "lucide-react";
import { useAtelierRolesStore } from "@/lib/atelierRolesStore";
import { useBookStore } from "@/lib/bookStore";
import {
  entreprisesForRoleSecteur,
  histoiresForSelection,
  rolesForLiveHistoires,
  secteursForRole,
} from "@/lib/liveCatalogFunnel";
import {
  listVisibleLivePlayCatalog,
  setAdminPlaySession,
  type PlayCatalogEntry,
} from "@/lib/playCatalog";
import { cn } from "@/lib/utils";

type Step = "role" | "secteur" | "entreprise" | "histoire";

const STEPS: { id: Step; label: string }[] = [
  { id: "role", label: "Rôle" },
  { id: "secteur", label: "Secteur" },
  { id: "entreprise", label: "Entreprise" },
  { id: "histoire", label: "Histoire" },
];

/**
 * Entonnoir Mode Histoire Live.
 * Rôles = biblio Admin ∩ histoires Live ; secteurs = Création / Book.
 */
export default function JouerLiveHistoireFunnelPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { syncPlayerCatalog } = useBookStore();
  const { roles: adminRoles } = useAtelierRolesStore();

  const [entries, setEntries] = useState<PlayCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const role = (search.get("role") || "").trim();
  const secteur = (search.get("secteur") || "").trim();
  const entreprise = (search.get("entreprise") || "").trim();

  const step: Step = !role
    ? "role"
    : !secteur
      ? "secteur"
      : !entreprise
        ? "entreprise"
        : "histoire";

  useEffect(() => {
    syncPlayerCatalog();
    setAdminPlaySession(null);
    void listVisibleLivePlayCatalog().then((list) => {
      setEntries(list);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleOptions = useMemo(
    () => rolesForLiveHistoires(entries, adminRoles),
    [entries, adminRoles]
  );
  const secteurOptions = useMemo(
    () => (role ? secteursForRole(entries, role) : []),
    [entries, role]
  );
  const entrepriseOptions = useMemo(
    () =>
      role && secteur ? entreprisesForRoleSecteur(entries, role, secteur) : [],
    [entries, role, secteur]
  );
  const histoireOptions = useMemo(
    () =>
      role && secteur && entreprise
        ? histoiresForSelection(entries, role, secteur, entreprise)
        : [],
    [entries, role, secteur, entreprise]
  );

  function hrefFor(parts: {
    role?: string;
    secteur?: string;
    entreprise?: string;
  }) {
    const q = new URLSearchParams();
    if (parts.role) q.set("role", parts.role);
    if (parts.secteur) q.set("secteur", parts.secteur);
    if (parts.entreprise) q.set("entreprise", parts.entreprise);
    const qs = q.toString();
    return qs ? `/jouer/live/histoire?${qs}` : "/jouer/live/histoire";
  }

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
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
          Mode Histoire · Book Live
        </p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          {step === "role"
            ? "Choisis ton rôle"
            : step === "secteur"
              ? "Secteur d'activité"
              : step === "entreprise"
                ? "Entreprise"
                : "Histoire"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Rôle → Secteur → Entreprise → Histoire. Rôles issus d&apos;Admin →
          Atelier → Rôles ; secteurs désignés à la Création de contexte.
        </p>

        <ol className="mt-6 flex flex-wrap gap-2">
          {STEPS.map((s, i) => {
            const idx = STEPS.findIndex((x) => x.id === step);
            const active = s.id === step;
            const done = i < idx;
            return (
              <li
                key={s.id}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
                  active
                    ? "bg-violet-400/25 text-violet-100"
                    : done
                      ? "bg-white/10 text-accent"
                      : "bg-white/5 text-muted"
                )}
              >
                {i + 1}. {s.label}
              </li>
            );
          })}
        </ol>

        {(role || secteur || entreprise) && (
          <p className="mt-3 text-xs text-muted">
            {[role, secteur, entreprise].filter(Boolean).join(" · ")}
            {" · "}
            <Link href="/jouer/live/histoire" className="underline">
              Recommencer
            </Link>
          </p>
        )}

        {loading ? (
          <p className="mt-8 text-sm text-muted">Chargement du catalogue…</p>
        ) : step === "role" ? (
          roleOptions.length === 0 ? (
            <Empty hint="Aucune histoire Live avec un rôle. Publie une histoire Book Live liée à un rôle Admin." />
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {roleOptions.map((r, i) => (
                <button
                  key={r.nom}
                  type="button"
                  onClick={() => router.push(hrefFor({ role: r.nom }))}
                  className="value-enter rounded-2xl border border-violet-400/30 bg-panel p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-violet-300/50"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  <h2 className="font-display text-xl font-semibold">{r.nom}</h2>
                  {r.description ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted">
                      {r.description}
                    </p>
                  ) : r.mission ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted">
                      {r.mission}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted">
                      Rôle catalogue Live
                      {!r.fromAdminLibrary
                        ? " (pas encore dans la biblio Admin)"
                        : ""}
                    </p>
                  )}
                  <p className="mt-3 text-[11px] text-violet-200/80">
                    {r.histoiresCount} histoire
                    {r.histoiresCount > 1 ? "s" : ""} Live
                    {r.fromAdminLibrary ? " · biblio Admin" : ""}
                  </p>
                </button>
              ))}
            </div>
          )
        ) : step === "secteur" ? (
          secteurOptions.length === 0 ? (
            <Empty hint="Aucun secteur pour ce rôle. Vérifie que la Création a un « Secteur d'activité » renseigné." />
          ) : (
            <div className="mt-8 space-y-3">
              {secteurOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    router.push(hrefFor({ role, secteur: s }))
                  }
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-panel px-5 py-4 text-left transition hover:border-accent/40"
                >
                  <span className="font-display text-lg font-semibold">{s}</span>
                  <ArrowRight className="h-4 w-4 text-accent" />
                </button>
              ))}
            </div>
          )
        ) : step === "entreprise" ? (
          entrepriseOptions.length === 0 ? (
            <Empty hint="Aucune entreprise Live pour ce rôle / secteur." />
          ) : (
            <div className="mt-8 space-y-3">
              {entrepriseOptions.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() =>
                    router.push(hrefFor({ role, secteur, entreprise: e }))
                  }
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-panel px-5 py-4 text-left transition hover:border-accent/40"
                >
                  <span className="font-display text-lg font-semibold">{e}</span>
                  <ArrowRight className="h-4 w-4 text-accent" />
                </button>
              ))}
            </div>
          )
        ) : histoireOptions.length === 0 ? (
          <Empty hint="Aucune histoire Live pour cette sélection." />
        ) : (
          <div className="mt-8 space-y-3">
            {histoireOptions.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl border border-violet-400/25 bg-panel p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-semibold">
                    {h.nom}{" "}
                    <span className="text-sm font-normal text-muted">
                      V{h.version}
                    </span>
                  </p>
                  <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    LIVE
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {h.roleName} · {h.secteur} · {h.entrepriseNom}
                </p>
                <Link
                  href={`/jouer/book/${h.id}`}
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

function Empty({ hint }: { hint: string }) {
  return (
    <p className="mt-8 rounded-2xl border border-dashed border-white/15 bg-panel/50 px-4 py-8 text-sm text-muted">
      {hint}
    </p>
  );
}
