"use client"

import { SectionHeader } from "../foundation/section-header"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import type { ToolTraceDetail } from "../../neoarc-agentic-contracts/trace"

/**
 * A sanitized summary of one tool invocation. Deliberately never renders
 * raw tool I/O — only `action.actionSummary`/`resultSummary`, both of
 * which are the product adapter's own sanitized text.
 */
export function ToolTrace({ detail }: { readonly detail: ToolTraceDetail }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionHeader title={detail.action.toolName} />
      <p className="text-sm text-[var(--neoarc-color-foreground)]">{detail.action.actionSummary}</p>
      {detail.action.targetLabel ? (
        <p className="text-xs text-[var(--neoarc-color-foreground-muted)]">Target: {detail.action.targetLabel}</p>
      ) : null}
      <div className="flex items-center gap-2">
        <RuntimeStatusBadge status={detail.status} />
        {detail.resultSummary ? (
          <span className="text-xs text-[var(--neoarc-color-foreground-muted)]">{detail.resultSummary}</span>
        ) : null}
      </div>
    </div>
  )
}
