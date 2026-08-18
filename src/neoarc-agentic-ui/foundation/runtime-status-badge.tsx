/**
 * neoarc-agentic-ui / foundation / RuntimeStatusBadge
 *
 * Purpose: render a `RuntimeStatus` (used across agents, runs, and tasks in
 * later slices) as a compact badge.
 *
 * Input model: `status: RuntimeStatus`.
 * States: one per `RuntimeStatus` union member.
 */

import * as React from "react"
import { Ban, Check, CircleDashed, Clock, RefreshCw, TriangleAlert, UserRound, X } from "lucide-react"
import type { RuntimeStatus } from "../../neoarc-agentic-contracts/foundation"
import { Badge, type BadgeProps } from "../primitives/badge"

const config: Record<
  RuntimeStatus,
  { label: string; tone: BadgeProps["tone"]; icon: React.ComponentType<{ className?: string }> }
> = {
  idle: { label: "Idle", tone: "neutral", icon: CircleDashed },
  queued: { label: "Queued", tone: "neutral", icon: Clock },
  running: { label: "Running", tone: "info", icon: RefreshCw },
  waiting_for_human: { label: "Waiting for human", tone: "warning", icon: UserRound },
  succeeded: { label: "Succeeded", tone: "success", icon: Check },
  failed: { label: "Failed", tone: "danger", icon: X },
  cancelled: { label: "Cancelled", tone: "neutral", icon: Ban },
  retrying: { label: "Retrying", tone: "warning", icon: TriangleAlert },
}

export interface RuntimeStatusBadgeProps {
  readonly status: RuntimeStatus
  readonly className?: string
}

export function RuntimeStatusBadge({ status, className }: RuntimeStatusBadgeProps) {
  const { label, tone, icon: Icon } = config[status]
  const iconClassName = status === "running" ? "size-3 animate-spin" : "size-3"
  return (
    <Badge tone={tone} className={className}>
      <Icon className={iconClassName} />
      {label}
    </Badge>
  )
}
