import Link from "next/link";
import { ArrowRight, Compass, Scale, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    icon: Search,
    title: "Enquêter",
    text: "Explorez modules, données et entretiens pour comprendre la situation.",
  },
  {
    icon: Scale,
    title: "Décider",
    text: "Arbitrez avec des impacts visibles sur les indicateurs clés.",
  },
  {
    icon: Compass,
    title: "Maîtriser",
    text: "Pilotez trésorerie, production et moral comme un tableau de bord.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-navy">
      <div className="pointer-events-none absolute inset-0 atmosphere" aria-hidden />
      <div
        className="pointer-events-none absolute -right-24 top-[-10%] h-[70vh] w-[55vw] rounded-full bg-navy/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-[-20%] h-[50vh] w-[40vw] rounded-full bg-accent/[0.08] blur-3xl"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-display text-xl font-semibold tracking-tight text-navy">
          KEYBER
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/play">Démo</Link>
        </Button>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-6 pb-20 pt-10 md:pt-20">
        <section className="hero-enter max-w-3xl">
          <p className="mb-4 font-display text-5xl font-semibold tracking-tight text-navy md:text-7xl">
            KEYBER
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-navy md:text-5xl">
            Prends les commandes.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            Plateforme générique de simulation de décisions. Une coquille
            claire pour enquêter, décider et maîtriser — sans scénario métier.
          </p>
          <div className="mt-8">
            <Button asChild variant="accent" size="lg" className="cta-pulse">
              <Link href="/play">
                Entrer dans la démo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-24 grid gap-10 border-t border-slate-200/80 pt-12 md:grid-cols-3 md:gap-8">
          {VALUES.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className="value-enter"
              style={{ animationDelay: `${180 + index * 120}ms` }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-semibold text-navy">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {text}
              </p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
