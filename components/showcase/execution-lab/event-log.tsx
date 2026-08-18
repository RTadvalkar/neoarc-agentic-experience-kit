"use client"

/**
 * components/showcase/execution-lab/event-log
 *
 * SHOWCASE-ONLY. Displays the semantic `AgenticUIEvent` log required by
 * docs/03_BOOTSTRAP...prompt.md §10. Every user-intent event emitted while
 * interacting with the Execution Lab (currently: selecting a rendered node)
 * appears here, proving `AgenticUIEvent` is a real, inspectable contract
 * rather than a shape nothing ever emits.
 */

import type { AgenticUIEvent } from "../../../src/neoarc-agentic-contracts/ui-events"
import { SectionHeader } from "../../../src/neoarc-agentic-ui/foundation/section-header"
import { EmptyState } from "../../../src/neoarc-agentic-ui/foundation/empty-state"
import { Timestamp } from "../../../src/neoarc-agentic-ui/foundation/timestamp"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"

export interface EventLogProps {
  readonly events: readonly AgenticUIEvent[]
}

export function EventLog({ events }: EventLogProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <SectionHeader
        title="Semantic UI event log"
        description="AgenticUIEvent instances emitted by reusable components in this session."
      />
      {events.length === 0 ? (
        <EmptyState title="No UI events yet" description="Select a rendered node to emit an inspector.node.select event." />
      ) : (
        <Surface variant="muted" className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-3">
          <ul className="flex flex-col gap-2">
            {events.map((event, index) => (
              <li key={`${event.type}-${event.occurredAt}-${index}`} className="flex flex-col gap-1 rounded-[var(--neoarc-radius-sm)] border border-[var(--neoarc-color-border-muted)] bg-[var(--neoarc-color-surface)] p-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="accent">{event.type}</Badge>
                  <Timestamp value={event.occurredAt} variant="relative" />
                </div>
                <span className="text-xs text-[var(--neoarc-color-foreground-muted)]">
                  from {event.sourceComponent}
                </span>
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  )
}
