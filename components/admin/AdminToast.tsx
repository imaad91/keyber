"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { useAdminStore } from "@/lib/adminStore";

export function AdminToast() {
  const { toast, clearAdminToast } = useAdminStore();

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => clearAdminToast(), 2800);
    return () => window.clearTimeout(t);
  }, [toast, clearAdminToast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-lg">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-medium text-slate-800">{toast}</p>
      </div>
    </div>
  );
}
