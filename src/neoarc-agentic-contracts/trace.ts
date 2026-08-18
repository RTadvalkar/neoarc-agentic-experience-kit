/**
 * neoarc-agentic-contracts / trace
 *
 * Slice 5. Execution provenance, not private reasoning: this module models
 * *observable/supplied* execution facts for the forensic Trace view — never
 * a model's hidden chain-of-thought. Every field here is either present
 * because a product adapter supplied it, or explicitly marked unavailable
 * via `AvailableOr`/`UnavailableReason` (`shared.ts`). Nothing in this file
 * is computed, inferred, or fabricated by the kit.
 *
 * This module deliberately reuses existing contracts rather than
 * re-declaring parallel shapes: `ActorSummary` (`foundation.ts`) for actor
 * identity, `RunError` (`runtime.ts`) for error facts, `ArtifactRef`
 * (`conversation.ts`) for artifact facts, `ToolActionIdentity`
 * (`human-interaction.ts`) for tool identity, `PendingInteraction`
 * (`human-interaction.ts`) and `HumanDecision` (`proposal.ts`) for the two
 * human-interaction domains, and `EventCorrelation` (`events.ts`) for
 * correlation keys. `TraceAccessLevel`/`RedactionState` (`foundation.ts`)
 * are reused as-is, never re-typed.
 */

import type { ISOTimestamp, OpaqueId } from "./shared"
import type { AvailableOr } from "./shared"
import type { ActorSummary, RuntimeStatus, TraceAccessLevel } from "./foundation"
import type { EventCorrelation } from "./events"
import type { RunError } from "./runtime"
import type { ArtifactRef } from "./conversation"
import type { ToolActionIdentity } from "./human-interaction"

/**
 * Every kind of observable execution fact the Trace view can render, per
 * `docs/07_TRACE_AND_PROVENANCE.prompt.md` §"Execution provenance, not
 * private reasoning". Deliberately excludes anything resembling raw model
 * reasoning/thoughts — there is no `"reasoning"` kind in this union.
 */
export type TraceEventKind =
  | "system-instruction"
  | "user-input"
  | "context"
  | "runtime-recipe"
  | "model-policy"
  | "resolved-model"
  | "knowledge"
  | "relationship"
  | "tool"
  | "agent-activity"
  | "human-interaction"
  | "proposal"
  | "artifact"
  | "error"
  | "retry"

/** Identity + version facts for a system instruction, supplied only. */
export interface SystemInstructionTraceDetail {
  readonly instructionId?: OpaqueId
  readonly version?: string
  readonly label?: string
}

/** The raw user input that started or continued a turn. Supplied verbatim, never summarized. */
export interface UserInputTraceDetail {
  readonly text: string
}

/** One piece of supplied context (workspace/section/product context) fed into the run. */
export interface ContextTraceDetail {
  readonly label: string
  readonly value?: string
}

/** Identity + version facts for the semantic runtime recipe in effect. */
export interface RuntimeRecipeTraceDetail {
  readonly recipeId?: OpaqueId
  readonly version?: string
  readonly label?: string
}

/** Identity + version facts for the model policy in effect. */
export interface ModelPolicyTraceDetail {
  readonly policyId?: OpaqueId
  readonly version?: string
  readonly label?: string
}

/**
 * The model actually resolved/targeted for this turn — explicitly
 * `AvailableOr`-wrapped because whether this is shown at all is
 * permission-aware (an adapter may withhold it as `insufficient_access`).
 */
export interface TraceModelRoute {
  readonly modelId: string
  readonly provider?: string
  readonly version?: string
}

/** How one piece of knowledge was used, distinguishing retrieved/selected/supplied/cited per Gate 5 — never collapsed into a single "used" concept. */
export type KnowledgeUsageCategory = "retrieved" | "selected" | "supplied" | "cited"

/** One supplied fact about knowledge usage. `score` is optional and never computed/defaulted when absent. */
export interface KnowledgeUsage {
  readonly knowledgeId?: OpaqueId
  readonly title?: string
  readonly sourceType?: string
  readonly usageCategory: KnowledgeUsageCategory
  readonly score?: number
}

/** How one relationship traversal/edge was used. Importance is never inferred solely from traversal — `usageCategory` must be supplied. */
export type RelationshipUsageCategory = "retrieval" | "context" | "evidence" | "impact"

/** One supplied fact about a relationship traversal, per spec §"Relationship usage". */
export interface RelationshipUsage {
  readonly relationshipId?: OpaqueId
  readonly sourceEntity: string
  readonly predicate: string
  readonly targetEntity: string
  readonly traversalDepth?: number
  readonly usageCategory: RelationshipUsageCategory
}

/** A sanitized summary of one tool invocation for the forensic Trace view — never raw tool I/O. */
export interface ToolTraceDetail {
  readonly action: ToolActionIdentity
  readonly status: RuntimeStatus
  readonly resultSummary?: string
}

/** A safe activity summary — the same vocabulary `ActivitySummary` (`conversation.ts`) uses, kept here as the Trace-detail shape for `"agent-activity"` events. */
export interface AgentActivityTraceDetail {
  readonly label: string
  readonly status?: RuntimeStatus
}

/**
 * Which sub-kind of human interaction a `"human-interaction"` trace event
 * concerns. Deliberately narrower than the full `PresentationIntent`
 * (`human-interaction.ts`) — the `"human-interaction"` `TraceEventKind`
 * only ever covers `human.clarification.*`/`permission.*` events; business
 * decisions (`proposal.review.*`) project to the separate `"proposal"`
 * kind instead, so the two approval domains stay visually distinct rather
 * than collapsing into one generic domain field.
 */
export type HumanInteractionTraceDomain = "clarification" | "execution-permission"

/** Supplied facts about one human interaction event, referencing the interaction by id rather than duplicating its full shape. */
export interface HumanInteractionTraceDetail {
  readonly domain: HumanInteractionTraceDomain
  readonly interactionId: OpaqueId
  readonly label: string
  readonly outcome?: string
}

/** Supplied facts about one proposal-related trace event. */
export interface ProposalTraceDetail {
  readonly proposalId: OpaqueId
  readonly label: string
  readonly action?: string
}

/** Retry scheduling facts — distinct from `error`, per the reserved `retry.scheduled` vocabulary entry. */
export interface RetryTraceDetail {
  readonly attempt: number
  readonly reason?: string
  readonly scheduledFor?: ISOTimestamp
}

/**
 * The per-kind detail payload for a `TraceEvent`. Discriminated by the
 * event's own `kind` — components narrow through a closed switch
 * (`TraceInspector`), never a fallthrough default that guesses shape.
 */
export type TraceEventDetail =
  | { readonly kind: "system-instruction"; readonly value: SystemInstructionTraceDetail }
  | { readonly kind: "user-input"; readonly value: UserInputTraceDetail }
  | { readonly kind: "context"; readonly value: ContextTraceDetail }
  | { readonly kind: "runtime-recipe"; readonly value: RuntimeRecipeTraceDetail }
  | { readonly kind: "model-policy"; readonly value: ModelPolicyTraceDetail }
  | { readonly kind: "resolved-model"; readonly value: AvailableOr<TraceModelRoute> }
  | { readonly kind: "knowledge"; readonly value: KnowledgeUsage }
  | { readonly kind: "relationship"; readonly value: RelationshipUsage }
  | { readonly kind: "tool"; readonly value: ToolTraceDetail }
  | { readonly kind: "agent-activity"; readonly value: AgentActivityTraceDetail }
  | { readonly kind: "human-interaction"; readonly value: HumanInteractionTraceDetail }
  | { readonly kind: "proposal"; readonly value: ProposalTraceDetail }
  | { readonly kind: "artifact"; readonly value: ArtifactRef }
  | { readonly kind: "error"; readonly value: RunError }
  | { readonly kind: "retry"; readonly value: RetryTraceDetail }

/**
 * One forensic execution fact in the Trace view. `id` is the event's own
 * stable identity (Trace is an append-only chronological log — there is no
 * separate accumulating "trace node" business identity the way a run or
 * task has one). `correlation` keys into `turnId`/`stepId` for grouping.
 */
export interface TraceEvent {
  readonly id: OpaqueId
  readonly occurredAt: ISOTimestamp
  readonly detail: TraceEventDetail
  readonly actor?: ActorSummary
  readonly correlation?: EventCorrelation
}

/** A stable grouping of trace events by turn, referencing events by id — never duplicating event content. */
export interface TraceTurn {
  readonly id: OpaqueId
  readonly label?: string
  readonly occurredAt: ISOTimestamp
  readonly eventIds: readonly OpaqueId[]
}

/** A stable grouping of trace events by step within a turn, referencing events by id. */
export interface TraceStep {
  readonly id: OpaqueId
  readonly turnId: OpaqueId
  readonly label?: string
  readonly occurredAt: ISOTimestamp
  readonly eventIds: readonly OpaqueId[]
}

/** Supplied token/cost-style usage facts. Every field optional and never computed by the kit. */
export interface TraceUsage {
  readonly inputTokens?: number
  readonly outputTokens?: number
  readonly totalTokens?: number
  readonly costLabel?: string
}

/** Supplied latency facts. Every field optional and never computed by the kit. */
export interface TraceTiming {
  readonly queuedMs?: number
  readonly runningMs?: number
  readonly totalMs?: number
}

/**
 * Top-level summary of one execution trace. `accessLevel` documents which
 * `TraceAccessLevel` the supplied data already reflects — it is descriptive
 * of what the adapter chose to include, never something the UI enforces.
 */
export interface ExecutionTraceSummary {
  readonly id: OpaqueId
  readonly startedAt: ISOTimestamp
  readonly completedAt?: ISOTimestamp
  readonly status: RuntimeStatus
  readonly accessLevel: TraceAccessLevel
  readonly usage?: TraceUsage
  readonly timing?: TraceTiming
}
