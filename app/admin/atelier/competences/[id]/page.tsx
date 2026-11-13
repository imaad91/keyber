"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import {
  COMPETENCE_TYPE_LABELS,
  isTechniqueVague,
  useAtelierStore,
  type CompetenceType,
} from "@/lib/atelierStore";

function linesToList(s: string) {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function AtelierCompetenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getCompetence,
    contextes,
    updateCompetence,
    toast,
    clearToast,
  } = useAtelierStore();
  const def = getCompetence(id);

  const [nom, setNom] = useState("");
  const [type, setType] = useState<CompetenceType>("technique");
  const [contexteId, setContexteId] = useState("");
  const [definitionExacte, setDefinitionExacte] = useState("");
  const [formule, setFormule] = useState("");
  const [indicateurs, setIndicateurs] = useState("");
  const [erreurs, setErreurs] = useState("");
  const [debutant, setDebutant] = useState("");
  const [intermediaire, setIntermediaire] = useState("");
  const [expert, setExpert] = useState("");

  useEffect(() => {
    if (!def) return;
    setNom(def.nom);
    setType(def.type);
    setContexteId(def.contexteId);
    setDefinitionExacte(def.definitionExacte);
    setFormule(def.formule);
    setIndicateurs(def.indicateurs.join("\n"));
    setErreurs(def.erreursFrequentes.join("\n"));
    setDebutant(def.niveaux.debutant);
    setIntermediaire(def.niveaux.intermediaire);
    setExpert(def.niveaux.expert);
  }, [def]);

  if (!def) {
    return (
      <p className="text-sm text-slate-500">
        Compétence introuvable.{" "}
        <Link href="/admin/atelier/competences" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const draft = {
    ...def,
    nom,
    type,
    contexteId,
    definitionExacte,
    formule,
    indicateurs: linesToList(indicateurs),
    erreursFrequentes: linesToList(erreurs),
    niveaux: { debutant, intermediaire, expert },
  };
  const vague = isTechniqueVague(draft);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/competences"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Compétences", href: "/admin/atelier/competences" },
          { label: def.nom },
        ]}
        title={def.nom}
      />

      {vague ? (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
          Fiche technique trop vague — ajoutez une formule et au moins un
          indicateur précis.
        </div>
      ) : null}

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
            updateCompetence(id, {
              nom,
              type,
              contexteId,
              definitionExacte,
              formule,
              indicateurs: linesToList(indicateurs),
              erreursFrequentes: linesToList(erreurs),
              niveaux: { debutant, intermediaire, expert },
            })
          }
        >
          Enregistrer
        </AdminButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Id (non modifiable)">
          <input className={inputClass} value={def.id} readOnly disabled />
        </Field>
        <Field label="Nom">
          <input
            className={inputClass}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </Field>
        <Field label="Type">
          <select
            className={selectClass}
            value={type}
            onChange={(e) => setType(e.target.value as CompetenceType)}
          >
            <option value="generale">{COMPETENCE_TYPE_LABELS.generale}</option>
            <option value="technique">{COMPETENCE_TYPE_LABELS.technique}</option>
          </select>
        </Field>
        <Field label="Contexte lié (obligatoire)">
          <select
            className={selectClass}
            value={contexteId}
            onChange={(e) => setContexteId(e.target.value)}
          >
            {contextes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Définition exacte" className="sm:col-span-2">
          <textarea
            className={textareaClass}
            value={definitionExacte}
            onChange={(e) => setDefinitionExacte(e.target.value)}
          />
        </Field>
        <Field
          label="Formule (technique)"
          hint="Ex. Besoin net = Besoin brut - Stock - En-cours"
          className="sm:col-span-2"
        >
          <input
            className={inputClass}
            value={formule}
            onChange={(e) => setFormule(e.target.value)}
          />
        </Field>
        <Field
          label="Indicateurs précis (1 par ligne)"
          className="sm:col-span-2"
        >
          <textarea
            className={textareaClass}
            value={indicateurs}
            onChange={(e) => setIndicateurs(e.target.value)}
          />
        </Field>
        <Field
          label="Erreurs fréquentes (1 par ligne)"
          className="sm:col-span-2"
        >
          <textarea
            className={textareaClass}
            value={erreurs}
            onChange={(e) => setErreurs(e.target.value)}
          />
        </Field>
        <Field label="Niveau Débutant">
          <textarea
            className={textareaClass}
            value={debutant}
            onChange={(e) => setDebutant(e.target.value)}
          />
        </Field>
        <Field label="Niveau Intermédiaire">
          <textarea
            className={textareaClass}
            value={intermediaire}
            onChange={(e) => setIntermediaire(e.target.value)}
          />
        </Field>
        <Field label="Niveau Expert" className="sm:col-span-2">
          <textarea
            className={textareaClass}
            value={expert}
            onChange={(e) => setExpert(e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
