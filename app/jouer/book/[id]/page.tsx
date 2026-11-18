import { Suspense } from "react";
import BookClient from "./BookClient";

export default function JouerBookEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen atmosphere-play px-6 py-8 text-sm text-muted">
          Chargement…
        </div>
      }
    >
      <BookClient />
    </Suspense>
  );
}
