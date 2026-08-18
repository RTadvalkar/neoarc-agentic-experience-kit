/**
 * neoarc-agentic-ui / foundation / LoadingState
 *
 * Purpose: a restrained in-progress indicator with an accessible live
 * region, for panels/lists waiting on a product adapter to supply data.
 *
 * Input model: optional `label` (defaults to "Loading").
 */

import * as React from "react"
import { Spinner } from "../primitives/spinner"
import { cn } from "../lib/cn"

export interface LoadingStateProps {
  readonly label?: string
  readonly className?: string
}

export function LoadingState({ label = "Loading", className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center gap-2 p-8 text-center", className)}
    >
      <Spinner size="md" />
      <p className="text-sm text-[var(--neoarc-color-foreground-muted)]">{label}</p>
    </div>
  )
}
