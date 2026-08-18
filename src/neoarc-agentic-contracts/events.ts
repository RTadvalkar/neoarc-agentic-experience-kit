/**
 * neoarc-agentic-contracts / events
 *
 * `AgenticEventEnvelope` is the normalized shape a product event adapter
 * produces from a backend/runtime event, before it ever reaches the optional
 * projection package. It is intentionally generic: individual event
 * categories (conversation, run, trace, ...) are introduced in later slices
 * as typed payloads, not as new envelope shapes.
 *
 * This is a UI/projection contract, not a requirement that NeoArc backends
 * be event-sourced — see docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md.
 */

import type { ISOTimestamp, OpaqueId } from "./shared"

/**
 * Whether an event represents durable business fact that must be retained
 * for replay/audit, or a transient signal (e.g. a typing indicator) that
 * live UIs may drop without changing correctness.
 */
export type EventDurability = "durable" | "transient"

/**
 * Optional correlation identifiers. An event is never required to carry
 * every id — only the ones meaningful to its category. Correlation must key
 * off stable business identity, never "the latest unfinished item" — see
 * docs/02A §Replayability.
 */
export interface EventCorrelation {
  readonly executionTraceId?: OpaqueId
  readonly missionId?: OpaqueId
  readonly runId?: OpaqueId
  readonly turnId?: OpaqueId
  readonly stepId?: OpaqueId
  readonly toolCallId?: OpaqueId
  readonly taskId?: OpaqueId
  readonly proposalId?: OpaqueId
  readonly artifactId?: OpaqueId
}

/**
 * Normalized backend/runtime event envelope.
 *
 * `type` is a free-form, namespaced string (see
 * docs/16_NORMALIZED_EVENT_VOCABULARY.json for the illustrative vocabulary).
 * `payload` is intentionally `unknown` at this layer — later slices define
 * typed payload unions per category and narrow with type guards rather than
 * widening this envelope.
 */
export interface AgenticEventEnvelope<TPayload = unknown> {
  readonly id: OpaqueId
  readonly type: string
  readonly occurredAt: ISOTimestamp
  /** Monotonic ordering hint within a single correlation scope, if supplied. */
  readonly sequence?: number
  readonly durability: EventDurability
  readonly correlation?: EventCorrelation
  readonly payload: TPayload
}

/** Type guard helper for narrowing an envelope's payload by event type. */
export function isEventOfType<TPayload>(
  event: AgenticEventEnvelope,
  type: string,
): event is AgenticEventEnvelope<TPayload> {
  return event.type === type
}
