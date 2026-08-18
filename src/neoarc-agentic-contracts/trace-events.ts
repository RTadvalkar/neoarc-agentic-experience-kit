/**
 * neoarc-agentic-contracts / trace-events
 *
 * Slice 5 typed payloads for `AgenticEventEnvelope<TPayload>` (see
 * `events.ts`) describing trace/provenance-category backend/runtime
 * events. `neoarc-agentic-projection/trace-node-definitions.ts`,
 * `provenance-node-definitions.ts`, and `activity-node-definitions.ts`
 * consume these.
 *
 * Every event type string here is taken verbatim from
 * `docs/16_NORMALIZED_EVENT_VOCABULARY.json`'s execution / turnStep /
 * inputContext / knowledge / relationship / tool / humanInteraction /
 * artifact / retryError categories — no new type strings are invented.
 * The envelope's own `id` is the `TraceEvent.id` (trace is an append-only
 * log keyed by the event's own identity), so payloads never re-carry an
 * event id. Correlation lives on the envelope (`EventCorrelation`), not
 * duplicated into these payloads either.
 *
 * Human-interaction events reuse `PendingInteraction` (`human-interaction.ts`)
 * and `HumanDecision` (`proposal.ts`) rather than a third parallel shape —
 * the two separate approval domains (execution permission vs. business
 * decision) stay distinct here too, mirrored by `human.clarification.*`
 * and `permission.*` being kept apart from `proposal.review.*`.
 */

import type { OpaqueId } from "./shared"
import type { AvailableOr } from "./shared"
import type { ActorSummary } from "./foundation"
import type { RunError } from "./runtime"
import type { ArtifactRef } from "./conversation"
import type { PendingInteraction } from "./human-interaction"
import type { HumanDecision } from "./proposal"
import type { ToolActionIdentity } from "./human-interaction"
import type {
  ContextTraceDetail,
  KnowledgeUsage,
  ModelPolicyTraceDetail,
  RelationshipUsage,
  RetryTraceDetail,
  RuntimeRecipeTraceDetail,
  SystemInstructionTraceDetail,
  TraceModelRoute,
  TraceTiming,
  TraceUsage,
  UserInputTraceDetail,
} from "./trace"
import type { RuntimeStatus, TraceAccessLevel } from "./foundation"

/** Every trace/provenance-category event type this Slice defines, verbatim from the reserved vocabulary. */
export const TRACE_EVENT_TYPES = [
  "execution.started",
  "execution.completed",
  "execution.failed",
  "turn.started",
  "turn.completed",
  "step.started",
  "step.completed",
  "system_instruction.active",
  "user_input.received",
  "context.supplied",
  "runtime_recipe.active",
  "model_policy.active",
  "model_route.resolved",
  "knowledge.retrieved",
  "knowledge.selected",
  "knowledge.supplied",
  "knowledge.cited",
  "relationship.traversed",
  "relationship.used",
  "tool.started",
  "tool.completed",
  "tool.failed",
  "human.clarification.requested",
  "human.clarification.resolved",
  "permission.requested",
  "permission.resolved",
  "proposal.review.requested",
  "proposal.review.resolved",
  "artifact.started",
  "artifact.produced",
  "artifact.failed",
  "retry.scheduled",
  "retry.started",
  "error.recorded",
] as const

export type TraceEventType = (typeof TRACE_EVENT_TYPES)[number]

export interface ExecutionStartedPayload {
  readonly accessLevel: TraceAccessLevel
}

export interface ExecutionCompletedPayload {
  readonly usage?: TraceUsage
  readonly timing?: TraceTiming
}

export interface ExecutionFailedPayload {
  readonly error: RunError
}

export interface TurnStartedPayload {
  readonly label?: string
}

export interface TurnCompletedPayload {}

export interface StepStartedPayload {
  readonly label?: string
}

export interface StepCompletedPayload {}

export interface SystemInstructionActivePayload {
  readonly detail: SystemInstructionTraceDetail
}

export interface UserInputReceivedPayload {
  readonly detail: UserInputTraceDetail
  readonly actor?: ActorSummary
}

export interface ContextSuppliedPayload {
  readonly detail: ContextTraceDetail
}

export interface RuntimeRecipeActivePayload {
  readonly detail: RuntimeRecipeTraceDetail
}

export interface ModelPolicyActivePayload {
  readonly detail: ModelPolicyTraceDetail
}

export interface ModelRouteResolvedPayload {
  readonly resolvedModel: AvailableOr<TraceModelRoute>
}

/** Shared by all four `knowledge.*` event types — `usage.usageCategory` carries which one occurred. */
export interface KnowledgeUsageEventPayload {
  readonly usage: KnowledgeUsage
}

/** Shared by both `relationship.*` event types — `usage.usageCategory` carries which one occurred. */
export interface RelationshipUsageEventPayload {
  readonly usage: RelationshipUsage
}

export interface ToolStartedPayload {
  readonly action: ToolActionIdentity
}

export interface ToolCompletedPayload {
  readonly action: ToolActionIdentity
  readonly status: RuntimeStatus
  readonly resultSummary?: string
}

export interface ToolFailedPayload {
  readonly action: ToolActionIdentity
  readonly error: RunError
}

/** Shared by `human.clarification.requested`/`permission.requested` — both are pending-interaction facts, distinguished by `interaction.presentationIntent`. */
export interface HumanInteractionRequestedPayload {
  readonly interaction: PendingInteraction
}

/** Shared by `human.clarification.resolved`/`permission.resolved`. */
export interface HumanInteractionResolvedPayload {
  readonly interactionId: OpaqueId
  readonly outcome: string
}

export interface ProposalReviewRequestedPayload {
  readonly proposalId: OpaqueId
  readonly label: string
}

/** A business-decision resolution — reuses `HumanDecision`, never the execution-permission outcome vocabulary. */
export interface ProposalReviewResolvedPayload {
  readonly decision: HumanDecision
}

export interface ArtifactStartedPayload {
  readonly artifact: ArtifactRef
}

export interface ArtifactProducedPayload {
  readonly artifact: ArtifactRef
  readonly producedByNodeId?: OpaqueId
}

export interface ArtifactFailedPayload {
  readonly artifact: ArtifactRef
  readonly error: RunError
}

export interface RetryScheduledPayload {
  readonly detail: RetryTraceDetail
}

export interface RetryStartedPayload {
  readonly attempt: number
}

export interface ErrorRecordedPayload {
  readonly error: RunError
}

/** Discriminated-by-caller union of every trace/provenance event payload. Consumers narrow via `event.type`. */
export type TraceEventPayload =
  | ExecutionStartedPayload
  | ExecutionCompletedPayload
  | ExecutionFailedPayload
  | TurnStartedPayload
  | TurnCompletedPayload
  | StepStartedPayload
  | StepCompletedPayload
  | SystemInstructionActivePayload
  | UserInputReceivedPayload
  | ContextSuppliedPayload
  | RuntimeRecipeActivePayload
  | ModelPolicyActivePayload
  | ModelRouteResolvedPayload
  | KnowledgeUsageEventPayload
  | RelationshipUsageEventPayload
  | ToolStartedPayload
  | ToolCompletedPayload
  | ToolFailedPayload
  | HumanInteractionRequestedPayload
  | HumanInteractionResolvedPayload
  | ProposalReviewRequestedPayload
  | ProposalReviewResolvedPayload
  | ArtifactStartedPayload
  | ArtifactProducedPayload
  | ArtifactFailedPayload
  | RetryScheduledPayload
  | RetryStartedPayload
  | ErrorRecordedPayload
