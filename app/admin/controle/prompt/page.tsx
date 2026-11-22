"use client";

import { useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  PROMPT_AUDIT,
  PROMPT_CORRECTION,
  PROMPT_MODE_EMPLOI,
} from "@/lib/controlePrompts";
import { cn } from "@/lib/utils";

type Tab = "audit" | "correction";

export default function ControlePromptPage() {
  const [tab, setTab] = useState<Tab>("audit");
  const [copied, setCopied] = useState<string | null>(null);
  const text = tab === "audit" ? PROMPT_AUDIT : PROMPT_CORRECTION;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tab);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copiez le prompt :", text);
    }
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/controle/agents"
        backLabel="← Contrôle"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Contrôle", href: "/admin/controle/agents" },
          { label: "Prompt" },
        ]}
        title="Le Prompt Keyber"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("audit")}
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
            tab === "audit"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          Prompt Audit
        </button>
        <button
          type="button"
          onClick={() => setTab("correction")}
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
            tab === "correction"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          Prompt Correction
        </button>
      </div>

      <div className="mb-3 flex justify-end">
        <AdminButton onClick={copy}>
          {copied === tab ? "Copié ✓" : "Copier ce Prompt"}
        </AdminButton>
      </div>

      <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-950 p-5 text-[13px] leading-relaxed text-slate-100 shadow-sm">
        {text}
      </pre>

      <p className="mt-6 text-xs leading-relaxed text-slate-500">
        {PROMPT_MODE_EMPLOI}
      </p>
    </div>
  );
}
