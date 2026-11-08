import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ErpTable } from "@/components/ErpTable";

export default function ErpPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/play"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au jeu
        </Link>
        <h1 className="mb-4 font-display text-2xl font-semibold">
          KEYBER ERP — vue dédiée
        </h1>
        <div className="h-[70vh]">
          <ErpTable />
        </div>
      </div>
    </div>
  );
}
