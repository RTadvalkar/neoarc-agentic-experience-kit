/**
 * neoarc-agentic-ui / foundation / Timestamp
 *
 * Purpose: render an ISO-8601 timestamp consistently, with an accessible
 * `<time>` element and an optional relative label.
 *
 * Input model: `value: ISOTimestamp`, optional `variant` ("absolute" |
 * "relative"), optional `now` override for deterministic tests/fixtures.
 *
 * States: valid timestamp, invalid/unparseable timestamp (renders the raw
 * string with an accessible note rather than throwing or fabricating a
 * date).
 *
 * Note: "relative" is computed at render time against `now` (defaults to
 * `Date.now()`), so server- and client-rendered relative labels may differ
 * by a few seconds. Pass an explicit `now` in tests/fixtures/replay contexts
 * for determinism.
 */

import * as React from "react"
import type { ISOTimestamp } from "../../neoarc-agentic-contracts/shared"
import { cn } from "../lib/cn"

export interface TimestampProps {
  readonly value: ISOTimestamp
  readonly variant?: "absolute" | "relative"
  readonly now?: number
  readonly className?: string
}

function formatRelative(value: number, now: number): string {
  const deltaMs = now - value
  const deltaSeconds = Math.round(deltaMs / 1000)
  const absSeconds = Math.abs(deltaSeconds)
  const suffix = deltaSeconds >= 0 ? "ago" : "from now"

  if (absSeconds < 5) return "just now"
  if (absSeconds < 60) return `${absSeconds}s ${suffix}`
  const minutes = Math.round(absSeconds / 60)
  if (minutes < 60) return `${minutes}m ${suffix}`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ${suffix}`
  const days = Math.round(hours / 24)
  return `${days}d ${suffix}`
}

export function Timestamp({ value, variant = "absolute", now, className }: TimestampProps) {
  const parsed = new Date(value)
  const isValid = !Number.isNaN(parsed.getTime())

  if (!isValid) {
    return (
      <span className={cn("text-[var(--neoarc-color-foreground-subtle)]", className)}>
        <span className="sr-only">Invalid timestamp: </span>
        {value}
      </span>
    )
  }

  const absoluteLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)

  const displayLabel =
    variant === "relative" ? formatRelative(parsed.getTime(), now ?? Date.now()) : absoluteLabel

  return (
    <time
      dateTime={value}
      title={variant === "relative" ? absoluteLabel : undefined}
      className={cn("text-[var(--neoarc-color-foreground-muted)]", className)}
    >
      {displayLabel}
    </time>
  )
}
