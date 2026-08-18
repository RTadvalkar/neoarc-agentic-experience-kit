"use client"

import { Badge } from "../primitives/badge"
import type { HumanInteractionTraceDetail } from "../../neoarc-agentic-contracts/trace"

/**
 * Renders one human-interaction trace fact. `domain` keeps clarification
 * and execution-permission visually distinct — this kind never covers
 * business-decision (proposal review) facts, which project to the
 * separate `"proposal"` `TraceEventKind`/`ProposalTrace` instead.
 */
export function HumanInteractionTrace({ detail }: { readonly detail: HumanInteractionTraceDetail }) {
  const domainLabel = detail.domain === "clarification" ? "Clarification" : "Execution permission"
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Badge tone="outline">{domainLabel}</Badge>
        {detail.outcome ? <Badge tone="neutral">{detail.outcome}</Badge> : null}
      </div>
      <p className="text-sm text-[var(--neoarc-color-foreground)]">{detail.label}</p>
    </div>
  )
}
