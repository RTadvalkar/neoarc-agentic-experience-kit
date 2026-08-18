/**
 * neoarc-agentic-contracts / runtime
 *
 * Slice 4 normalized models for missions, runs, tasks, and hierarchical
 * workflows. Every type here is a normalized view model a product adapter
 * supplies — the kit never computes run/task status, progress, or
 * retryability itself.
 *
 * Deliberately reuses rather than duplicates: `RuntimeStatus`
 * (`foundation.ts`) stays the coarse, shared vocabulary for agents, runs,
 * and tasks; `RunStatus` here is the richer, run-specific vocabulary
 * layered on top of it (never a replacement — see
 * docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md §2). `ArtifactRef`
 * (`conversation.ts`) is reused as the artifact half of `RunOutput` instead
 * of a second near-identical artifact shape. `PendingInteraction` and
 * `PresentationIntent` (`human-interaction.ts`) are reused rather than a
 * new human-control contract — see `HumanWaitReason` below.
 */

import type { ActorSummary, RiskLevel, RuntimeStatus } from "./foundation"
import type { ISOTimestamp, OpaqueId } from "./shared"
import type { EventCorrelation } from "./events"
import type { ArtifactRef } from "./conversation"
import type { PresentationIntent } from "./human-interaction"

/**
 * Run-specific lifecycle, richer than the shared `RuntimeStatus`. Includes
 * transitional states (`starting`, `cancel_requested`) that `RuntimeStatus`
 * deliberately does not carry, since not every runtime status consumer
 * (agents, tasks) needs them.
 */
export type RunStatus =
  | "queued"
  | "starting"
  | "running"
  | "waiting_for_human"
  | "paused"
  | "completed"
  | "failed"
  | "cancel_requested"
  | "cancelled"

/** Whether a failed/cancelled run or task can be retried, and why not when it can't. Never computed by the kit. */
export interface Retryability {
  readonly retryable: boolean
  readonly reason?: string
}

/** Coarse cancellation lifecycle, orthogonal to `RunStatus` so a cancellation-in-flight is never confused with a terminal state. */
export type CancellationState = "none" | "requested" | "cancelled"

/**
 * Why a run is currently waiting on a human — the subset of
 * `PresentationIntent` (`human-interaction.ts`) meaningful in a runtime
 * context. Deliberately a subtype, not a parallel enum, so runtime and
 * human-interaction vocabularies cannot silently drift apart.
 */
export type HumanWaitReason = Extract<
  PresentationIntent,
  "clarification" | "execution-permission" | "proposal-review" | "override"
>

/** A mission — the top-level, possibly multi-run unit of work a product groups runs under. */
export interface MissionSummary {
  readonly id: OpaqueId
  readonly title: string
  readonly description?: string
  readonly status: RuntimeStatus
  readonly riskLevel?: RiskLevel
  readonly createdAt: ISOTimestamp
}

/** Supplied progress toward a run or task's completion. Never a fabricated percentage. */
export interface ProgressSummary {
  readonly completedSteps: number
  readonly totalSteps?: number
  readonly label?: string
}

/** One execution run — a single attempt at carrying out a mission (or a standalone unit of work with no mission). */
export interface RunSummary {
  readonly id: OpaqueId
  readonly missionId?: OpaqueId
  readonly label: string
  readonly agent?: ActorSummary
  readonly status: RunStatus
  readonly progress?: ProgressSummary
  readonly cancellation: CancellationState
  readonly retryability?: Retryability
  readonly humanWaitReason?: HumanWaitReason
  readonly startedAt?: ISOTimestamp
  readonly completedAt?: ISOTimestamp
  readonly correlation?: EventCorrelation
}

/**
 * One unit of agent work within a run. Every `*Refs` field is a list of
 * opaque, supplied references only — this contract never carries the
 * referenced knowledge/relationship/tool/output content itself, and a
 * missing ref must render as "not supplied", never fabricated. Full
 * Trace/Provenance visualization of these references is deferred to
 * Slice 5; here they exist only so `AgentTaskInspector` can list what was
 * referenced without inventing detail it was not given.
 */
export interface AgentTask {
  readonly taskId: OpaqueId
  readonly title: string
  readonly status: RuntimeStatus
  readonly missionId?: OpaqueId
  readonly runId?: OpaqueId
  readonly producedBy?: ActorSummary
  readonly progress?: ProgressSummary
  readonly inputRefs?: readonly OpaqueId[]
  readonly knowledgeRefs?: readonly OpaqueId[]
  readonly relationshipRefs?: readonly OpaqueId[]
  readonly toolCallRefs?: readonly OpaqueId[]
  readonly outputRefs?: readonly OpaqueId[]
  readonly startedAt?: ISOTimestamp
  readonly completedAt?: ISOTimestamp
  readonly correlation?: EventCorrelation
}

/** One entry in a run's chronological execution timeline (`ExecutionTimeline`). */
export interface ExecutionStep {
  readonly id: OpaqueId
  readonly label: string
  readonly status: RuntimeStatus
  readonly occurredAt: ISOTimestamp
  readonly taskId?: OpaqueId
}

/** One artifact a run produced. Wraps the existing `ArtifactRef` rather than duplicating its shape. */
export interface RunOutput {
  readonly id: OpaqueId
  readonly artifact: ArtifactRef
  readonly taskId?: OpaqueId
  readonly producedAt: ISOTimestamp
}

/** One supplied, observed run-level error. Never a fabricated or guessed cause. */
export interface RunError {
  readonly id: OpaqueId
  readonly message: string
  readonly causeSummary?: string
  readonly retryability: Retryability
  readonly occurredAt: ISOTimestamp
  readonly taskId?: OpaqueId
}

/** One task reference inside a `WorkflowGroup`. A thin pointer — the full `AgentTask` is looked up by `taskId` from the caller's own task collection, never duplicated here. */
export interface WorkflowMember {
  readonly id: OpaqueId
  readonly taskId: OpaqueId
}

/**
 * One phase/group in a hierarchical workflow (`WorkflowRunTree`). `status`
 * is supplied by the product, never derived by the kit from `members` —
 * a product may have richer aggregation rules than "any child running
 * means running".
 */
export interface WorkflowGroup {
  readonly id: OpaqueId
  readonly label: string
  readonly status: RuntimeStatus
  readonly members: readonly WorkflowMember[]
}
