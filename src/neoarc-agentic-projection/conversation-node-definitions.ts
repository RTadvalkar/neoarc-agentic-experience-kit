/**
 * neoarc-agentic-projection / conversation-node-definitions
 *
 * Slice 2 built-in `AgenticNodeDefinition`s for the ten conversation node
 * kinds (docs/04_CONVERSATION_PROJECTION_REPLAY.prompt.md §2). Kit-provided,
 * per docs/INTEGRATION_GUIDE.md's responsibility table ("Projecting envelope
 * → AgenticViewNode: AgenticNodeDefinition (kit-provided for built-in kinds
 * from Slice 2 forward...)"). A product never has to write its own
 * projector for these ten categories; it only supplies
 * `AgenticEventEnvelope`s shaped like `conversation-events.ts`.
 *
 * Every definition here is stateful in the sense that matters: message and
 * tool activity accumulate across multiple events for the same business
 * key (`messageId`/`tool.id`/...), but each individual `project()` call
 * stays pure — it derives the next node purely from the incoming event and
 * `context.findExistingNode(key)`, never from a hidden module-level store.
 * The actual mutable store lives in `projection-store.ts`; these
 * definitions are the recipe, not the state.
 *
 * `node.kind` uses the fully-namespaced `"conversation.<item-kind>"` string
 * (matching docs/04 §2 literally); `node.target` is always `"conversation"`.
 * `node.key` is always a stable business id, never derived from event id or
 * array position, so live-append and full replay converge — see
 * `projection-store.ts` and its test file for the proof.
 */

import type { AgenticEventEnvelope } from "../neoarc-agentic-contracts/events"
import type {
  ConversationActivityUpdatedPayload,
  ConversationArtifactProducedPayload,
  ConversationClarificationRequestedPayload,
  ConversationClarificationResolvedPayload,
  ConversationErrorRecordedPayload,
  ConversationHandoffCompletedPayload,
  ConversationHandoffRequestedPayload,
  ConversationMessageCompletedPayload,
  ConversationMessageCreatedPayload,
  ConversationMessageDeltaPayload,
  ConversationNoticePostedPayload,
  ConversationRetryScheduledPayload,
  ConversationToolCompletedPayload,
  ConversationToolStartedPayload,
  ConversationToolUpdatedPayload,
} from "../neoarc-agentic-contracts/conversation-events"
import type {
  ConversationAgentMessageItem,
  ConversationArtifactItem,
  ConversationClarificationItem,
  ConversationErrorItem,
  ConversationHandoffItem,
  ConversationMessage,
  ConversationNoticeItem,
  ConversationRetryItem,
  ConversationTimelineItem,
  ConversationToolItem,
  ConversationUserMessageItem,
  MessageContentBlock,
} from "../neoarc-agentic-contracts/conversation"
import type { AgenticNodeDefinition, AgenticViewNode, MatchResult } from "./types"

const TARGET = "conversation" as const

function keyFor(prefix: string, id: string): string {
  return `conversation:${prefix}:${id}`
}

function nodeOf(
  key: string,
  kind: string,
  data: ConversationTimelineItem,
  event: AgenticEventEnvelope,
): AgenticViewNode<ConversationTimelineItem> {
  return { key, kind, target: TARGET, data, visibility: "visible", correlation: event.correlation }
}

function mergeContent(
  existing: readonly MessageContentBlock[],
  delta: MessageContentBlock,
): readonly MessageContentBlock[] {
  const last = existing[existing.length - 1]
  if (last && last.kind === delta.kind && delta.kind === "text" && last.kind === "text") {
    return [...existing.slice(0, -1), { kind: "text", text: last.text + delta.text }]
  }
  if (last && last.kind === delta.kind && delta.kind === "markdown" && last.kind === "markdown") {
    return [...existing.slice(0, -1), { kind: "markdown", markdown: last.markdown + delta.markdown }]
  }
  return [...existing, delta]
}

/**
 * `conversation.user-message` / `conversation.agent-message` — one
 * definition matches all three message lifecycle events and routes to the
 * human or agent kind based on `author.kind` at creation time (the author
 * of a message never changes across its own lifecycle).
 */
export const conversationMessageNodeDefinition: AgenticNodeDefinition<unknown, ConversationTimelineItem> = {
  kind: "conversation.message",
  target: TARGET,
  publicationCadence: "animation-frame",
  match(event): MatchResult {
    if (event.type === "conversation.message.created") return { matched: true, kind: "conversation.user-message", target: TARGET }
    if (event.type === "conversation.message.delta" || event.type === "conversation.message.completed") {
      return { matched: true, kind: "conversation.message", target: TARGET }
    }
    return { matched: false }
  },
  project(event, context) {
    const key = keyFor("message", (event.payload as { messageId: string }).messageId)
    const existing = context.findExistingNode?.(key) as AgenticViewNode<ConversationTimelineItem> | undefined
    const existingMessage =
      existing && (existing.data.kind === "user-message" || existing.data.kind === "agent-message")
        ? existing.data.message
        : undefined

    if (event.type === "conversation.message.created") {
      const payload = event.payload as ConversationMessageCreatedPayload
      const message: ConversationMessage = {
        id: payload.messageId,
        author: payload.author,
        createdAt: event.occurredAt,
        content: payload.initialContent ?? [],
        streaming: true,
        status: "running",
        correlation: event.correlation,
      }
      const kind: ConversationTimelineItem["kind"] = payload.author.kind === "human" ? "user-message" : "agent-message"
      const item: ConversationUserMessageItem | ConversationAgentMessageItem =
        kind === "user-message"
          ? { kind: "user-message", id: payload.messageId, createdAt: event.occurredAt, correlation: event.correlation, message }
          : { kind: "agent-message", id: payload.messageId, createdAt: event.occurredAt, correlation: event.correlation, message }
      return nodeOf(key, `conversation.${kind}`, item, event)
    }

    if (event.type === "conversation.message.delta") {
      const payload = event.payload as ConversationMessageDeltaPayload
      if (!existingMessage || !existing) {
        // Delta arrived without a prior "created" — still project something
        // honest rather than dropping the event.
        const message: ConversationMessage = {
          id: payload.messageId,
          author: { id: "unknown", kind: "agent", displayName: "Agent" },
          createdAt: event.occurredAt,
          content: [payload.delta],
          streaming: true,
          status: "running",
        }
        const item: ConversationAgentMessageItem = {
          kind: "agent-message",
          id: payload.messageId,
          createdAt: event.occurredAt,
          correlation: event.correlation,
          message,
        }
        return nodeOf(key, "conversation.agent-message", item, event)
      }
      const message: ConversationMessage = {
        ...existingMessage,
        content: mergeContent(existingMessage.content, payload.delta),
      }
      const item = { ...existing.data, message } as ConversationTimelineItem
      return nodeOf(key, existing.kind, item, event)
    }

    // conversation.message.completed
    const payload = event.payload as ConversationMessageCompletedPayload
    const baseMessage: ConversationMessage = existingMessage ?? {
      id: payload.messageId,
      author: { id: "unknown", kind: "agent", displayName: "Agent" },
      createdAt: event.occurredAt,
      content: [],
    }
    const message: ConversationMessage = {
      ...baseMessage,
      streaming: false,
      status: payload.status,
      citations: payload.citations ?? baseMessage.citations,
      attachments: payload.attachments ?? baseMessage.attachments,
      artifacts: payload.artifacts ?? baseMessage.artifacts,
    }
    const item = existing
      ? ({ ...existing.data, message } as ConversationTimelineItem)
      : ({ kind: "agent-message", id: payload.messageId, createdAt: event.occurredAt, correlation: event.correlation, message } as ConversationAgentMessageItem)
    return nodeOf(key, existing?.kind ?? "conversation.agent-message", item, event)
  },
}

/** `conversation.activity` — safe activity summaries, replaced (not accumulated) per update. */
export const conversationActivityNodeDefinition: AgenticNodeDefinition<unknown, ConversationTimelineItem> = {
  kind: "conversation.activity",
  target: TARGET,
  publicationCadence: "animation-frame",
  match(event) {
    return event.type === "conversation.activity.updated"
      ? { matched: true, kind: "conversation.activity", target: TARGET }
      : { matched: false }
  },
  project(event) {
    const payload = event.payload as ConversationActivityUpdatedPayload
    const key = keyFor("activity", payload.activity.id)
    const item: ConversationTimelineItem = {
      kind: "activity",
      id: payload.activity.id,
      createdAt: event.occurredAt,
      correlation: event.correlation,
      activity: payload.activity,
    }
    return nodeOf(key, "conversation.activity", item, event)
  },
}

/** `conversation.tool` — one node per `tool.id`, updated across started -> updated -> completed. */
export const conversationToolNodeDefinition: AgenticNodeDefinition<unknown, ConversationTimelineItem> = {
  kind: "conversation.tool",
  target: TARGET,
  publicationCadence: "immediate",
  match(event) {
    if (
      event.type === "conversation.tool.started" ||
      event.type === "conversation.tool.updated" ||
      event.type === "conversation.tool.completed"
    ) {
      return { matched: true, kind: "conversation.tool", target: TARGET }
    }
    return { matched: false }
  },
  project(event) {
    const payload = event.payload as
      | ConversationToolStartedPayload
      | ConversationToolUpdatedPayload
      | ConversationToolCompletedPayload
    const key = keyFor("tool", payload.tool.id)
    const item: ConversationToolItem = {
      kind: "tool",
      id: payload.tool.id,
      createdAt: event.occurredAt,
      correlation: event.correlation,
      tool: payload.tool,
    }
    return nodeOf(key, "conversation.tool", item, event)
  },
}

/** `conversation.clarification` — one node per `clarification.id`, updated on resolution. */
export const conversationClarificationNodeDefinition: AgenticNodeDefinition<unknown, ConversationTimelineItem> = {
  kind: "conversation.clarification",
  target: TARGET,
  publicationCadence: "immediate",
  match(event) {
    if (event.type === "conversation.clarification.requested" || event.type === "conversation.clarification.resolved") {
      return { matched: true, kind: "conversation.clarification", target: TARGET }
    }
    return { matched: false }
  },
  project(event, context) {
    if (event.type === "conversation.clarification.requested") {
      const payload = event.payload as ConversationClarificationRequestedPayload
      const key = keyFor("clarification", payload.clarification.id)
      const item: ConversationClarificationItem = {
        kind: "clarification",
        id: payload.clarification.id,
        createdAt: event.occurredAt,
        correlation: event.correlation,
        clarification: payload.clarification,
      }
      return nodeOf(key, "conversation.clarification", item, event)
    }
    const payload = event.payload as ConversationClarificationResolvedPayload
    const key = keyFor("clarification", payload.clarificationId)
    const existing = context.findExistingNode?.(key) as AgenticViewNode<ConversationClarificationItem> | undefined
    const base = existing?.data.clarification ?? {
      id: payload.clarificationId,
      question: "",
      resolved: false,
    }
    const item: ConversationClarificationItem = {
      kind: "clarification",
      id: payload.clarificationId,
      createdAt: existing?.data.createdAt ?? event.occurredAt,
      correlation: event.correlation,
      clarification: { ...base, resolved: true, resolution: payload.resolution },
    }
    return nodeOf(key, "conversation.clarification", item, event)
  },
}

/** `conversation.handoff` — one node per `handoff.id`, updated on completion. */
export const conversationHandoffNodeDefinition: AgenticNodeDefinition<unknown, ConversationTimelineItem> = {
  kind: "conversation.handoff",
  target: TARGET,
  publicationCadence: "immediate",
  match(event) {
    if (event.type === "conversation.handoff.requested" || event.type === "conversation.handoff.completed") {
      return { matched: true, kind: "conversation.handoff", target: TARGET }
    }
    return { matched: false }
  },
  project(event, context) {
    if (event.type === "conversation.handoff.requested") {
      const payload = event.payload as ConversationHandoffRequestedPayload
      const key = keyFor("handoff", payload.handoff.id)
      const item: ConversationHandoffItem = {
        kind: "handoff",
        id: payload.handoff.id,
        createdAt: event.occurredAt,
        correlation: event.correlation,
        handoff: payload.handoff,
      }
      return nodeOf(key, "conversation.handoff", item, event)
    }
    const payload = event.payload as ConversationHandoffCompletedPayload
    const key = keyFor("handoff", payload.handoffId)
    const existing = context.findExistingNode?.(key) as AgenticViewNode<ConversationHandoffItem> | undefined
    if (!existing) return nodeOf(key, "conversation.handoff", {
      kind: "handoff",
      id: payload.handoffId,
      createdAt: event.occurredAt,
      correlation: event.correlation,
      handoff: {
        id: payload.handoffId,
        fromAgent: { id: "unknown", kind: "agent", displayName: "Agent" },
        toAgent: { id: "unknown", kind: "agent", displayName: "Agent" },
        status: payload.status,
      },
    }, event)
    const item: ConversationHandoffItem = {
      ...existing.data,
      handoff: { ...existing.data.handoff, status: payload.status },
    }
    return nodeOf(key, "conversation.handoff", item, event)
  },
}

/** `conversation.artifact` — standalone produced-artifact node (distinct from artifacts inline on a message). */
export const conversationArtifactNodeDefinition: AgenticNodeDefinition<unknown, ConversationTimelineItem> = {
  kind: "conversation.artifact",
  target: TARGET,
  publicationCadence: "immediate",
  match(event) {
    return event.type === "conversation.artifact.produced"
      ? { matched: true, kind: "conversation.artifact", target: TARGET }
      : { matched: false }
  },
  project(event) {
    const payload = event.payload as ConversationArtifactProducedPayload
    const key = keyFor("artifact", payload.artifact.id)
    const item: ConversationArtifactItem = {
      kind: "artifact",
      id: payload.artifact.id,
      createdAt: event.occurredAt,
      correlation: event.correlation,
      artifact: payload.artifact,
    }
    return nodeOf(key, "conversation.artifact", item, event)
  },
}

/** `conversation.notice` — one-shot; keyed by the envelope's own id since notices do not accumulate. */
export const conversationNoticeNodeDefinition: AgenticNodeDefinition<unknown, ConversationTimelineItem> = {
  kind: "conversation.notice",
  target: TARGET,
  publicationCadence: "immediate",
  match(event) {
    return event.type === "conversation.notice.posted"
      ? { matched: true, kind: "conversation.notice", target: TARGET }
      : { matched: false }
  },
  project(event) {
    const payload = event.payload as ConversationNoticePostedPayload
    const key = keyFor("notice", event.id)
    const item: ConversationNoticeItem = {
      kind: "notice",
      id: event.id,
      createdAt: event.occurredAt,
      correlation: event.correlation,
      notice: payload.notice,
    }
    return nodeOf(key, "conversation.notice", item, event)
  },
}

/** `conversation.error` — one-shot; keyed by the envelope's own id. */
export const conversationErrorNodeDefinition: AgenticNodeDefinition<unknown, ConversationTimelineItem> = {
  kind: "conversation.error",
  target: TARGET,
  publicationCadence: "immediate",
  match(event) {
    return event.type === "conversation.error.recorded"
      ? { matched: true, kind: "conversation.error", target: TARGET }
      : { matched: false }
  },
  project(event) {
    const payload = event.payload as ConversationErrorRecordedPayload
    const key = keyFor("error", event.id)
    const item: ConversationErrorItem = {
      kind: "error",
      id: event.id,
      createdAt: event.occurredAt,
      correlation: event.correlation,
      error: payload.error,
    }
    return nodeOf(key, "conversation.error", item, event)
  },
}

/** `conversation.retry` — one-shot; keyed by the envelope's own id. */
export const conversationRetryNodeDefinition: AgenticNodeDefinition<unknown, ConversationTimelineItem> = {
  kind: "conversation.retry",
  target: TARGET,
  publicationCadence: "immediate",
  match(event) {
    return event.type === "conversation.retry.scheduled"
      ? { matched: true, kind: "conversation.retry", target: TARGET }
      : { matched: false }
  },
  project(event) {
    const payload = event.payload as ConversationRetryScheduledPayload
    const key = keyFor("retry", event.id)
    const item: ConversationRetryItem = {
      kind: "retry",
      id: event.id,
      createdAt: event.occurredAt,
      correlation: event.correlation,
      retry: payload.retry,
    }
    return nodeOf(key, "conversation.retry", item, event)
  },
}

/**
 * Every built-in conversation node definition, in match-priority order.
 * Consumers pass this straight to `applyEvent`/`applyEvents`
 * (`projection-store.ts`) — registering a new, unrelated node family never
 * requires editing this array; it is only for conversation's own ten kinds.
 */
export const conversationNodeDefinitions: readonly AgenticNodeDefinition<unknown, ConversationTimelineItem>[] = [
  conversationMessageNodeDefinition,
  conversationActivityNodeDefinition,
  conversationToolNodeDefinition,
  conversationClarificationNodeDefinition,
  conversationHandoffNodeDefinition,
  conversationArtifactNodeDefinition,
  conversationNoticeNodeDefinition,
  conversationErrorNodeDefinition,
  conversationRetryNodeDefinition,
]
