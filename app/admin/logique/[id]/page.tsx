"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Legacy /admin/logique/[id] → /admin/workflow/scenarios/[id] */
export default function LegacyLogiqueDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    if (id) router.replace(`/admin/workflow/scenarios/${id}`);
  }, [id, router]);
  return (
    <p className="text-sm text-slate-500">
      Redirection vers Workflow → Scénarios…
    </p>
  );
}
