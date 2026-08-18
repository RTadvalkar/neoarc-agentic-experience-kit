/**
 * neoarc-agentic-ui / foundation / CapabilityBadge
 *
 * Purpose: render one supplied agent capability (e.g. "code-review",
 * "web-search") as a neutral, non-judgmental badge. The kit never infers or
 * ranks capabilities — it only displays what the adapter supplies.
 *
 * Input model: `capability: string`, optional `icon` override.
 */

import * as React from "react"
import { Sparkles } from "lucide-react"
import { Badge } from "../primitives/badge"

export interface CapabilityBadgeProps {
  readonly capability: string
  readonly icon?: React.ComponentType<{ className?: string }>
  readonly className?: string
}

export function CapabilityBadge({ capability, icon: Icon = Sparkles, className }: CapabilityBadgeProps) {
  return (
    <Badge tone="outline" className={className}>
      <Icon className="size-3" />
      {capability}
    </Badge>
  )
}
