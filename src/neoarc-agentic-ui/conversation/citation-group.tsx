/**
 * neoarc-agentic-ui / conversation / CitationGroup
 *
 * Purpose: render a message's supplied `CitationRef[]` as a compact,
 * opaque-looking group of chips. Never fabricates a citation, never shows a
 * confidence/score unless one is supplied elsewhere — this component only
 * displays what it is given.
 *
 * Semantic UI events: emits `"citation.open"` (`CitationOpenPayload`) when
 * the user opens a specific citation.
 */

import * as React from "react"
import { FileText } from "lucide-react"
import type { CitationRef } from "../../neoarc-agentic-contracts/conversation"
import type { CitationOpenPayload } from "../../neoarc-agentic-contracts/conversation-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { cn } from "../lib/cn"

export interface CitationGroupProps {
  readonly citations: readonly CitationRef[]
  readonly onEmitEvent?: (event: AgenticUIEvent<CitationOpenPayload>) => void
  readonly className?: string
}

export function CitationGroup({ citations, onEmitEvent, className }: CitationGroupProps) {
  if (citations.length === 0) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} role="list" aria-label="Citations">
      {citations.map((citation) => (
        <button
          key={citation.id}
          type="button"
          role="listitem"
          onClick={() =>
            onEmitEvent?.(
              createUIEvent({
                type: "citation.open",
                sourceComponent: "CitationGroup",
                payload: { citationId: citation.id },
              }),
            )
          }
          className={cn(
            "inline-flex items-center gap-1 rounded-[var(--neoarc-radius-full)] border px-2 py-0.5 text-xs",
            "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-muted)] text-[var(--neoarc-color-foreground-muted)]",
            "hover:text-[var(--neoarc-color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
          )}
          title={citation.sourceLabel}
        >
          <FileText aria-hidden="true" className="size-3" />
          <span className="max-w-40 truncate">{citation.label}</span>
        </button>
      ))}
    </div>
  )
}
