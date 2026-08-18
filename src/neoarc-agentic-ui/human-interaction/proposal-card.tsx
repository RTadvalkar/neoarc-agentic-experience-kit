/**
 * neoarc-agentic-ui / human-interaction / ProposalCard
 *
 * Purpose: the compact, conversation-inline summary of a `ProposalSummary`
 * — title, status, a short summary, top risk/policy/conflict signals, and
 * a `DecisionBar` for quick decisions. Opens `ProposalViewer` (via
 * `onEmitOpen`) for full review rather than duplicating its detail. This
 * answers "should this proposal become authoritative?" — never the
 * execution-permission question (`ExecutionPermissionCard`).
 *
 * A `conflicted` or `stale` proposal never silently disables itself here —
 * it renders the product-supplied `decisionPermissions` exactly as given,
 * plus an `InlineNotice` surfacing *why*, so the human always sees an
 * honest explanation rather than a mysteriously grayed-out button.
 *
 * Semantic UI events: `proposal.open` (plus whatever `DecisionBar` emits).
 */

import * as React from "react"
import { FileText } from "lucide-react"
import type { ProposalSummary } from "../../neoarc-agentic-contracts/proposal"
import type {
  ProposalApplyRequestPayload,
  ProposalDeferRequestPayload,
  ProposalOpenPayload,
  ProposalRefineRequestPayload,
  ProposalRejectRequestPayload,
} from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { InlineNotice } from "../foundation/inline-notice"
import { Surface } from "../primitives/surface"
import { cn } from "../lib/cn"
import { ProposalStatusBadge } from "./proposal-status-badge"
import { DecisionBar } from "./decision-bar"

export interface ProposalCardProps {
  readonly proposal: ProposalSummary
  readonly onEmitOpen?: (event: AgenticUIEvent<ProposalOpenPayload>) => void
  readonly onEmitApply?: (event: AgenticUIEvent<ProposalApplyRequestPayload>) => void
  readonly onEmitRefine?: (event: AgenticUIEvent<ProposalRefineRequestPayload>) => void
  readonly onEmitReject?: (event: AgenticUIEvent<ProposalRejectRequestPayload>) => void
  readonly onEmitDefer?: (event: AgenticUIEvent<ProposalDeferRequestPayload>) => void
  readonly onRequestRefine?: () => void
  readonly onRequestOverride?: () => void
  readonly className?: string
}

export function ProposalCard({
  proposal,
  onEmitOpen,
  onEmitApply,
  onEmitRefine,
  onEmitReject,
  onEmitDefer,
  onRequestRefine,
  onRequestOverride,
  className,
}: ProposalCardProps) {
  const unresolvedConflicts = (proposal.conflicts ?? []).filter((conflict) => !conflict.resolved)

  function emitOpen() {
    onEmitOpen?.(
      createUIEvent({
        type: "proposal.open",
        sourceComponent: "ProposalCard",
        payload: { proposalId: proposal.id },
      }),
    )
  }

  return (
    <Surface
      variant="muted"
      role="group"
      aria-label={`Proposal: ${proposal.title}`}
      className={cn("flex w-full flex-col gap-3 p-4", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={emitOpen}
          className={cn(
            "flex items-start gap-2 text-left",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
          )}
        >
          <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--neoarc-color-accent)]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[var(--neoarc-color-foreground)]">{proposal.title}</span>
            <span className="text-sm text-[var(--neoarc-color-foreground-muted)]">{proposal.summary}</span>
          </div>
        </button>
        <ProposalStatusBadge status={proposal.status} />
      </div>

      {proposal.status === "conflicted" && unresolvedConflicts.length > 0 ? (
        <InlineNotice
          tone="danger"
          title="Unresolved conflicts"
          description={`${unresolvedConflicts.length} conflict${unresolvedConflicts.length === 1 ? "" : "s"} must be resolved before this proposal can proceed.`}
        />
      ) : null}
      {proposal.status === "stale" ? (
        <InlineNotice tone="warning" title="This proposal may be out of date" description="Open it for full review before deciding." />
      ) : null}
      {proposal.lastActionFailed ? (
        <InlineNotice
          tone="danger"
          title={`Could not ${proposal.lastActionFailed.action} this proposal`}
          description={proposal.lastActionFailed.reason}
        />
      ) : null}

      <DecisionBar
        proposalId={proposal.id}
        decisionPermissions={proposal.decisionPermissions}
        pendingAction={proposal.pendingAction}
        onEmitApply={onEmitApply}
        onEmitRefine={onEmitRefine}
        onEmitReject={onEmitReject}
        onEmitDefer={onEmitDefer}
        onRequestRefine={onRequestRefine}
        onRequestOverride={onRequestOverride}
      />
    </Surface>
  )
}
