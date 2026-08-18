"use client"

import { Badge } from "../primitives/badge"
import type { ProposalTraceDetail } from "../../neoarc-agentic-contracts/trace"

/**
 * Renders one business-decision (proposal) trace fact. Kept as its own
 * `TraceEventKind`, distinct from `HumanInteractionTrace` — the two
 * approval domains ("may this proceed?" vs "should this become
 * authoritative?") are never collapsed into one generic shape.
 */
export function ProposalTrace({ detail }: { readonly detail: ProposalTraceDetail }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Badge tone="outline">Proposal</Badge>
        {detail.action ? <Badge tone="accent">{detail.action}</Badge> : null}
      </div>
      <p className="text-sm text-[var(--neoarc-color-foreground)]">{detail.label}</p>
    </div>
  )
}
