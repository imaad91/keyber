"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Copy } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { ChantierEtape1Form } from "@/components/admin/atelier/ChantierEtape1Form";
import { ChantierEtape2Roles } from "@/components/admin/atelier/ChantierEtape2Roles";
import {
  buildPromptCorrection,
  CHANTIER_ETAPE_STATUT_LABELS,
  CHANTIER_ETAPES,
  countEtapesValidees,
  hasEtapePrecedenteBloquee,
  isChantierPretAPublier,
  useAtelierChantierStore,
  type ChantierEtapeStatut,
} from "@/lib/atelierChantierStore";
import { useAtelierStore } from "@/lib/atelierStore";
import { cn } from "@/lib/utils";

const STATUT_STYLES: Record<ChantierEtapeStatut, string> = {
  a_faire: "bg-slate-100 text-slate-700 ring-slate-200",
  en_cours: "bg-amber-100 text-amber-900 ring-amber-200",
  bloque: "bg-rose-100 text-rose-800 ring-rose-200",
  valide: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export default function AtelierChantierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getChantier,
    setEtapeStatut,
    attemptPublish,
    setChantierPublie,
    toast,
    clearToast,
  } = useAtelierChantierStore();
  const { getSecteur, setContextePublie } = useAtelierStore();
  const chantier = getChantier(id);

  const [blockPanel, setBlockPanel] = useState<null | 1 | 2 | 3 | 4 | 5 | 6>(
    null
  );
  const [blockText, setBlockText] = useState("");
  const [blockError, setBlockError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!chantier) {
    return (
      <p className="text-sm text-slate-500">
        Chantier introuvable.{" "}
        <Link href="/admin/atelier/chantier" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const secteur = chantier.secteurId
    ? getSecteur(chantier.secteurId)
    : undefined;
  const done = countEtapesValidees(chantier);
  const canPublish = isChantierPretAPublier(chantier);

  function applyStatut(
    numero: 1 | 2 | 3 | 4 | 5 | 6,
    statut: ChantierEtapeStatut,
    motif?: string
  ) {
    setActionError(null);
    setPublishMsg(null);
    const res = setEtapeStatut(id, numero, statut, motif);
    if (res.error) setActionError(res.error);
  }

  async function copyPrompt(numero: number, motif: string) {
    const text = buildPromptCorrection(chantier!.nom, numero, motif);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(numero);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copiez le prompt :", text);
    }
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/chantier"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/chantier" },
          { label: "Chantier / Création", href: "/admin/atelier/chantier" },
          { label: chantier.nom },
        ]}
        title={`Chantier — ${chantier.nom}`}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-500">Secteur :</span>{" "}
            {secteur?.nom ?? "—"}
          </p>
          <p className="mt-1">
            Progression :{" "}
            <strong>
              {done} étape{done > 1 ? "s" : ""} validée{done > 1 ? "s" : ""} sur
              6
            </strong>
          </p>
        </div>
        <AdminButton
          type="button"
          disabled={!canPublish}
          title={
            canPublish
              ? "Publier dans l'Atelier"
              : "Les 6 étapes doivent être validées"
          }
          onClick={() => {
            setPublishMsg(null);
            setActionError(null);
            const res = attemptPublish(id);
            if (res.error) {
              setActionError(res.error);
              return;
            }
            if (!chantier.contexteId) {
              setActionError("Étape 1 incomplète : aucun contexte lié");
              return;
            }
            const pub = setContextePublie(chantier.contexteId, true);
            if (pub.error) {
              setActionError(pub.error);
              return;
            }
            setChantierPublie(id, true);
            setPublishMsg(
              "Contexte publié dans Atelier → Contextes. Vous pouvez le consulter en lecture seule."
            );
          }}
        >
          Publier dans l&apos;Atelier
        </AdminButton>
      </div>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}
      {publishMsg ? (
        <p className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800">
          {publishMsg}
        </p>
      ) : null}
      {actionError ? (
        <p className="mb-3 text-sm text-rose-600">{actionError}</p>
      ) : null}

      <ol className="space-y-4">
        {CHANTIER_ETAPES.map((def) => {
          const etape = chantier.etapes.find((e) => e.numero === def.numero)!;
          const blockedPrev = hasEtapePrecedenteBloquee(
            chantier,
            def.numero
          );
          const lockedNext = blockedPrev;

          return (
            <li
              key={def.numero}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">
                      Étape {def.numero} : {def.nom}
                    </p>
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
                        STATUT_STYLES[etape.statut]
                      )}
                    >
                      {CHANTIER_ETAPE_STATUT_LABELS[etape.statut]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {def.description}
                  </p>
                  {etape.statut === "bloque" && etape.motifBlocage ? (
                    <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
                      <span className="font-medium">Motif :</span>{" "}
                      {etape.motifBlocage}
                    </p>
                  ) : null}
                  {lockedNext ? (
                    <p className="mt-2 text-xs text-rose-600">
                      Une étape précédente est bloquée — vous ne pouvez pas
                      avancer ici tant qu&apos;elle n&apos;est pas débloquée.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <AdminButton
                  variant="secondary"
                  type="button"
                  disabled={lockedNext || etape.statut === "en_cours"}
                  onClick={() => applyStatut(def.numero, "en_cours")}
                >
                  Mettre en cours
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  type="button"
                  disabled={lockedNext || etape.statut === "valide"}
                  onClick={() => applyStatut(def.numero, "valide")}
                >
                  Valider
                </AdminButton>
                <AdminButton
                  variant="danger"
                  type="button"
                  disabled={lockedNext}
                  onClick={() => {
                    setBlockError(null);
                    setBlockText("");
                    setBlockPanel(def.numero);
                  }}
                >
                  Bloquer
                </AdminButton>
                {etape.statut === "bloque" && etape.motifBlocage ? (
                  <AdminButton
                    variant="ghost"
                    type="button"
                    onClick={() =>
                      copyPrompt(def.numero, etape.motifBlocage)
                    }
                  >
                    <Copy className="h-4 w-4" />
                    {copied === def.numero
                      ? "Copié !"
                      : "Copier le Prompt de Correction"}
                  </AdminButton>
                ) : null}
              </div>

              {def.numero === 1 ? (
                <ChantierEtape1Form
                  chantierId={id}
                  readOnly={chantier.publie || lockedNext}
                />
              ) : null}
              {def.numero === 2 ? (
                <ChantierEtape2Roles
                  chantierId={id}
                  readOnly={chantier.publie || lockedNext}
                />
              ) : null}
              {def.numero === 3 ? (
                <div className="mt-4">
                  <Link href={`/admin/atelier/chantier/${id}/etape-3`}>
                    <AdminButton
                      variant="secondary"
                      type="button"
                      disabled={lockedNext}
                    >
                      Ouvrir l&apos;Étape 3 — Compétences + Cours
                    </AdminButton>
                  </Link>
                </div>
              ) : null}
              {def.numero === 4 ? (
                <div className="mt-4">
                  <Link href={`/admin/atelier/chantier/${id}/etape-4`}>
                    <AdminButton
                      variant="secondary"
                      type="button"
                      disabled={lockedNext}
                    >
                      Ouvrir l&apos;Étape 4 — Scénarios Mode Compétence
                    </AdminButton>
                  </Link>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {blockPanel ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Bloquer l&apos;étape {blockPanel}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Qu&apos;est-ce qui ne te plaît pas ? Écris-le en phrase simple.
            </p>
            <textarea
              className="mt-3 min-h-[120px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={blockText}
              onChange={(e) => setBlockText(e.target.value)}
              placeholder="Ex. Tu as inventé une responsabilité"
            />
            {blockError ? (
              <p className="mt-2 text-sm text-rose-600">{blockError}</p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => setBlockPanel(null)}
              >
                Annuler
              </AdminButton>
              <AdminButton
                variant="danger"
                type="button"
                onClick={() => {
                  setBlockError(null);
                  const res = setEtapeStatut(
                    id,
                    blockPanel,
                    "bloque",
                    blockText
                  );
                  if (res.error) {
                    setBlockError(res.error);
                    return;
                  }
                  setBlockPanel(null);
                }}
              >
                Confirmer le blocage
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
