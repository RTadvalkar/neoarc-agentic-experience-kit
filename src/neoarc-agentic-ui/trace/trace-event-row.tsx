"use client"

import { Badge } from "../primitives/badge"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import type { TraceEventSelectPayload } from "../../neoarc-agentic-contracts/trace-ui-events"
import type { TraceEvent, TraceEventKind } from "../../neoarc-agentic-contracts/trace"

const kindLabel: Record<TraceEventKind, string> = {
  "system-instruction": "System instruction",
  "user-input": "User input",
  context: "Context",
  "runtime-recipe": "Runtime recipe",
  "model-policy": "Model policy",
  "resolved-model": "Resolved model",
  knowledge: "Knowledge",
  relationship: "Relationship",
  tool: "Tool",
  "agent-activity": "Activity",
  "human-interaction": "Human interaction",
  proposal: "Proposal",
  artifact: "Artifact",
  error: "Error",
  retry: "Retry",
}

/** Derives a short, honest one-line summary for the row from a trace event's own supplied fields — never a fabricated description. */
function summarize(event: TraceEvent): string {
  const { detail } = event
  switch (detail.kind) {
    case "system-instruction":
      return detail.value.label ?? detail.value.instructionId ?? "System instruction active"
    case "user-input":
      return detail.value.text
    case "context":
      return detail.value.label
    case "runtime-recipe":
      return detail.value.label ?? detail.value.recipeId ?? "Runtime recipe active"
    case "model-policy":
      return detail.value.label ?? detail.value.policyId ?? "Model policy active"
    case "resolved-model":
      return detail.value.available ? detail.value.value.modelId : `Not available (${detail.value.reason})`
    case "knowledge":
      return detail.value.title ?? detail.value.knowledgeId ?? "Knowledge used"
    case "relationship":
      return `${detail.value.sourceEntity} ${detail.value.predicate} ${detail.value.targetEntity}`
    case "tool":
      return detail.value.action.actionSummary
    case "agent-activity":
      return detail.value.label
    case "human-interaction":
      return detail.value.label
    case "proposal":
      return detail.value.label
    case "artifact":
      return detail.value.name
    case "error":
      return detail.value.message
    case "retry":
      return `Attempt ${detail.value.attempt}${detail.value.reason ? `: ${detail.value.reason}` : ""}`
    default:
      return detail satisfies never
  }
}

export interface TraceEventRowProps {
  readonly event: TraceEvent
  readonly selected?: boolean
  readonly onEmitSelect?: (event: AgenticUIEvent<TraceEventSelectPayload>) => void
}

/** One forensic row: kind badge, honest one-line summary, actor name (if supplied), timestamp. Emits `trace.event.select` on click. */
export function TraceEventRow({ event, selected, onEmitSelect }: TraceEventRowProps) {
  return (
    <button
      type="button"
      onClick={() =>
        onEmitSelect?.(
          createUIEvent({
            type: "trace.event.select",
            sourceComponent: "TraceEventRow",
            correlation: event.correlation,
            payload: { eventId: event.id },
          }),
        )
      }
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--neoarc-radius-md)] border px-3 py-2 text-left text-sm transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
        selected
          ? "border-[var(--neoarc-color-accent)] bg-[var(--neoarc-color-accent-muted)]"
          : "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] hover:bg-[var(--neoarc-color-surface-muted)]",
      )}
    >
      <Badge tone={event.detail.kind === "error" ? "danger" : "outline"} className="shrink-0">
        {kindLabel[event.detail.kind]}
      </Badge>
      <span className="min-w-0 flex-1 truncate text-[var(--neoarc-color-foreground)]">{summarize(event)}</span>
      {event.actor ? (
        <span className="shrink-0 truncate text-xs text-[var(--neoarc-color-foreground-muted)]">{event.actor.displayName}</span>
      ) : null}
      <Timestamp value={event.occurredAt} variant="relative" className="shrink-0 text-xs" />
    </button>
  )
}
