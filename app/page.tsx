import Link from "next/link";
import { HomeProgression } from "@/components/HomeProgression";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 atmosphere-landing" aria-hidden />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 40%, rgba(61,214,198,0.25), transparent 45%), linear-gradient(135deg, transparent 40%, rgba(240,160,90,0.12))",
        }}
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-display text-xl font-semibold tracking-tight text-accent">
          KEYBER
        </p>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Mode Admin</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/profil">Profil</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[75vh] w-full max-w-6xl flex-col justify-center px-6 pb-20">
        <HomeProgression />
      </main>
    </div>
  );
}
