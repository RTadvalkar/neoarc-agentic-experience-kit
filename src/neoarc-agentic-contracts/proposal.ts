/**
 * neoarc-agentic-contracts / proposal
 *
 * Slice 3 normalized models for the business-decision side of human
 * control: "should this proposal/change become authoritative?" — a
 * strictly different question from execution permission
 * (`human-interaction.ts`'s `ExecutionPermissionRequest`). Nothing here may
 * be rendered as if it answers the execution-permission question, and
 * nothing in `human-interaction.ts` may be rendered as if it answers this
 * one.
 *
 * Every field is a normalized view model a product adapter supplies. The
 * kit never computes risk/policy findings, never infers a decision from
 * silence, and never claims an action succeeded until the product adapter
 * feeds an updated `ProposalSummary` back through controlled props.
 */

import type { ISOTimestamp, OpaqueId } from "./shared"
import type { ActorSummary, RiskLevel } from "./foundation"
import type { EventCorrelation } from "./events"

/**
 * Coarse lifecycle of a proposal. `stale` and `conflicted` both restrict
 * which `DecisionAction`s a product should mark available — the kit does
 * not compute this restriction itself, it only renders the
 * `DecisionPermission[]` supplied alongside.
 */
export type ProposalStatus =
  | "draft"
  | "ready_for_review"
  | "stale"
  | "conflicted"
  | "decision_pending"
  | "approved"
  | "rejected"
  | "deferred"
  | "overridden"

/** One human business decision a product may allow on a proposal. Never assumed to all be present. */
export type DecisionAction = "approve" | "refine" | "reject" | "defer" | "override"

/**
 * Whether one specific `DecisionAction` is currently available on a given
 * proposal, and why not when it isn't — supplied by the product, exactly
 * like `ActionAvailability` (`foundation.ts`) but scoped to the decision
 * vocabulary so a `DecisionBar` never has to reason about
 * `ActionUnavailableReason` values that do not apply here.
 */
export interface DecisionPermission {
  readonly action: DecisionAction
  readonly available: boolean
  readonly reason?: string
  readonly label?: string
}

/** One supplied before/after change within a proposal section. Text only — never a hand-computed diff of arbitrary binary content. */
export interface ProposalChange {
  readonly id: OpaqueId
  readonly summary: string
  readonly path?: string
  readonly before?: string
  readonly after?: string
}

/** A named grouping of related changes within a proposal (e.g. "Pricing", "Access control"). */
export interface ProposalSection {
  readonly id: OpaqueId
  readonly title: string
  readonly changes: readonly ProposalChange[]
}

/** A compact, supplied evidence reference. Full evidence/citation UX (EvidenceDrawer) is deferred to the Trace/Provenance work — this is only a summary/reference. */
export interface EvidenceSummary {
  readonly id: OpaqueId
  readonly label: string
  readonly sourceLabel?: string
  readonly url?: string
}

/** One supplied risk finding attached to a proposal. Never computed by the kit. */
export interface RiskFinding {
  readonly id: OpaqueId
  readonly level: RiskLevel
  readonly summary: string
}

/** One supplied policy-engine finding attached to a proposal. Never computed by the kit. */
export interface PolicyFinding {
  readonly id: OpaqueId
  readonly policyName: string
  readonly outcome: "pass" | "warning" | "violation"
  readonly summary: string
}

/** One supplied conflict — e.g. this proposal collides with another change already applied. */
export interface ConflictSummary {
  readonly id: OpaqueId
  readonly summary: string
  readonly conflictingWith?: string
  readonly resolved: boolean
  readonly resolution?: string
}

/** Whether the product requires an explicit human override before this proposal's decision can proceed, and why. */
export interface OverrideRequirement {
  readonly required: boolean
  readonly reason?: string
  readonly requiredRole?: string
}

/** One authoritative, already-recorded human decision — part of `ProposalSummary.decisionHistory`. Never fabricated; only ever supplied by the product after the backend records it. */
export interface HumanDecision {
  readonly id: OpaqueId
  readonly action: DecisionAction
  readonly decidedBy: ActorSummary
  readonly decidedAt: ISOTimestamp
  readonly note?: string
}

/** Which revision of a proposal is currently being viewed. */
export interface ProposalRevision {
  readonly revision: number
  readonly createdAt: ISOTimestamp
  readonly summary?: string
}

/**
 * A full normalized proposal, ready for `ProposalViewer`/`ProposalCard`.
 * `pendingAction`, when set, means a `DecisionAction` intent has been
 * emitted and the product has not yet fed back an authoritative
 * `status`/`decisionHistory` update — components must render this as an
 * explicit "action pending" state, never as success.
 */
export interface ProposalSummary {
  readonly id: OpaqueId
  readonly title: string
  readonly status: ProposalStatus
  readonly revision: ProposalRevision
  readonly summary: string
  readonly sections: readonly ProposalSection[]
  readonly evidence?: readonly EvidenceSummary[]
  readonly riskFindings?: readonly RiskFinding[]
  readonly policyFindings?: readonly PolicyFinding[]
  readonly conflicts?: readonly ConflictSummary[]
  readonly decisionPermissions: readonly DecisionPermission[]
  readonly overrideRequirement?: OverrideRequirement
  readonly decisionHistory?: readonly HumanDecision[]
  readonly pendingAction?: DecisionAction
  readonly lastActionFailed?: { readonly action: DecisionAction; readonly reason: string }
  readonly correlation?: EventCorrelation
}
