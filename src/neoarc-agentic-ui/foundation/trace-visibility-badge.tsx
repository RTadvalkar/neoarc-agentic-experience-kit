/**
 * neoarc-agentic-ui / foundation / TraceVisibilityBadge
 *
 * Purpose: display which supplied `TraceAccessLevel` a piece of trace
 * content is scoped to. The kit never enforces access — it only labels what
 * the product/backend adapter has already decided to supply, per
 * docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md §Trace access
 * and redaction.
 *
 * Input model: `level: TraceAccessLevel`.
 */

import * as React from "react"
import { Eye } from "lucide-react"
import type { TraceAccessLevel } from "../../neoarc-agentic-contracts/foundation"
import { Badge } from "../primitives/badge"

const label: Record<TraceAccessLevel, string> = {
  USER: "User visible",
  OPERATOR: "Operator visible",
  DEVELOPER: "Developer visible",
  PLATFORM_ADMIN: "Platform admin visible",
}

export interface TraceVisibilityBadgeProps {
  readonly level: TraceAccessLevel
  readonly className?: string
}

export function TraceVisibilityBadge({ level, className }: TraceVisibilityBadgeProps) {
  return (
    <Badge tone="outline" className={className}>
      <Eye className="size-3" />
      {label[level]}
    </Badge>
  )
}
