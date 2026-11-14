"use client";

import { AtelierPlaceholderPage } from "@/components/admin/AtelierPlaceholderPage";

export default function AtelierCompetencesPage() {
  return (
    <AtelierPlaceholderPage
      title="Atelier — Compétences"
      crumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Atelier", href: "/admin/atelier/creation" },
        { label: "Compétences" },
      ]}
    />
  );
}
