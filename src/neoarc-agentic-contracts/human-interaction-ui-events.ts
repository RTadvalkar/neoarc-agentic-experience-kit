/**
 * neoarc-agentic-contracts / human-interaction-ui-events
 *
 * Slice 3 typed payloads for `AgenticUIEvent<TPayload>` (see `ui-events.ts`)
 * emitted by the human-interaction component family
 * (`src/neoarc-agentic-ui/human-interaction`). Two disjoint event
 * namespaces on purpose — `permission.*` (execution permission) and
 * `proposal.*` (business decision) — mirroring the hard contract split
 * between `human-interaction.ts` and `proposal.ts`. Every one of these is a
 * signal of user intent only: emitting one never implies the corresponding
 * backend action succeeded. The product adapter owns calling its real
 * backend and feeding the authoritative result back in through controlled
 * props (`ExecutionPermissionRequest.status`/`outcome`,
 * `ProposalSummary.status`/`pendingAction`/`decisionHistory`).
 *
 * `proposal.evidence.open` is intentionally NOT defined here — Slice 3
 * ships only a compact supplied evidence summary/reference (no
 * `EvidenceDrawer`); that event, if needed, arrives with the fuller
 * Evidence subsystem alongside the later Trace/Provenance work.
 */

import type { OpaqueId } from "./shared"

/** Every execution-permission semantic UI event type this Slice defines. */
export const PERMISSION_UI_EVENT_TYPES = [
  "permission.allowOnce.request",
  "permission.reject.request",
  "permission.cancel.request",
] as const

export type PermissionUIEventType = (typeof PERMISSION_UI_EVENT_TYPES)[number]

/** Every proposal/business-decision semantic UI event type this Slice defines. */
export const PROPOSAL_UI_EVENT_TYPES = [
  "proposal.open",
  "proposal.apply.request",
  "proposal.refine.request",
  "proposal.reject.request",
  "proposal.defer.request",
  "proposal.override.submit",
  "proposal.change.open",
  "proposal.conflict.resolve",
  "proposal.history.open",
] as const

export type ProposalUIEventType = (typeof PROPOSAL_UI_EVENT_TYPES)[number]

/** Emitted by `ExecutionPermissionCard`/`ExecutionPermissionDialog` when the human allows the action to proceed once. */
export interface PermissionAllowOnceRequestPayload {
  readonly requestId: OpaqueId
}

/** Emitted when the human rejects the pending execution permission request. */
export interface PermissionRejectRequestPayload {
  readonly requestId: OpaqueId
  readonly reason?: string
}

/** Emitted when the human cancels/withdraws from a pending execution permission request without deciding. */
export interface PermissionCancelRequestPayload {
  readonly requestId: OpaqueId
}

/** Emitted by `ProposalCard` when the human opens a proposal for full review. */
export interface ProposalOpenPayload {
  readonly proposalId: OpaqueId
}

/** Emitted by `DecisionBar` when the human requests the proposal be applied/approved. */
export interface ProposalApplyRequestPayload {
  readonly proposalId: OpaqueId
}

/** Emitted by `DecisionBar` when the human requests refinement instead of a direct decision. */
export interface ProposalRefineRequestPayload {
  readonly proposalId: OpaqueId
  readonly note?: string
}

/** Emitted by `DecisionBar` when the human rejects the proposal. */
export interface ProposalRejectRequestPayload {
  readonly proposalId: OpaqueId
  readonly reason?: string
}

/** Emitted by `DecisionBar` when the human defers the decision. */
export interface ProposalDeferRequestPayload {
  readonly proposalId: OpaqueId
  readonly reason?: string
}

/** Emitted by `HumanOverrideDialog` once a required justification has been supplied. */
export interface ProposalOverrideSubmitPayload {
  readonly proposalId: OpaqueId
  readonly justification: string
}

/** Emitted by `ChangeDiffViewer` when the human opens one specific change for detail. */
export interface ProposalChangeOpenPayload {
  readonly proposalId: OpaqueId
  readonly changeId: OpaqueId
}

/** Emitted by `ConflictResolutionPanel` when the human submits a resolution for one conflict. */
export interface ProposalConflictResolvePayload {
  readonly proposalId: OpaqueId
  readonly conflictId: OpaqueId
  readonly resolution: string
}

/** Emitted by `DecisionHistory`/`ProposalStatusTimeline` when the human opens the full decision history. */
export interface ProposalHistoryOpenPayload {
  readonly proposalId: OpaqueId
}

/** Discriminated-by-caller union of every execution-permission UI event payload. */
export type PermissionUIEventPayload =
  | PermissionAllowOnceRequestPayload
  | PermissionRejectRequestPayload
  | PermissionCancelRequestPayload

/** Discriminated-by-caller union of every proposal/business-decision UI event payload. */
export type ProposalUIEventPayload =
  | ProposalOpenPayload
  | ProposalApplyRequestPayload
  | ProposalRefineRequestPayload
  | ProposalRejectRequestPayload
  | ProposalDeferRequestPayload
  | ProposalOverrideSubmitPayload
  | ProposalChangeOpenPayload
  | ProposalConflictResolvePayload
  | ProposalHistoryOpenPayload
