/**
 * neoarc-agentic-projection / trace-node-definitions
 *
 * Slice 5 built-in `AgenticNodeDefinition`s for the Trace view (target
 * `"trace"`). Two definitions, deliberately kept thin:
 *
 * 1. `traceSummaryNodeDefinition` (`"trace.summary"`) — the one genuinely
 *    accumulating node: an `ExecutionTraceSummary` transitions
 *    running -> completed/failed across `execution.started/completed/failed`,
 *    keyed by the trace's own stable `correlation.executionTraceId`
 *    (never event id, never array position).
 * 2. `traceEventNodeDefinition` (`"trace.event"`) — one node per matched
 *    content event, keyed by the event's own `id`. Trace is inherently an
 *    append-only chronological log, so the event id IS the stable business
 *    identity here — unlike `traceSummaryNodeDefinition` above.
 *
 * `turn.started`/`turn.completed`/`step.started`/`step.completed` are
 * intentionally *not* matched here — they are pure structural bookends
 * with no `TraceEventKind` of their own. `TraceExplorer`/`TraceTimeline`
 * group the flat `"trace.event"` list into turns/steps client-side by
 * reading `correlation.turnId`/`stepId` off each already-projected node,
 * so no second accumulating "turn"/"step" node kind is needed — keeping
 * this projector thin and honest, per
 * docs/07_TRACE_AND_PROVENANCE.prompt.md's projection guidance.
 */

import type { AgenticEventEnvelope } from "../neoarc-agentic-contracts/events"
import type {
  ArtifactFailedPayload,
  ArtifactProducedPayload,
  ArtifactStartedPayload,
  ContextSuppliedPayload,
  ErrorRecordedPayload,
  ExecutionCompletedPayload,
  ExecutionFailedPayload,
  ExecutionStartedPayload,
  HumanInteractionRequestedPayload,
  HumanInteractionResolvedPayload,
  KnowledgeUsageEventPayload,
  ModelPolicyActivePayload,
  ModelRouteResolvedPayload,
  ProposalReviewRequestedPayload,
  ProposalReviewResolvedPayload,
  RelationshipUsageEventPayload,
  RetryScheduledPayload,
  RetryStartedPayload,
  RuntimeRecipeActivePayload,
  SystemInstructionActivePayload,
  ToolCompletedPayload,
  ToolFailedPayload,
  ToolStartedPayload,
  UserInputReceivedPayload,
} from "../neoarc-agentic-contracts/trace-events"
import type { ExecutionTraceSummary, TraceEvent, TraceEventDetail } from "../neoarc-agentic-contracts/trace"
import type { AgenticNodeDefinition, AgenticViewNode, MatchResult } from "./types"

const TARGET = "trace" as const

function summaryNodeOf(
  key: string,
  data: ExecutionTraceSummary,
  event: AgenticEventEnvelope,
): AgenticViewNode<ExecutionTraceSummary> {
  return { key, kind: "trace.summary", target: TARGET, data, visibility: "visible", correlation: event.correlation }
}

function eventNodeOf(event: AgenticEventEnvelope, data: TraceEvent): AgenticViewNode<TraceEvent> {
  return { key: `trace:event:${event.id}`, kind: "trace.event", target: TARGET, data, visibility: "visible", correlation: event.correlation }
}

/** `trace.summary` — one node per execution trace, transitioning running -> completed/failed, keyed by `executionTraceId`. */
export const traceSummaryNodeDefinition: AgenticNodeDefinition<unknown, ExecutionTraceSummary> = {
  kind: "trace.summary",
  target: TARGET,
  publicationCadence: "immediate",
  match(event): MatchResult {
    if (event.type === "execution.started" || event.type === "execution.completed" || event.type === "execution.failed") {
      return { matched: true, kind: "trace.summary", target: TARGET }
    }
    return { matched: false }
  },
  project(event, context) {
    const traceId = event.correlation?.executionTraceId ?? event.id
    const key = `trace:summary:${traceId}`
    const existing = context.findExistingNode?.(key) as AgenticViewNode<ExecutionTraceSummary> | undefined

    if (event.type === "execution.started") {
      const payload = event.payload as ExecutionStartedPayload
      const summary: ExecutionTraceSummary = {
        id: traceId,
        startedAt: event.occurredAt,
        status: "running",
        accessLevel: payload.accessLevel,
      }
      return summaryNodeOf(key, summary, event)
    }

    const base: ExecutionTraceSummary = existing?.data ?? {
      id: traceId,
      startedAt: event.occurredAt,
      status: "running",
      accessLevel: "USER",
    }

    if (event.type === "execution.completed") {
      const payload = event.payload as ExecutionCompletedPayload
      const summary: ExecutionTraceSummary = {
        ...base,
        completedAt: event.occurredAt,
        status: "completed",
        usage: payload.usage,
        timing: payload.timing,
      }
      return summaryNodeOf(key, summary, event)
    }

    // execution.failed
    const summary: ExecutionTraceSummary = { ...base, completedAt: event.occurredAt, status: "failed" }
    return summaryNodeOf(key, summary, event)
  },
}

/** `trace.event` — one node per matched content event, keyed by the event's own id. */
export const traceEventNodeDefinition: AgenticNodeDefinition<unknown, TraceEvent> = {
  kind: "trace.event",
  target: TARGET,
  publicationCadence: "immediate",
  match(event): MatchResult {
    switch (event.type) {
      case "execution.failed":
      case "system_instruction.active":
      case "user_input.received":
      case "context.supplied":
      case "runtime_recipe.active":
      case "model_policy.active":
      case "model_route.resolved":
      case "knowledge.retrieved":
      case "knowledge.selected":
      case "knowledge.supplied":
      case "knowledge.cited":
      case "relationship.traversed":
      case "relationship.used":
      case "tool.started":
      case "tool.completed":
      case "tool.failed":
      case "human.clarification.requested":
      case "human.clarification.resolved":
      case "permission.requested":
      case "permission.resolved":
      case "proposal.review.requested":
      case "proposal.review.resolved":
      case "artifact.started":
      case "artifact.produced":
      case "artifact.failed":
      case "retry.scheduled":
      case "retry.started":
      case "error.recorded":
        return { matched: true, kind: "trace.event", target: TARGET }
      default:
        return { matched: false }
    }
  },
  project(event) {
    const detail = detailFor(event)
    const actor = "actor" in (event.payload as Record<string, unknown>) ? (event.payload as UserInputReceivedPayload).actor : undefined
    const data: TraceEvent = {
      id: event.id,
      occurredAt: event.occurredAt,
      detail,
      actor,
      correlation: event.correlation,
    }
    return eventNodeOf(event, data)
  },
}

function detailFor(event: AgenticEventEnvelope): TraceEventDetail {
  switch (event.type) {
    case "system_instruction.active":
      return { kind: "system-instruction", value: (event.payload as SystemInstructionActivePayload).detail }
    case "user_input.received":
      return { kind: "user-input", value: (event.payload as UserInputReceivedPayload).detail }
    case "context.supplied":
      return { kind: "context", value: (event.payload as ContextSuppliedPayload).detail }
    case "runtime_recipe.active":
      return { kind: "runtime-recipe", value: (event.payload as RuntimeRecipeActivePayload).detail }
    case "model_policy.active":
      return { kind: "model-policy", value: (event.payload as ModelPolicyActivePayload).detail }
    case "model_route.resolved":
      return { kind: "resolved-model", value: (event.payload as ModelRouteResolvedPayload).resolvedModel }
    case "knowledge.retrieved":
    case "knowledge.selected":
    case "knowledge.supplied":
    case "knowledge.cited":
      return { kind: "knowledge", value: (event.payload as KnowledgeUsageEventPayload).usage }
    case "relationship.traversed":
    case "relationship.used":
      return { kind: "relationship", value: (event.payload as RelationshipUsageEventPayload).usage }
    case "tool.started": {
      const payload = event.payload as ToolStartedPayload
      return { kind: "tool", value: { action: payload.action, status: "running" } }
    }
    case "tool.completed": {
      const payload = event.payload as ToolCompletedPayload
      return { kind: "tool", value: { action: payload.action, status: payload.status, resultSummary: payload.resultSummary } }
    }
    case "tool.failed": {
      const payload = event.payload as ToolFailedPayload
      return { kind: "tool", value: { action: payload.action, status: "failed", resultSummary: payload.error.message } }
    }
    case "human.clarification.requested": {
      const payload = event.payload as HumanInteractionRequestedPayload
      return {
        kind: "human-interaction",
        value: { domain: "clarification", interactionId: payload.interaction.id, label: payload.interaction.label },
      }
    }
    case "permission.requested": {
      const payload = event.payload as HumanInteractionRequestedPayload
      return {
        kind: "human-interaction",
        value: { domain: "execution-permission", interactionId: payload.interaction.id, label: payload.interaction.label },
      }
    }
    case "human.clarification.resolved": {
      const payload = event.payload as HumanInteractionResolvedPayload
      return {
        kind: "human-interaction",
        value: { domain: "clarification", interactionId: payload.interactionId, label: "Clarification resolved", outcome: payload.outcome },
      }
    }
    case "permission.resolved": {
      const payload = event.payload as HumanInteractionResolvedPayload
      return {
        kind: "human-interaction",
        value: { domain: "execution-permission", interactionId: payload.interactionId, label: "Execution permission resolved", outcome: payload.outcome },
      }
    }
    case "proposal.review.requested": {
      const payload = event.payload as ProposalReviewRequestedPayload
      return { kind: "proposal", value: { proposalId: payload.proposalId, label: payload.label } }
    }
    case "proposal.review.resolved": {
      const payload = event.payload as ProposalReviewResolvedPayload
      return {
        kind: "proposal",
        value: { proposalId: payload.decision.id, label: "Proposal review resolved", action: payload.decision.action },
      }
    }
    case "artifact.started":
      return { kind: "artifact", value: (event.payload as ArtifactStartedPayload).artifact }
    case "artifact.produced":
      return { kind: "artifact", value: (event.payload as ArtifactProducedPayload).artifact }
    case "artifact.failed":
      return { kind: "artifact", value: (event.payload as ArtifactFailedPayload).artifact }
    case "retry.scheduled":
      return { kind: "retry", value: (event.payload as RetryScheduledPayload).detail }
    case "retry.started": {
      const payload = event.payload as RetryStartedPayload
      return { kind: "retry", value: { attempt: payload.attempt } }
    }
    case "error.recorded":
      return { kind: "error", value: (event.payload as ErrorRecordedPayload).error }
    default: {
      // "execution.failed" is matched but has no dedicated content kind of
      // its own beyond reusing "error" — projects the same RunError shape.
      const payload = event.payload as ExecutionFailedPayload
      return { kind: "error", value: payload.error }
    }
  }
}

/** Every built-in trace node definition, in match-priority order. */
export const traceNodeDefinitions: readonly AgenticNodeDefinition<unknown, ExecutionTraceSummary | TraceEvent>[] = [
  traceSummaryNodeDefinition,
  traceEventNodeDefinition,
]
