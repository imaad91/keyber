"use client";

import { AtelierPlaceholderPage } from "@/components/admin/AtelierPlaceholderPage";

export default function AtelierWorkflowPage() {
  return (
    <AtelierPlaceholderPage
      title="Atelier — Workflow"
      crumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Atelier", href: "/admin/atelier/creation" },
        { label: "Workflow" },
      ]}
    />
  );
}
