"use client"

import { TraceEventRow } from "./trace-event-row"
import { EmptyState } from "../foundation/empty-state"
import type { AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import type { TraceEventSelectPayload } from "../../neoarc-agentic-contracts/trace-ui-events"
import type { TraceEvent } from "../../neoarc-agentic-contracts/trace"
import type { OpaqueId } from "../../neoarc-agentic-contracts/shared"

export interface TraceTimelineProps {
  readonly events: readonly TraceEvent[]
  readonly selectedEventId?: OpaqueId
  readonly onEmitSelect?: (event: AgenticUIEvent<TraceEventSelectPayload>) => void
}

/**
 * A flat chronological list of `TraceEventRow`s. `events` is assumed
 * already ordered/filtered by the caller (`TraceExplorer` handles
 * turn/step grouping and filtering) — this component stays a plain
 * renderer of whatever list it's given.
 */
export function TraceTimeline({ events, selectedEventId, onEmitSelect }: TraceTimelineProps) {
  if (events.length === 0) {
    return <EmptyState title="No events" description="No trace events match the current filter." />
  }
  return (
    <div className="flex flex-col gap-1.5">
      {events.map((event) => (
        <TraceEventRow key={event.id} event={event} selected={event.id === selectedEventId} onEmitSelect={onEmitSelect} />
      ))}
    </div>
  )
}

