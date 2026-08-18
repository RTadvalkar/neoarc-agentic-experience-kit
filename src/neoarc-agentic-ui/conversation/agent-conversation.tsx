/**
 * neoarc-agentic-ui / conversation / AgentConversation
 *
 * Purpose: render an ordered `ConversationTimelineItem[]` — the single
 * component that both integration modes converge on (docs/02A §Integration
 * modes): a product adapter may build `ConversationThread.items` directly
 * from its own DTOs, or unwrap `AgenticViewNode<ConversationTimelineItem>.data`
 * from `neoarc-agentic-projection`'s built-in conversation node
 * definitions. Either way, the array handed to this component's `items`
 * prop is exactly the same shape.
 *
 * The `switch (item.kind)` below is a closed, ten-case dispatch owned
 * entirely by this one component for its own ten known item kinds — not
 * the kit-wide "central mega-switch" the architecture rules forbid (that
 * anti-pattern is a single switch spanning unrelated feature-owned node
 * families across the whole kit; registering a new, unrelated node family
 * elsewhere never requires touching this file). `ConversationTimelineItem`
 * itself is a closed union (see conversation.ts) precisely so this
 * dispatch can be exhaustive without a fallback branch.
 *
 * Input model: `items: ConversationTimelineItem[]`.
 *
 * Semantic UI events: forwards every conversation UI event type
 * (`citation.open`, `artifact.open`, `attachment.open`, `handoff.open`,
 * `toolActivity.toggle`, `clarification.submit`,
 * `conversation.stop.request`, `conversation.retry.request`) through the
 * single `onEmitEvent` callback — the product adapter wires up one
 * dispatcher rather than nine separate props.
 */

import * as React from "react"
import type { ConversationTimelineItem } from "../../neoarc-agentic-contracts/conversation"
import type { ConversationUIEventPayload } from "../../neoarc-agentic-contracts/conversation-ui-events"
import type { AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { InlineNotice } from "../foundation/inline-notice"
import { ConversationMessage } from "./conversation-message"
import { ActivitySummaryList } from "./activity-summary-list"
import { ToolActivityDisclosure } from "./tool-activity-disclosure"
import { ClarificationCard } from "./clarification-card"
import { AgentHandoffCard } from "./agent-handoff-card"
import { ArtifactReferenceCard } from "./artifact-reference-card"
import { ConversationEmptyState } from "./conversation-empty-state"
import { cn } from "../lib/cn"

export interface AgentConversationProps {
  readonly items: readonly ConversationTimelineItem[]
  readonly onEmitEvent?: (event: AgenticUIEvent<ConversationUIEventPayload>) => void
  readonly emptyState?: React.ReactNode
  readonly className?: string
}

export function AgentConversation({ items, onEmitEvent, emptyState, className }: AgentConversationProps) {
  if (items.length === 0) {
    return <div className={className}>{emptyState ?? <ConversationEmptyState />}</div>
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} role="log" aria-label="Conversation">
      {items.map((item) => (
        <div key={item.id}>{renderConversationTimelineItem(item, onEmitEvent)}</div>
      ))}
    </div>
  )
}

/**
 * Render a single `ConversationTimelineItem` to the same presentational
 * component `AgentConversation` would use for it. Exported so a per-node
 * `RendererRegistry` adapter (registering each of the ten built-in
 * `conversation.*` kinds — see docs/RENDERER_REGISTRY.md) can render an
 * individual `AgenticViewNode<ConversationTimelineItem>` identically to how
 * `AgentConversation` renders the same item inside a full array, instead of
 * re-implementing this dispatch a second time.
 */
export function renderConversationTimelineItem(
  item: ConversationTimelineItem,
  onEmitEvent: ((event: AgenticUIEvent<ConversationUIEventPayload>) => void) | undefined,
): React.ReactNode {
  switch (item.kind) {
    case "user-message":
    case "agent-message":
      return (
        <ConversationMessage
          message={item.message}
          onEmitCitationEvent={onEmitEvent}
          onEmitAttachmentEvent={onEmitEvent}
          onEmitArtifactEvent={onEmitEvent}
          onEmitStopEvent={onEmitEvent}
          onEmitRetryEvent={onEmitEvent}
        />
      )
    case "activity":
      return <ActivitySummaryList items={[item.activity]} />
    case "tool":
      return <ToolActivityDisclosure tool={item.tool} onEmitEvent={onEmitEvent} />
    case "clarification":
      return <ClarificationCard clarification={item.clarification} onEmitEvent={onEmitEvent} />
    case "handoff":
      return <AgentHandoffCard handoff={item.handoff} onEmitEvent={onEmitEvent} />
    case "artifact":
      return <ArtifactReferenceCard artifact={item.artifact} onEmitEvent={onEmitEvent} />
    case "notice":
      return (
        <InlineNotice
          tone={item.notice.tone}
          title={item.notice.title}
          description={item.notice.description}
        />
      )
    case "error":
      return (
        <InlineNotice
          tone="danger"
          title={item.error.message}
          description={item.error.causeSummary ?? (item.error.retryable ? "This can be retried." : undefined)}
        />
      )
    case "retry":
      return (
        <InlineNotice
          tone="warning"
          title={`Retry attempt ${item.retry.attempt}${item.retry.maxAttempts ? ` of ${item.retry.maxAttempts}` : ""}`}
          description={item.retry.reason}
        />
      )
    default:
      return null
  }
}
