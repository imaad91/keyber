"use client";

/**
 * Clear Campus — bootstrap démos au premier chargement.
 * Si le Book est vide, injecte Lumière (+ Novacier) pour que le Preview
 * ne paraisse pas « ancien Keyber sans scénarios ».
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  lumiereDemoAlreadySeeded,
  seedLumiereCoDemo,
} from "@/lib/lumiereCoSeed";
import {
  novacierPackAlreadySeeded,
  seedNovacierBookPack,
} from "@/lib/novacierBookSeed";

const FLAG_KEY = "keyber-clear-campus-demo-bootstrap-v1";

export function ClearCampusDemoBootstrap({
  variant = "banner",
}: {
  variant?: "banner" | "silent";
}) {
  const [status, setStatus] = useState<
    "idle" | "seeded" | "ready" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const lumOk = lumiereDemoAlreadySeeded();
      const novOk = novacierPackAlreadySeeded();
      if (lumOk && novOk) {
        setStatus("ready");
        return;
      }

      const alreadyBootstrapped = window.localStorage.getItem(FLAG_KEY) === "1";
      // Toujours compléter les packs manquants (même si flag présent).
      if (!lumOk) seedLumiereCoDemo();
      if (!novOk) seedNovacierBookPack();
      window.localStorage.setItem(FLAG_KEY, "1");
      setStatus("seeded");
      setMessage(
        alreadyBootstrapped
          ? "Démos Clear Campus mises à jour (Lumière + Novacier)."
          : "Démos Clear Campus injectées : Lumière (entrepôt) + Novacier (usine)."
      );
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Seed démo impossible");
    }
  }, []);

  if (variant === "silent") return null;
  if (status === "idle" || (!message && status === "ready")) return null;

  return (
    <div
      className="mb-4 rounded-2xl border border-teal-200 bg-teal-50/90 px-4 py-3 text-sm text-teal-950 shadow-sm"
      role="status"
    >
      <p className="font-semibold tracking-tight">Clear Campus — démos prêtes</p>
      {message ? <p className="mt-1 text-teal-900/90">{message}</p> : null}
      <p className="mt-2 text-xs text-teal-800/80">
        Pour voir le nouveau monde : Book → Tester une Histoire → carte Campus
        claire → hotspot Vue Live Production.
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
        <Link
          href="/admin/book/en-cours-de-test"
          className="underline underline-offset-2"
        >
          Ouvrir le Book (test)
        </Link>
        <Link
          href="/admin/atelier/production"
          className="underline underline-offset-2"
        >
          Hub Production
        </Link>
        <Link href="/jouer/live" className="underline underline-offset-2">
          Catalogue Live
        </Link>
      </div>
    </div>
  );
}
