/**
 * neoarc-agentic-contracts / ui-events
 *
 * `AgenticUIEvent` represents user intent emitted by reusable
 * `neoarc-agentic-ui` components through typed callbacks. It is a distinct
 * contract from `AgenticEventEnvelope` (backend/runtime events) — the kit
 * never reuses backend event shapes for UI actions, and never assumes an
 * emitted UI event implies success. The product adapter is responsible for
 * turning this into a real backend call and feeding the authoritative result
 * back in through controlled props.
 */

import type { ISOTimestamp, OpaqueId } from "./shared"
import type { EventCorrelation } from "./events"

/**
 * Free-form, namespaced semantic UI event type, e.g. "conversation.message.send",
 * "permission.respond", "proposal.decision.submit". Slice 1 does not define
 * concrete event type constants yet — those are introduced alongside the
 * components that emit them in later slices.
 */
export type AgenticUIEventType = string

/**
 * Normalized user-intent event emitted by a `neoarc-agentic-ui` component.
 *
 * `sourceComponent` identifies which reusable component emitted the event
 * (e.g. "AgentComposer"), useful for the Execution Lab event log and for
 * product-side analytics/debugging.
 */
export interface AgenticUIEvent<TPayload = unknown> {
  readonly type: AgenticUIEventType
  readonly occurredAt: ISOTimestamp
  readonly sourceComponent: string
  readonly correlation?: EventCorrelation
  readonly payload: TPayload
}

/** Convenience factory so components emit consistently shaped events. */
export function createUIEvent<TPayload>(
  input: Omit<AgenticUIEvent<TPayload>, "occurredAt"> & { occurredAt?: ISOTimestamp },
): AgenticUIEvent<TPayload> {
  return {
    ...input,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  }
}

/** A callback signature reusable components use to emit UI events. */
export type AgenticUIEventHandler<TPayload = unknown> = (
  event: AgenticUIEvent<TPayload>,
) => void

/** Re-exported so consumers can reason about correlation without a second import. */
export type { EventCorrelation }
export type { OpaqueId }
