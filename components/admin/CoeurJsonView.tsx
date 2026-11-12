"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileUp,
  Pencil,
  ShieldCheck,
  X,
} from "lucide-react";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  formatCoeurJson,
  highlightJson,
  validateCoeurText,
  type CoeurValidationError,
  type ScenarioCoeur,
} from "@/lib/adminCoeur";
import { cn } from "@/lib/utils";

type Props = {
  coeur: ScenarioCoeur;
  onValidate: (coeur: ScenarioCoeur) => void;
  syncOk: boolean;
};

export function CoeurJsonView({ coeur, onValidate, syncOk }: Props) {
  const pretty = useMemo(() => formatCoeurJson(coeur), [coeur]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(pretty);
  const [errors, setErrors] = useState<CoeurValidationError[]>([]);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(pretty);
      setErrors([]);
    }
  }, [pretty, editing]);

  useEffect(() => {
    if (!editing) return;
    const result = validateCoeurText(draft);
    setErrors(result.ok ? [] : result.errors);
  }, [draft, editing]);

  const highlighted = useMemo(() => highlightJson(pretty), [pretty]);

  function copyCoeur() {
    void navigator.clipboard.writeText(pretty);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function exportCoeur() {
    const blob = new Blob([pretty], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coeur-${coeur.scenario.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setEditing(true);
      setDraft(text);
      const result = validateCoeurText(text);
      if (result.ok) {
        setErrors([]);
        onValidate(result.coeur);
        setEditing(false);
      } else {
        setErrors(result.errors);
      }
    };
    reader.readAsText(file);
  }

  function validate() {
    const source = editing ? draft : pretty;
    const result = validateCoeurText(source);
    if (!result.ok) {
      setErrors(result.errors);
      if (!editing) setEditing(true);
      setDraft(source);
      return;
    }
    setErrors([]);
    onValidate(result.coeur);
    setEditing(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <AdminButton variant="secondary" onClick={copyCoeur}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copier le CŒUR
        </AdminButton>
        {!editing ? (
          <AdminButton variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Modifier le CŒUR
          </AdminButton>
        ) : (
          <AdminButton variant="ghost" onClick={() => setEditing(false)}>
            <X className="h-4 w-4" />
            Annuler
          </AdminButton>
        )}
        <AdminButton onClick={validate} disabled={!editing && errors.length > 0}>
          <ShieldCheck className="h-4 w-4" />
          Valider le CŒUR
        </AdminButton>
        <AdminButton variant="secondary" onClick={exportCoeur}>
          <Download className="h-4 w-4" />
          Exporter le CŒUR
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() => fileRef.current?.click()}
        >
          <FileUp className="h-4 w-4" />
          Importer un CŒUR
        </AdminButton>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importFile(f);
            e.target.value = "";
          }}
        />
        <span
          className={cn(
            "ml-auto rounded-md px-2.5 py-1 text-xs font-semibold",
            syncOk && errors.length === 0
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
          )}
        >
          {syncOk && errors.length === 0
            ? "Synchronisé ✓ — CŒUR et Graphique identiques"
            : "Non synchronisé — En attente de validation"}
        </span>
      </div>

      {errors.length > 0 ? (
        <div className="space-y-1 rounded-lg border border-red-200 bg-red-50 p-3">
          {errors.map((e, i) => (
            <p key={i} className="text-sm font-medium text-red-700">
              Erreur ligne {e.line} : {e.message.replace(/^Erreur ligne[^:]*:\s*/i, "")}
            </p>
          ))}
        </div>
      ) : null}

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          className="min-h-[560px] w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-[12px] leading-5 text-slate-100 shadow-inner outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
      ) : (
        <pre className="max-h-[640px] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-[12px] leading-5 shadow-inner">
          <code
            className="coeur-json block font-mono text-slate-100"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .coeur-json .json-key { color: #7dd3fc; }
        .coeur-json .json-string { color: #86efac; }
        .coeur-json .json-number { color: #fcd34d; }
        .coeur-json .json-lit { color: #f9a8d4; }
      `,
        }}
      />
    </div>
  );
}
