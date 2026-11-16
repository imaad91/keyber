"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BookPlayStatusBanner } from "@/components/BookPlayStatusBanner";
import { ModeBadge } from "@/components/admin/BookEntryCard";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { OsPlayShell } from "@/components/osPlay/OsPlayShell";
import {
  bookVersionLabel,
  useBookStore,
  type BookStatus,
} from "@/lib/bookStore";
import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { createOsBookPlayState, type OsBookPlayState } from "@/lib/osBookPlay";
import {
  OS_LEGACY_PLAY_PATH,
  OS_LIVE_CATALOG_PATH,
} from "@/lib/keyberOs/bookBridge";
import {
  fetchParamFile,
  getAdminPlaySession,
  getPlayCatalogEntry,
  paramFileExists,
  setAdminPlaySession,
} from "@/lib/playCatalog";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";

/**
 * Entrée joueur officielle Keyber OS (Étape 20).
 * Route : `/jouer/book/[id]` → OsPlayShell (pipeline lib/keyberOs).
 * Bandeaux Test / Live inchangés. `/play` = POC Novacier, hors de cette page.
 * Pas d'Atelier.
 */
export default function JouerBookEntryPage() {
  const { id } = useParams<{ id: string }>();
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

      const apply = (resolved: ScenarioParamFile, missing: boolean) => {
        if (cancelled) return;
        setFileMissing(missing);
        setPlay(createOsBookPlayState(resolved, String(id)));
      };
      const fail = () => {
        if (cancelled) return;
        setFileMissing(true);
        setPlay(null);
      };

      if (!name) {
        if (embedded) apply(embedded, false);
        else fail();
        return;
      }

      const exists = await paramFileExists(name);
      if (cancelled) return;
      if (!exists) {
        if (embedded) apply(embedded, true);
        else fail();
        return;
      }

      const fromDisk = await fetchParamFile(name);
      if (cancelled) return;
      const resolved = fromDisk || embedded;
      if (resolved) apply(resolved, !fromDisk);
      else fail();
    }
    void boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, paramFileName, entryStatus]);

  const returnHref =
    adminSession?.returnHref ||
    (status === "live" ? "/admin/book/live" : "/admin/book/en-cours-de-test");

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
              onClick={() => setAdminPlaySession(null)}
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
                Keyber OS · hors {OS_LEGACY_PLAY_PATH}
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
