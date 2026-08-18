/**
 * neoarc-agentic-ui / conversation / AgentHandoffCard
 *
 * Purpose: render a supplied agent-to-agent `HandoffSummary` — who handed
 * off to whom, why (if supplied), and current status. Never infers a
 * reason or fabricates the receiving agent.
 *
 * Semantic UI events: emits `"handoff.open"` (`HandoffOpenPayload`) when
 * the user opens handoff detail.
 */

import * as React from "react"
import { ArrowRight } from "lucide-react"
import type { HandoffSummary } from "../../neoarc-agentic-contracts/conversation"
import type { HandoffOpenPayload } from "../../neoarc-agentic-contracts/conversation-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { AgentAvatar } from "../foundation/agent-avatar"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { Surface } from "../primitives/surface"
import { cn } from "../lib/cn"

export interface AgentHandoffCardProps {
  readonly handoff: HandoffSummary
  readonly onEmitEvent?: (event: AgenticUIEvent<HandoffOpenPayload>) => void
  readonly className?: string
}

export function AgentHandoffCard({ handoff, onEmitEvent, className }: AgentHandoffCardProps) {
  return (
    <Surface variant="muted" className={cn("w-full", className)}>
      <button
        type="button"
        onClick={() =>
          onEmitEvent?.(
            createUIEvent({
              type: "handoff.open",
              sourceComponent: "AgentHandoffCard",
              payload: { handoffId: handoff.id },
            }),
          )
        }
        className="flex w-full flex-col gap-2 rounded-[var(--neoarc-radius-lg)] p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
      >
        <div className="flex items-center gap-2">
          <AgentAvatar displayName={handoff.fromAgent.displayName} avatarUrl={handoff.fromAgent.avatarUrl} initials={handoff.fromAgent.initials} size="sm" />
          <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-[var(--neoarc-color-foreground-subtle)]" />
          <AgentAvatar displayName={handoff.toAgent.displayName} avatarUrl={handoff.toAgent.avatarUrl} initials={handoff.toAgent.initials} size="sm" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--neoarc-color-foreground)]">
            {handoff.fromAgent.displayName} → {handoff.toAgent.displayName}
          </span>
          <RuntimeStatusBadge status={handoff.status} />
        </div>
        {handoff.reason ? (
          <p className="text-xs text-[var(--neoarc-color-foreground-muted)]">{handoff.reason}</p>
        ) : null}
      </button>
    </Surface>
  )
}
