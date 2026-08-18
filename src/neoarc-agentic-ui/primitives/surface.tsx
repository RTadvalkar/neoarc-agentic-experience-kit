/**
 * neoarc-agentic-ui / primitives / Surface
 *
 * NeoArc-owned adapted primitive. A themed container used as the base for
 * cards, panels, empty/loading states, and other foundation components.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"

export const surfaceVariants = cva("rounded-[var(--neoarc-radius-lg)] border", {
  variants: {
    variant: {
      base: "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)]",
      muted: "border-[var(--neoarc-color-border-muted)] bg-[var(--neoarc-color-surface-muted)]",
      raised:
        "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-raised)] shadow-[var(--neoarc-elevation-2)]",
    },
  },
  defaultVariants: {
    variant: "base",
  },
})

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(surfaceVariants({ variant }), className)} {...props} />
  ),
)
Surface.displayName = "Surface"
