"use client"

/**
 * components/showcase/execution-lab/activity-node-renderer
 *
 * SHOWCASE-ONLY. The React renderer registered against the built-in
 * `activity.entry` (target, kind) pair in `executionLabRendererRegistry`
 * (lib/showcase/registry-bootstrap.ts). Wraps the single `ActivitySummary`
 * in `ActivitySummaryList` — the exact same component `AgentConversation`
 * uses for the `conversation.activity` kind — rather than declaring a
 * second "how to render an ActivitySummary" component.
 */

import type { AgenticViewNode } from "../../../src/neoarc-agentic-projection/types"
import type { ActivitySummary } from "../../../src/neoarc-agentic-contracts/conversation"
import { ActivitySummaryList } from "../../../src/neoarc-agentic-ui/conversation/activity-summary-list"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"

export interface ActivityNodeRendererProps {
  readonly node: AgenticViewNode
  readonly onSelect?: (node: AgenticViewNode) => void
  readonly selected?: boolean
}

function isActivitySummary(value: unknown): value is ActivitySummary {
  return typeof value === "object" && value !== null && "label" in value && "status" in value
}

export function ActivityNodeRenderer({ node, onSelect, selected }: ActivityNodeRendererProps) {
  const summary = isActivitySummary(node.data) ? node.data : undefined

  return (
    <Surface variant={selected ? "raised" : "base"} className="flex w-full flex-col gap-2 p-3">
      <button type="button" onClick={() => onSelect?.(node)} className="flex w-full items-center justify-between gap-2 text-left" aria-pressed={selected}>
        <Badge tone="outline">{node.kind}</Badge>
      </button>
      {summary ? (
        <ActivitySummaryList items={[summary]} />
      ) : (
        <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
          Unrecognized activity node payload for key {node.key}.
        </span>
      )}
    </Surface>
  )
}
