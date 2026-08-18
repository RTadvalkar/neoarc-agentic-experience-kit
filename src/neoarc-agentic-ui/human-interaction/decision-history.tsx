/**
 * neoarc-agentic-ui / human-interaction / DecisionHistory
 *
 * Purpose: render a proposal's supplied `HumanDecision[]` as a compact,
 * reverse-chronological audit list — who decided what, and when. Every
 * entry is an already-recorded, authoritative decision; this component
 * never renders a `pendingAction` (that belongs to `DecisionBar`'s
 * submitting state) and never fabricates an entry.
 *
 * Semantic UI events: `proposal.history.open`, emitted once when the human
 * expands a collapsed history into view (mirrors `ChangeDiffViewer`'s
 * open-on-first-expand pattern) — never on every re-render.
 */

import * as React from "react"
import { History } from "lucide-react"
import type { HumanDecision, ProposalSummary } from "../../neoarc-agentic-contracts/proposal"
import type { ProposalHistoryOpenPayload } from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"

export interface DecisionHistoryProps {
  readonly proposalId: ProposalSummary["id"]
  readonly decisions: readonly HumanDecision[]
  readonly defaultCollapsed?: boolean
  readonly onEmitHistoryOpen?: (event: AgenticUIEvent<ProposalHistoryOpenPayload>) => void
  readonly className?: string
}

const actionLabel: Record<HumanDecision["action"], string> = {
  approve: "approved",
  refine: "requested refinement on",
  reject: "rejected",
  defer: "deferred",
  override: "overrode",
}

export function DecisionHistory({
  proposalId,
  decisions,
  defaultCollapsed = true,
  onEmitHistoryOpen,
  className,
}: DecisionHistoryProps) {
  const [expanded, setExpanded] = React.useState(!defaultCollapsed)
  const hasOpenedRef = React.useRef(!defaultCollapsed)

  if (decisions.length === 0) {
    return null
  }

  function toggle() {
    const next = !expanded
    setExpanded(next)
    if (next && !hasOpenedRef.current) {
      hasOpenedRef.current = true
      onEmitHistoryOpen?.(
        createUIEvent({
          type: "proposal.history.open",
          sourceComponent: "DecisionHistory",
          payload: { proposalId },
        }),
      )
    }
  }

  const ordered = [...decisions].sort((a, b) => (a.decidedAt < b.decidedAt ? 1 : -1))

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium text-[var(--neoarc-color-foreground-muted)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
        )}
      >
        <History aria-hidden="true" className="size-3.5" />
        Decision history ({decisions.length})
      </button>
      {expanded ? (
        <ol className="flex flex-col gap-2 border-l border-[var(--neoarc-color-border)] pl-3">
          {ordered.map((decision) => (
            <li key={decision.id} className="flex flex-col gap-0.5 text-xs">
              <span className="text-[var(--neoarc-color-foreground)]">
                <span className="font-medium">{decision.decidedBy.displayName}</span>{" "}
                {actionLabel[decision.action]} this proposal
              </span>
              <span className="text-[var(--neoarc-color-foreground-subtle)]">
                <Timestamp value={decision.decidedAt} variant="relative" />
              </span>
              {decision.note ? (
                <span className="text-[var(--neoarc-color-foreground-muted)]">&ldquo;{decision.note}&rdquo;</span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
