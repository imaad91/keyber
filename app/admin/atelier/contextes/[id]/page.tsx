"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { useAtelierStore } from "@/lib/atelierStore";

export default function AtelierContexteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getContexte, updateContexte, toast, clearToast } = useAtelierStore();
  const ctx = getContexte(id);

  const [nom, setNom] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [stock, setStock] = useState("");
  const [contrats, setContrats] = useState("");
  const [comptabilite, setComptabilite] = useState("");
  const [problematiques, setProblematiques] = useState("");

  useEffect(() => {
    if (!ctx) return;
    setNom(ctx.nom);
    setOrganisation(ctx.organisation);
    setStock(ctx.stock);
    setContrats(ctx.contrats);
    setComptabilite(ctx.comptabilite);
    setProblematiques(ctx.problematiques);
  }, [ctx]);

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

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/contextes"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Contextes", href: "/admin/atelier/contextes" },
          { label: ctx.nom },
        ]}
        title={ctx.nom}
      />

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4">
        <AdminButton
          onClick={() =>
            updateContexte(id, {
              nom,
              organisation,
              stock,
              contrats,
              comptabilite,
              problematiques,
            })
          }
        >
          Enregistrer
        </AdminButton>
      </div>

      <div className="space-y-5">
        <Field label="Nom">
          <input
            className={inputClass}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </Field>
        <Field
          label="Organisation"
          hint="Organigramme, qui fait quoi, rôles"
        >
          <textarea
            className={textareaClass}
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        </Field>
        <Field label="Stock" hint="Quantités réelles, kg / unités">
          <textarea
            className={textareaClass}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </Field>
        <Field label="Contrats" hint="Clients, délais, pénalités">
          <textarea
            className={textareaClass}
            value={contrats}
            onChange={(e) => setContrats(e.target.value)}
          />
        </Field>
        <Field label="Comptabilité" hint="Trésorerie, marges, coûts">
          <textarea
            className={textareaClass}
            value={comptabilite}
            onChange={(e) => setComptabilite(e.target.value)}
          />
        </Field>
        <Field
          label="Problématiques"
          hint="Tensions, machines en panne, fournisseur en retard"
        >
          <textarea
            className={textareaClass}
            value={problematiques}
            onChange={(e) => setProblematiques(e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
