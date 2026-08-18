/**
 * neoarc-agentic-ui / human-interaction / ProposalStatusTimeline
 *
 * Purpose: a chronological view combining a proposal's current
 * `ProposalStatus` with its supplied `decisionHistory` — a Trace-shaped
 * rendering of the same normalized facts `DecisionHistory` shows in a
 * Chat/inline shape. This is the "alternate execution view" reuse the kit
 * calls for: same facts, different renderer, different target (Trace
 * rather than conversation-inline).
 *
 * Never infers an entry that was not supplied. The current status always
 * renders as the terminal/most-recent node, even if `decisionHistory` is
 * empty (e.g. a `draft` proposal has a status but no decisions yet).
 *
 * Semantic UI events: `proposal.history.open`, when the human opens full
 * decision history from the timeline instead of `DecisionHistory`'s
 * inline entry point — the two never define competing event shapes.
 */

import * as React from "react"
import type { ProposalSummary } from "../../neoarc-agentic-contracts/proposal"
import type { ProposalHistoryOpenPayload } from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"
import { ProposalStatusBadge } from "./proposal-status-badge"

export interface ProposalStatusTimelineProps {
  readonly proposal: ProposalSummary
  readonly onEmitHistoryOpen?: (event: AgenticUIEvent<ProposalHistoryOpenPayload>) => void
  readonly className?: string
}

const actionLabel: Record<string, string> = {
  approve: "Approved",
  refine: "Refinement requested",
  reject: "Rejected",
  defer: "Deferred",
  override: "Overridden",
}

export function ProposalStatusTimeline({ proposal, onEmitHistoryOpen, className }: ProposalStatusTimelineProps) {
  const decisions = proposal.decisionHistory ?? []
  const ordered = [...decisions].sort((a, b) => (a.decidedAt < b.decidedAt ? -1 : 1))

  function emitOpen() {
    onEmitHistoryOpen?.(
      createUIEvent({
        type: "proposal.history.open",
        sourceComponent: "ProposalStatusTimeline",
        payload: { proposalId: proposal.id },
      }),
    )
  }

  return (
    <ol className={cn("flex flex-col gap-3", className)}>
      <li className="flex flex-col gap-1 border-l-2 border-[var(--neoarc-color-border)] pl-3">
        <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
          <Timestamp value={proposal.revision.createdAt} variant="relative" /> — revision {proposal.revision.revision}
        </span>
        <span className="text-sm text-[var(--neoarc-color-foreground-muted)]">Proposal created</span>
      </li>
      {ordered.map((decision) => (
        <li key={decision.id} className="flex flex-col gap-1 border-l-2 border-[var(--neoarc-color-border)] pl-3">
          <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
            <Timestamp value={decision.decidedAt} variant="relative" />
          </span>
          <span className="text-sm text-[var(--neoarc-color-foreground)]">
            {actionLabel[decision.action] ?? decision.action} by{" "}
            <span className="font-medium">{decision.decidedBy.displayName}</span>
          </span>
          {decision.note ? (
            <span className="text-xs text-[var(--neoarc-color-foreground-muted)]">&ldquo;{decision.note}&rdquo;</span>
          ) : null}
        </li>
      ))}
      <li
        className={cn(
          "flex flex-col gap-1 border-l-2 pl-3",
          "border-[var(--neoarc-color-accent)]",
        )}
      >
        <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">Current status</span>
        <button
          type="button"
          onClick={emitOpen}
          className={cn(
            "inline-flex w-fit items-center gap-2",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
          )}
        >
          <ProposalStatusBadge status={proposal.status} />
        </button>
      </li>
    </ol>
  )
}
