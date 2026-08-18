/**
 * neoarc-agentic-contracts / conversation-ui-events
 *
 * Slice 2 typed payloads for `AgenticUIEvent<TPayload>` (see
 * `ui-events.ts`) emitted by `neoarc-agentic-ui` conversation components.
 * Every one of these is a signal of user intent only — emitting one never
 * implies the corresponding backend action succeeded. The product adapter
 * is responsible for calling its own backend and feeding the authoritative
 * result back in through controlled props (e.g. updating the
 * `ConversationMessage.status` it passed down) — see `EVENT_MODEL.md`.
 */

import type { OpaqueId } from "./shared"

/** Every conversation semantic UI event type this Slice defines. */
export const CONVERSATION_UI_EVENT_TYPES = [
  "conversation.message.send",
  "conversation.stop.request",
  "conversation.retry.request",
  "clarification.submit",
  "citation.open",
  "artifact.open",
  "handoff.open",
  "toolActivity.toggle",
  "attachment.open",
] as const

export type ConversationUIEventType = (typeof CONVERSATION_UI_EVENT_TYPES)[number]

/** Emitted by `AgentComposer` when the user submits a new message. */
export interface ConversationMessageSendPayload {
  readonly text: string
}

/** Emitted by `AgentComposer`/`ResponseActions` when the user asks an in-progress response to stop. */
export interface ConversationStopRequestPayload {
  readonly messageId: OpaqueId
}

/** Emitted by `ResponseActions` when the user asks a failed response to be retried. */
export interface ConversationRetryRequestPayload {
  readonly messageId: OpaqueId
}

/** Emitted by `ClarificationCard` when the user submits a response to a pending clarification. */
export interface ClarificationSubmitPayload {
  readonly clarificationId: OpaqueId
  readonly resolution: string
}

/** Emitted by `CitationGroup` when the user opens a specific citation. */
export interface CitationOpenPayload {
  readonly citationId: OpaqueId
}

/** Emitted by `ArtifactReferenceCard` when the user opens an artifact. */
export interface ArtifactOpenPayload {
  readonly artifactId: OpaqueId
}

/** Emitted by `AgentHandoffCard` when the user opens handoff detail. */
export interface HandoffOpenPayload {
  readonly handoffId: OpaqueId
}

/** Emitted by `ToolActivityDisclosure` when the user expands/collapses tool detail. */
export interface ToolActivityTogglePayload {
  readonly toolActivityId: OpaqueId
  readonly open: boolean
}

/** Emitted by `AttachmentList` when the user opens a specific attachment. */
export interface AttachmentOpenPayload {
  readonly attachmentId: OpaqueId
}

/** Discriminated-by-caller union of every conversation UI event payload. */
export type ConversationUIEventPayload =
  | ConversationMessageSendPayload
  | ConversationStopRequestPayload
  | ConversationRetryRequestPayload
  | ClarificationSubmitPayload
  | CitationOpenPayload
  | ArtifactOpenPayload
  | HandoffOpenPayload
  | ToolActivityTogglePayload
  | AttachmentOpenPayload
