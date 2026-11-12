import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ComputerErp } from "@/components/computer/ComputerErp";

export default function ErpPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/play"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au jeu — utilisez Accès Ordinateur en partie
        </Link>
        <h1 className="mb-4 font-display text-2xl font-semibold">
          ERP Novacier — aperçu
        </h1>
        <div className="h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ComputerErp />
        </div>
      </div>
    </div>
  );
}
