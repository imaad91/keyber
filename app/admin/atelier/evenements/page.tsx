"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  creationVersionLabel,
  useAtelierCreationStore,
} from "@/lib/atelierCreationStore";
import {
  downloadEventsTemplate,
  eventPreviewEntries,
  parseEventsExcel,
  type EventExcelFields,
} from "@/lib/atelierEventsExcel";
import { useAtelierEventsStore } from "@/lib/atelierEventsStore";

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

type EntrepriseOption = {
  familyId: string;
  nom: string;
  label: string;
};

export default function AtelierEvenementsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { creations } = useAtelierCreationStore();
  const {
    listEntrepriseFiles,
    validateEventsSubmission,
    deleteEntrepriseFile,
    toast,
    clearToast,
  } = useAtelierEventsStore();

  const files = listEntrepriseFiles();

  useEffect(() => {
    clearToast();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear stale toast once on mount
  }, []);

  const entreprises = useMemo(() => {
    const map = new Map<string, EntrepriseOption>();
    for (const c of creations) {
      if (!map.has(c.familyId)) {
        map.set(c.familyId, {
          familyId: c.familyId,
          nom: c.nom,
          label: creationVersionLabel(c),
        });
      }
    }
    for (const f of files) {
      if (!map.has(f.familyId)) {
        map.set(f.familyId, {
          familyId: f.familyId,
          nom: f.entrepriseNom,
          label: f.entrepriseNom,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nom.localeCompare(b.nom)
    );
  }, [creations, files]);

  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [preview, setPreview] = useState<EventExcelFields[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Réimport ciblé depuis une ligne du listing. */
  const [reimportFamilyId, setReimportFamilyId] = useState<string | null>(null);

  const selected = entreprises.find((e) => e.familyId === selectedFamilyId);
  const importTargetFamilyId = reimportFamilyId || selectedFamilyId;
  const importTargetNom =
    entreprises.find((e) => e.familyId === importTargetFamilyId)?.nom ||
    selected?.nom ||
    "";

  async function onFileChange(file: File | null) {
    setParseError(null);
    setPreview(null);
    if (!file) return;
    if (!importTargetFamilyId) {
      setParseError("Choisissez d'abord une entreprise.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const res = parseEventsExcel(buf);
      if (!res.ok) {
        setParseError(res.error);
        return;
      }
      setPreview(res.rows);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function confirmSubmit() {
    if (!preview?.length || !importTargetFamilyId || !importTargetNom) return;
    const res = validateEventsSubmission(
      importTargetFamilyId,
      importTargetNom,
      preview
    );
    if (res.error && res.added === 0) {
      setParseError(res.error);
      return;
    }
    setPreview(null);
    setParseError(null);
    setReimportFamilyId(null);
  }

  function startImport() {
    setReimportFamilyId(null);
    if (!selectedFamilyId) {
      setParseError("Choisissez d'abord une entreprise.");
      return;
    }
    setParseError(null);
    fileRef.current?.click();
  }

  function startReimport(familyId: string) {
    setSelectedFamilyId(familyId);
    setReimportFamilyId(familyId);
    setParseError(null);
    setPreview(null);
    fileRef.current?.click();
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Événements" },
        ]}
        title="Atelier — Événements"
      />

      <p className="mb-4 max-w-3xl rounded-xl border border-violet-200 bg-violet-50/80 px-3 py-2 text-xs text-violet-950">
        Étape 24 — le Template Excel inclut les colonnes OS (Jour, Heure,
        Urgent, Condition, Conséquence…). Book → Générer les mappe vers le
        param → Moteur d&apos;Événements. Démo :{" "}
        <code className="rounded bg-violet-100 px-1">
          data/scenarios/lumiere-co/KEYBER_Events_Lumiere_Co.xlsx
        </code>
        .
      </p>

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Un fichier événements = <strong>une seule entreprise</strong>. Pas de
        bibliothèque partagée : AgriBio ≠ Novacier. Source de vérité ici —
        pas de sélection dans Création.
      </p>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <AdminButton type="button" onClick={() => downloadEventsTemplate()}>
          <Download className="h-4 w-4" />
          Télécharger le Template Événements
        </AdminButton>

        <label className="text-sm">
          <span className="mb-1 block text-xs text-slate-500">
            Entreprise (obligatoire avant import)
          </span>
          <select
            className="min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={selectedFamilyId}
            onChange={(e) => setSelectedFamilyId(e.target.value)}
          >
            <option value="">— Choisir —</option>
            {entreprises.map((e) => (
              <option key={e.familyId} value={e.familyId}>
                {e.nom}
              </option>
            ))}
          </select>
        </label>

        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={startImport}
        >
          <Upload className="h-4 w-4" />
          Importer un fichier Événements pour une entreprise
        </AdminButton>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {entreprises.length === 0 ? (
        <p className="mb-4 text-sm text-amber-800">
          Aucune entreprise en Création pour l&apos;instant. Importez d&apos;abord
          un Excel Contexte dans Création, puis revenez importer ses
          événements.
        </p>
      ) : null}

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}
      {parseError ? (
        <p className="mb-3 text-sm text-rose-600">{parseError}</p>
      ) : null}

      {preview && importTargetNom ? (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Aperçu — Événements pour {importTargetNom}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {preview.length} événement{preview.length > 1 ? "s" : ""} (les noms
            déjà présents pour cette entreprise seront ignorés).
          </p>
          <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto">
            {preview.map((fields, i) => {
              const entries = eventPreviewEntries(fields).filter((e) => e.filled);
              return (
                <div
                  key={`${fields["Nom"]}-${i}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {fields["Nom"]}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {entries.slice(0, 5).map((e) => (
                      <li key={e.label}>
                        <span className="font-medium text-slate-500">
                          {e.label} :
                        </span>{" "}
                        {e.value}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AdminButton type="button" onClick={confirmSubmit}>
              Valider la soumission
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => {
                setPreview(null);
                setReimportFamilyId(null);
              }}
            >
              Annuler
            </AdminButton>
          </div>
        </div>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Fichiers événements par entreprise ({files.length})
      </h2>
      {files.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Aucun fichier encore. Téléchargez le template, choisissez une
          entreprise, importez.
        </p>
      ) : (
        <div className="space-y-3">
          {files.map((f) => (
            <div
              key={f.familyId}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  {f.entrepriseNom}
                </p>
                <p className="mt-1 text-sm text-slate-600">{f.label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {f.eventCount} événement{f.eventCount > 1 ? "s" : ""} · Import{" "}
                  {formatDateFr(f.importedAt)}
                  <span className="ml-1 text-slate-400">(Europe/Paris)</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/atelier/evenements/${f.familyId}`}>
                  <AdminButton variant="secondary" type="button">
                    Voir
                  </AdminButton>
                </Link>
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() => startReimport(f.familyId)}
                >
                  Réimporter
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Supprimer tout le fichier Événements de « ${f.entrepriseNom} » ?`
                      )
                    )
                      return;
                    const res = deleteEntrepriseFile(f.familyId);
                    if (res.error) window.alert(res.error);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                  Supprimer
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
