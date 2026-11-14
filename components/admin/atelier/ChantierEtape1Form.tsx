"use client";

import { useEffect, useState } from "react";
import {
  AdminButton,
  Field,
  inputClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { useAtelierChantierStore } from "@/lib/atelierChantierStore";
import { useAtelierStore } from "@/lib/atelierStore";

/** Étape 1 — création secteur + fiche contexte (champs déjà connus Atelier). */
export function ChantierEtape1Form({
  chantierId,
  readOnly,
}: {
  chantierId: string;
  readOnly?: boolean;
}) {
  const {
    getChantier,
    updateChantierLinks,
  } = useAtelierChantierStore();
  const {
    getSecteur,
    getContexte,
    createSecteur,
    updateSecteur,
    createContexte,
    updateContexte,
  } = useAtelierStore();

  const chantier = getChantier(chantierId);
  const secteur = chantier?.secteurId
    ? getSecteur(chantier.secteurId)
    : undefined;
  const contexte = chantier?.contexteId
    ? getContexte(chantier.contexteId)
    : undefined;

  const [secteurNom, setSecteurNom] = useState("");
  const [secteurDescription, setSecteurDescription] = useState("");
  const [secteurContraintes, setSecteurContraintes] = useState("");

  const [nom, setNom] = useState(chantier?.nom ?? "");
  const [taille, setTaille] = useState("");
  const [employes, setEmployes] = useState("");
  const [machines, setMachines] = useState("");
  const [clients, setClients] = useState("");
  const [fournisseurs, setFournisseurs] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [stock, setStock] = useState("");
  const [problemes, setProblemes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (secteur) {
      setSecteurNom(secteur.nom);
      setSecteurDescription(secteur.description);
      setSecteurContraintes(secteur.contraintes);
    }
    if (contexte) {
      setNom(contexte.nom);
      setTaille(contexte.taille);
      setEmployes(contexte.employes);
      setMachines(contexte.machines);
      setClients(contexte.clients);
      setFournisseurs(contexte.fournisseurs);
      setOrganisation(contexte.organisation);
      setStock(contexte.stock);
      setProblemes(contexte.problematiques);
    } else if (chantier) {
      setNom(chantier.nom);
    }
  }, [secteur, contexte, chantier]);

  if (!chantier) return null;

  function save() {
    setError(null);
    setSaved(false);
    if (!secteurNom.trim()) {
      setError("Nom du secteur obligatoire");
      return;
    }
    if (!nom.trim()) {
      setError("Nom de l'entreprise obligatoire");
      return;
    }

    let nextSecteurId = chantier!.secteurId;
    if (nextSecteurId && getSecteur(nextSecteurId)) {
      const res = updateSecteur(nextSecteurId, {
        nom: secteurNom,
        description: secteurDescription,
        contraintes: secteurContraintes,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
    } else {
      const created = createSecteur({
        nom: secteurNom,
        description: secteurDescription,
        contraintes: secteurContraintes,
      });
      if ("error" in created) {
        setError(created.error);
        return;
      }
      nextSecteurId = created.id;
    }

    let nextContexteId = chantier!.contexteId;
    if (nextContexteId && getContexte(nextContexteId)) {
      const res = updateContexte(nextContexteId, {
        nom,
        secteurId: nextSecteurId,
        chantierId: chantierId,
        taille,
        employes,
        machines,
        clients,
        fournisseurs,
        organisation,
        stock,
        problematiques: problemes,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
    } else {
      const created = createContexte({
        nom,
        secteurId: nextSecteurId,
        chantierId,
        taille,
        employes,
        machines,
        clients,
        fournisseurs,
        organisation,
        stock,
        problematiques: problemes,
      });
      if ("error" in created) {
        setError(created.error);
        return;
      }
      nextContexteId = created.id;
    }

    updateChantierLinks(chantierId, {
      secteurId: nextSecteurId,
      contexteId: nextContexteId,
      nom,
    });
    setSaved(true);
  }

  return (
    <div className="mt-4 space-y-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">Secteur</h4>
        <div className="mt-3 space-y-3">
          <Field label="Nom du secteur *">
            <input
              className={inputClass}
              value={secteurNom}
              disabled={readOnly}
              onChange={(e) => setSecteurNom(e.target.value)}
              placeholder="Ex. Agroalimentaire"
            />
          </Field>
          <Field label="Description">
            <textarea
              className={textareaClass}
              value={secteurDescription}
              disabled={readOnly}
              onChange={(e) => setSecteurDescription(e.target.value)}
            />
          </Field>
          <Field label="Contraintes spécifiques du secteur">
            <textarea
              className={textareaClass}
              value={secteurContraintes}
              disabled={readOnly}
              onChange={(e) => setSecteurContraintes(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          Fiche contexte / entreprise
        </h4>
        <div className="mt-3 space-y-3">
          <Field label="Nom de l'entreprise *">
            <input
              className={inputClass}
              value={nom}
              disabled={readOnly}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex. AgriBio"
            />
          </Field>
          <Field label="Taille">
            <input
              className={inputClass}
              value={taille}
              disabled={readOnly}
              onChange={(e) => setTaille(e.target.value)}
            />
          </Field>
          <Field label="Employés">
            <textarea
              className={textareaClass}
              value={employes}
              disabled={readOnly}
              onChange={(e) => setEmployes(e.target.value)}
            />
          </Field>
          <Field label="Machines">
            <textarea
              className={textareaClass}
              value={machines}
              disabled={readOnly}
              onChange={(e) => setMachines(e.target.value)}
            />
          </Field>
          <Field label="Clients">
            <textarea
              className={textareaClass}
              value={clients}
              disabled={readOnly}
              onChange={(e) => setClients(e.target.value)}
            />
          </Field>
          <Field label="Fournisseurs">
            <textarea
              className={textareaClass}
              value={fournisseurs}
              disabled={readOnly}
              onChange={(e) => setFournisseurs(e.target.value)}
            />
          </Field>
          <Field label="Organisation">
            <textarea
              className={textareaClass}
              value={organisation}
              disabled={readOnly}
              onChange={(e) => setOrganisation(e.target.value)}
            />
          </Field>
          <Field label="Stock">
            <textarea
              className={textareaClass}
              value={stock}
              disabled={readOnly}
              onChange={(e) => setStock(e.target.value)}
            />
          </Field>
          <Field label="Problèmes">
            <textarea
              className={textareaClass}
              value={problemes}
              disabled={readOnly}
              onChange={(e) => setProblemes(e.target.value)}
            />
          </Field>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {saved ? (
        <p className="text-sm text-emerald-700">Étape 1 enregistrée.</p>
      ) : null}
      {!readOnly ? (
        <AdminButton type="button" onClick={save}>
          Enregistrer Secteur + Contexte
        </AdminButton>
      ) : null}
    </div>
  );
}
