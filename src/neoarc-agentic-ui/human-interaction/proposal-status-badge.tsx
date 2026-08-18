/**
 * neoarc-agentic-ui / human-interaction / ProposalStatusBadge
 *
 * Purpose: render a proposal's supplied `ProposalStatus` — a coarse
 * lifecycle label, never a decision outcome (that is `DecisionAction`,
 * shown instead via `DecisionHistory`/`ProposalStatusTimeline` entries).
 *
 * Input model: `status: ProposalStatus`.
 */

import * as React from "react"
import { CheckCircle2, Clock, FileEdit, GitPullRequestArrow, ShieldAlert, ShieldOff, XCircle } from "lucide-react"
import type { ProposalStatus } from "../../neoarc-agentic-contracts/proposal"
import { Badge, type BadgeProps } from "../primitives/badge"

const config: Record<
  ProposalStatus,
  { label: string; tone: BadgeProps["tone"]; icon: React.ComponentType<{ className?: string }> }
> = {
  draft: { label: "Draft", tone: "neutral", icon: FileEdit },
  ready_for_review: { label: "Ready for review", tone: "info", icon: GitPullRequestArrow },
  stale: { label: "Stale", tone: "warning", icon: Clock },
  conflicted: { label: "Conflicted", tone: "danger", icon: ShieldAlert },
  decision_pending: { label: "Decision pending", tone: "info", icon: Clock },
  approved: { label: "Approved", tone: "success", icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "danger", icon: XCircle },
  deferred: { label: "Deferred", tone: "neutral", icon: Clock },
  overridden: { label: "Overridden", tone: "warning", icon: ShieldOff },
}

export interface ProposalStatusBadgeProps {
  readonly status: ProposalStatus
  readonly className?: string
}

export function ProposalStatusBadge({ status, className }: ProposalStatusBadgeProps) {
  const { label, tone, icon: Icon } = config[status]
  return (
    <Badge tone={tone} className={className}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
