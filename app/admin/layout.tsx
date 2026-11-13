import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminToast } from "@/components/admin/AdminToast";

export const metadata: Metadata = {
  title: "KEYBER Studio",
  description:
    "Studio KEYBER — Atelier, Système, Contrôle, Équipe. Pas le jeu.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-8">{children}</div>
      </main>
      <AdminToast />
    </div>
  );
}
