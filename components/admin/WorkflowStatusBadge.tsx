"use client";

import {
  workflowLabel,
  workflowProgressLabel,
  WORKFLOW_STATUT_META,
  type StatutWorkflow,
} from "@/lib/adminWorkflow";
import { cn } from "@/lib/utils";

export function WorkflowStatusBadge({
  status,
  showStep,
}: {
  status: StatutWorkflow;
  showStep?: boolean;
}) {
  const meta = WORKFLOW_STATUT_META[status];
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
          meta.pill
        )}
      >
        {workflowLabel(status)}
      </span>
      {showStep ? (
        <span className="text-[11px] font-medium tabular-nums text-slate-500">
          {workflowProgressLabel(status)}
        </span>
      ) : null}
    </span>
  );
}
