"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BookPlayStatusBanner } from "@/components/BookPlayStatusBanner";
import { ModeBadge } from "@/components/admin/BookEntryCard";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { OsIntroNarrative } from "@/components/osPlay/OsIntroNarrative";
import { OsPlayShell } from "@/components/osPlay/OsPlayShell";
import {
  bookVersionLabel,
  useBookStore,
  type BookStatus,
} from "@/lib/bookStore";
import {
  osDonneesClearProgress,
  osDonneesLoadProgress,
} from "@/lib/keyberOs/donneesSauvegarde";
import {
  OS_LIVE_CATALOG_PATH,
  osBookPlayHref,
} from "@/lib/keyberOs/bookBridge";
import {
  rememberOsParamSource,
  resolveOsBookParam,
} from "@/lib/keyberOs/paramLoader";
import { createOsBookPlayState, type OsBookPlayState } from "@/lib/osBookPlay";
import {
  clearOsActivePlay,
  publishOsActivePlay,
} from "@/lib/osActivePlayStore";
import {
  getAdminPlaySession,
  getPlayCatalogEntry,
  setAdminPlaySession,
} from "@/lib/playCatalog";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";

/**
 * Entrée joueur officielle Keyber OS (Étape 20).
 * Route : `/jouer/book/[id]` → OsPlayShell (pipeline lib/keyberOs).
 * Bandeaux Test / Live inchangés. `/play` redirige vers Live (Étape 42).
 * Pas d'Atelier.
 */
export default function BookClient() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const forceNew = searchParams.get("new") === "1";
  const { getEntry, syncPlayerCatalog } = useBookStore();
  const { config: osConfig } = useKeyberOsRuntime();
  const bookEntry = getEntry(id);
  const catalogEntry = getPlayCatalogEntry(id);

  const [status, setStatus] = useState<BookStatus>(
    bookEntry?.status ?? catalogEntry?.status ?? "en_test"
  );
  const [fileMissing, setFileMissing] = useState(false);
  const [play, setPlay] = useState<OsBookPlayState | null>(null);
  const [adminSession, setAdminSession] = useState(getAdminPlaySession());

  const meta = bookEntry || catalogEntry;
  const paramFileName =
    bookEntry?.paramFileName || catalogEntry?.paramFileName || "";
  const entryStatus: BookStatus =
    bookEntry?.status ?? catalogEntry?.status ?? "en_test";

  useEffect(() => {
    syncPlayerCatalog();
    const session = getAdminPlaySession();
    setAdminSession((prev) => {
      if (!prev && !session) return prev;
      if (
        prev &&
        session &&
        prev.bookEntryId === session.bookEntryId &&
        prev.status === session.status &&
        prev.returnHref === session.returnHref
      ) {
        return prev;
      }
      return session;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus(entryStatus);
    async function boot() {
      const entry = getEntry(id);
      const catalog = getPlayCatalogEntry(id);
      const embedded = entry?.paramFile || catalog?.paramFile || null;
      const name =
        entry?.paramFileName || catalog?.paramFileName || paramFileName;

      /** Étape 36 — loader strict : disk | embedded uniquement (pas Novacier). */
      const resolved = await resolveOsBookParam({
        paramFileName: name,
        embedded,
      });
      if (cancelled) return;

      if (!resolved.ok) {
        setFileMissing(true);
        setPlay(null);
        return;
      }

      rememberOsParamSource(resolved.source);
      setFileMissing(resolved.diskMissing);
      const sessionId = String(id);
      // Catalogue Live « Jouer » (?new=1) → partie neuve (intro / narration).
      if (forceNew) {
        osDonneesClearProgress(sessionId);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/jouer/book/${sessionId}`);
        }
      }
      const resumed = forceNew ? null : osDonneesLoadProgress(sessionId);
      if (resumed) {
        setPlay({
          ...resumed,
          param: resolved.param,
          paramSource: resolved.source,
          log: [
            resolved.log,
            ...(resumed.log || []).filter(
              (l) => !String(l).startsWith("Loader OS →")
            ),
          ],
        });
        return;
      }
      setPlay(
        createOsBookPlayState(resolved.param, sessionId, resolved.source)
      );
    }
    void boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, paramFileName, entryStatus, forceNew]);

  const returnHref =
    adminSession?.returnHref ||
    (status === "live" ? "/admin/book/live" : "/admin/book/en-cours-de-test");

  useEffect(() => {
    if (!play || !meta) return;
    publishOsActivePlay(
      {
        bookEntryId: String(id),
        title: bookVersionLabel(meta),
        subtitle:
          meta.mode === "competence"
            ? `Compétence : ${meta.competenceName || "—"}`
            : `Rôle : ${meta.roleName || "—"} · Secteur : ${meta.secteur || "—"}`,
        returnHref: osBookPlayHref(String(id)),
      },
      play
    );
  }, [play, meta, id]);

  if (!meta && fileMissing) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-600">
        Scénario indisponible (fichier de paramétrage manquant).{" "}
        <Link href={OS_LIVE_CATALOG_PATH} className="underline">
          Catalogue Live
        </Link>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-600">
        Scénario Book introuvable.{" "}
        <Link href={OS_LIVE_CATALOG_PATH} className="underline">
          Retour
        </Link>
      </div>
    );
  }

  if (fileMissing && status === "live" && !adminSession) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-600">
        Ce scénario Live n&apos;a plus de fichier de paramétrage — retiré du
        Front-End joueur.
      </div>
    );
  }

  const subtitle =
    meta.mode === "competence"
      ? `Compétence : ${meta.competenceName || "—"}`
      : `Rôle : ${meta.roleName || "—"} · Secteur : ${meta.secteur || "—"}`;

  const fullBleed =
    Boolean(play) && osConfig.interfaceJoueur.fullBleedShell !== false;

  // Page narration plein écran — avant le shell (Histoire / Intro[]).
  if (play && !play.world?.introSeen) {
    return (
      <div className="relative min-h-screen">
        <OsIntroNarrative play={play} setPlay={setPlay} />
      </div>
    );
  }

  return (
    <div
      className={
        fullBleed
          ? "flex min-h-screen flex-col bg-background"
          : "min-h-screen bg-slate-100 text-slate-900"
      }
    >
      <BookPlayStatusBanner status={status} />

      {adminSession ? (
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2">
          <Link href={returnHref}>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => {
                clearOsActivePlay();
                setAdminPlaySession(null);
              }}
            >
              ← Retour à l&apos;Admin
            </AdminButton>
          </Link>
        </div>
      ) : null}

      {fullBleed ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {!adminSession ? (
            <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-panel px-3 py-1.5 text-xs text-muted">
              <Link
                href={OS_LIVE_CATALOG_PATH}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Catalogue
              </Link>
              <ModeBadge mode={meta.mode} />
              <span>
                {meta.entrepriseNom} · V{meta.version}
              </span>
              <span className="ml-auto hidden text-[10px] uppercase tracking-wider text-muted sm:inline">
                Keyber OS · porte Live
              </span>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-panel px-3 py-1.5 text-xs text-muted">
              <ModeBadge mode={meta.mode} />
              <span>
                {meta.entrepriseNom} · V{meta.version}
              </span>
              <span className="ml-auto text-[10px] uppercase tracking-wider">
                Keyber OS
              </span>
            </div>
          )}
          {play ? (
            <OsPlayShell
              play={play}
              setPlay={setPlay}
              title={bookVersionLabel(meta)}
              subtitle={subtitle}
            />
          ) : (
            <p className="p-6 text-sm text-muted">
              {fileMissing
                ? "Fichier de paramétrage introuvable."
                : "Chargement…"}
            </p>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-6 py-8">
          {!adminSession ? (
            <Link
              href={OS_LIVE_CATALOG_PATH}
              className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Catalogue Live
            </Link>
          ) : null}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <ModeBadge mode={meta.mode} />
            <span className="text-xs text-slate-500">
              {meta.entrepriseNom} · V{meta.version}
            </span>
          </div>
          {!play ? (
            <p className="text-sm text-slate-500">
              {fileMissing
                ? "Fichier de paramétrage introuvable."
                : "Chargement…"}
            </p>
          ) : (
            <OsPlayShell
              play={play}
              setPlay={setPlay}
              title={bookVersionLabel(meta)}
              subtitle={subtitle}
            />
          )}
        </div>
      )}
    </div>
  );
}
