/**
 * neoarc-agentic-ui / human-interaction / DecisionBar
 *
 * Purpose: render the set of currently-available `DecisionAction`s for one
 * proposal, driven entirely by the supplied `decisionPermissions` — never
 * a hardcoded five-button row. An action absent from
 * `decisionPermissions`, or present with `available: false`, never renders
 * as a clickable control; `reason`/`label` overrides are honored when
 * supplied. `refine` and `override` open dedicated flows (a note prompt
 * and `HumanOverrideDialog` respectively) rather than firing immediately,
 * since both require additional human input before the intent is
 * complete.
 *
 * Semantic UI events: `proposal.apply.request`, `proposal.refine.request`,
 * `proposal.reject.request`, `proposal.defer.request`. `override` does not
 * emit directly from this component — see `onRequestOverride`.
 */

import * as React from "react"
import { Check, Clock3, PencilLine, ShieldAlert, X } from "lucide-react"
import type { DecisionAction, DecisionPermission, ProposalSummary } from "../../neoarc-agentic-contracts/proposal"
import type {
  ProposalApplyRequestPayload,
  ProposalDeferRequestPayload,
  ProposalRefineRequestPayload,
  ProposalRejectRequestPayload,
} from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { Spinner } from "../primitives/spinner"
import { cn } from "../lib/cn"
import { resolveVisibleDecisionPermissions } from "./human-interaction-logic"

export interface DecisionBarProps {
  readonly proposalId: ProposalSummary["id"]
  readonly decisionPermissions: readonly DecisionPermission[]
  readonly pendingAction?: DecisionAction
  readonly onEmitApply?: (event: AgenticUIEvent<ProposalApplyRequestPayload>) => void
  readonly onEmitRefine?: (event: AgenticUIEvent<ProposalRefineRequestPayload>) => void
  readonly onEmitReject?: (event: AgenticUIEvent<ProposalRejectRequestPayload>) => void
  readonly onEmitDefer?: (event: AgenticUIEvent<ProposalDeferRequestPayload>) => void
  /** Opens the refine note prompt. Omit to disable the refine action's input step entirely (it will still render disabled if unavailable). */
  readonly onRequestRefine?: () => void
  /** Opens `HumanOverrideDialog`. `DecisionBar` never renders an override button itself unless this is supplied. */
  readonly onRequestOverride?: () => void
  readonly className?: string
}

const actionMeta: Record<
  DecisionAction,
  { defaultLabel: string; icon: React.ComponentType<{ className?: string }>; tone: "primary" | "neutral" | "danger" }
> = {
  approve: { defaultLabel: "Approve", icon: Check, tone: "primary" },
  refine: { defaultLabel: "Refine", icon: PencilLine, tone: "neutral" },
  reject: { defaultLabel: "Reject", icon: X, tone: "danger" },
  defer: { defaultLabel: "Defer", icon: Clock3, tone: "neutral" },
  override: { defaultLabel: "Override", icon: ShieldAlert, tone: "danger" },
}

const buttonBase = cn(
  "inline-flex items-center gap-1.5 rounded-[var(--neoarc-radius-md)] border px-3 py-1.5 text-xs font-medium",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
)

const toneClasses: Record<"primary" | "neutral" | "danger", string> = {
  primary: "border-transparent bg-[var(--neoarc-color-accent)] text-[var(--neoarc-color-accent-foreground)]",
  neutral: "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground)]",
  danger: "border-[var(--neoarc-color-danger)] bg-transparent text-[var(--neoarc-color-danger)]",
}

export function DecisionBar({
  proposalId,
  decisionPermissions,
  pendingAction,
  onEmitApply,
  onEmitRefine,
  onEmitReject,
  onEmitDefer,
  onRequestRefine,
  onRequestOverride,
  className,
}: DecisionBarProps) {
  const submitting = pendingAction !== undefined

  function handleClick(action: DecisionAction) {
    if (action === "refine") {
      if (onRequestRefine) {
        onRequestRefine()
      } else {
        onEmitRefine?.(
          createUIEvent({
            type: "proposal.refine.request",
            sourceComponent: "DecisionBar",
            payload: { proposalId },
          }),
        )
      }
      return
    }
    if (action === "override") {
      onRequestOverride?.()
      return
    }
    if (action === "approve") {
      onEmitApply?.(
        createUIEvent({
          type: "proposal.apply.request",
          sourceComponent: "DecisionBar",
          payload: { proposalId },
        }),
      )
      return
    }
    if (action === "reject") {
      onEmitReject?.(
        createUIEvent({
          type: "proposal.reject.request",
          sourceComponent: "DecisionBar",
          payload: { proposalId },
        }),
      )
      return
    }
    onEmitDefer?.(
      createUIEvent({
        type: "proposal.defer.request",
        sourceComponent: "DecisionBar",
        payload: { proposalId },
      }),
    )
  }

  const visiblePermissions = resolveVisibleDecisionPermissions(decisionPermissions, Boolean(onRequestOverride))

  if (visiblePermissions.length === 0) {
    return null
  }

  return (
    <div role="group" aria-label="Proposal decision" className={cn("flex flex-wrap items-center gap-2", className)}>
      {visiblePermissions.map((permission) => {
        const meta = actionMeta[permission.action]
        const Icon = meta.icon
        const isThisPending = pendingAction === permission.action
        return (
          <button
            key={permission.action}
            type="button"
            disabled={!permission.available || submitting}
            title={!permission.available ? permission.reason : undefined}
            onClick={() => handleClick(permission.action)}
            className={cn(buttonBase, toneClasses[meta.tone])}
          >
            {isThisPending ? <Spinner size="sm" /> : <Icon className="size-3.5" />}
            {permission.label ?? meta.defaultLabel}
          </button>
        )
      })}
      {submitting ? (
        <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">Awaiting confirmation…</span>
      ) : null}
    </div>
  )
}
