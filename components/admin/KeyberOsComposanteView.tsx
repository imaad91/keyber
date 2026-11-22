"use client";

import type { ReactNode } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { KeyberOsSubNav } from "@/components/admin/KeyberOsSubNav";
import { OsModuleDashboard } from "@/components/admin/OsModuleDashboard";
import type { ComposanteDoc } from "@/lib/keyberOsDocs";
import { cn } from "@/lib/utils";

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <section
      className={cn(
        "mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
        accent
      )}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-800">
        {children}
      </div>
    </section>
  );
}

/** Structure identique pour chaque composante Keyber OS — lecture seule. */
export function KeyberOsComposanteView({
  doc,
  /** Contenu visible juste sous la sous-nav (ex. galerie PNJ). */
  lead,
}: {
  doc: ComposanteDoc;
  lead?: ReactNode;
}) {
  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Keyber OS", href: "/admin/systeme/vue-globale" },
          { label: doc.title },
        ]}
        title={`Keyber OS — ${doc.title}`}
      />
      <KeyberOsSubNav />

      {lead ? <div className="mb-6">{lead}</div> : null}

      <OsModuleDashboard moduleId={doc.id} />

      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Dashboard ci-dessus = architecture + santé (màj à chaque réglage).
        Documentation + runtime (bandeau vert plus bas). Aucun scénario ni
        entreprise inventés ici — le Front appelle{" "}
        <code className="text-xs">lib/keyberOs/</code>.
      </p>

      <Section title="Ce que fait cette composante">
        <ul className="list-inside list-disc space-y-1">
          {doc.ceQueCaFait.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section title="De quoi elle est composée">
        <ul className="list-inside list-disc space-y-1">
          {doc.deQuoiCompose.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section title="Comment elle fonctionne">
        <ol className="list-inside list-decimal space-y-1">
          {doc.commentCaMarche.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </Section>

      <Section title="Son workflow à l'intérieur" accent="bg-slate-50">
        <ol className="mx-auto flex max-w-lg flex-col items-stretch">
          {doc.workflowSteps.map((step, i) => (
            <li key={step} className="flex flex-col items-center">
              <div className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-900">
                {step}
              </div>
              {i < doc.workflowSteps.length - 1 ? (
                <div className="flex flex-col items-center py-1" aria-hidden>
                  <div className="h-5 w-0.5 bg-slate-300" />
                  <svg width="18" height="10" viewBox="0 0 20 12" className="text-slate-400">
                    <path
                      d="M2 2 L10 10 L18 2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Ce qu'elle ne fait pas" accent="border-amber-200 bg-amber-50/60">
        <ul className="list-inside list-disc space-y-1 text-amber-950">
          {doc.ceQueCaNeFaitPas.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      <p className="text-xs text-slate-400">
        Réfs. code : {doc.codeRefs.join(" · ")}
      </p>
    </div>
  );
}
