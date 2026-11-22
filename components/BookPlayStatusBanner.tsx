"use client";

import type { BookStatus } from "@/lib/bookStore";

/** Bandeau MODE TEST (orange) ou badge LIVE (vert) — Book Studio. */
export function BookPlayStatusBanner({ status }: { status: BookStatus }) {
  if (status === "en_test") {
    return (
      <div
        role="status"
        className="sticky top-0 z-50 w-full border-b border-amber-600 bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-amber-950 shadow"
      >
        MODE TEST — En cours de test — Visible uniquement pour toi, l&apos;Admin.
      </div>
    );
  }
  return (
    <div className="sticky top-0 z-50 flex justify-end px-4 py-2">
      <span className="inline-flex items-center rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
        LIVE
      </span>
    </div>
  );
}
