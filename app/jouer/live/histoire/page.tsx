import { Suspense } from "react";
import HistoireClient from "./HistoireClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen atmosphere-play px-6 py-8 text-sm text-muted">
          Chargement…
        </div>
      }
    >
      <HistoireClient />
    </Suspense>
  );
}
