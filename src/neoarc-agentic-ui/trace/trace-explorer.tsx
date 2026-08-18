"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { TraceTurn } from "./trace-turn"
import { TraceStep } from "./trace-step"
import { TraceEventRow } from "./trace-event-row"
import { TraceTimeline } from "./trace-timeline"
import { TraceInspector } from "./trace-inspector"
import { EmptyState } from "../foundation/empty-state"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import type { TraceUIEventPayload } from "../../neoarc-agentic-contracts/trace-ui-events"
import type { TraceEvent, TraceEventKind, TraceTurn as TraceTurnType, TraceStep as TraceStepType } from "../../neoarc-agentic-contracts/trace"
import type { OpaqueId } from "../../neoarc-agentic-contracts/shared"
import { cn } from "../lib/cn"

const ALL_KINDS: readonly TraceEventKind[] = [
  "system-instruction",
  "user-input",
  "context",
  "runtime-recipe",
  "model-policy",
  "resolved-model",
  "knowledge",
  "relationship",
  "tool",
  "agent-activity",
  "human-interaction",
  "proposal",
  "artifact",
  "error",
  "retry",
]

export interface TraceExplorerProps {
  readonly events: readonly TraceEvent[]
  /** Optional turn/step grouping. When omitted, events render as one flat chronological timeline. */
  readonly turns?: readonly TraceTurnType[]
  readonly steps?: readonly TraceStepType[]
  /** Controlled selection; falls back to internal state when omitted (same disclosure-widget pattern as `TraceTurn`/`TraceStep`). */
  readonly selectedEventId?: OpaqueId
  readonly filterKinds?: readonly TraceEventKind[]
  readonly searchQuery?: string
  readonly onEmitEvent?: (event: AgenticUIEvent<TraceUIEventPayload>) => void
  readonly className?: string
}

/**
 * Root Trace component: composes filter + search controls, turn/step
 * grouping (when supplied) or a flat `TraceTimeline`, and the
 * `TraceInspector` detail panel for the selected event — all driven off
 * the same flat `events` array, per the projection note that turn/step
 * grouping happens client-side by reading `correlation.turnId`/`stepId`.
 */
export function TraceExplorer({
  events,
  turns,
  steps,
  selectedEventId: selectedEventIdProp,
  filterKinds: filterKindsProp,
  searchQuery: searchQueryProp,
  onEmitEvent,
  className,
}: TraceExplorerProps) {
  const [selectedEventIdState, setSelectedEventIdState] = React.useState<OpaqueId | undefined>(undefined)
  const [filterKindsState, setFilterKindsState] = React.useState<readonly TraceEventKind[] | undefined>(undefined)
  const [searchQueryState, setSearchQueryState] = React.useState("")

  const selectedEventId = selectedEventIdProp ?? selectedEventIdState
  const filterKinds = filterKindsProp ?? filterKindsState
  const searchQuery = searchQueryProp ?? searchQueryState

  const filteredEvents = React.useMemo(() => {
    const byKind = filterKinds && filterKinds.length > 0 ? events.filter((event) => filterKinds.includes(event.detail.kind)) : events
    if (!searchQuery.trim()) return byKind
    const needle = searchQuery.trim().toLowerCase()
    return byKind.filter((event) => JSON.stringify(event.detail.value).toLowerCase().includes(needle))
  }, [events, filterKinds, searchQuery])

  const selectedEvent = filteredEvents.find((event) => event.id === selectedEventId)

  function handleEmitSelect(uiEvent: AgenticUIEvent<{ eventId: OpaqueId }>) {
    setSelectedEventIdState(uiEvent.payload.eventId)
    onEmitEvent?.(uiEvent)
  }

  function toggleKind(kind: TraceEventKind) {
    const current = filterKinds ?? []
    const next = current.includes(kind) ? current.filter((value) => value !== kind) : [...current, kind]
    setFilterKindsState(next.length === 0 ? undefined : next)
    onEmitEvent?.(
      createUIEvent({
        type: "trace.filter.change",
        sourceComponent: "TraceExplorer",
        payload: { kinds: next.length === 0 ? undefined : next },
      }),
    )
  }

  function handleSearchChange(value: string) {
    setSearchQueryState(value)
    onEmitEvent?.(
      createUIEvent({
        type: "trace.search.change",
        sourceComponent: "TraceExplorer",
        payload: { query: value },
      }),
    )
  }

  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[var(--neoarc-color-foreground-subtle)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search trace events"
              aria-label="Search trace events"
              className={cn(
                "w-full rounded-[var(--neoarc-radius-md)] border py-1.5 pl-9 pr-3 text-sm",
                "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
              )}
            />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by event kind">
            {ALL_KINDS.map((kind) => {
              const active = filterKinds?.includes(kind) ?? false
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => toggleKind(kind)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-[var(--neoarc-radius-full)] border px-2 py-0.5 text-xs font-medium",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
                    active
                      ? "border-[var(--neoarc-color-accent)] bg-[var(--neoarc-color-accent-muted)] text-[var(--neoarc-color-accent)]"
                      : "border-[var(--neoarc-color-border)] bg-transparent text-[var(--neoarc-color-foreground-muted)]",
                  )}
                >
                  {kind}
                </button>
              )
            })}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyState title="No events" description="No trace events match the current filter or search." />
        ) : turns && turns.length > 0 ? (
          <div className="flex flex-col gap-2">
            {turns.map((turn) => {
              const turnEvents = filteredEvents.filter((event) => turn.eventIds.includes(event.id))
              if (turnEvents.length === 0) return null
              const turnSteps = (steps ?? []).filter((step) => step.turnId === turn.id)
              return (
                <TraceTurn key={turn.id} turn={turn} eventCount={turnEvents.length}>
                  {turnSteps.length > 0
                    ? turnSteps.map((step) => {
                        const stepEvents = turnEvents.filter((event) => step.eventIds.includes(event.id))
                        if (stepEvents.length === 0) return null
                        return (
                          <TraceStep key={step.id} step={step} eventCount={stepEvents.length}>
                            {stepEvents.map((event) => (
                              <TraceEventRow key={event.id} event={event} selected={event.id === selectedEventId} onEmitSelect={handleEmitSelect} />
                            ))}
                          </TraceStep>
                        )
                      })
                    : turnEvents.map((event) => (
                        <TraceEventRow key={event.id} event={event} selected={event.id === selectedEventId} onEmitSelect={handleEmitSelect} />
                      ))}
                </TraceTurn>
              )
            })}
          </div>
        ) : (
          <TraceTimeline events={filteredEvents} selectedEventId={selectedEventId} onEmitSelect={handleEmitSelect} />
        )}
      </div>
      <div className="w-full lg:w-96 lg:shrink-0">
        <TraceInspector event={selectedEvent} />
      </div>
    </div>
  )
}
