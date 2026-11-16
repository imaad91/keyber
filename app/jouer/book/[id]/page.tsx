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
  fetchParamFile,
  getAdminPlaySession,
  getPlayCatalogEntry,
  paramFileExists,
  setAdminPlaySession,
} from "@/lib/playCatalog";

/**
 * Front-End play Book — shell Keyber OS (Ordinateur, décisions, interviews…).
 * Pas d'Atelier.
 */
export default function JouerBookEntryPage() {
  const { id } = useParams<{ id: string }>();
  const { getEntry, syncPlayerCatalog } = useBookStore();
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
        <Link href="/jouer/live" className="underline">
          Catalogue Live
        </Link>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-600">
        Scénario Book introuvable.{" "}
        <Link href="/jouer/live" className="underline">
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <BookPlayStatusBanner status={status} />

      {adminSession ? (
        <div className="border-b border-slate-200 bg-white px-4 py-2">
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

      <div className="mx-auto max-w-5xl px-6 py-8">
        {!adminSession ? (
          <Link
            href="/jouer/live"
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
              ? "Fichier de paramétrage introuvable (et aucun param embarqué)."
              : "Chargement du paramétrage…"}
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
    </div>
  );
}
