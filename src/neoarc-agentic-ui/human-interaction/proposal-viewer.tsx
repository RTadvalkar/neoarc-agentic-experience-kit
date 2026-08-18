/**
 * neoarc-agentic-ui / human-interaction / ProposalViewer
 *
 * Purpose: the full-detail composition for one `ProposalSummary` —
 * sections/changes (`ChangeDiffViewer`), supplied risk/policy findings,
 * conflicts (`ConflictResolutionPanel`), evidence references, decision
 * history (`DecisionHistory`), and the `DecisionBar`. Intended for a
 * dedicated review surface (inspector tab, drawer, standalone page) rather
 * than conversation-inline — `ProposalCard` is the compact counterpart for
 * that.
 *
 * Composes existing components rather than re-implementing their
 * behavior; owns only the override-dialog open state, since that is
 * inherently a full-review-surface concern (`DecisionBar` never renders an
 * override button unless `onRequestOverride` is supplied — see
 * `decision-bar.tsx`).
 */

import * as React from "react"
import { ExternalLink } from "lucide-react"
import type {
  ProposalApplyRequestPayload,
  ProposalChangeOpenPayload,
  ProposalConflictResolvePayload,
  ProposalDeferRequestPayload,
  ProposalHistoryOpenPayload,
  ProposalOverrideSubmitPayload,
  ProposalRefineRequestPayload,
  ProposalRejectRequestPayload,
} from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import type { ProposalSummary } from "../../neoarc-agentic-contracts/proposal"
import type { AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { InlineNotice } from "../foundation/inline-notice"
import { cn } from "../lib/cn"
import { ChangeDiffViewer } from "./change-diff-viewer"
import { ConflictResolutionPanel } from "./conflict-resolution-panel"
import { DecisionBar } from "./decision-bar"
import { DecisionHistory } from "./decision-history"
import { HumanOverrideDialog } from "./human-override-dialog"
import { ProposalStatusBadge } from "./proposal-status-badge"

export interface ProposalViewerProps {
  readonly proposal: ProposalSummary
  readonly onEmitApply?: (event: AgenticUIEvent<ProposalApplyRequestPayload>) => void
  readonly onEmitRefine?: (event: AgenticUIEvent<ProposalRefineRequestPayload>) => void
  readonly onEmitReject?: (event: AgenticUIEvent<ProposalRejectRequestPayload>) => void
  readonly onEmitDefer?: (event: AgenticUIEvent<ProposalDeferRequestPayload>) => void
  readonly onEmitOverrideSubmit?: (event: AgenticUIEvent<ProposalOverrideSubmitPayload>) => void
  readonly onRequestRefine?: () => void
  readonly onEmitChangeOpen?: (event: AgenticUIEvent<ProposalChangeOpenPayload>) => void
  readonly onEmitConflictResolve?: (event: AgenticUIEvent<ProposalConflictResolvePayload>) => void
  readonly onEmitHistoryOpen?: (event: AgenticUIEvent<ProposalHistoryOpenPayload>) => void
  readonly className?: string
}

const policyOutcomeTone = { pass: "success", warning: "warning", violation: "danger" } as const

export function ProposalViewer({
  proposal,
  onEmitApply,
  onEmitRefine,
  onEmitReject,
  onEmitDefer,
  onEmitOverrideSubmit,
  onRequestRefine,
  onEmitChangeOpen,
  onEmitConflictResolve,
  onEmitHistoryOpen,
  className,
}: ProposalViewerProps) {
  const [overrideOpen, setOverrideOpen] = React.useState(false)
  const canOverride = Boolean(proposal.overrideRequirement?.required)

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-[var(--neoarc-color-foreground)]">{proposal.title}</h2>
          <p className="text-sm text-[var(--neoarc-color-foreground-muted)]">{proposal.summary}</p>
        </div>
        <ProposalStatusBadge status={proposal.status} />
      </div>

      {proposal.riskFindings && proposal.riskFindings.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">
            Risk findings
          </span>
          {proposal.riskFindings.map((finding) => (
            <InlineNotice
              key={finding.id}
              tone={finding.level === "low" || finding.level === "none" ? "info" : "warning"}
              title={finding.summary}
            />
          ))}
        </div>
      ) : null}

      {proposal.policyFindings && proposal.policyFindings.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">
            Policy findings
          </span>
          {proposal.policyFindings.map((finding) => (
            <InlineNotice
              key={finding.id}
              tone={policyOutcomeTone[finding.outcome]}
              title={finding.policyName}
              description={finding.summary}
            />
          ))}
        </div>
      ) : null}

      {proposal.conflicts && proposal.conflicts.length > 0 ? (
        <ConflictResolutionPanel
          proposalId={proposal.id}
          conflicts={proposal.conflicts}
          onEmitResolve={onEmitConflictResolve}
        />
      ) : null}

      {proposal.sections.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">
            Changes
          </span>
          <ChangeDiffViewer proposalId={proposal.id} sections={proposal.sections} onEmitChangeOpen={onEmitChangeOpen} />
        </div>
      ) : null}

      {proposal.evidence && proposal.evidence.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">
            Evidence
          </span>
          <ul className="flex flex-col gap-1">
            {proposal.evidence.map((item) => (
              <li key={item.id} className="flex items-center gap-1.5 text-xs text-[var(--neoarc-color-foreground-muted)]">
                <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer" className="underline">
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
                {item.sourceLabel ? <span className="text-[var(--neoarc-color-foreground-subtle)]">— {item.sourceLabel}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {proposal.decisionHistory && proposal.decisionHistory.length > 0 ? (
        <DecisionHistory
          proposalId={proposal.id}
          decisions={proposal.decisionHistory}
          onEmitHistoryOpen={onEmitHistoryOpen}
        />
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
        onRequestOverride={canOverride ? () => setOverrideOpen(true) : undefined}
      />

      {proposal.overrideRequirement ? (
        <HumanOverrideDialog
          proposalId={proposal.id}
          overrideRequirement={proposal.overrideRequirement}
          open={overrideOpen}
          onOpenChange={setOverrideOpen}
          submitting={proposal.pendingAction === "override"}
          onEmitSubmit={onEmitOverrideSubmit}
        />
      ) : null}
    </div>
  )
}
