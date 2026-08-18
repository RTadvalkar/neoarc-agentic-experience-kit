/**
 * neoarc-agentic-ui / primitives / Spinner
 *
 * NeoArc-owned adapted primitive. Restrained motion per
 * docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md — a single
 * rotating stroke, no decorative bounce/pulse.
 */

import * as React from "react"
import { cn } from "../lib/cn"

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "sm" | "md" | "lg"
}

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, number> = {
  sm: 14,
  md: 18,
  lg: 24,
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  const dimension = sizeMap[size]
  return (
    <svg
      role="status"
      aria-label="Loading"
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin text-[var(--neoarc-color-foreground-subtle)]", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
