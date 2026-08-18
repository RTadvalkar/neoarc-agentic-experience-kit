"use client"

import { AgentAvatar } from "../foundation/agent-avatar"
import type { ActorSummary } from "../../neoarc-agentic-contracts/foundation"

/**
 * A compact "who did this" line for the Trace view, composing the
 * existing `AgentAvatar` primitive for `ActorSummary` — deliberately not
 * `AgentIdentity`, which expects the richer `AgentSummary` shape (with
 * `lifecycleStatus`/`description`) that Trace events don't carry. Kept as
 * its own small component rather than duplicating `AgentAvatar`'s markup.
 */
export function TraceActor({ actor }: { readonly actor: ActorSummary }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <AgentAvatar displayName={actor.displayName} avatarUrl={actor.avatarUrl} initials={actor.initials} kind={actor.kind} size="sm" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-[var(--neoarc-color-foreground)]">{actor.displayName}</span>
        {actor.secondaryLabel ? (
          <span className="truncate text-xs text-[var(--neoarc-color-foreground-muted)]">{actor.secondaryLabel}</span>
        ) : null}
      </div>
    </div>
  )
}
