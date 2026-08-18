/**
 * neoarc-agentic-ui / human-interaction / ExecutionPermissionCard
 *
 * Purpose: the inline, resolvable "may this specific tool/action proceed?"
 * card. This answers a strictly different question from any proposal/
 * business-decision component — see
 * `docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md` §Two
 * separate approval domains. Never
 * displays raw tool arguments; only the supplied
 * `ToolActionIdentity.actionSummary`/`targetLabel`.
 *
 * States: `pending` (awaiting a human decision — action buttons live),
 * `submitted` (intent emitted, backend has not yet confirmed — buttons
 * disabled, an explicit "action pending" indicator shown), `resolved` (an
 * authoritative `outcome` was supplied — `PermissionOutcomeBadge` shown,
 * never buttons), and the honest `unavailable` outcome renders as a blocked
 * state rather than a resolved success/failure.
 *
 * Semantic UI events: `permission.allowOnce.request`,
 * `permission.reject.request`, `permission.cancel.request`. Emitting one
 * is a request only — this component never flips its own displayed state
 * to `resolved`; the product adapter must feed the authoritative
 * `ExecutionPermissionRequest` back through props.
 */

import * as React from "react"
import { ShieldQuestion } from "lucide-react"
import type { ExecutionPermissionRequest } from "../../neoarc-agentic-contracts/human-interaction"
import type {
  PermissionAllowOnceRequestPayload,
  PermissionCancelRequestPayload,
  PermissionRejectRequestPayload,
} from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { RiskBadge } from "../foundation/risk-badge"
import { PermissionBlockedState } from "../foundation/permission-blocked-state"
import { Surface } from "../primitives/surface"
import { Spinner } from "../primitives/spinner"
import { cn } from "../lib/cn"
import { PermissionReason } from "./permission-reason"
import { PermissionOutcomeBadge } from "./permission-outcome-badge"

export interface ExecutionPermissionCardProps {
  readonly request: ExecutionPermissionRequest
  readonly onEmitAllowOnce?: (event: AgenticUIEvent<PermissionAllowOnceRequestPayload>) => void
  readonly onEmitReject?: (event: AgenticUIEvent<PermissionRejectRequestPayload>) => void
  readonly onEmitCancel?: (event: AgenticUIEvent<PermissionCancelRequestPayload>) => void
  readonly className?: string
}

const buttonBase = cn(
  "inline-flex items-center gap-1.5 rounded-[var(--neoarc-radius-md)] border px-2.5 py-1.5 text-xs font-medium",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
)

export function ExecutionPermissionCard({
  request,
  onEmitAllowOnce,
  onEmitReject,
  onEmitCancel,
  className,
}: ExecutionPermissionCardProps) {
  const submitting = request.status === "submitted"
  const resolved = request.status === "resolved"

  function emit(
    handler: ((event: AgenticUIEvent<{ readonly requestId: string }>) => void) | undefined,
    type: "permission.allowOnce.request" | "permission.reject.request" | "permission.cancel.request",
  ) {
    handler?.(
      createUIEvent({
        type,
        sourceComponent: "ExecutionPermissionCard",
        payload: { requestId: request.id },
      }),
    )
  }

  if (resolved && request.outcome === "unavailable") {
    return (
      <PermissionBlockedState
        className={className}
        availability={{
          actionId: request.id,
          available: false,
          label: `${request.action.toolName} is unavailable`,
          reason: "runtime_unavailable",
        }}
      />
    )
  }

  return (
    <Surface
      variant="muted"
      role="group"
      aria-label="Execution permission requested"
      className={cn("flex w-full flex-col gap-3 p-4", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <ShieldQuestion aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--neoarc-color-accent)]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[var(--neoarc-color-foreground)]">{request.action.toolName}</span>
            <span className="text-sm text-[var(--neoarc-color-foreground-muted)]">{request.action.actionSummary}</span>
            {request.action.targetLabel ? (
              <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
                Target: <code className="font-mono">{request.action.targetLabel}</code>
              </span>
            ) : null}
          </div>
        </div>
        {request.riskLevel ? <RiskBadge level={request.riskLevel} /> : null}
      </div>

      <PermissionReason text={request.consequenceSummary} tone="consequence" />

      {resolved && request.outcome ? (
        <div className="flex items-center gap-2">
          <PermissionOutcomeBadge outcome={request.outcome} />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => emit(onEmitAllowOnce, "permission.allowOnce.request")}
            className={cn(
              buttonBase,
              "border-transparent bg-[var(--neoarc-color-accent)] text-[var(--neoarc-color-accent-foreground)]",
            )}
          >
            Allow once
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => emit(onEmitReject, "permission.reject.request")}
            className={cn(
              buttonBase,
              "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground)]",
            )}
          >
            Reject
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => emit(onEmitCancel, "permission.cancel.request")}
            className={cn(
              buttonBase,
              "border-transparent bg-transparent text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)]",
            )}
          >
            Cancel
          </button>
          {submitting ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--neoarc-color-foreground-subtle)]">
              <Spinner size="sm" />
              Awaiting confirmation…
            </span>
          ) : null}
        </div>
      )}
    </Surface>
  )
}
