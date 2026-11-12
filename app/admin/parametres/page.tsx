"use client";

import { AdminButton, PageHeader } from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";

export default function ParametresPage() {
  const { resetAdminData } = useAdminStore();

  return (
    <div>
      <PageHeader
        title="Paramètres"
        subtitle="Réglages Studio — n'affecte pas la partie joueur en cours."
      />
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Données Admin locales
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Réinitialise le Cœur, les agents et les fiches au seed Novacier
          (localStorage de ce navigateur).
        </p>
        <AdminButton
          variant="danger"
          className="mt-4"
          onClick={() => {
            if (
              window.confirm(
                "Réinitialiser toutes les données Admin locales ?"
              )
            ) {
              resetAdminData();
            }
          }}
        >
          Réinitialiser les données Admin
        </AdminButton>
      </div>
    </div>
  );
}
