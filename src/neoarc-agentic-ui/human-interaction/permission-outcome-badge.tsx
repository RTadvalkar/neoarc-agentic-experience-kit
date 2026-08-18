/**
 * neoarc-agentic-ui / human-interaction / PermissionOutcomeBadge
 *
 * Purpose: render a supplied, resolved `ExecutionPermissionOutcome` — never
 * inferred, never shown before the product adapter has actually supplied
 * it. Distinct from `PermissionBlockedState` (a static "you can never do
 * this" state) and from `RiskBadge` (a risk classification, not an
 * outcome).
 *
 * Input model: `outcome: ExecutionPermissionOutcome`.
 */

import * as React from "react"
import { Ban, CircleSlash2, Clock, ShieldCheck } from "lucide-react"
import type { ExecutionPermissionOutcome } from "../../neoarc-agentic-contracts/human-interaction"
import { Badge, type BadgeProps } from "../primitives/badge"

const config: Record<
  ExecutionPermissionOutcome,
  { label: string; tone: BadgeProps["tone"]; icon: React.ComponentType<{ className?: string }> }
> = {
  allowed_once: { label: "Allowed once", tone: "success", icon: ShieldCheck },
  rejected: { label: "Rejected", tone: "danger", icon: Ban },
  cancelled: { label: "Cancelled", tone: "neutral", icon: CircleSlash2 },
  unavailable: { label: "Unavailable", tone: "warning", icon: Clock },
}

export interface PermissionOutcomeBadgeProps {
  readonly outcome: ExecutionPermissionOutcome
  readonly className?: string
}

export function PermissionOutcomeBadge({ outcome, className }: PermissionOutcomeBadgeProps) {
  const { label, tone, icon: Icon } = config[outcome]
  return (
    <Badge tone={tone} className={className}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
