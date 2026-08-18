"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"
import type { TraceStep as TraceStepType } from "../../neoarc-agentic-contracts/trace"

export interface TraceStepProps {
  readonly step: TraceStepType
  readonly eventCount: number
  readonly defaultOpen?: boolean
  readonly children: React.ReactNode
}

/** A collapsible grouping header for one `TraceStep` within a `TraceTurn`, wrapping its `TraceEventRow` children. */
export function TraceStep({ step, eventCount, defaultOpen = true, children }: TraceStepProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] p-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
      >
        <span className="flex items-center gap-2 text-xs font-medium text-[var(--neoarc-color-foreground-muted)]">
          <ChevronDown aria-hidden="true" className={cn("size-3.5 transition-transform", !open && "-rotate-90")} />
          {step.label ?? `Step ${step.id}`}
          <span className="font-normal">
            {eventCount} event{eventCount === 1 ? "" : "s"}
          </span>
        </span>
        <Timestamp value={step.occurredAt} variant="relative" className="text-xs" />
      </button>
      {open ? <div className="flex flex-col gap-1.5 pl-5">{children}</div> : null}
    </div>
  )
}
