/**
 * neoarc-agentic-ui / foundation / AgentIdentity
 *
 * Purpose: compose `AgentAvatar` with name/description/status into the
 * standard "who is this" identity block reused across conversation,
 * runtime, and trace surfaces in later slices.
 *
 * Input model: `agent: AgentSummary`, optional `showStatus`, `size`.
 */

import * as React from "react"
import type { AgentSummary } from "../../neoarc-agentic-contracts/foundation"
import { AgentAvatar } from "./agent-avatar"
import { AgentStatusBadge } from "./agent-status-badge"
import { cn } from "../lib/cn"

export interface AgentIdentityProps {
  readonly agent: AgentSummary
  readonly showStatus?: boolean
  readonly size?: "sm" | "md" | "lg"
  readonly className?: string
}

export function AgentIdentity({ agent, showStatus = true, size = "md", className }: AgentIdentityProps) {
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <AgentAvatar
        displayName={agent.displayName}
        avatarUrl={agent.avatarUrl}
        initials={agent.initials}
        kind="agent"
        size={size}
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-[var(--neoarc-color-foreground)]">
          {agent.displayName}
        </span>
        {agent.description ? (
          <span className="truncate text-xs text-[var(--neoarc-color-foreground-muted)]">
            {agent.description}
          </span>
        ) : null}
      </div>
      {showStatus ? <AgentStatusBadge status={agent.lifecycleStatus} /> : null}
    </div>
  )
}
