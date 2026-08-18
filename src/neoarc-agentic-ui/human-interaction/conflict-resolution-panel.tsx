/**
 * neoarc-agentic-ui / human-interaction / ConflictResolutionPanel
 *
 * Purpose: render a proposal's supplied `ConflictSummary[]` — never
 * computed by the kit, always product-supplied. An unresolved conflict
 * offers a free-text resolution input; a resolved one renders its
 * supplied `resolution` and never re-offers input, matching
 * `ClarificationCard`'s pending-vs-resolved pattern.
 *
 * `DecisionBar`'s `approve`/`override` actions are a product concern to
 * gate on unresolved conflicts (via `decisionPermissions`) — this panel
 * only surfaces the conflicts and collects resolutions; it never disables
 * another component itself.
 *
 * Semantic UI events: `proposal.conflict.resolve`.
 */

import * as React from "react"
import { CheckCircle2, GitCompareArrows } from "lucide-react"
import type { ConflictSummary, ProposalSummary } from "../../neoarc-agentic-contracts/proposal"
import type { ProposalConflictResolvePayload } from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { Surface } from "../primitives/surface"
import { cn } from "../lib/cn"

export interface ConflictResolutionPanelProps {
  readonly proposalId: ProposalSummary["id"]
  readonly conflicts: readonly ConflictSummary[]
  readonly onEmitResolve?: (event: AgenticUIEvent<ProposalConflictResolvePayload>) => void
  readonly className?: string
}

function ConflictRow({
  proposalId,
  conflict,
  onEmitResolve,
}: {
  readonly proposalId: ProposalSummary["id"]
  readonly conflict: ConflictSummary
  readonly onEmitResolve?: (event: AgenticUIEvent<ProposalConflictResolvePayload>) => void
}) {
  const [draft, setDraft] = React.useState("")

  function submit() {
    const resolution = draft.trim()
    if (resolution.length === 0) return
    onEmitResolve?.(
      createUIEvent({
        type: "proposal.conflict.resolve",
        sourceComponent: "ConflictResolutionPanel",
        payload: { proposalId, conflictId: conflict.id, resolution },
      }),
    )
  }

  return (
    <li className="flex flex-col gap-2 py-2">
      <div className="flex items-start gap-2">
        {conflict.resolved ? (
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--neoarc-color-success)]" />
        ) : (
          <GitCompareArrows aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--neoarc-color-danger)]" />
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-[var(--neoarc-color-foreground)]">{conflict.summary}</span>
          {conflict.conflictingWith ? (
            <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
              Conflicts with: {conflict.conflictingWith}
            </span>
          ) : null}
        </div>
      </div>
      {conflict.resolved ? (
        conflict.resolution ? (
          <p className="ml-6 text-xs text-[var(--neoarc-color-foreground-muted)]">Resolution: {conflict.resolution}</p>
        ) : null
      ) : (
        <div className="ml-6 flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Describe how this conflict was resolved…"
            className={cn(
              "flex-1 rounded-[var(--neoarc-radius-sm)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-2 py-1 text-xs",
              "text-[var(--neoarc-color-foreground)] placeholder:text-[var(--neoarc-color-foreground-subtle)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
            )}
          />
          <button
            type="button"
            disabled={draft.trim().length === 0}
            onClick={submit}
            className={cn(
              "rounded-[var(--neoarc-radius-sm)] border border-transparent bg-[var(--neoarc-color-accent)] px-2.5 py-1 text-xs font-medium",
              "text-[var(--neoarc-color-accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
            )}
          >
            Submit
          </button>
        </div>
      )}
    </li>
  )
}

export function ConflictResolutionPanel({ proposalId, conflicts, onEmitResolve, className }: ConflictResolutionPanelProps) {
  if (conflicts.length === 0) {
    return null
  }

  return (
    <Surface
      variant="muted"
      role="group"
      aria-label="Proposal conflicts"
      className={cn("flex flex-col gap-1 p-3", className)}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">
        Conflicts
      </span>
      <ul className="flex flex-col divide-y divide-[var(--neoarc-color-border)]">
        {conflicts.map((conflict) => (
          <ConflictRow key={conflict.id} proposalId={proposalId} conflict={conflict} onEmitResolve={onEmitResolve} />
        ))}
      </ul>
    </Surface>
  )
}
