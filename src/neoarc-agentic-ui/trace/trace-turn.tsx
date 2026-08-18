"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"
import type { TraceTurn as TraceTurnType } from "../../neoarc-agentic-contracts/trace"

export interface TraceTurnProps {
  readonly turn: TraceTurnType
  readonly eventCount: number
  readonly defaultOpen?: boolean
  readonly children: React.ReactNode
}

/** A collapsible grouping header for one `TraceTurn`, wrapping whatever `TraceStep`/`TraceEventRow` children the caller supplies. */
export function TraceTurn({ turn, eventCount, defaultOpen = true, children }: TraceTurnProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="flex flex-col gap-2 rounded-[var(--neoarc-radius-lg)] border border-[var(--neoarc-color-border)] p-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-[var(--neoarc-color-foreground)]">
          <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform", !open && "-rotate-90")} />
          {turn.label ?? `Turn ${turn.id}`}
          <span className="text-xs font-normal text-[var(--neoarc-color-foreground-muted)]">
            {eventCount} event{eventCount === 1 ? "" : "s"}
          </span>
        </span>
        <Timestamp value={turn.occurredAt} variant="relative" className="text-xs" />
      </button>
      {open ? <div className="flex flex-col gap-2 pl-6">{children}</div> : null}
    </div>
  )
}
