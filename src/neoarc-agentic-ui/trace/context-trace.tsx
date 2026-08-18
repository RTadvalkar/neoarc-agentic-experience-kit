/**
 * neoarc-agentic-ui / trace / ContextTrace
 *
 * Purpose: render one supplied piece of context (workspace/section/product
 * context) fed into the run.
 *
 * Input model: `detail: ContextTraceDetail`.
 */

import type { ContextTraceDetail } from "../../neoarc-agentic-contracts/trace"
import { cn } from "../lib/cn"

export interface ContextTraceProps {
  readonly detail: ContextTraceDetail
  readonly className?: string
}

export function ContextTrace({ detail, className }: ContextTraceProps) {
  return (
    <div className={cn("flex items-baseline gap-2 text-sm", className)}>
      <span className="font-medium text-[var(--neoarc-color-foreground)]">{detail.label}</span>
      {detail.value ? <span className="text-[var(--neoarc-color-foreground-muted)]">{detail.value}</span> : null}
    </div>
  )
}
