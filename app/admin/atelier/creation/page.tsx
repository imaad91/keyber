"use client";

import { AtelierPlaceholderPage } from "@/components/admin/AtelierPlaceholderPage";

export default function AtelierCreationPage() {
  return (
    <AtelierPlaceholderPage
      title="Atelier — Création"
      crumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Atelier", href: "/admin/atelier/creation" },
        { label: "Création" },
      ]}
    />
  );
}
