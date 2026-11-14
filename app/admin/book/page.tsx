"use client";

import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { PLACEHOLDER_MESSAGE } from "@/components/admin/AtelierPlaceholderPage";

export default function BookPage() {
  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Book" },
        ]}
        title="Book"
      />
      <p className="mt-2 text-sm text-slate-600">{PLACEHOLDER_MESSAGE}</p>
    </div>
  );
}
