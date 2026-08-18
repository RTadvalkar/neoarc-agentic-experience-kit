"use client"

import { InlineNotice } from "../foundation/inline-notice"
import { Timestamp } from "../foundation/timestamp"
import type { RunError } from "../../neoarc-agentic-contracts/runtime"

/**
 * A read-only rendering of one `RunError` fact for the forensic Trace log
 * — reuses `RunError` as-is rather than a parallel shape. Unlike
 * `RunErrorPanel` (Mission tab), this never offers a retry action: the
 * Trace view is a record of what happened, not a place to take action.
 */
export function ErrorTrace({ detail }: { readonly detail: RunError }) {
  return (
    <InlineNotice
      tone="danger"
      title={detail.message}
      description={
        <span className="flex flex-col gap-1">
          {detail.causeSummary ? <span>{detail.causeSummary}</span> : null}
          <span className="text-xs opacity-80">
            Occurred <Timestamp value={detail.occurredAt} variant="relative" />
          </span>
          <span className="text-xs opacity-80">
            {detail.retryability.retryable ? "Retryable" : `Not retryable${detail.retryability.reason ? `: ${detail.retryability.reason}` : ""}`}
          </span>
        </span>
      }
    />
  )
}
