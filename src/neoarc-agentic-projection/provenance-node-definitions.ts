/**
 * neoarc-agentic-projection / provenance-node-definitions
 *
 * Slice 5 built-in `AgenticNodeDefinition`s for the Provenance view (target
 * `"provenance"`) — "how did we get from user intent to this artifact?",
 * per docs/07's lineage chain (User Intent -> Mission -> Agent Task ->
 * Knowledge/Relationships/Tools/Decisions -> Proposal -> Artifact).
 *
 * Two definitions:
 * 1. `provenanceNodeDefinition` (`"provenance.node"`) — one `ProvenanceNode`
 *    per matched event, keyed by the entity's own supplied id.
 * 2. `provenanceEdgeNodeDefinition` (`"provenance.edge"`) — one
 *    `ProvenanceEdge` **only** when the source event itself supplies a
 *    producer reference (currently `ArtifactProducedPayload.producedByNodeId`).
 *    No edge is ever inferred from event ordering or timing proximity — an
 *    artifact produced without a supplied `producedByNodeId` gets a node
 *    with no incoming edge, which is the honest result, not a gap to be
 *    silently filled in.
 *
 * Reuses the runtime-category event types (`mission.started`/`task.started`,
 * `runtime-events.ts`) alongside the trace-category ones — provenance is
 * the one view that legitimately spans both categories, since lineage
 * starts at the mission/task level.
 */

import type { AgenticEventEnvelope } from "../neoarc-agentic-contracts/events"
import type { MissionStartedPayload, TaskStartedPayload } from "../neoarc-agentic-contracts/runtime-events"
import type {
  ArtifactProducedPayload,
  KnowledgeUsageEventPayload,
  ProposalReviewRequestedPayload,
  ProposalReviewResolvedPayload,
  RelationshipUsageEventPayload,
  ToolCompletedPayload,
  UserInputReceivedPayload,
} from "../neoarc-agentic-contracts/trace-events"
import type { ProvenanceEdge, ProvenanceNode } from "../neoarc-agentic-contracts/provenance"
import type { AgenticNodeDefinition, AgenticViewNode, MatchResult } from "./types"

const TARGET = "provenance" as const

function nodeKey(entityKind: string, id: string): string {
  return `provenance:node:${entityKind}:${id}`
}

function nodeOf(node: ProvenanceNode, event: AgenticEventEnvelope): AgenticViewNode<ProvenanceNode> {
  return { key: nodeKey(node.entityKind, node.id), kind: "provenance.node", target: TARGET, data: node, visibility: "visible", correlation: event.correlation }
}

/** `provenance.node` — one node per matched event, keyed by the entity's own supplied id. */
export const provenanceNodeDefinition: AgenticNodeDefinition<unknown, ProvenanceNode> = {
  kind: "provenance.node",
  target: TARGET,
  publicationCadence: "immediate",
  match(event): MatchResult {
    switch (event.type) {
      case "user_input.received":
      case "mission.started":
      case "task.started":
      case "knowledge.selected":
      case "relationship.used":
      case "tool.completed":
      case "proposal.review.requested":
      case "proposal.review.resolved":
      case "artifact.produced":
        return { matched: true, kind: "provenance.node", target: TARGET }
      default:
        return { matched: false }
    }
  },
  project(event) {
    const node = provenanceNodeFor(event)
    return nodeOf(node, event)
  },
}

function provenanceNodeFor(event: AgenticEventEnvelope): ProvenanceNode {
  switch (event.type) {
    case "user_input.received": {
      const payload = event.payload as UserInputReceivedPayload
      return { id: event.id, entityKind: "intent", label: payload.detail.text, occurredAt: event.occurredAt, correlation: event.correlation }
    }
    case "mission.started": {
      const payload = event.payload as MissionStartedPayload
      return { id: payload.mission.id, entityKind: "mission", label: payload.mission.title, occurredAt: event.occurredAt, correlation: event.correlation }
    }
    case "task.started": {
      const payload = event.payload as TaskStartedPayload
      return { id: payload.task.taskId, entityKind: "task", label: payload.task.title, occurredAt: event.occurredAt, correlation: event.correlation }
    }
    case "knowledge.selected": {
      const payload = event.payload as KnowledgeUsageEventPayload
      const id = payload.usage.knowledgeId ?? event.id
      return { id, entityKind: "knowledge", label: payload.usage.title ?? "Knowledge", occurredAt: event.occurredAt, correlation: event.correlation }
    }
    case "relationship.used": {
      const payload = event.payload as RelationshipUsageEventPayload
      const id = payload.usage.relationshipId ?? event.id
      return {
        id,
        entityKind: "relationship",
        label: `${payload.usage.sourceEntity} \u2192 ${payload.usage.predicate} \u2192 ${payload.usage.targetEntity}`,
        occurredAt: event.occurredAt,
        correlation: event.correlation,
      }
    }
    case "tool.completed": {
      const payload = event.payload as ToolCompletedPayload
      const id = event.correlation?.toolCallId ?? event.id
      return { id, entityKind: "tool", label: payload.action.actionSummary, occurredAt: event.occurredAt, correlation: event.correlation }
    }
    case "proposal.review.requested": {
      const payload = event.payload as ProposalReviewRequestedPayload
      return { id: payload.proposalId, entityKind: "proposal", label: payload.label, occurredAt: event.occurredAt, correlation: event.correlation }
    }
    case "proposal.review.resolved": {
      const payload = event.payload as ProposalReviewResolvedPayload
      return {
        id: payload.decision.id,
        entityKind: "decision",
        label: `Decision: ${payload.decision.action}`,
        occurredAt: event.occurredAt,
        correlation: event.correlation,
      }
    }
    default: {
      // "artifact.produced"
      const payload = event.payload as ArtifactProducedPayload
      return { id: payload.artifact.id, entityKind: "artifact", label: payload.artifact.name, occurredAt: event.occurredAt, correlation: event.correlation }
    }
  }
}

/** `provenance.edge` — one edge only when the source event supplies a producer reference. Never inferred. */
export const provenanceEdgeNodeDefinition: AgenticNodeDefinition<unknown, ProvenanceEdge> = {
  kind: "provenance.edge",
  target: TARGET,
  publicationCadence: "immediate",
  match(event): MatchResult {
    if (event.type !== "artifact.produced") return { matched: false }
    const payload = event.payload as ArtifactProducedPayload
    if (!payload.producedByNodeId) return { matched: false }
    return { matched: true, kind: "provenance.edge", target: TARGET }
  },
  project(event) {
    const payload = event.payload as ArtifactProducedPayload
    // `match` already guarantees `producedByNodeId` is present.
    const fromNodeId = payload.producedByNodeId as string
    const edge: ProvenanceEdge = {
      id: `provenance:edge:${fromNodeId}:${payload.artifact.id}`,
      fromNodeId,
      toNodeId: payload.artifact.id,
      relation: "produced",
    }
    return { key: edge.id, kind: "provenance.edge", target: TARGET, data: edge, visibility: "visible", correlation: event.correlation }
  },
}

/** Every built-in provenance node definition, in match-priority order. */
export const provenanceNodeDefinitions: readonly AgenticNodeDefinition<unknown, ProvenanceNode | ProvenanceEdge>[] = [
  provenanceNodeDefinition,
  provenanceEdgeNodeDefinition,
]
