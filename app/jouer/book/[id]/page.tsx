"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BookPlayStatusBanner } from "@/components/BookPlayStatusBanner";
import { ModeBadge } from "@/components/admin/BookEntryCard";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  bookVersionLabel,
  useBookStore,
  type BookStatus,
} from "@/lib/bookStore";
import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import {
  applyOsBookChoice,
  createOsBookPlayState,
  osBookErpSnapshot,
  osBookInterfaceView,
  type OsBookPlayState,
} from "@/lib/osBookPlay";
import {
  fetchParamFile,
  getAdminPlaySession,
  getPlayCatalogEntry,
  paramFileExists,
  setAdminPlaySession,
} from "@/lib/playCatalog";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";

/**
 * Front-End play d'une carte Book — appelle Keyber OS (param → décisions →
 * événements → ERP facteur → progression). Pas d'Atelier.
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
  const [param, setParam] = useState<ScenarioParamFile | null>(null);
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
    // Une seule fois au montage — syncPlayerCatalog n'est pas stable.
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
        setParam(resolved);
        setPlay(createOsBookPlayState(resolved, String(id)));
      };
      const fail = () => {
        if (cancelled) return;
        setFileMissing(true);
        setParam(null);
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
        // Admin / Book : fichier absent → param embarqué si dispo.
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
    // Intentionnel : id + status + nom de fichier (pas l'objet entry).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, paramFileName, entryStatus]);

  // Relit le runtime OS à chaque render — modules Admin branchés.
  const erp = play ? osBookErpSnapshot(play) : null;
  const ui = play ? osBookInterfaceView(play) : null;
  void osConfig.erp.tresorerieFacteur;
  void osConfig.interfaceJoueur;
  void osConfig.progression;
  void osConfig.moteurDecisions;

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

  const decision = play?.decisions[play.stepIndex];

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

      <div className="mx-auto max-w-3xl px-6 py-8">
        {!adminSession ? (
          <Link
            href="/jouer/live"
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Catalogue Live
          </Link>
        ) : null}

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <ModeBadge mode={meta.mode} />
          <span className="text-xs text-slate-500">
            {meta.entrepriseNom} · V{meta.version}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {bookVersionLabel(meta)}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {meta.mode === "competence"
            ? `Compétence : ${meta.competenceName || "—"}`
            : `Rôle : ${meta.roleName || "—"} · Secteur : ${meta.secteur || "—"}`}
        </p>

        {/* ERP via module Keyber OS */}
        {erp && ui?.showErpTiles ? (
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ErpTile
              label="Trésorerie"
              value={`${erp.tresorerie.toLocaleString("fr-FR")} €`}
              hint={`brute ${erp.tresorerieBrute.toLocaleString("fr-FR")} ×${erp.facteur}`}
            />
            <ErpTile label="Stock" value={String(erp.stock)} />
            <ErpTile label="Production" value={String(erp.production)} />
            <ErpTile label="Commandes" value={String(erp.commandes)} />
          </section>
        ) : null}

        <p className="mt-2 text-xs text-slate-500">
          ERP Keyber OS — {osConfig.erp.tresorerieFormuleLabel}
          {erp ? ` · équipe ${erp.equipe}` : ""}
        </p>

        {/* Progression via module OS */}
        {play && ui?.showProgressionLine ? (
          <p className="mt-3 text-sm text-slate-700">
            XP {play.xp} · Niveau {play.niveau} · Score {play.score}
            {play.eventsFired.length
              ? ` · Événements : ${play.eventsFired.join(", ")}`
              : ""}
          </p>
        ) : null}

        {/* Décision */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!play ? (
            <p className="text-sm text-slate-500">
              {fileMissing
                ? "Fichier de paramétrage introuvable (et aucun param embarqué). Ce scénario ne peut pas être joué tant que le fichier n’est pas régénéré / présent sous data/scenarios/."
                : "Chargement du paramétrage…"}
            </p>
          ) : play.finished ? (
            <div>
              <h2 className="text-lg font-semibold">Fin de scénario</h2>
              <p className="mt-2 text-sm text-slate-600">
                Score {play.score} · XP {play.xp} · Niveau {play.niveau}
              </p>
              <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                {(meta as { textContent?: string }).textContent ||
                  param?.Nom ||
                  "—"}
              </pre>
            </div>
          ) : decision ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Moteur de Décisions & Branches — étape {play.stepIndex + 1}/
                {play.decisions.length}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{decision.titre}</h2>
              <div className="mt-4 space-y-2">
                {decision.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium hover:border-slate-400 hover:bg-white"
                    onClick={() => setPlay(applyOsBookChoice(play, o.id))}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {play.feedback ? (
                <p className="mt-3 text-sm text-emerald-700">{play.feedback}</p>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* Pipeline OS log (module Interface Joueur) */}
        {play && ui?.showPipelineLog ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/70">
              Pipeline Keyber OS
            </p>
            <ul className="mt-2 space-y-1 font-mono text-[11px] text-emerald-100">
              {play.log.map((line, i) => (
                <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ErpTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p> : null}
    </div>
  );
}
