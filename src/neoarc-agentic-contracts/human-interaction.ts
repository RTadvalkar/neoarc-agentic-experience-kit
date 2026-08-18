/**
 * neoarc-agentic-contracts / human-interaction
 *
 * Slice 3 normalized models for human-in-the-loop UX. This module defines
 * the *generic* pending-human-interaction vocabulary shared by every
 * presentation intent (clarification, execution permission, proposal
 * review, risk acknowledgement, override, confirmation).
 *
 * This module intentionally does NOT define a generic "Approval" type.
 * Execution permission ("may this specific tool/action proceed?") and
 * business decision ("should this proposal become authoritative?") are two
 * different questions with two different contracts — see `proposal.ts` for
 * the business-decision side. Collapsing them into one abstraction would
 * erase a distinction docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md
 * treats as non-negotiable.
 */

import type { ISOTimestamp, OpaqueId } from "./shared"
import type { RiskLevel } from "./foundation"
import type { EventCorrelation } from "./events"

/**
 * How a pending human interaction should be presented. A specialized
 * renderer for one intent must never silently drop a valid action a more
 * generic renderer would have shown.
 */
export type PresentationIntent =
  | "clarification"
  | "execution-permission"
  | "proposal-review"
  | "risk-acknowledgement"
  | "override"
  | "confirmation"

/** Discriminant for `HumanInteractionRequest.kind`, one per `PresentationIntent`. */
export type HumanInteractionKind =
  | "clarification"
  | "execution_permission"
  | "proposal_review"
  | "risk_acknowledgement"
  | "override"
  | "confirmation"

/**
 * Lifecycle of any human interaction request. `submitted` is the
 * intermediate "intent emitted, awaiting authoritative result" state — a
 * component must render this distinctly from `resolved` and must never
 * infer `resolved` merely because the user clicked something. See
 * `docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md` §Human
 * interaction.
 */
export type InteractionStatus = "pending" | "submitted" | "resolved" | "cancelled"

/** One selectable option offered to the human for a pending interaction. */
export interface InteractionOption {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly destructive?: boolean
}

/**
 * A generic pending-or-resolved request for a human to act. Concrete
 * presentation intents (execution permission, proposal review, ...) carry
 * their own richer contracts (`ExecutionPermissionRequest`,
 * `ProposalSummary`) — this shape is for the parts of the UI that need to
 * reason about "some human interaction is outstanding" without caring which
 * concrete kind it is (e.g. `PendingHumanInteraction`).
 */
export interface HumanInteractionRequest {
  readonly id: OpaqueId
  readonly kind: HumanInteractionKind
  readonly presentationIntent: PresentationIntent
  readonly title: string
  readonly description?: string
  readonly status: InteractionStatus
  readonly options?: readonly InteractionOption[]
  readonly requestedAt: ISOTimestamp
  readonly correlation?: EventCorrelation
}

/**
 * A compact, session/mission-scoped summary of one thing currently waiting
 * on a human — e.g. for composing into a Mission Center list. Deliberately
 * shallow: it never duplicates the full detail of the underlying
 * interaction (that stays in `ExecutionPermissionRequest`/`ProposalSummary`
 * and their dedicated components).
 */
export interface PendingInteraction {
  readonly id: OpaqueId
  readonly presentationIntent: PresentationIntent
  readonly label: string
  readonly requestedAt: ISOTimestamp
  readonly riskLevel?: RiskLevel
}

/**
 * Normalized identity of the tool/action an execution-permission request is
 * about. `actionSummary` must already be a safe, product-supplied summary —
 * this contract intentionally has no field for raw tool arguments, so a
 * caller cannot pass sensitive payloads through it by accident.
 */
export interface ToolActionIdentity {
  readonly toolName: string
  readonly actionSummary: string
  readonly targetLabel?: string
}

/**
 * The four normalized outcomes of "may this specific tool/action proceed?".
 * `unavailable` covers both "the runtime cannot currently grant this" and
 * "this was withdrawn before a human responded" — the request's own
 * `unavailableReason` explains which, honestly, rather than the UI guessing.
 */
export type ExecutionPermissionOutcome = "allowed_once" | "rejected" | "cancelled" | "unavailable"

/**
 * One execution-permission request. `status` distinguishes "still
 * deciding" (`pending`), "a decision was emitted and we are waiting on the
 * backend" (`submitted`), and "the backend told us what actually happened"
 * (`resolved`) — `outcome` is only meaningful once `status` is `resolved`.
 */
export interface ExecutionPermissionRequest {
  readonly id: OpaqueId
  readonly action: ToolActionIdentity
  readonly riskLevel?: RiskLevel
  readonly consequenceSummary?: string
  readonly requestedAt: ISOTimestamp
  readonly status: InteractionStatus
  readonly outcome?: ExecutionPermissionOutcome
  readonly unavailableReason?: string
  readonly correlation?: EventCorrelation
}
