/**
 * neoarc-agentic-ui / conversation / ClarificationCard
 *
 * Purpose: render one pending-or-resolved `ClarificationRequest`. Pending
 * clarifications with supplied `options` render them as a choice list;
 * without `options`, a free-text response field is offered. Resolved
 * clarifications render the supplied `resolution` and never re-offer input.
 *
 * This is one of the "human interaction" presentation intents named in
 * docs/02B §Human interaction (`"clarification"`) — later slices (Slice 3+)
 * may compose this alongside other pending-interaction presentations, but
 * this component itself never removes a valid action once resolved.
 *
 * Semantic UI events: emits `"clarification.submit"`
 * (`ClarificationSubmitPayload`). Submitting is a request only — the
 * product adapter owns whether the backend actually records the resolution
 * and must feed it back through `clarification.resolved`/`resolution`.
 */

import * as React from "react"
import { CircleHelp } from "lucide-react"
import type { ClarificationRequest } from "../../neoarc-agentic-contracts/conversation"
import type { ClarificationSubmitPayload } from "../../neoarc-agentic-contracts/conversation-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { Surface } from "../primitives/surface"
import { Badge } from "../primitives/badge"
import { cn } from "../lib/cn"

export interface ClarificationCardProps {
  readonly clarification: ClarificationRequest
  readonly onEmitEvent?: (event: AgenticUIEvent<ClarificationSubmitPayload>) => void
  readonly className?: string
}

export function ClarificationCard({ clarification, onEmitEvent, className }: ClarificationCardProps) {
  const [draft, setDraft] = React.useState("")

  function submit(resolution: string) {
    if (!resolution.trim()) return
    onEmitEvent?.(
      createUIEvent({
        type: "clarification.submit",
        sourceComponent: "ClarificationCard",
        payload: { clarificationId: clarification.id, resolution },
      }),
    )
  }

  return (
    <Surface
      variant="muted"
      className={cn("flex w-full flex-col gap-2.5 p-3.5", className)}
      role="group"
      aria-label="Clarification requested"
    >
      <div className="flex items-start gap-2">
        <CircleHelp aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--neoarc-color-warning)]" />
        <p className="text-sm font-medium text-[var(--neoarc-color-foreground)]">{clarification.question}</p>
      </div>

      {clarification.resolved ? (
        <div className="flex items-center gap-2 pl-6">
          <Badge tone="success">Resolved</Badge>
          <span className="text-sm text-[var(--neoarc-color-foreground-muted)]">{clarification.resolution}</span>
        </div>
      ) : clarification.options && clarification.options.length > 0 ? (
        <div className="flex flex-wrap gap-2 pl-6">
          {clarification.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => submit(option)}
              className="rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--neoarc-color-foreground)] hover:bg-[var(--neoarc-color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="flex items-center gap-2 pl-6"
          onSubmit={(event) => {
            event.preventDefault()
            submit(draft)
            setDraft("")
          }}
        >
          <label htmlFor={`clarification-${clarification.id}`} className="sr-only">
            Respond to clarification
          </label>
          <input
            id={`clarification-${clarification.id}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your response"
            className="min-w-0 flex-1 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-2.5 py-1 text-sm text-[var(--neoarc-color-foreground)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
          />
          <button
            type="submit"
            className="rounded-[var(--neoarc-radius-md)] bg-[var(--neoarc-color-accent)] px-3 py-1 text-xs font-medium text-[var(--neoarc-color-accent-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
          >
            Submit
          </button>
        </form>
      )}
    </Surface>
  )
}
