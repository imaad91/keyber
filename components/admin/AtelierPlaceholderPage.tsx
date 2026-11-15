"use client";

import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

const PLACEHOLDER_MESSAGE = "À implémenter dans les prompts suivants";

export function AtelierPlaceholderPage({
  title,
  crumbs,
}: {
  title: string;
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={crumbs}
        title={title}
      />
      <p className="mt-2 text-sm text-slate-600">{PLACEHOLDER_MESSAGE}</p>
    </div>
  );
}

export { PLACEHOLDER_MESSAGE };
