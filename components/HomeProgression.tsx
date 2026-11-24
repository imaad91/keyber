"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClearCampusDemoBootstrap } from "@/components/ClearCampusDemoBootstrap";
import {
  OS_LIVE_CATALOG_PATH,
  osBookPlayHref,
} from "@/lib/keyberOs/bookBridge";
import {
  osDonneesMostRecentSave,
  type OsBookSaveSummary,
} from "@/lib/keyberOs/donneesSauvegarde";
import {
  lumiereDemoAlreadySeeded,
  seedLumiereCoDemo,
} from "@/lib/lumiereCoSeed";
import {
  novacierPackAlreadySeeded,
  seedNovacierBookPack,
} from "@/lib/novacierBookSeed";

export function HomeProgression() {
  const router = useRouter();
  const [resume, setResume] = useState<OsBookSaveSummary | null>(null);

  useEffect(() => {
    setResume(osDonneesMostRecentSave());
    // Seed démos si Book vide (Preview live sinon = ancien feeling + 0 scénario).
    try {
      if (!lumiereDemoAlreadySeeded()) seedLumiereCoDemo();
      if (!novacierPackAlreadySeeded()) seedNovacierBookPack();
    } catch {
      /* ignore */
    }
  }, []);

  function onResume() {
    if (!resume) return;
    router.push(osBookPlayHref(resume.sessionId));
  }

  return (
    <section className="hero-enter max-w-3xl">
      <ClearCampusDemoBootstrap />
      <p className="font-display text-5xl font-semibold tracking-tight text-accent md:text-7xl">
        KEYBER
      </p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">
        Clear Campus · thème clair · monde libre
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
        Explore l&apos;entreprise. Décide.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
        Démos Lumière (entrepôt) et Novacier (usine) : carte Campus → hotspots →
        Suite outils ou Vue Live Production. Catalogue Live = même shell OS.
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

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="accent" size="lg" className="cta-pulse">
          <Link href={OS_LIVE_CATALOG_PATH}>
            Catalogue Live
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/book/en-cours-de-test">Book · Tester Campus</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/atelier/production">Studio Production</Link>
        </Button>
      </div>
    </section>
  );
}
