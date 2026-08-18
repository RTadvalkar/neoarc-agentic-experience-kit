/**
 * neoarc-agentic-ui / runtime / RunStatusBadge
 *
 * Purpose: render the richer, run-specific `RunStatus` vocabulary
 * (`runtime.ts`) — deliberately a sibling of `RuntimeStatusBadge`
 * (foundation), never a replacement for it. `RuntimeStatus` stays the
 * coarse status shared by agents/runs/tasks; `RunStatus` adds the
 * transitional states (`starting`, `cancel_requested`) only a run needs.
 *
 * Input model: `status: RunStatus`.
 */

import * as React from "react"
import { Ban, Check, CircleDashed, Clock, LoaderCircle, Pause, RefreshCw, X } from "lucide-react"
import type { RunStatus } from "../../neoarc-agentic-contracts/runtime"
import { Badge, type BadgeProps } from "../primitives/badge"

const config: Record<
  RunStatus,
  { label: string; tone: BadgeProps["tone"]; icon: React.ComponentType<{ className?: string }> }
> = {
  queued: { label: "Queued", tone: "neutral", icon: Clock },
  starting: { label: "Starting", tone: "info", icon: LoaderCircle },
  running: { label: "Running", tone: "info", icon: RefreshCw },
  waiting_for_human: { label: "Waiting for human", tone: "warning", icon: Clock },
  paused: { label: "Paused", tone: "neutral", icon: Pause },
  completed: { label: "Completed", tone: "success", icon: Check },
  failed: { label: "Failed", tone: "danger", icon: X },
  cancel_requested: { label: "Cancellation requested", tone: "warning", icon: Ban },
  cancelled: { label: "Cancelled", tone: "neutral", icon: Ban },
}

export interface RunStatusBadgeProps {
  readonly status: RunStatus
  readonly className?: string
}

export function RunStatusBadge({ status, className }: RunStatusBadgeProps) {
  const { label, tone, icon: Icon } = config[status]
  const spinning = status === "running" || status === "starting"
  return (
    <Badge tone={tone} className={className}>
      <Icon className={spinning ? "size-3 animate-spin" : "size-3"} />
      {label}
    </Badge>
  )
}

export { config as runStatusBadgeConfig }
