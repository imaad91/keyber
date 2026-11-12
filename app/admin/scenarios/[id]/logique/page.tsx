"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, EyeOff, GitCompare, History } from "lucide-react";
import { LogiqueBpmnView } from "@/components/admin/LogiqueBpmnView";
import { ScenarioWorkspaceNav } from "@/components/admin/ScenarioWorkspaceNav";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { relativeTimeFr } from "@/lib/coeurHistory";
import { useAdminStore } from "@/lib/adminStore";

export default function ScenarioLogiquePage() {
  const { id } = useParams<{ id: string }>();
  const {
    scenarios,
    getScenarioCoeur,
    getCoeurMeta,
    markCoeurHighlightsSeen,
    coeurMeta,
  } = useAdminStore();
  const scenario = scenarios.find((s) => s.id === id);
  const meta = coeurMeta[id] ?? getCoeurMeta(id);
  const liveCoeur = getScenarioCoeur(id);

  const [onlyHl, setOnlyHl] = useState(false);
  const [viewVersionId, setViewVersionId] = useState<string | null>(null);
  const [blinkId, setBlinkId] = useState<string | null>(null);
  const [comparePrev, setComparePrev] = useState(false);

  const viewing = useMemo(() => {
    if (!viewVersionId) return liveCoeur;
    return (
      meta.versions.find((v) => v.id === viewVersionId)?.snapshot ?? liveCoeur
    );
  }, [viewVersionId, meta.versions, liveCoeur]);

  const activeHighlights = meta.highlights;

  const deletedNodes = useMemo(() => {
    const deleted = activeHighlights.filter(
      (h) => h.kind === "supprime" && (!h.seen || h.expiresAt)
    );
    if (!deleted.length || meta.versions.length < 2) {
      return { decisions: [], evenements: [] };
    }
    const prev = meta.versions[1]?.snapshot;
    if (!prev) return { decisions: [], evenements: [] };
    return {
      decisions: prev.decisions.filter((d) =>
        deleted.some((h) => h.nodeId === d.id)
      ),
      evenements: prev.evenements.filter((e) =>
        deleted.some((h) => h.nodeId === e.id)
      ),
    };
  }, [activeHighlights, meta.versions]);

  if (!scenario) {
    return (
      <p className="text-sm text-slate-500">
        Scénario introuvable.{" "}
        <Link href="/admin/scenarios" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  function blink(nodeId: string) {
    setBlinkId(nodeId);
    setTimeout(() => setBlinkId(null), 2400);
  }

  return (
    <div>
      <ScenarioWorkspaceNav scenarioId={id} titre={scenario.titre} />

      <div className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <strong className="text-slate-900">Onglet Logique — lecture seule.</strong>{" "}
        Vos yeux, pas vos mains. Toute modification du Cœur se fait via Agents ou
        Fiche Scénario.
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <AdminButton
          variant={onlyHl ? "primary" : "secondary"}
          onClick={() => setOnlyHl((v) => !v)}
        >
          <Eye className="h-4 w-4" />
          Voir les dernières modifications
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() => markCoeurHighlightsSeen(id)}
        >
          <EyeOff className="h-4 w-4" />
          Tout marquer comme vu
        </AdminButton>
        <AdminButton
          variant={comparePrev ? "primary" : "secondary"}
          onClick={() => {
            setComparePrev((v) => !v);
            if (!comparePrev && meta.versions[1]) {
              setViewVersionId(null);
            }
          }}
        >
          <GitCompare className="h-4 w-4" />
          Comparer avec la version précédente
        </AdminButton>
      </div>

      {/* Version timeline */}
      <div className="mb-4 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
        {meta.versions.slice(0, 12).map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() =>
              setViewVersionId((cur) => (cur === v.id ? null : v.id))
            }
            className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs transition ${
              viewVersionId === v.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            <span className="block font-semibold">Version {v.version}</span>
            <span className="block opacity-80">
              {relativeTimeFr(v.createdAt)} par {v.originLabel}
            </span>
          </button>
        ))}
        {meta.versions.length === 0 ? (
          <p className="px-2 py-1 text-xs text-slate-500">Aucune version</p>
        ) : null}
      </div>

      {viewVersionId ? (
        <p className="mb-3 text-xs font-semibold text-amber-700">
          Affichage historique — version sélectionnée (lecture seule)
        </p>
      ) : null}

      <LogiqueBpmnView
        coeur={viewing}
        highlights={activeHighlights}
        onlyHighlights={onlyHl}
        blinkNodeId={blinkId}
        deletedNodes={deletedNodes}
      />

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <History className="h-4 w-4" />
          Historique visuel
        </h2>
        <ul className="space-y-2">
          {meta.audit.slice(0, 10).map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
            >
              <div>
                <p className="font-semibold text-slate-800">{a.description}</p>
                <p className="text-slate-500">
                  {new Date(a.at).toLocaleString("fr-FR")} · {a.originLabel}
                  {a.oldValue && a.newValue
                    ? ` · ${a.oldValue} → ${a.newValue}`
                    : ""}
                </p>
              </div>
              <AdminButton
                variant="ghost"
                className="text-xs"
                onClick={() => {
                  const hl = meta.highlights.find((h) => !h.seen) ?? meta.highlights[0];
                  if (hl) blink(hl.nodeId.split(":")[0]!);
                }}
              >
                Voir dans le graphique
              </AdminButton>
            </li>
          ))}
          {meta.audit.length === 0 ? (
            <p className="text-xs text-slate-500">Pas encore d&apos;historique.</p>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
