"use client";

import { NoOsSessionGate } from "@/components/NoOsSessionGate";
import { OsProfilView } from "@/components/OsProfilView";
import { useOsActivePlay } from "@/lib/osActivePlayStore";

/**
 * Étape 29 — Profil Book OS uniquement.
 * Sans session active → CTA Live (plus de cast Novacier POC).
 */
export default function ProfilPage() {
  const active = useOsActivePlay();

  if (active.play && active.meta) {
    const returnHref =
      active.meta.returnHref ||
      `/jouer/book/${encodeURIComponent(active.meta.bookEntryId)}`;
    return (
      <OsProfilView
        play={active.play}
        returnHref={returnHref}
        title={active.meta.title}
        subtitle={active.meta.subtitle}
      />
    );
  }

  return (
    <NoOsSessionGate
      title="Profil"
      blurb="Aucune session Book active. Lance une partie depuis le catalogue Live pour voir progression et badges."
    />
  );
}
