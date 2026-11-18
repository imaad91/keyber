"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OS_LIVE_CATALOG_PATH } from "@/lib/keyberOs/bookBridge";

/**
 * Écran quand Journal / Livre / Profil / ERP sont ouverts hors session Book OS.
 * Plus de fallback Novacier POC (post Étape 42).
 */
export function NoOsSessionGate({
  title,
  blurb,
}: {
  title: string;
  blurb?: string;
}) {
  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto flex max-w-lg flex-col px-6 py-16">
        <Link
          href={OS_LIVE_CATALOG_PATH}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Catalogue Live
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Session Book requise
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {blurb ||
            "Lance une partie depuis le catalogue Live pour afficher ce panneau. Les données du POC legacy ne sont plus utilisées."}
        </p>
        <div className="mt-8">
          <Button asChild variant="accent">
            <Link href={OS_LIVE_CATALOG_PATH}>Aller au catalogue Live</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
