/**
 * neoarc-agentic-ui / foundation / AgentAvatar
 *
 * Purpose: render a human/agent/system/service identity as a compact avatar
 * with an optional lifecycle-status dot. Pure display component — receives
 * everything through controlled props, emits nothing.
 *
 * Input model: displayName (required for initials fallback + accessible
 * name), optional avatarUrl/initials/kind/statusIndicator.
 *
 * States: image loads, image missing (falls back to initials), no initials
 * supplied (falls back to first letter of displayName).
 *
 * Trace visibility: none — this component never renders redacted data.
 */

import * as React from "react"
import type { ActorKind, AgentLifecycleStatus } from "../../neoarc-agentic-contracts/foundation"
import { cn } from "../lib/cn"

export interface AgentAvatarProps {
  readonly displayName: string
  readonly avatarUrl?: string
  readonly initials?: string
  readonly kind?: ActorKind
  readonly statusIndicator?: AgentLifecycleStatus
  readonly size?: "sm" | "md" | "lg"
  readonly className?: string
}

const sizeClasses: Record<NonNullable<AgentAvatarProps["size"]>, string> = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
}

const statusDotColor: Record<AgentLifecycleStatus, string> = {
  idle: "bg-[var(--neoarc-color-foreground-subtle)]",
  active: "bg-[var(--neoarc-color-success)]",
  waiting_for_human: "bg-[var(--neoarc-color-warning)]",
  degraded: "bg-[var(--neoarc-color-warning)]",
  unavailable: "bg-[var(--neoarc-color-danger)]",
}

function computeInitials(displayName: string, initials?: string): string {
  if (initials) return initials.slice(0, 2).toUpperCase()
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function AgentAvatar({
  displayName,
  avatarUrl,
  initials,
  kind = "agent",
  statusIndicator,
  size = "md",
  className,
}: AgentAvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false)
  const showImage = avatarUrl && !imageFailed

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-[var(--neoarc-radius-full)] border font-medium",
          "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-muted)] text-[var(--neoarc-color-foreground-muted)]",
          sizeClasses[size],
        )}
        role="img"
        aria-label={`${displayName}${kind === "agent" ? " (agent)" : ""}`}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- reusable kit code must not depend on next/image
          <img
            src={avatarUrl}
            alt=""
            className="size-full object-cover"
            crossOrigin="anonymous"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span aria-hidden="true">{computeInitials(displayName, initials)}</span>
        )}
      </span>
      {statusIndicator ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-[var(--neoarc-color-surface)]",
            statusDotColor[statusIndicator],
          )}
        />
      ) : null}
    </span>
  )
}
