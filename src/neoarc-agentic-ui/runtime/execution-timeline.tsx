/**
 * neoarc-agentic-ui / runtime / ExecutionTimeline
 *
 * Purpose: render a run's chronological `ExecutionStep[]` — a flat,
 * forensic "what happened, in order" view, distinct from `WorkflowRunTree`
 * (structural, hierarchical). A product may build `steps` from its own
 * event log or activity feed; this component has no projection dependency.
 *
 * Input model: `steps: ExecutionStep[]`.
 */

import type { ExecutionStep } from "../../neoarc-agentic-contracts/runtime"
import { EmptyState } from "../foundation/empty-state"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"

export interface ExecutionTimelineProps {
  readonly steps: readonly ExecutionStep[]
  readonly className?: string
}

export function ExecutionTimeline({ steps, className }: ExecutionTimelineProps) {
  if (steps.length === 0) {
    return <EmptyState title="No execution steps yet" description="Steps will appear here as the run progresses." />
  }

  return (
    <ol className={cn("flex flex-col gap-3", className)} aria-label="Execution timeline">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              aria-hidden="true"
              className="mt-1 size-2 shrink-0 rounded-full bg-[var(--neoarc-color-border-strong)]"
            />
            {index < steps.length - 1 ? (
              <span aria-hidden="true" className="w-px flex-1 bg-[var(--neoarc-color-border-muted)]" />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[var(--neoarc-color-foreground)]">{step.label}</span>
              <RuntimeStatusBadge status={step.status} />
            </div>
            <Timestamp value={step.occurredAt} variant="relative" className="text-xs" />
          </div>
        </li>
      ))}
    </ol>
  )
}
