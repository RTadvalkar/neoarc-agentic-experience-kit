"use client"

import { Badge } from "../primitives/badge"
import { Timestamp } from "../foundation/timestamp"
import type { RetryTraceDetail } from "../../neoarc-agentic-contracts/trace"

/** Renders one retry-scheduling fact, kept distinct from `ErrorTrace` per the reserved `retry.scheduled` vocabulary entry. */
export function RetryTrace({ detail }: { readonly detail: RetryTraceDetail }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Badge tone="warning">Retry attempt {detail.attempt}</Badge>
        {detail.scheduledFor ? (
          <span className="text-xs text-[var(--neoarc-color-foreground-muted)]">
            Scheduled <Timestamp value={detail.scheduledFor} variant="relative" />
          </span>
        ) : null}
      </div>
      {detail.reason ? <p className="text-sm text-[var(--neoarc-color-foreground)]">{detail.reason}</p> : null}
    </div>
  )
}
