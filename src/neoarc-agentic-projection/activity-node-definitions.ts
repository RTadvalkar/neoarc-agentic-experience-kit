/**
 * neoarc-agentic-projection / activity-node-definitions
 *
 * Slice 5 built-in `AgenticNodeDefinition` for the Activity view (target
 * `"activity"`, reserved since Slice 1's `AgenticViewTarget` but left
 * unpopulated until now). Activity is the "concise safe progress" surface
 * per docs/07 §"Alternate execution views" — the same underlying facts as
 * Trace/Provenance/Mission, reduced to one-line, always-safe-to-render
 * status entries.
 *
 * Reuses the existing `ActivitySummary` shape (`conversation.ts`, already
 * used by the conversation family's `"conversation.activity"` kind) rather
 * than declaring a new type — this is genuinely the same vocabulary, just
 * fed from a broader event set (task/run/tool/artifact/human-interaction),
 * not only conversation-authored activity updates.
 *
 * One-shot per event (append-only feed, not accumulating per business id)
 * — keyed by the event's own id, exactly like `traceEventNodeDefinition`.
 */

import type { AgenticEventEnvelope } from "../neoarc-agentic-contracts/events"
import type { ActivitySummary } from "../neoarc-agentic-contracts/conversation"
import type {
  RunCompletedPayload,
  RunFailedPayload,
  RunWaitingForHumanPayload,
  TaskCompletedPayload,
  TaskStartedPayload,
} from "../neoarc-agentic-contracts/runtime-events"
import type {
  ArtifactProducedPayload,
  HumanInteractionRequestedPayload,
  HumanInteractionResolvedPayload,
  ProposalReviewRequestedPayload,
  ProposalReviewResolvedPayload,
  ToolCompletedPayload,
  ToolFailedPayload,
  ToolStartedPayload,
} from "../neoarc-agentic-contracts/trace-events"
import type { AgenticNodeDefinition, AgenticViewNode, MatchResult } from "./types"

const TARGET = "activity" as const

function activityNodeOf(event: AgenticEventEnvelope, summary: ActivitySummary): AgenticViewNode<ActivitySummary> {
  return { key: `activity:entry:${event.id}`, kind: "activity.entry", target: TARGET, data: summary, visibility: "visible", correlation: event.correlation }
}

/** `activity.entry` — a terse, always-safe one-line status derived from the same broad event set Trace/Provenance also read. */
export const activityEntryNodeDefinition: AgenticNodeDefinition<unknown, ActivitySummary> = {
  kind: "activity.entry",
  target: TARGET,
  publicationCadence: "immediate",
  match(event): MatchResult {
    switch (event.type) {
      case "task.started":
      case "task.completed":
      case "run.waiting_for_human":
      case "run.completed":
      case "run.failed":
      case "tool.started":
      case "tool.completed":
      case "tool.failed":
      case "human.clarification.requested":
      case "human.clarification.resolved":
      case "permission.requested":
      case "permission.resolved":
      case "proposal.review.requested":
      case "proposal.review.resolved":
      case "artifact.produced":
        return { matched: true, kind: "activity.entry", target: TARGET }
      default:
        return { matched: false }
    }
  },
  project(event) {
    return activityNodeOf(event, summaryFor(event))
  },
}

function summaryFor(event: AgenticEventEnvelope): ActivitySummary {
  const id = event.id
  const occurredAt = event.occurredAt
  switch (event.type) {
    case "task.started":
      return { id, label: `Started: ${(event.payload as TaskStartedPayload).task.title}`, occurredAt, status: "running" }
    case "task.completed": {
      const payload = event.payload as TaskCompletedPayload
      return { id, label: `Task ${payload.status}`, occurredAt, status: payload.status }
    }
    case "run.waiting_for_human":
      return { id, label: (event.payload as RunWaitingForHumanPayload).interaction.label, occurredAt, status: "waiting_for_human" }
    case "run.completed":
      return { id, label: "Run completed", occurredAt, status: "completed" }
    case "run.failed":
      return { id, label: (event.payload as RunFailedPayload).error.message, occurredAt, status: "failed" }
    case "tool.started":
      return { id, label: `Running: ${(event.payload as ToolStartedPayload).action.actionSummary}`, occurredAt, status: "running" }
    case "tool.completed": {
      const payload = event.payload as ToolCompletedPayload
      return { id, label: payload.action.actionSummary, occurredAt, status: payload.status }
    }
    case "tool.failed":
      return { id, label: `Failed: ${(event.payload as ToolFailedPayload).action.actionSummary}`, occurredAt, status: "failed" }
    case "human.clarification.requested":
      return { id, label: (event.payload as HumanInteractionRequestedPayload).interaction.label, occurredAt, status: "waiting_for_human" }
    case "human.clarification.resolved":
      return { id, label: `Clarification resolved: ${(event.payload as HumanInteractionResolvedPayload).outcome}`, occurredAt, status: "completed" }
    case "permission.requested":
      return { id, label: (event.payload as HumanInteractionRequestedPayload).interaction.label, occurredAt, status: "waiting_for_human" }
    case "permission.resolved":
      return { id, label: `Permission ${(event.payload as HumanInteractionResolvedPayload).outcome}`, occurredAt, status: "completed" }
    case "proposal.review.requested":
      return { id, label: (event.payload as ProposalReviewRequestedPayload).label, occurredAt, status: "waiting_for_human" }
    case "proposal.review.resolved":
      return { id, label: `Proposal ${(event.payload as ProposalReviewResolvedPayload).decision.action}d`, occurredAt, status: "completed" }
    default: {
      // "artifact.produced"
      const payload = event.payload as ArtifactProducedPayload
      return { id, label: `Produced: ${payload.artifact.name}`, occurredAt, status: "completed" }
    }
  }
}

/** Every built-in activity node definition. */
export const activityNodeDefinitions: readonly AgenticNodeDefinition<unknown, ActivitySummary>[] = [activityEntryNodeDefinition]
