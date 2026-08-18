/**
 * neoarc-agentic-ui / foundation / PermissionBlockedState
 *
 * Purpose: a distinct, explicit state for "you cannot see/do this", so
 * permission-denied never looks like an empty list or a loading spinner
 * that never resolves — see docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md.
 *
 * Input model: `availability: ActionAvailability` (only rendered when
 * `availability.available` is false), optional `action` slot (e.g. "Request
 * access").
 *
 * This is distinct from `ExecutionPermissionCard` (Slice 3), which
 * represents an active, resolvable "may this proceed?" request rather than
 * a static blocked state.
 */

import * as React from "react"
import { Lock } from "lucide-react"
import type { ActionAvailability } from "../../neoarc-agentic-contracts/foundation"
import { cn } from "../lib/cn"

export interface PermissionBlockedStateProps {
  readonly availability: ActionAvailability
  readonly action?: React.ReactNode
  readonly className?: string
}

const reasonCopy: Record<string, string> = {
  permission_denied: "You do not have permission to view or perform this action.",
  not_supported: "This action is not supported in the current context.",
  requires_human_review: "This action requires human review before it can proceed.",
  runtime_unavailable: "The runtime required for this action is currently unavailable.",
  not_supplied: "Availability was not supplied for this action.",
  not_available: "This action is not currently available.",
  redacted: "Details about this action have been redacted.",
  insufficient_access: "Your current access level cannot view this action.",
}

export function PermissionBlockedState({ availability, action, className }: PermissionBlockedStateProps) {
  const description = availability.reason
    ? reasonCopy[availability.reason] ?? "This action is unavailable."
    : "This action is unavailable."

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--neoarc-radius-lg)] border p-8 text-center",
        "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-muted)]",
        className,
      )}
    >
      <Lock aria-hidden="true" className="size-6 text-[var(--neoarc-color-foreground-subtle)]" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[var(--neoarc-color-foreground)]">
          {availability.label ?? "Access restricted"}
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--neoarc-color-foreground-muted)]">
          {description}
        </p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}
