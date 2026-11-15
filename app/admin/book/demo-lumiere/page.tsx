"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  lumiereDemoAlreadySeeded,
  seedLumiereCoDemo,
} from "@/lib/lumiereCoSeed";
import { LUMIERE_NOM } from "@/lib/lumiereCoDemoData";

/**
 * Exception démo : charge tout le workflow Lumière & Co en localStorage
 * (Création + Événements + Book test/Live). Ne touche pas AgriBio / Novacier.
 */
export default function DemoLumierePage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [already, setAlready] = useState(false);

  useEffect(() => {
    setAlready(lumiereDemoAlreadySeeded());
  }, []);

  function runSeed() {
    setBusy(true);
    try {
      const res = seedLumiereCoDemo();
      setMsg(
        `${LUMIERE_NOM} prêt — événements : ${res.created.events}, cartes Book : ${res.created.bookEntries}. Rechargement…`
      );
      window.setTimeout(() => {
        window.location.href = "/admin/book/en-cours-de-test";
      }, 600);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur seed");
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/book/en-cours-de-test"
        backLabel="← Book"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Book", href: "/admin/book/en-cours-de-test" },
          { label: "Démo Lumière & Co" },
        ]}
        title="Démo — Lumière & Co"
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Exception workflow : injecte une entreprise neuve (contexte, événements,
        rôle, compétence, scénarios test + Live avec 3 vues V1).{" "}
        <strong>Ne modifie pas</strong> Novacier ni AgriBio.
      </p>

      {already ? (
        <p className="mb-4 text-sm text-emerald-700">
          Démo déjà présente dans le localStorage. Tu peux réinjecter (écrase
          seulement Lumière & Co).
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <AdminButton type="button" disabled={busy} onClick={runSeed}>
          {busy ? "Injection…" : "Lancer le workflow démo Lumière & Co"}
        </AdminButton>
        <Link href="/admin/book/en-cours-de-test">
          <AdminButton type="button" variant="secondary">
            Voir le Book
          </AdminButton>
        </Link>
      </div>

      {msg ? <p className="mt-4 text-sm text-slate-700">{msg}</p> : null}
    </div>
  );
}
