/**
 * lib/showcase/trace-gallery-fixtures
 *
 * SHOWCASE-ONLY. Fixtures for the Trace UI family entries in the
 * Foundation Component Gallery (`component-gallery.tsx`). Kept out of
 * `src/neoarc-agentic-ui` per docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md
 * ("keep mock data outside reusable components"). Distinct from
 * `lib/showcase/trace-fixtures.ts`, which supplies the full replayable
 * "Architecture agent run" event stream for the Execution Lab scenario —
 * these are small, standalone `TraceEvent` literals for exercising each
 * Trace component's props/states directly.
 */

import type {
  KnowledgeUsageCategory,
  RelationshipUsageCategory,
  TraceEvent,
  TraceStep,
  TraceTiming,
  TraceTurn,
  TraceUsage,
} from "../../src/neoarc-agentic-contracts/trace"
import type { AvailableOr } from "../../src/neoarc-agentic-contracts/shared"
import type { ActorSummary } from "../../src/neoarc-agentic-contracts/foundation"

export const galleryTraceActor: ActorSummary = {
  id: "agent-architecture",
  kind: "agent",
  displayName: "Architecture agent",
  secondaryLabel: "v2.1.0",
}

export const galleryTraceHumanActor: ActorSummary = {
  id: "user-jamie",
  kind: "human",
  displayName: "Jamie Chen",
}

export const galleryKnowledgeUsageCategories: readonly KnowledgeUsageCategory[] = ["retrieved", "selected", "supplied", "cited"]
export const galleryRelationshipUsageCategories: readonly RelationshipUsageCategory[] = ["retrieval", "context", "evidence", "impact"]

export const galleryResolvedModelAvailable: AvailableOr<{ modelId: string; provider?: string; version?: string }> = {
  available: true,
  value: { modelId: "architecture-reasoning-large", provider: "internal", version: "2026-06" },
}

export const galleryResolvedModelUnavailable: AvailableOr<{ modelId: string; provider?: string; version?: string }> = {
  available: false,
  reason: "insufficient_access",
}

export const galleryTraceUsage: TraceUsage = { inputTokens: 4820, outputTokens: 1650, totalTokens: 6470 }
export const galleryTraceTimingFixture: TraceTiming = { queuedMs: 120, runningMs: 41580, totalMs: 41700 }

export const galleryTraceEventSystemInstruction: TraceEvent = {
  id: "gallery-trace-system-instruction",
  occurredAt: "2026-08-18T09:00:01.000Z",
  detail: { kind: "system-instruction", value: { instructionId: "instr-architecture-agent", version: "4", label: "Architecture agent system instruction" } },
  actor: galleryTraceActor,
}

export const galleryTraceEventUserInput: TraceEvent = {
  id: "gallery-trace-user-input",
  occurredAt: "2026-08-18T09:00:02.400Z",
  detail: { kind: "user-input", value: { text: "Design an async order-events service so downstream teams stop polling the orders table." } },
  actor: galleryTraceHumanActor,
}

export const galleryTraceEventContext: TraceEvent = {
  id: "gallery-trace-context",
  occurredAt: "2026-08-18T09:00:02.600Z",
  detail: { kind: "context", value: { label: "Workspace", value: "Acme Platform / Architecture" } },
}

export const galleryTraceEventRuntimeRecipe: TraceEvent = {
  id: "gallery-trace-runtime-recipe",
  occurredAt: "2026-08-18T09:00:01.200Z",
  detail: { kind: "runtime-recipe", value: { recipeId: "recipe-design-and-provision", version: "2", label: "Design + provision recipe" } },
}

export const galleryTraceEventModelPolicy: TraceEvent = {
  id: "gallery-trace-model-policy",
  occurredAt: "2026-08-18T09:00:01.400Z",
  detail: { kind: "model-policy", value: { policyId: "policy-standard-reasoning", version: "1", label: "Standard reasoning policy" } },
}

export const galleryTraceEventResolvedModel: TraceEvent = {
  id: "gallery-trace-resolved-model",
  occurredAt: "2026-08-18T09:00:01.600Z",
  detail: { kind: "resolved-model", value: galleryResolvedModelAvailable },
}

export const galleryTraceEventResolvedModelRedacted: TraceEvent = {
  id: "gallery-trace-resolved-model-redacted",
  occurredAt: "2026-08-18T09:00:01.600Z",
  detail: { kind: "resolved-model", value: galleryResolvedModelUnavailable },
}

export const galleryTraceEventKnowledge: TraceEvent = {
  id: "gallery-trace-knowledge",
  occurredAt: "2026-08-18T09:00:10.500Z",
  detail: { kind: "knowledge", value: { knowledgeId: "kb-events-pattern", title: "Async events pattern guide", sourceType: "internal-wiki", usageCategory: "retrieved", score: 0.86 } },
}

export const galleryTraceEventRelationship: TraceEvent = {
  id: "gallery-trace-relationship",
  occurredAt: "2026-08-18T09:00:11.200Z",
  detail: { kind: "relationship", value: { relationshipId: "rel-orders-service", sourceEntity: "orders-service", predicate: "depends_on", targetEntity: "orders-table", usageCategory: "evidence" } },
}

export const galleryTraceEventTool: TraceEvent = {
  id: "gallery-trace-tool",
  occurredAt: "2026-08-18T09:00:12.500Z",
  detail: {
    kind: "tool",
    value: { action: { toolName: "internal-docs-search", actionSummary: "Search internal docs for existing event-service conventions", targetLabel: "Internal docs" }, status: "completed", resultSummary: "Found 2 prior services using SQS fan-out with a shared naming convention." },
  },
}

export const galleryTraceEventAgentActivity: TraceEvent = {
  id: "gallery-trace-agent-activity",
  occurredAt: "2026-08-18T09:00:03.000Z",
  detail: { kind: "agent-activity", value: { label: "Design service boundaries", status: "running" } },
}

export const galleryTraceEventHumanInteraction: TraceEvent = {
  id: "gallery-trace-human-interaction",
  occurredAt: "2026-08-18T09:00:03.500Z",
  detail: { kind: "human-interaction", value: { domain: "clarification", interactionId: "clarification-arch-1", label: "Which message broker should the service target — Kafka or SQS?", outcome: "SQS" } },
}

export const galleryTraceEventProposal: TraceEvent = {
  id: "gallery-trace-proposal",
  occurredAt: "2026-08-18T09:00:27.500Z",
  detail: { kind: "proposal", value: { proposalId: "proposal-arch-1", label: "Adopt SQS-based order-events service (ADR-0042)", action: "approve" } },
}

export const galleryTraceEventArtifact: TraceEvent = {
  id: "gallery-trace-artifact",
  occurredAt: "2026-08-18T09:00:40.500Z",
  detail: { kind: "artifact", value: { id: "artifact-adr-42", name: "ADR-0042: Adopt SQS-based order-events service", artifactType: "document", status: "completed", version: "1", url: "https://example.com/adr/0042" } },
}

export const galleryTraceEventError: TraceEvent = {
  id: "gallery-trace-error",
  occurredAt: "2026-08-18T09:00:20.500Z",
  detail: { kind: "error", value: { id: "error-arch-1", message: "State lock held by another operation", causeSummary: "A concurrent plan held the Terraform state lock.", retryability: { retryable: true }, occurredAt: "2026-08-18T09:00:20.500Z" } },
}

export const galleryTraceEventRetry: TraceEvent = {
  id: "gallery-trace-retry",
  occurredAt: "2026-08-18T09:00:20.700Z",
  detail: { kind: "retry", value: { attempt: 2, reason: "State lock released", scheduledFor: "2026-08-18T09:00:25.000Z" } },
}

export const galleryTraceEvents: readonly TraceEvent[] = [
  galleryTraceEventSystemInstruction,
  galleryTraceEventRuntimeRecipe,
  galleryTraceEventModelPolicy,
  galleryTraceEventResolvedModel,
  galleryTraceEventUserInput,
  galleryTraceEventContext,
  galleryTraceEventKnowledge,
  galleryTraceEventRelationship,
  galleryTraceEventTool,
  galleryTraceEventAgentActivity,
  galleryTraceEventHumanInteraction,
  galleryTraceEventError,
  galleryTraceEventRetry,
  galleryTraceEventProposal,
  galleryTraceEventArtifact,
]

export const galleryTraceTurn: TraceTurn = {
  id: "turn-1",
  label: "Design the async order-events service",
  occurredAt: "2026-08-18T09:00:02.200Z",
  eventIds: galleryTraceEvents.map((event) => event.id),
}

export const galleryTraceStep: TraceStep = {
  id: "step-1",
  turnId: "turn-1",
  label: "Gather prior art",
  occurredAt: "2026-08-18T09:00:10.200Z",
  eventIds: [galleryTraceEventKnowledge.id, galleryTraceEventRelationship.id, galleryTraceEventTool.id],
}
