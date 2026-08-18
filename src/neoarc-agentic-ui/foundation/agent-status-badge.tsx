/**
 * neoarc-agentic-ui / foundation / AgentStatusBadge
 *
 * Purpose: render an `AgentLifecycleStatus` as a compact, honest badge. This
 * is distinct from `RuntimeStatusBadge`, which reflects a run/task's
 * execution status rather than an agent's overall lifecycle.
 *
 * Input model: `status: AgentLifecycleStatus`.
 * States: one badge per lifecycle status value; no "unknown" fallback is
 * needed because the type is a closed union supplied by the adapter.
 */

import * as React from "react"
import { Circle, CircleDot, CircleOff, TriangleAlert, UserRound } from "lucide-react"
import type { AgentLifecycleStatus } from "../../neoarc-agentic-contracts/foundation"
import { Badge, type BadgeProps } from "../primitives/badge"

const config: Record<
  AgentLifecycleStatus,
  { label: string; tone: BadgeProps["tone"]; icon: React.ComponentType<{ className?: string }> }
> = {
  idle: { label: "Idle", tone: "neutral", icon: Circle },
  active: { label: "Active", tone: "success", icon: CircleDot },
  waiting_for_human: { label: "Waiting for human", tone: "warning", icon: UserRound },
  degraded: { label: "Degraded", tone: "warning", icon: TriangleAlert },
  unavailable: { label: "Unavailable", tone: "danger", icon: CircleOff },
}

export interface AgentStatusBadgeProps {
  readonly status: AgentLifecycleStatus
  readonly className?: string
}

export function AgentStatusBadge({ status, className }: AgentStatusBadgeProps) {
  const { label, tone, icon: Icon } = config[status]
  return (
    <Badge tone={tone} className={className}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
