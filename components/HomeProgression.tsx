"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OS_LIVE_CATALOG_PATH,
  osBookPlayHref,
} from "@/lib/keyberOs/bookBridge";
import {
  osDonneesMostRecentSave,
  type OsBookSaveSummary,
} from "@/lib/keyberOs/donneesSauvegarde";

export function HomeProgression() {
  const router = useRouter();
  const [resume, setResume] = useState<OsBookSaveSummary | null>(null);

  useEffect(() => {
    setResume(osDonneesMostRecentSave());
  }, []);

  function onResume() {
    if (!resume) return;
    router.push(osBookPlayHref(resume.sessionId));
  }

  return (
    <section className="hero-enter max-w-3xl">
      <p className="font-display text-5xl font-semibold tracking-tight text-accent md:text-7xl">
        KEYBER
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
        Prends les commandes.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
        Une seule porte joueur : le catalogue Live. Compétence ou Histoire —
        même shell Keyber OS, sauvegarde Book automatique.
      </p>

      {resume ? (
        <div className="mt-6 rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Partie Book en cours
          </p>
          <p className="mt-1 font-display text-lg font-semibold">
            Reprendre {resume.title} — Jour {resume.jourActuel}
            {resume.finished ? " (terminée)" : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            Niveau {resume.niveau} · {resume.xp} XP
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={onResume}>Reprendre</Button>
            <Button asChild variant="outline">
              <Link href={OS_LIVE_CATALOG_PATH}>Nouvelle partie</Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <Button asChild variant="accent" size="lg" className="cta-pulse">
          <Link href={OS_LIVE_CATALOG_PATH}>
            C&apos;est parti
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
