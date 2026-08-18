/**
 * neoarc-agentic-ui / foundation / RiskBadge
 *
 * Purpose: render a supplied `RiskLevel` without ever computing or
 * inferring risk itself — the value always comes from a product/backend
 * adapter (e.g. a policy engine), per docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md.
 *
 * Input model: `level: RiskLevel`.
 */

import * as React from "react"
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react"
import type { RiskLevel } from "../../neoarc-agentic-contracts/foundation"
import { Badge, type BadgeProps } from "../primitives/badge"

const config: Record<
  RiskLevel,
  { label: string; tone: BadgeProps["tone"]; icon: React.ComponentType<{ className?: string }> }
> = {
  none: { label: "No known risk", tone: "success", icon: ShieldCheck },
  low: { label: "Low risk", tone: "success", icon: ShieldCheck },
  medium: { label: "Medium risk", tone: "warning", icon: ShieldQuestion },
  high: { label: "High risk", tone: "danger", icon: ShieldAlert },
  critical: { label: "Critical risk", tone: "danger", icon: ShieldAlert },
}

export interface RiskBadgeProps {
  readonly level: RiskLevel
  readonly className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const { label, tone, icon: Icon } = config[level]
  return (
    <Badge tone={tone} className={className}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
