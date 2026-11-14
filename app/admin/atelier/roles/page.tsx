"use client";

import { AtelierPlaceholderPage } from "@/components/admin/AtelierPlaceholderPage";

export default function AtelierRolesPage() {
  return (
    <AtelierPlaceholderPage
      title="Atelier — Rôles"
      crumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Atelier", href: "/admin/atelier/creation" },
        { label: "Rôles" },
      ]}
    />
  );
}
