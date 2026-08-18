/**
 * neoarc-agentic-contracts / conversation-events
 *
 * Slice 2 typed payloads for `AgenticEventEnvelope<TPayload>` (see
 * `events.ts`) describing conversation-category backend/runtime events.
 * These are the shapes a product event adapter produces when normalizing
 * its own webhook/SSE/polling payloads — see docs/INTEGRATION_GUIDE.md
 * Path B. `neoarc-agentic-projection`'s built-in conversation node
 * definitions (`conversation-node-definitions.ts`) consume these.
 *
 * Naming follows docs/16_NORMALIZED_EVENT_VOCABULARY.json's illustrative,
 * namespaced, non-enum style. Every correlation MUST key off a stable
 * business id supplied here (never array position, never "the latest
 * unfinished node") — see docs/02A §Replayability and
 * docs/TRACEABILITY_PRINCIPLES.md §4.
 */

import type {
  ActivitySummary,
  ArtifactRef,
  AttachmentRef,
  CitationRef,
  ClarificationRequest,
  ConversationErrorPayload,
  ConversationNoticePayload,
  ConversationRetryPayload,
  HandoffSummary,
  MessageAuthor,
  MessageContentBlock,
  ToolActivitySummary,
} from "./conversation"

/** Every conversation-category event type this Slice defines. */
export const CONVERSATION_EVENT_TYPES = [
  "conversation.message.created",
  "conversation.message.delta",
  "conversation.message.completed",
  "conversation.activity.updated",
  "conversation.tool.started",
  "conversation.tool.updated",
  "conversation.tool.completed",
  "conversation.clarification.requested",
  "conversation.clarification.resolved",
  "conversation.handoff.requested",
  "conversation.handoff.completed",
  "conversation.artifact.produced",
  "conversation.notice.posted",
  "conversation.error.recorded",
  "conversation.retry.scheduled",
] as const

export type ConversationEventType = (typeof CONVERSATION_EVENT_TYPES)[number]

/**
 * A new message turn has started. `messageId` is the stable business key
 * every later delta/completed event for this same message must reuse via
 * `EventCorrelation.turnId` (or a product may key on its own message id —
 * the kit only requires *a* stable id, not this specific field name, to be
 * threaded through correlation).
 */
export interface ConversationMessageCreatedPayload {
  readonly messageId: string
  readonly author: MessageAuthor
  readonly initialContent?: readonly MessageContentBlock[]
}

/** An incremental content append to an in-progress message. High-frequency — see `PublicationCadence`. */
export interface ConversationMessageDeltaPayload {
  readonly messageId: string
  readonly delta: MessageContentBlock
}

/** Terminal state for a message turn. */
export interface ConversationMessageCompletedPayload {
  readonly messageId: string
  readonly status: "completed" | "failed" | "cancelled"
  readonly citations?: readonly CitationRef[]
  readonly attachments?: readonly AttachmentRef[]
  readonly artifacts?: readonly ArtifactRef[]
}

export interface ConversationActivityUpdatedPayload {
  readonly activity: ActivitySummary
}

export interface ConversationToolStartedPayload {
  readonly tool: ToolActivitySummary
}
export interface ConversationToolUpdatedPayload {
  readonly tool: ToolActivitySummary
}
export interface ConversationToolCompletedPayload {
  readonly tool: ToolActivitySummary
}

export interface ConversationClarificationRequestedPayload {
  readonly clarification: ClarificationRequest
}
export interface ConversationClarificationResolvedPayload {
  readonly clarificationId: string
  readonly resolution: string
}

export interface ConversationHandoffRequestedPayload {
  readonly handoff: HandoffSummary
}
export interface ConversationHandoffCompletedPayload {
  readonly handoffId: string
  readonly status: "completed" | "failed"
}

export interface ConversationArtifactProducedPayload {
  readonly artifact: ArtifactRef
}

export interface ConversationNoticePostedPayload {
  readonly notice: ConversationNoticePayload
}

export interface ConversationErrorRecordedPayload {
  readonly error: ConversationErrorPayload
}

export interface ConversationRetryScheduledPayload {
  readonly retry: ConversationRetryPayload
}

/** Discriminated-by-caller union of every conversation event payload. Consumers narrow via `event.type`. */
export type ConversationEventPayload =
  | ConversationMessageCreatedPayload
  | ConversationMessageDeltaPayload
  | ConversationMessageCompletedPayload
  | ConversationActivityUpdatedPayload
  | ConversationToolStartedPayload
  | ConversationToolUpdatedPayload
  | ConversationToolCompletedPayload
  | ConversationClarificationRequestedPayload
  | ConversationClarificationResolvedPayload
  | ConversationHandoffRequestedPayload
  | ConversationHandoffCompletedPayload
  | ConversationArtifactProducedPayload
  | ConversationNoticePostedPayload
  | ConversationErrorRecordedPayload
  | ConversationRetryScheduledPayload
