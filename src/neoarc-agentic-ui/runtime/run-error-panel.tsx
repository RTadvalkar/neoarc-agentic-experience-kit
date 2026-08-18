/**
 * neoarc-agentic-ui / runtime / RunErrorPanel
 *
 * Purpose: render one supplied `RunError` honestly — the message and
 * (optional) cause summary the backend actually gave us, never a
 * fabricated stack trace or guessed root cause. A retry control renders
 * only when `error.retryability.retryable` is true; when false, the
 * reason is shown as plain text instead of a disabled-looking button
 * that invites a repeated click.
 *
 * Semantic UI events: `run.retry.request`.
 */

import type { RunError } from "../../neoarc-agentic-contracts/runtime"
import type { RunRetryRequestPayload } from "../../neoarc-agentic-contracts/runtime-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import type { OpaqueId } from "../../neoarc-agentic-contracts/shared"
import { InlineNotice } from "../foundation/inline-notice"
import { Timestamp } from "../foundation/timestamp"
import { Spinner } from "../primitives/spinner"
import { cn } from "../lib/cn"

export interface RunErrorPanelProps {
  readonly runId: OpaqueId
  readonly error: RunError
  readonly retrying?: boolean
  readonly onEmitRetry?: (event: AgenticUIEvent<RunRetryRequestPayload>) => void
  readonly className?: string
}

export function RunErrorPanel({ runId, error, retrying, onEmitRetry, className }: RunErrorPanelProps) {
  return (
    <InlineNotice
      tone="danger"
      className={cn(className)}
      title={error.message}
      description={
        <span className="flex flex-col gap-1">
          {error.causeSummary ? <span>{error.causeSummary}</span> : null}
          <span className="text-xs opacity-80">
            Occurred <Timestamp value={error.occurredAt} variant="relative" />
          </span>
          {!error.retryability.retryable && error.retryability.reason ? (
            <span className="text-xs opacity-80">Not retryable: {error.retryability.reason}</span>
          ) : null}
        </span>
      }
      actions={
        error.retryability.retryable ? (
          <button
            type="button"
            disabled={retrying}
            onClick={() =>
              onEmitRetry?.(
                createUIEvent({
                  type: "run.retry.request",
                  sourceComponent: "RunErrorPanel",
                  payload: { runId },
                }),
              )
            }
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[var(--neoarc-radius-md)] border px-3 py-1.5 text-xs font-medium",
              "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {retrying ? <Spinner size="sm" /> : null}
            Retry
          </button>
        ) : undefined
      }
    />
  )
}
