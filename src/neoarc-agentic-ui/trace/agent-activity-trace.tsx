"use client"

import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import type { AgentActivityTraceDetail } from "../../neoarc-agentic-contracts/trace"

/** A single terse, safe activity summary line — reuses the same vocabulary `ActivitySummary` uses elsewhere. */
export function AgentActivityTrace({ detail }: { readonly detail: AgentActivityTraceDetail }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--neoarc-color-foreground)]">
      <span>{detail.label}</span>
      {detail.status ? <RuntimeStatusBadge status={detail.status} /> : null}
    </div>
  )
}
