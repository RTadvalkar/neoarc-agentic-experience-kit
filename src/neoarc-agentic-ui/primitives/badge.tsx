/**
 * neoarc-agentic-ui / primitives / Badge
 *
 * NeoArc-owned adapted primitive (Correction 2). Consumed by the foundation
 * component family (AgentStatusBadge, RuntimeStatusBadge, CapabilityBadge,
 * RiskBadge, TraceVisibilityBadge, ...). Not the shadcn `components/ui/badge`
 * — this package does not depend on the showcase app's primitive layer.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--neoarc-radius-full)] border px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral:
          "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-muted)] text-[var(--neoarc-color-foreground-muted)]",
        accent:
          "border-transparent bg-[var(--neoarc-color-accent-muted)] text-[var(--neoarc-color-accent)]",
        success:
          "border-transparent bg-[var(--neoarc-color-success-muted)] text-[var(--neoarc-color-success)]",
        warning:
          "border-transparent bg-[var(--neoarc-color-warning-muted)] text-[var(--neoarc-color-warning)]",
        danger:
          "border-transparent bg-[var(--neoarc-color-danger-muted)] text-[var(--neoarc-color-danger)]",
        info: "border-transparent bg-[var(--neoarc-color-info-muted)] text-[var(--neoarc-color-info)]",
        outline: "border-[var(--neoarc-color-border-strong)] bg-transparent text-[var(--neoarc-color-foreground)]",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
