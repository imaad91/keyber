"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Maximize2 } from "lucide-react";
import { useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton, Field } from "@/components/admin/AdminPrimitives";
import { useAtelierChantierStore } from "@/lib/atelierChantierStore";
import { useAtelierStore } from "@/lib/atelierStore";
import { cn } from "@/lib/utils";

export default function AtelierContexteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getContexte,
    getSecteur,
    rolesForContexte,
    competencesForContexte,
    setContextePublie,
    toast,
    clearToast,
  } = useAtelierStore();
  const { findChantierByContexteId, setChantierPublie } =
    useAtelierChantierStore();

  const ctx = getContexte(id);
  const [fullscreen, setFullscreen] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  if (!ctx) {
    return (
      <p className="text-sm text-slate-500">
        Contexte introuvable.{" "}
        <Link href="/admin/atelier/contextes" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  if (!ctx.publie) {
    return (
      <p className="text-sm text-slate-500">
        Ce contexte n&apos;est pas publié.{" "}
        {ctx.chantierId ? (
          <Link
            href={`/admin/atelier/chantier/${ctx.chantierId}`}
            className="underline"
          >
            Ouvrir le Chantier
          </Link>
        ) : (
          <Link href="/admin/atelier/contextes" className="underline">
            Retour
          </Link>
        )}
      </p>
    );
  }

  const secteur = ctx.secteurId ? getSecteur(ctx.secteurId) : undefined;
  const roles = rolesForContexte(id);
  const competences = competencesForContexte(id);
  const chantier =
    findChantierByContexteId(id) ??
    (ctx.chantierId
      ? { id: ctx.chantierId }
      : undefined);

  function returnToChantier() {
    setReturnError(null);
    const chId = chantier?.id ?? ctx!.chantierId;
    if (!chId) {
      setReturnError(
        "Aucun chantier lié à ce contexte — impossible de retourner en modification."
      );
      return;
    }
    const a = setContextePublie(id, false);
    if (a.error) {
      setReturnError(a.error);
      return;
    }
    setChantierPublie(chId, false);
    router.push(`/admin/atelier/chantier/${chId}`);
  }

  const shellClass = fullscreen
    ? "fixed inset-0 z-50 overflow-y-auto bg-white p-6"
    : "";

  return (
    <div className={shellClass}>
      <AdminBreadcrumb
        backHref="/admin/atelier/contextes"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/chantier" },
          { label: "Contextes", href: "/admin/atelier/contextes" },
          { label: ctx.nom },
        ]}
        title={ctx.nom}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AdminButton type="button" onClick={returnToChantier}>
          Retourner au Chantier
        </AdminButton>
        <AdminButton
          variant="secondary"
          type="button"
          onClick={() => setFullscreen((v) => !v)}
        >
          <Maximize2 className="h-4 w-4" />
          {fullscreen ? "Quitter le plein écran" : "Plein écran"}
        </AdminButton>
        <Link href="/jouer">
          <AdminButton variant="ghost" type="button">
            Jouer
          </AdminButton>
        </Link>
      </div>

      {returnError ? (
        <p className="mb-3 text-sm text-rose-600">{returnError}</p>
      ) : null}
      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">
        Consultation — lecture seule
      </p>

      <div className="space-y-5">
        <ReadField label="Secteur d'activité" value={secteur?.nom ?? "—"} />
        {secteur?.contraintes ? (
          <ReadField
            label="Contraintes du secteur"
            value={secteur.contraintes}
          />
        ) : null}
        <ReadField label="Nom" value={ctx.nom} />
        <ReadField label="Taille" value={ctx.taille} />
        <ReadField label="Employés" value={ctx.employes} />
        <ReadField label="Machines" value={ctx.machines} />
        <ReadField label="Clients" value={ctx.clients} />
        <ReadField label="Fournisseurs" value={ctx.fournisseurs} />
        <ReadField label="Organisation" value={ctx.organisation} />
        <ReadField label="Stock" value={ctx.stock} />
        <ReadField label="Problèmes" value={ctx.problematiques} />
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Rôles jouables dans ce contexte
        </h2>
        {roles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Aucun rôle publié.
          </p>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => {
              const linked = competences.filter((c) =>
                role.competenceIds.includes(c.id)
              );
              return (
                <div
                  key={role.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="font-semibold text-slate-900">{role.nom}</p>
                  {role.description ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {role.description}
                    </p>
                  ) : null}
                  {role.responsabilites ? (
                    <p className="mt-2 text-xs text-slate-500">
                      <span className="font-medium">Responsabilités :</span>{" "}
                      {role.responsabilites}
                    </p>
                  ) : null}
                  {role.infosErp ? (
                    <p className="mt-1 text-xs text-slate-500">
                      <span className="font-medium">
                        Infos accessibles dans l&apos;ERP :
                      </span>{" "}
                      {role.infosErp}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-medium">Compétences liées :</span>{" "}
                    {linked.length
                      ? linked.map((c) => c.nom).join(", ")
                      : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <p
        className={cn(
          "whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-800",
          !value && "text-slate-400"
        )}
      >
        {value || "—"}
      </p>
    </Field>
  );
}
