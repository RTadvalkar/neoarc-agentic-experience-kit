/**
 * neoarc-agentic-ui / foundation / RedactedValue
 *
 * Purpose: render a field that may be withheld by a product/backend
 * adapter, using an explicit state instead of ever fabricating or silently
 * hiding a value — see docs/TRACEABILITY_PRINCIPLES.md.
 *
 * Input model: `state: RedactionState`; `children` supplies the real value,
 * only rendered when `state.redacted` is false.
 *
 * States: visible value, redacted, not supplied, not available,
 * insufficient access (the four `UnavailableReason` values, surfaced via
 * `state.reason`).
 *
 * Trace visibility: this is the primary component for honoring
 * `TraceAccessLevel`/redaction decisions made upstream by a product
 * adapter — the component itself never decides what should be redacted.
 */

import * as React from "react"
import { Lock } from "lucide-react"
import type { RedactionState } from "../../neoarc-agentic-contracts/foundation"
import { cn } from "../lib/cn"

export interface RedactedValueProps {
  readonly state: RedactionState
  readonly children: React.ReactNode
  readonly className?: string
}

const reasonLabel: Record<string, string> = {
  not_supplied: "Not supplied",
  not_available: "Not available",
  redacted: "Redacted",
  insufficient_access: "Insufficient access",
}

export function RedactedValue({ state, children, className }: RedactedValueProps) {
  if (!state.redacted) {
    return <>{children}</>
  }

  const label = state.reason ? reasonLabel[state.reason] ?? "Redacted" : "Redacted"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--neoarc-radius-sm)] border border-dashed",
        "border-[var(--neoarc-color-border-strong)] bg-[var(--neoarc-color-surface-muted)] px-1.5 py-0.5",
        "text-xs text-[var(--neoarc-color-foreground-subtle)]",
        className,
      )}
      title={state.note}
    >
      <Lock aria-hidden="true" className="size-3" />
      {label}
      {state.note ? <span className="sr-only">: {state.note}</span> : null}
    </span>
  )
}
