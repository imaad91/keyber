"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { CONTROLE_AGENT_IDS, DEFAULT_AGENTS } from "@/lib/agents";
import { useControleRapportsStore } from "@/lib/controleRapportsStore";

function NouveauRapportForm() {
  const router = useRouter();
  const search = useSearchParams();
  const preset = search.get("agentId") ?? "orchestra";
  const { addRapport } = useControleRapportsStore();

  const [agentId, setAgentId] = useState(preset);
  const [titre, setTitre] = useState("");
  const [score, setScore] = useState("");
  const [texte, setTexte] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/controle/rapports"
        backLabel="← Retour"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Contrôle", href: "/admin/controle/agents" },
          { label: "Rapports", href: "/admin/controle/rapports" },
          { label: "Nouveau" },
        ]}
        title="Ajouter un rapport"
      />

      {error ? (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <div className="space-y-4">
        <Field label="Agent concerné (obligatoire)">
          <select
            className={selectClass}
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            {CONTROLE_AGENT_IDS.map((id) => {
              const a = DEFAULT_AGENTS.find((x) => x.id === id);
              return (
                <option key={id} value={id}>
                  {a?.nom_affiche ?? id}
                </option>
              );
            })}
          </select>
        </Field>
        <Field label="Titre">
          <input
            className={inputClass}
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="ex. RAPPORT 5 - ORCHESTRA"
          />
        </Field>
        <Field label="Date" hint="Remplie automatiquement à l'enregistrement">
          <input
            className={inputClass}
            disabled
            value={new Date().toLocaleString("fr-FR", {
              timeZone: "Europe/Paris",
            })}
          />
        </Field>
        <Field label="Score (0-100, optionnel)">
          <input
            className={inputClass}
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
        </Field>
        <Field label="Texte du rapport">
          <textarea
            className={textareaClass}
            style={{ minHeight: 280 }}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Colle ici le rapport Cursor pour CET agent…"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <AdminButton
            onClick={() => {
              const scoreNum =
                score.trim() === "" ? null : Number.parseInt(score, 10);
              const res = addRapport({
                agentId,
                titre,
                score:
                  scoreNum != null && !Number.isNaN(scoreNum) ? scoreNum : null,
                texte,
              });
              if ("error" in res) {
                setError(res.error);
                return;
              }
              router.push(`/admin/controle/rapports/${res.id}`);
            }}
          >
            Enregistrer
          </AdminButton>
          <Link
            href="/admin/controle/rapports"
            className="inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Annuler
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NouveauRapportPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Chargement…</p>}>
      <NouveauRapportForm />
    </Suspense>
  );
}
