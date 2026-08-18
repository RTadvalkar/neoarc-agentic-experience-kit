/**
 * neoarc-agentic-contracts / conversation
 *
 * Slice 2 normalized public models for the reusable conversation layer.
 * Every type here is a normalized view model a product adapter produces
 * from a backend DTO — see docs/INTEGRATION_GUIDE.md. Nothing here is a
 * backend DTO, an event envelope, or a projection type; see
 * `conversation-events.ts` (inbound runtime events) and
 * `conversation-ui-events.ts` (outbound semantic UI events) for those.
 *
 * `ConversationThread.items` is deliberately usable two ways without any
 * duplication of shape:
 *
 * 1. Direct path — a product adapter builds a `ConversationThread` straight
 *    from its own DTOs and passes `thread.items` to `AgentConversation`.
 *    `neoarc-agentic-ui` never has to import anything from
 *    `neoarc-agentic-projection` to render this.
 * 2. Projected path — `neoarc-agentic-projection`'s built-in conversation
 *    node definitions (see `conversation-node-definitions.ts`) project
 *    `AgenticEventEnvelope`s into `AgenticViewNode<ConversationTimelineItem>`s
 *    whose `data` is exactly one of these same `ConversationTimelineItem`
 *    variants. A consumer of the projected path unwraps `node.data` and
 *    hands the resulting array to the very same `AgentConversation`.
 */

import type { ActorSummary, RuntimeStatus } from "./foundation"
import type { ISOTimestamp, OpaqueId } from "./shared"
import type { EventCorrelation } from "./events"

/**
 * The author of a `ConversationMessage`. Reuses `ActorSummary` rather than
 * duplicating id/kind/displayName/avatar fields — an author is simply an
 * actor in the "who said this" role. Kept as a distinct name in the public
 * surface (per the Slice 2 specification) purely for call-site clarity.
 */
export type MessageAuthor = ActorSummary

/** Discriminated content block inside a `ConversationMessage`. */
export interface TextBlock {
  readonly kind: "text"
  readonly text: string
}

/**
 * A block of supplied Markdown-like text. Rendered by `MessageContentRenderer`
 * using a minimal, dependency-free formatter (bold/italic/inline code/links)
 * — see that component's docs for why the kit does not pull in a full
 * CommonMark dependency. Products needing complete Markdown fidelity may
 * substitute their own renderer via composition.
 */
export interface MarkdownBlock {
  readonly kind: "markdown"
  readonly markdown: string
}

export type MessageContentBlock = TextBlock | MarkdownBlock

/** A supplied citation backing part of a message's content. Never fabricated. */
export interface CitationRef {
  readonly id: OpaqueId
  readonly label: string
  readonly sourceLabel?: string
  readonly url?: string
  readonly retrievedAt?: ISOTimestamp
}

/** A supplied file/attachment reference associated with a message. */
export interface AttachmentRef {
  readonly id: OpaqueId
  readonly name: string
  readonly mimeType?: string
  readonly sizeBytes?: number
  readonly url?: string
}

/**
 * A supplied reference to a produced artifact (document, diagram, code
 * change, ...). Reused both inline on a `ConversationMessage` and as the
 * payload of a standalone `conversation.artifact` timeline item — the kit
 * never duplicates this shape per call site.
 */
export interface ArtifactRef {
  readonly id: OpaqueId
  readonly name: string
  readonly artifactType?: string
  readonly version?: string
  readonly status?: RuntimeStatus
  readonly url?: string
}

/**
 * A pending or resolved request for human clarification. `resolved` and
 * `resolution` are both explicit — the kit never infers resolution from the
 * mere presence of a later message.
 */
export interface ClarificationRequest {
  readonly id: OpaqueId
  readonly question: string
  readonly options?: readonly string[]
  readonly resolved: boolean
  readonly resolution?: string
}

/**
 * One safe, observable "what is the agent doing right now" summary line —
 * see docs/TRACEABILITY_PRINCIPLES.md §1. Never a chain-of-thought
 * fragment. `status` is optional and, when supplied, only ever reflects an
 * observed lifecycle (e.g. "running" while an activity is current,
 * "completed" once superseded) — never inferred.
 */
export interface ActivitySummary {
  readonly id: OpaqueId
  readonly label: string
  readonly occurredAt: ISOTimestamp
  readonly status?: RuntimeStatus
}

/** A supplied summary of one tool invocation, safe to render (no raw tool I/O assumed). */
export interface ToolActivitySummary {
  readonly id: OpaqueId
  readonly toolName: string
  readonly status: RuntimeStatus
  readonly summary?: string
  readonly startedAt?: ISOTimestamp
  readonly completedAt?: ISOTimestamp
}

/** A supplied summary of an agent-to-agent handoff. */
export interface HandoffSummary {
  readonly id: OpaqueId
  readonly fromAgent: ActorSummary
  readonly toAgent: ActorSummary
  readonly reason?: string
  readonly status: RuntimeStatus
}

/** A supplied summary of work proceeding asynchronously outside this turn. */
export interface AsyncWorkSummary {
  readonly id: OpaqueId
  readonly label: string
  readonly status: RuntimeStatus
  readonly etaLabel?: string
}

/** A calm, explicit conversation-scoped notice — reuses `InlineNotice`'s tone vocabulary. */
export interface ConversationNoticePayload {
  readonly tone: "info" | "success" | "warning" | "danger"
  readonly title: string
  readonly description?: string
}

/** A supplied, observed error — never a fabricated or guessed cause. */
export interface ConversationErrorPayload {
  readonly message: string
  readonly retryable: boolean
  readonly causeSummary?: string
}

/** A supplied retry attempt notice. */
export interface ConversationRetryPayload {
  readonly attempt: number
  readonly maxAttempts?: number
  readonly reason?: string
  readonly nextAttemptAt?: ISOTimestamp
}

/**
 * A single message — human or agent — in a conversation. One shape covers
 * both roles; `author.kind` (`"human"` vs `"agent"`/`"system"`) is what
 * `ConversationMessage` (the component) uses to route to `HumanMessage` or
 * `AgentResponse`. `streaming: true` marks a message still being appended
 * to (see `conversation-events.ts` `conversation.message.delta`).
 */
export interface ConversationMessage {
  readonly id: OpaqueId
  readonly author: MessageAuthor
  readonly createdAt: ISOTimestamp
  readonly content: readonly MessageContentBlock[]
  readonly citations?: readonly CitationRef[]
  readonly attachments?: readonly AttachmentRef[]
  readonly artifacts?: readonly ArtifactRef[]
  readonly status?: RuntimeStatus
  readonly streaming?: boolean
  readonly correlation?: EventCorrelation
}

/** Every `ConversationTimelineItem` kind. Mirrors the ten built-in projected node kinds 1:1. */
export type ConversationItemKind =
  | "user-message"
  | "agent-message"
  | "activity"
  | "tool"
  | "clarification"
  | "handoff"
  | "artifact"
  | "notice"
  | "error"
  | "retry"

interface ConversationItemBase {
  readonly id: OpaqueId
  readonly createdAt: ISOTimestamp
  readonly correlation?: EventCorrelation
}

export interface ConversationUserMessageItem extends ConversationItemBase {
  readonly kind: "user-message"
  readonly message: ConversationMessage
}

export interface ConversationAgentMessageItem extends ConversationItemBase {
  readonly kind: "agent-message"
  readonly message: ConversationMessage
}

export interface ConversationActivityItem extends ConversationItemBase {
  readonly kind: "activity"
  readonly activity: ActivitySummary
}

export interface ConversationToolItem extends ConversationItemBase {
  readonly kind: "tool"
  readonly tool: ToolActivitySummary
}

export interface ConversationClarificationItem extends ConversationItemBase {
  readonly kind: "clarification"
  readonly clarification: ClarificationRequest
}

export interface ConversationHandoffItem extends ConversationItemBase {
  readonly kind: "handoff"
  readonly handoff: HandoffSummary
}

export interface ConversationArtifactItem extends ConversationItemBase {
  readonly kind: "artifact"
  readonly artifact: ArtifactRef
}

export interface ConversationNoticeItem extends ConversationItemBase {
  readonly kind: "notice"
  readonly notice: ConversationNoticePayload
}

export interface ConversationErrorItem extends ConversationItemBase {
  readonly kind: "error"
  readonly error: ConversationErrorPayload
}

export interface ConversationRetryItem extends ConversationItemBase {
  readonly kind: "retry"
  readonly retry: ConversationRetryPayload
}

/**
 * A single entry in a conversation timeline — either of the two message
 * kinds or one of the eight non-message categories. This union is exactly
 * what `AgentConversation` renders, and exactly what
 * `AgenticViewNode<ConversationTimelineItem>.data` holds on the projected
 * path — see the module doc comment above.
 */
export type ConversationTimelineItem =
  | ConversationUserMessageItem
  | ConversationAgentMessageItem
  | ConversationActivityItem
  | ConversationToolItem
  | ConversationClarificationItem
  | ConversationHandoffItem
  | ConversationArtifactItem
  | ConversationNoticeItem
  | ConversationErrorItem
  | ConversationRetryItem

/**
 * A normalized conversation, ready for direct rendering by
 * `AgentConversation` without any projection dependency.
 */
export interface ConversationThread {
  readonly id: OpaqueId
  readonly items: readonly ConversationTimelineItem[]
}
