/**
 * neoarc-agentic-ui / conversation / ToolActivityDisclosure
 *
 * Purpose: render one supplied `ToolActivitySummary` as a collapsible
 * disclosure — collapsed by default, expandable to show the supplied
 * `summary` text. Never assumes raw tool input/output is safe to render;
 * only ever shows the product-supplied safe summary string.
 *
 * Input model: `tool: ToolActivitySummary`, optional controlled `open`
 * (uncontrolled internal state used when omitted).
 *
 * Semantic UI events: emits `"toolActivity.toggle"`
 * (`ToolActivityTogglePayload`) on every expand/collapse.
 */

import * as React from "react"
import { ChevronRight, Wrench } from "lucide-react"
import type { ToolActivitySummary } from "../../neoarc-agentic-contracts/conversation"
import type { ToolActivityTogglePayload } from "../../neoarc-agentic-contracts/conversation-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { cn } from "../lib/cn"

export interface ToolActivityDisclosureProps {
  readonly tool: ToolActivitySummary
  readonly open?: boolean
  readonly onEmitEvent?: (event: AgenticUIEvent<ToolActivityTogglePayload>) => void
  readonly className?: string
}

export function ToolActivityDisclosure({ tool, open, onEmitEvent, className }: ToolActivityDisclosureProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open ?? internalOpen

  function handleToggle() {
    const next = !isOpen
    if (open === undefined) setInternalOpen(next)
    onEmitEvent?.(
      createUIEvent({
        type: "toolActivity.toggle",
        sourceComponent: "ToolActivityDisclosure",
        payload: { toolActivityId: tool.id, open: next },
      }),
    )
  }

  return (
    <div
      className={cn(
        "rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-muted)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
      >
        <ChevronRight
          aria-hidden="true"
          className={cn("size-3 shrink-0 text-[var(--neoarc-color-foreground-subtle)] transition-transform", isOpen && "rotate-90")}
        />
        <Wrench aria-hidden="true" className="size-3 shrink-0 text-[var(--neoarc-color-foreground-subtle)]" />
        <span className="min-w-0 flex-1 truncate font-medium text-[var(--neoarc-color-foreground-muted)]">
          {tool.toolName}
        </span>
        <RuntimeStatusBadge status={tool.status} />
      </button>
      {isOpen ? (
        <div className="border-t border-[var(--neoarc-color-border-muted)] px-2.5 py-2 text-xs text-[var(--neoarc-color-foreground-muted)]">
          {tool.summary ?? "No summary supplied for this tool invocation."}
        </div>
      ) : null}
    </div>
  )
}
