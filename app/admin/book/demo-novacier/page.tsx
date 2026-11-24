"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  NOVACIER_NOM,
  novacierParamFileName,
} from "@/lib/novacierBookPack";
import {
  novacierPackAlreadySeeded,
  seedNovacierBookPack,
} from "@/lib/novacierBookSeed";

/**
 * Étape 41 — seed Book Novacier (exemple) depuis le pack scénario.
 * Ne touche pas au moteur OS. Jouer via Book Live (Étape 42 : /play redirigé).
 */
export default function DemoNovacierPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [already, setAlready] = useState(false);

  useEffect(() => {
    setAlready(novacierPackAlreadySeeded());
  }, []);

  function runSeed() {
    setBusy(true);
    try {
      const res = seedNovacierBookPack();
      setMsg(
        `${NOVACIER_NOM} Book prêt — ${res.created.bookEntries} carte(s) (test + Live). Fichier : ${novacierParamFileName()}. Rechargement…`
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
          { label: "Pack Novacier" },
        ]}
        title="Pack — Novacier (Clear Campus Phase 5)"
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Injection Studio : cartes Book Histoire (En test + Live) + Campus usine
        + Vue Live Production (manufactured). Contenu = extraction{" "}
        <code className="rounded bg-slate-100 px-1">data/contextes/novacier</code>{" "}
        →{" "}
        <code className="rounded bg-slate-100 px-1">
          data/scenarios/novacier/
        </code>
        . <strong>Ne modifie pas</strong> Keyber OS. Après seed, Tester → carte
        Campus → hotspot « Vue Live Production » (presses / assemblage ≠ entrepôt
        Lumière). Jouer via{" "}
        <code className="rounded bg-slate-100 px-1">/jouer/live</code>.
      </p>

      {already ? (
        <p className="mb-4 text-sm text-emerald-700">
          Pack déjà présent — réinjecter écrase seulement les cartes Novacier.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <AdminButton type="button" disabled={busy} onClick={runSeed}>
          {busy ? "Injection…" : "Injecter le pack Novacier Book"}
        </AdminButton>
        <Link href="/admin/book/en-cours-de-test">
          <AdminButton type="button" variant="secondary">
            Voir le Book
          </AdminButton>
        </Link>
        <Link href="/jouer/live/histoire">
          <AdminButton type="button" variant="secondary">
            Catalogue Live Histoire
          </AdminButton>
        </Link>
      </div>

      {msg ? <p className="mt-4 text-sm text-slate-700">{msg}</p> : null}
    </div>
  );
}
