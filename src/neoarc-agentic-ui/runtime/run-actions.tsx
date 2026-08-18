/**
 * neoarc-agentic-ui / runtime / RunActions
 *
 * Purpose: render only the run-lifecycle controls that are actually valid
 * for the run's current `RunStatus` — cancel while
 * queued/starting/running/waiting_for_human/paused, retry while
 * failed/cancelled (and only when `retryability.retryable`), resume while
 * paused. This is the execution-permission domain's sibling for run
 * control, never a business decision (see `DecisionBar`/`proposal.ts`) —
 * clicking here never implies the run actually stopped or resumed; the
 * product adapter must feed the authoritative `RunSummary.status` back in.
 *
 * Semantic UI events: `run.cancel.request`, `run.retry.request`,
 * `run.resume.request`.
 */

import * as React from "react"
import { Ban, Play, RefreshCw } from "lucide-react"
import type { RunSummary } from "../../neoarc-agentic-contracts/runtime"
import type {
  RunCancelRequestPayload,
  RunResumeRequestPayload,
  RunRetryRequestPayload,
} from "../../neoarc-agentic-contracts/runtime-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { Spinner } from "../primitives/spinner"
import { cn } from "../lib/cn"

export interface RunActionsProps {
  readonly run: RunSummary
  /** Set while a request for this run is in flight, so buttons disable and no duplicate request can fire before the backend confirms. */
  readonly pendingAction?: "cancel" | "retry" | "resume"
  readonly onEmitCancel?: (event: AgenticUIEvent<RunCancelRequestPayload>) => void
  readonly onEmitRetry?: (event: AgenticUIEvent<RunRetryRequestPayload>) => void
  readonly onEmitResume?: (event: AgenticUIEvent<RunResumeRequestPayload>) => void
  readonly className?: string
}

const buttonBase = cn(
  "inline-flex items-center gap-1.5 rounded-[var(--neoarc-radius-md)] border px-3 py-1.5 text-xs font-medium",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
)

const neutralButton = cn(buttonBase, "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground)]")
const dangerButton = cn(buttonBase, "border-[var(--neoarc-color-danger)] bg-transparent text-[var(--neoarc-color-danger)]")

const cancellableStatuses = new Set<RunSummary["status"]>(["queued", "starting", "running", "waiting_for_human", "paused"])
const retryableStatuses = new Set<RunSummary["status"]>(["failed", "cancelled"])

export function RunActions({ run, pendingAction, onEmitCancel, onEmitRetry, onEmitResume, className }: RunActionsProps) {
  const canCancel = cancellableStatuses.has(run.status) && run.cancellation === "none"
  const canRetry = retryableStatuses.has(run.status) && (run.retryability?.retryable ?? false)
  const canResume = run.status === "paused"
  const submitting = pendingAction !== undefined

  if (!canCancel && !canRetry && !canResume) {
    return null
  }

  return (
    <div role="group" aria-label="Run actions" className={cn("flex flex-wrap items-center gap-2", className)}>
      {canResume ? (
        <button
          type="button"
          disabled={submitting}
          onClick={() =>
            onEmitResume?.(
              createUIEvent({
                type: "run.resume.request",
                sourceComponent: "RunActions",
                correlation: run.correlation,
                payload: { runId: run.id },
              }),
            )
          }
          className={neutralButton}
        >
          {pendingAction === "resume" ? <Spinner size="sm" /> : <Play className="size-3.5" />}
          Resume
        </button>
      ) : null}
      {canCancel ? (
        <button
          type="button"
          disabled={submitting}
          onClick={() =>
            onEmitCancel?.(
              createUIEvent({
                type: "run.cancel.request",
                sourceComponent: "RunActions",
                correlation: run.correlation,
                payload: { runId: run.id },
              }),
            )
          }
          className={dangerButton}
        >
          {pendingAction === "cancel" ? <Spinner size="sm" /> : <Ban className="size-3.5" />}
          Cancel
        </button>
      ) : null}
      {canRetry ? (
        <button
          type="button"
          disabled={submitting}
          title={!run.retryability?.retryable ? run.retryability?.reason : undefined}
          onClick={() =>
            onEmitRetry?.(
              createUIEvent({
                type: "run.retry.request",
                sourceComponent: "RunActions",
                correlation: run.correlation,
                payload: { runId: run.id },
              }),
            )
          }
          className={neutralButton}
        >
          {pendingAction === "retry" ? <Spinner size="sm" /> : <RefreshCw className="size-3.5" />}
          Retry
        </button>
      ) : null}
      {submitting ? <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">Awaiting confirmation…</span> : null}
    </div>
  )
}
