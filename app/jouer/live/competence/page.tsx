import { Suspense } from "react";
import CompetenceClient from "./CompetenceClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen atmosphere-play px-6 py-8 text-sm text-muted">
          Chargement…
        </div>
      }
    >
      <CompetenceClient />
    </Suspense>
  );
}
