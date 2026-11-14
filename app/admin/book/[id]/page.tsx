"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { ModeBadge } from "@/components/admin/BookEntryCard";
import { BookScenarioGraph } from "@/components/admin/BookScenarioGraph";
import { useAtelierCreationStore } from "@/lib/atelierCreationStore";
import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import {
  bookStatusLabel,
  bookVersionLabel,
  emptyBookGraph,
  isPlayerVisible,
  useBookStore,
  type BookGraphView,
} from "@/lib/bookStore";
import { cn } from "@/lib/utils";

type ViewTab = "texte" | "graphique" | "code";

function formatDateFr(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getEntry,
    familyHistory,
    setStatus,
    deleteEntry,
    saveAsNewVersion,
    toast,
    clearToast,
  } = useBookStore();
  const { returnFromBookToCreation } = useAtelierCreationStore();
  const entry = getEntry(id);

  const [tab, setTab] = useState<ViewTab>("texte");
  const [showHistory, setShowHistory] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [graphJson, setGraphJson] = useState("");
  const [codeJson, setCodeJson] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!entry) return;
    setTextContent(entry.textContent || "");
    setGraphJson(JSON.stringify(entry.graph || emptyBookGraph(), null, 2));
    setCodeJson(
      entry.paramFile
        ? JSON.stringify(entry.paramFile, null, 2)
        : JSON.stringify({ note: "Fichier de paramétrage vide" }, null, 2)
    );
    setDirty(false);
  }, [entry?.id]);

  const history = useMemo(
    () => (entry ? familyHistory(entry.familyId) : []),
    [entry, familyHistory]
  );

  if (!entry) {
    return (
      <p className="text-sm text-slate-500">
        Entrée Book introuvable.{" "}
        <Link href="/admin/book/en-cours-de-test" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const playHref =
    entry.mode === "competence" ? "/jouer/competence" : "/jouer/histoire";

  function parseGraph(): BookGraphView | null {
    try {
      const g = JSON.parse(graphJson) as BookGraphView;
      if (!Array.isArray(g.nodes)) return null;
      return g;
    } catch {
      return null;
    }
  }

  function parseParam(): ScenarioParamFile | null {
    try {
      return JSON.parse(codeJson) as ScenarioParamFile;
    } catch {
      return null;
    }
  }

  function saveVersion() {
    const graph = parseGraph();
    if (!graph) {
      window.alert("Vue Graphique : JSON invalide");
      return;
    }
    const paramFile = parseParam();
    if (!paramFile) {
      window.alert("Vue Code : JSON invalide");
      return;
    }
    const res = saveAsNewVersion(entry!.id, {
      textContent,
      graph,
      paramFile,
      paramFileName:
        entry!.paramFileName ||
        (typeof paramFile.fichier === "string" ? paramFile.fichier : ""),
    });
    if ("error" in res) {
      window.alert(res.error);
      return;
    }
    setDirty(false);
    router.push(`/admin/book/${res.entry.id}`);
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref={
          entry.status === "live"
            ? "/admin/book/live"
            : "/admin/book/en-cours-de-test"
        }
        backLabel="← Retour au Book"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Book", href: "/admin/book/en-cours-de-test" },
          { label: bookVersionLabel(entry) },
        ]}
        title={bookVersionLabel(entry)}
      />

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ModeBadge mode={entry.mode} />
        <label className="text-sm">
          <span className="mr-2 text-xs text-slate-500">Version</span>
          <select
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            value={entry.id}
            onChange={(e) => router.push(`/admin/book/${e.target.value}`)}
          >
            {history.map((h) => (
              <option key={h.id} value={h.id}>
                V{h.version}
                {h.status === "live" ? " · Live" : ""}
              </option>
            ))}
          </select>
        </label>
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => setShowHistory((v) => !v)}
        >
          Voir l&apos;historique
        </AdminButton>
      </div>

      {showHistory ? (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-medium text-slate-700">Historique des versions</p>
          <ul className="mt-2 space-y-1">
            {history.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/admin/book/${h.id}`}
                  className={cn(
                    "underline",
                    h.id === entry.id && "font-semibold text-slate-900"
                  )}
                >
                  V{h.version}
                </Link>{" "}
                — {bookStatusLabel(h.status)} · {formatDateFr(h.updatedAt)}
                {h.paramFileName ? (
                  <span className="ml-1 text-xs text-slate-400">
                    ({h.paramFileName})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={playHref}>
          <AdminButton variant="secondary" type="button">
            {entry.status === "live" ? "Jouer" : "Tester"}
          </AdminButton>
        </Link>
        {entry.status === "en_test" ? (
          <AdminButton
            type="button"
            onClick={() => {
              const res = setStatus(entry.id, "live");
              if (res.error) window.alert(res.error);
            }}
          >
            Passer en Live
          </AdminButton>
        ) : (
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => {
              const res = setStatus(entry.id, "en_test");
              if (res.error) window.alert(res.error);
            }}
          >
            Retourner en En cours de test
          </AdminButton>
        )}
        <AdminButton
          type="button"
          variant="ghost"
          onClick={() => {
            const res = returnFromBookToCreation(entry);
            if ("error" in res) {
              window.alert(res.error);
              return;
            }
            router.push(`/admin/atelier/creation/${res.id}`);
          }}
        >
          Retourner en Création
        </AdminButton>
        {entry.status === "en_test" ? (
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => {
              if (!window.confirm(`Supprimer « ${bookVersionLabel(entry)} » ?`))
                return;
              const res = deleteEntry(entry.id);
              if (res.error) window.alert(res.error);
              else router.push("/admin/book/en-cours-de-test");
            }}
          >
            Supprimer
          </AdminButton>
        ) : null}
      </div>

      <p className="mb-4 text-sm text-slate-600">
        {entry.mode === "competence" ? "Scénario (Mode Compétence)" : "Histoire (Mode Histoire)"}{" "}
        · {entry.entrepriseNom} · V{entry.version} · {bookStatusLabel(entry.status)}
        {isPlayerVisible(entry) ? " · visible joueurs" : " · Admin uniquement"}
        {entry.paramFileName ? (
          <>
            {" "}
            · <code className="text-xs">{entry.paramFileName}</code>
          </>
        ) : null}
      </p>

      {/* 3 onglets */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {(
          [
            ["texte", "Vue Texte"],
            ["graphique", "Vue Graphique"],
            ["code", "Vue Code — Fichier de paramétrage"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              tab === key
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "texte" ? (
        <div className="mb-4">
          <textarea
            className="min-h-[360px] w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm text-slate-900 shadow-sm"
            value={textContent}
            onChange={(e) => {
              setTextContent(e.target.value);
              setDirty(true);
            }}
          />
        </div>
      ) : null}

      {tab === "graphique" ? (
        <div className="mb-4 space-y-4">
          <BookScenarioGraph
            graph={parseGraph() || entry.graph || emptyBookGraph()}
            title={`Graphique — ${entry.nom} V${entry.version}`}
          />
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Édition structure graphe (JSON) — sync avec la vue
            </p>
            <textarea
              className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-900 shadow-sm"
              value={graphJson}
              onChange={(e) => {
                setGraphJson(e.target.value);
                setDirty(true);
              }}
            />
          </div>
        </div>
      ) : null}

      {tab === "code" ? (
        <div className="mb-4">
          <p className="mb-2 text-xs text-slate-500">
            Fichier de paramétrage JSON complet
            {entry.paramFileName ? (
              <>
                {" "}
                — <code>{entry.paramFileName}</code>
              </>
            ) : null}
          </p>
          <textarea
            className="min-h-[420px] w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-emerald-100 shadow-sm"
            value={codeJson}
            onChange={(e) => {
              setCodeJson(e.target.value);
              setDirty(true);
            }}
            spellCheck={false}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <AdminButton type="button" disabled={!dirty} onClick={saveVersion}>
          Sauvegarder une nouvelle version (V{entry.version + 1})
        </AdminButton>
        {dirty ? (
          <span className="text-xs text-amber-700">
            Modifications non enregistrées — V{entry.version} ne sera pas
            écrasée
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            3 vues synchronisées sur V{entry.version}
          </span>
        )}
      </div>
    </div>
  );
}
