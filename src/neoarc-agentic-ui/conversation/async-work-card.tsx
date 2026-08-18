/**
 * neoarc-agentic-ui / conversation / AsyncWorkCard
 *
 * Purpose: render a supplied `AsyncWorkSummary` — work proceeding
 * asynchronously outside the current turn (e.g. a long-running background
 * job the agent kicked off). Direct-view-model only: there is no built-in
 * `conversation.async-work` projected node kind in Slice 2's ten kinds (see
 * docs/04 §2), so this component is always driven straight from a supplied
 * `AsyncWorkSummary`, never unwrapped from a projected node.
 *
 * Semantic UI events: none — a pure status display. A product wanting a
 * "view details" action can wrap this component with its own control.
 */

import * as React from "react"
import { Clock } from "lucide-react"
import type { AsyncWorkSummary } from "../../neoarc-agentic-contracts/conversation"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { Surface } from "../primitives/surface"
import { cn } from "../lib/cn"

export interface AsyncWorkCardProps {
  readonly work: AsyncWorkSummary
  readonly className?: string
}

export function AsyncWorkCard({ work, className }: AsyncWorkCardProps) {
  return (
    <Surface variant="muted" className={cn("flex w-full items-center gap-3 p-3", className)}>
      <Clock aria-hidden="true" className="size-4 shrink-0 text-[var(--neoarc-color-foreground-subtle)]" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-[var(--neoarc-color-foreground)]">{work.label}</span>
        {work.etaLabel ? (
          <span className="truncate text-xs text-[var(--neoarc-color-foreground-subtle)]">{work.etaLabel}</span>
        ) : null}
      </div>
      <RuntimeStatusBadge status={work.status} />
    </Surface>
  )
}
