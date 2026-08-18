"use client"

/**
 * components/showcase/execution-lab/conversation-node-renderer
 *
 * SHOWCASE-ONLY. The React renderer registered against every built-in
 * `conversation.*` (target, kind) pair in `executionLabRendererRegistry`
 * (lib/showcase/registry-bootstrap.ts). It does exactly what a product
 * integration would do: unwrap `AgenticViewNode<ConversationTimelineItem>.data`
 * and hand it to `renderConversationTimelineItem` — the very same function
 * `AgentConversation` itself uses — wrapped in a selectable Surface so the
 * Execution Lab's node-selection/inspector wiring still works uniformly
 * across every registered renderer.
 */

import type { AgenticViewNode } from "../../../src/neoarc-agentic-projection/types"
import type { ConversationTimelineItem } from "../../../src/neoarc-agentic-contracts/conversation"
import type { ConversationUIEventPayload } from "../../../src/neoarc-agentic-contracts/conversation-ui-events"
import type { AgenticUIEvent } from "../../../src/neoarc-agentic-contracts/ui-events"
import { renderConversationTimelineItem } from "../../../src/neoarc-agentic-ui/conversation/agent-conversation"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"

export interface ConversationNodeRendererProps {
  readonly node: AgenticViewNode
  readonly onSelect?: (node: AgenticViewNode) => void
  readonly selected?: boolean
  readonly onEmitConversationEvent?: (event: AgenticUIEvent<ConversationUIEventPayload>) => void
}

function isConversationTimelineItem(value: unknown): value is ConversationTimelineItem {
  return typeof value === "object" && value !== null && "kind" in value && "id" in value
}

export function ConversationNodeRenderer({ node, onSelect, selected, onEmitConversationEvent }: ConversationNodeRendererProps) {
  const item = isConversationTimelineItem(node.data) ? node.data : undefined

  return (
    <Surface variant={selected ? "raised" : "base"} className="flex w-full flex-col gap-2 p-3">
      <button
        type="button"
        onClick={() => onSelect?.(node)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-pressed={selected}
      >
        <Badge tone="outline">{node.kind}</Badge>
      </button>
      {item ? (
        renderConversationTimelineItem(item, onEmitConversationEvent)
      ) : (
        <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
          Unrecognized conversation node payload for key {node.key}.
        </span>
      )}
    </Surface>
  )
}
