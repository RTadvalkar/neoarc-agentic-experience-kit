/**
 * neoarc-agentic-ui / human-interaction / PermissionReason
 *
 * Purpose: render the "why" behind an execution-permission request or its
 * resolution — a supplied consequence summary, or a supplied
 * `unavailableReason` — as a calm, explicit line. Never fabricates a
 * consequence when the product adapter did not supply one; renders nothing
 * rather than guessing.
 *
 * Input model: `text?: string`, optional `tone` (defaults to neutral
 * "consequence" framing; pass `"unavailable"` for an honest blocked-reason
 * framing).
 */

import * as React from "react"
import { Info, TriangleAlert } from "lucide-react"
import { cn } from "../lib/cn"

export interface PermissionReasonProps {
  readonly text?: string
  readonly tone?: "consequence" | "unavailable"
  readonly className?: string
}

export function PermissionReason({ text, tone = "consequence", className }: PermissionReasonProps) {
  if (!text) return null

  const Icon = tone === "unavailable" ? TriangleAlert : Info
  const colorClass =
    tone === "unavailable" ? "text-[var(--neoarc-color-warning)]" : "text-[var(--neoarc-color-foreground-subtle)]"

  return (
    <p className={cn("flex items-start gap-1.5 text-sm leading-relaxed text-[var(--neoarc-color-foreground-muted)]", className)}>
      <Icon aria-hidden="true" className={cn("mt-0.5 size-3.5 shrink-0", colorClass)} />
      <span>{text}</span>
    </p>
  )
}
