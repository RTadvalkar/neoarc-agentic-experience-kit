/**
 * neoarc-agentic-ui / conversation / ActivitySummaryList
 *
 * Purpose: render one or more safe "what is the agent doing right now"
 * summaries (see docs/TRACEABILITY_PRINCIPLES.md §1 — never a
 * chain-of-thought fragment). Used both for the `conversation.activity`
 * projected node (a single-item list) and standalone in an activity-target
 * panel showing several at once.
 *
 * Input model: `items: ActivitySummary[]`.
 *
 * Semantic UI events: none — pure display.
 */

import * as React from "react"
import { Loader2 } from "lucide-react"
import type { ActivitySummary } from "../../neoarc-agentic-contracts/conversation"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"

export interface ActivitySummaryListProps {
  readonly items: readonly ActivitySummary[]
  readonly className?: string
}

export function ActivitySummaryList({ items, className }: ActivitySummaryListProps) {
  if (items.length === 0) return null

  return (
    <ul className={cn("flex flex-col gap-1.5", className)} aria-label="Agent activity">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-2 text-xs text-[var(--neoarc-color-foreground-subtle)]"
        >
          {item.status === "running" ? (
            <Loader2 aria-hidden="true" className="size-3 shrink-0 animate-spin" />
          ) : (
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[var(--neoarc-color-foreground-subtle)]" />
          )}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <Timestamp value={item.occurredAt} variant="relative" className="shrink-0 text-xs" />
        </li>
      ))}
    </ul>
  )
}
