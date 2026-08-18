/**
 * lib/showcase/trace-fixtures
 *
 * SHOWCASE-ONLY. Slice 5's "Architecture Agent Run" scenario for the
 * Execution Lab (app/execution-lab) — a single rich, real
 * `AgenticEventEnvelope` stream demonstrating docs/07's "alternate
 * execution views": the same facts render as genuinely different content
 * on Chat/Activity/Trace/Provenance/Mission depending on which node
 * definitions the active tab's `target` selects (see `render-canvas.tsx`).
 *
 * The scenario follows an architecture agent through one full turn:
 * instruction/recipe/policy/model resolution, a clarifying question,
 * knowledge retrieval and a relationship traversal informing a design
 * decision, a tool call that fails transiently and is retried, an
 * execution-permission gate before a sandbox deploy, a proposal review
 * (the Architecture Decision Record), and two produced artifacts. Every
 * event shares a consistent `correlation` (`executionTraceId`, `missionId`,
 * `runId`, `turnId`/`stepId`) so every tab keys off the same identities.
 *
 * Mock data lives here, outside any reusable `src/neoarc-agentic-*`
 * package, per docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md.
 */

import type { AgenticEventEnvelope } from "../../src/neoarc-agentic-contracts/events"
import type { AgentSummary, ContextRef } from "../../src/neoarc-agentic-contracts/foundation"
import type { RuntimeEventPayload } from "../../src/neoarc-agentic-contracts/runtime-events"
import type { TraceEventPayload } from "../../src/neoarc-agentic-contracts/trace-events"
import type { MissionSummary } from "../../src/neoarc-agentic-contracts/runtime"

export type ArchitectureAgentRunPayload = RuntimeEventPayload | TraceEventPayload

export interface TraceExecutionLabScenario {
  readonly family: "trace"
  readonly id: string
  readonly label: string
  readonly description: string
  readonly agent: AgentSummary
  readonly context: ContextRef
  readonly events: readonly AgenticEventEnvelope<ArchitectureAgentRunPayload>[]
}

const platformContext: ContextRef = { id: "ctx-platform", kind: "workspace", label: "Acme Platform" }
const architectureContext: ContextRef = { id: "ctx-architecture", kind: "section", label: "Architecture", parent: platformContext }

const architectureAgent: AgentSummary = {
  id: "agent-architecture",
  displayName: "Architecture agent",
  description: "Designs and provisions service architecture changes",
  lifecycleStatus: "active",
  capabilities: ["design", "provisioning", "documentation"],
  version: "2.1.0",
}

const missionArchitecture: MissionSummary = {
  id: "mission-arch-1",
  title: "Introduce an async order-events service",
  description: "Design and provision a new async order-events service and document the decision.",
  status: "running",
  riskLevel: "medium",
  createdAt: "2026-08-18T09:00:00.000Z",
}

const correlation = {
  executionTraceId: "trace-arch-1",
  missionId: "mission-arch-1",
  runId: "run-arch-1",
} as const

function envelope<TPayload extends ArchitectureAgentRunPayload>(
  input: Omit<AgenticEventEnvelope<TPayload>, "durability"> & { durability?: AgenticEventEnvelope<TPayload>["durability"] },
): AgenticEventEnvelope<TPayload> {
  return { durability: "durable", ...input }
}

export const architectureAgentRunScenario: TraceExecutionLabScenario = {
  family: "trace",
  id: "trace-architecture-agent-run",
  label: "Architecture agent run",
  description:
    "One full turn of an architecture agent: instruction/recipe/policy/model resolution, a clarifying question, knowledge and relationship usage informing a design decision, a tool call that fails and retries, an execution-permission gate before a sandbox deploy, a proposal review producing an ADR, and two produced artifacts.",
  agent: architectureAgent,
  context: architectureContext,
  events: [
    envelope({
      id: "evt-arch-01",
      type: "execution.started",
      occurredAt: "2026-08-18T09:00:00.000Z",
      sequence: 1,
      correlation,
      payload: { accessLevel: "DEVELOPER" },
    }),
    envelope({
      id: "evt-arch-02",
      type: "mission.started",
      occurredAt: "2026-08-18T09:00:00.500Z",
      sequence: 2,
      correlation,
      payload: { mission: missionArchitecture },
    }),
    envelope({
      id: "evt-arch-03",
      type: "system_instruction.active",
      occurredAt: "2026-08-18T09:00:01.000Z",
      sequence: 3,
      correlation,
      payload: { detail: { instructionId: "instr-architecture-agent", version: "4", label: "Architecture agent system instruction" } },
    }),
    envelope({
      id: "evt-arch-04",
      type: "runtime_recipe.active",
      occurredAt: "2026-08-18T09:00:01.200Z",
      sequence: 4,
      correlation,
      payload: { detail: { recipeId: "recipe-design-and-provision", version: "2", label: "Design + provision recipe" } },
    }),
    envelope({
      id: "evt-arch-05",
      type: "model_policy.active",
      occurredAt: "2026-08-18T09:00:01.400Z",
      sequence: 5,
      correlation,
      payload: { detail: { policyId: "policy-standard-reasoning", version: "1", label: "Standard reasoning policy" } },
    }),
    envelope({
      id: "evt-arch-06",
      type: "model_route.resolved",
      occurredAt: "2026-08-18T09:00:01.600Z",
      sequence: 6,
      correlation,
      payload: { resolvedModel: { available: true, value: { modelId: "architecture-reasoning-large", provider: "internal", version: "2026-06" } } },
    }),
    envelope({
      id: "evt-arch-07",
      type: "run.started",
      occurredAt: "2026-08-18T09:00:02.000Z",
      sequence: 7,
      correlation,
      payload: {
        run: { id: "run-arch-1", missionId: "mission-arch-1", label: "Design run — attempt 1", agent: { id: "agent-architecture", kind: "agent", displayName: "Architecture agent" }, status: "running", cancellation: "none", correlation },
        workflow: [{ id: "phase-design", label: "Design", status: "running", members: [{ id: "member-1", taskId: "task-design-1" }] }],
      },
    }),
    envelope({
      id: "evt-arch-08",
      type: "turn.started",
      occurredAt: "2026-08-18T09:00:02.200Z",
      sequence: 8,
      correlation: { ...correlation, turnId: "turn-1" },
      payload: { label: "Design the async order-events service" },
    }),
    envelope({
      id: "evt-arch-09",
      type: "user_input.received",
      occurredAt: "2026-08-18T09:00:02.400Z",
      sequence: 9,
      correlation: { ...correlation, turnId: "turn-1" },
      payload: { detail: { text: "Design an async order-events service so downstream teams stop polling the orders table." }, actor: { id: "user-jamie", kind: "human", displayName: "Jamie Chen" } },
    }),
    envelope({
      id: "evt-arch-10",
      type: "context.supplied",
      occurredAt: "2026-08-18T09:00:02.600Z",
      sequence: 10,
      correlation: { ...correlation, turnId: "turn-1" },
      payload: { detail: { label: "Workspace", value: "Acme Platform / Architecture" } },
    }),
    envelope({
      id: "evt-arch-11",
      type: "task.started",
      occurredAt: "2026-08-18T09:00:03.000Z",
      sequence: 11,
      correlation: { ...correlation, taskId: "task-design-1" },
      payload: { task: { taskId: "task-design-1", title: "Design service boundaries", status: "running", missionId: "mission-arch-1", runId: "run-arch-1", producedBy: { id: "agent-architecture", kind: "agent", displayName: "Architecture agent" }, startedAt: "2026-08-18T09:00:03.000Z" } },
    }),
    envelope({
      id: "evt-arch-12",
      type: "human.clarification.requested",
      occurredAt: "2026-08-18T09:00:03.500Z",
      sequence: 12,
      correlation: { ...correlation, turnId: "turn-1" },
      payload: { interaction: { id: "clarification-arch-1", presentationIntent: "clarification", label: "Which message broker should the service target — Kafka or SQS?", requestedAt: "2026-08-18T09:00:03.500Z" } },
    }),
    envelope({
      id: "evt-arch-13",
      type: "human.clarification.resolved",
      occurredAt: "2026-08-18T09:00:10.000Z",
      sequence: 13,
      correlation: { ...correlation, turnId: "turn-1" },
      payload: { interactionId: "clarification-arch-1", outcome: "SQS" },
    }),
    envelope({
      id: "evt-arch-14",
      type: "step.started",
      occurredAt: "2026-08-18T09:00:10.200Z",
      sequence: 14,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-1" },
      payload: { label: "Gather prior art" },
    }),
    envelope({
      id: "evt-arch-15",
      type: "knowledge.retrieved",
      occurredAt: "2026-08-18T09:00:10.500Z",
      sequence: 15,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-1" },
      payload: { usage: { knowledgeId: "kb-events-pattern", title: "Async events pattern guide", sourceType: "internal-wiki", usageCategory: "retrieved", score: 0.86 } },
    }),
    envelope({
      id: "evt-arch-16",
      type: "knowledge.selected",
      occurredAt: "2026-08-18T09:00:10.700Z",
      sequence: 16,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-1" },
      payload: { usage: { knowledgeId: "kb-events-pattern", title: "Async events pattern guide", sourceType: "internal-wiki", usageCategory: "selected" } },
    }),
    envelope({
      id: "evt-arch-17",
      type: "relationship.traversed",
      occurredAt: "2026-08-18T09:00:11.000Z",
      sequence: 17,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-1" },
      payload: { usage: { relationshipId: "rel-orders-service", sourceEntity: "orders-service", predicate: "depends_on", targetEntity: "orders-table", traversalDepth: 1, usageCategory: "retrieval" } },
    }),
    envelope({
      id: "evt-arch-18",
      type: "relationship.used",
      occurredAt: "2026-08-18T09:00:11.200Z",
      sequence: 18,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-1" },
      payload: { usage: { relationshipId: "rel-orders-service", sourceEntity: "orders-service", predicate: "depends_on", targetEntity: "orders-table", usageCategory: "evidence" } },
    }),
    envelope({
      id: "evt-arch-19",
      type: "tool.started",
      occurredAt: "2026-08-18T09:00:11.500Z",
      sequence: 19,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-1", toolCallId: "toolcall-search-1" },
      payload: { action: { toolName: "internal-docs-search", actionSummary: "Search internal docs for existing event-service conventions", targetLabel: "Internal docs" } },
    }),
    envelope({
      id: "evt-arch-20",
      type: "tool.completed",
      occurredAt: "2026-08-18T09:00:12.500Z",
      sequence: 20,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-1", toolCallId: "toolcall-search-1" },
      payload: { action: { toolName: "internal-docs-search", actionSummary: "Search internal docs for existing event-service conventions", targetLabel: "Internal docs" }, status: "completed", resultSummary: "Found 2 prior services using SQS fan-out with a shared naming convention." },
    }),
    envelope({
      id: "evt-arch-21",
      type: "step.completed",
      occurredAt: "2026-08-18T09:00:12.700Z",
      sequence: 21,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-1" },
      payload: {},
    }),
    envelope({
      id: "evt-arch-22",
      type: "step.started",
      occurredAt: "2026-08-18T09:00:13.000Z",
      sequence: 22,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2" },
      payload: { label: "Provision the sandbox topic" },
    }),
    envelope({
      id: "evt-arch-23",
      type: "permission.requested",
      occurredAt: "2026-08-18T09:00:13.200Z",
      sequence: 23,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2" },
      payload: { interaction: { id: "permission-arch-1", presentationIntent: "execution-permission", label: "Apply Terraform plan to provision the sandbox SQS queue", requestedAt: "2026-08-18T09:00:13.200Z", riskLevel: "low" } },
    }),
    envelope({
      id: "evt-arch-24",
      type: "permission.resolved",
      occurredAt: "2026-08-18T09:00:18.000Z",
      sequence: 24,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2" },
      payload: { interactionId: "permission-arch-1", outcome: "allowed_once" },
    }),
    envelope({
      id: "evt-arch-25",
      type: "tool.started",
      occurredAt: "2026-08-18T09:00:18.200Z",
      sequence: 25,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", toolCallId: "toolcall-terraform-1" },
      payload: { action: { toolName: "terraform-apply", actionSummary: "Apply plan to create sandbox SQS queue", targetLabel: "sandbox/order-events" } },
    }),
    envelope({
      id: "evt-arch-26",
      type: "tool.failed",
      occurredAt: "2026-08-18T09:00:20.500Z",
      sequence: 26,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", toolCallId: "toolcall-terraform-1" },
      payload: {
        action: { toolName: "terraform-apply", actionSummary: "Apply plan to create sandbox SQS queue", targetLabel: "sandbox/order-events" },
        error: { id: "error-arch-1", message: "State lock held by another operation", causeSummary: "A concurrent plan held the Terraform state lock.", retryability: { retryable: true }, occurredAt: "2026-08-18T09:00:20.500Z" },
      },
    }),
    envelope({
      id: "evt-arch-27",
      type: "error.recorded",
      occurredAt: "2026-08-18T09:00:20.600Z",
      sequence: 27,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", toolCallId: "toolcall-terraform-1" },
      payload: { error: { id: "error-arch-1", message: "State lock held by another operation", causeSummary: "A concurrent plan held the Terraform state lock.", retryability: { retryable: true }, occurredAt: "2026-08-18T09:00:20.500Z" } },
    }),
    envelope({
      id: "evt-arch-28",
      type: "retry.scheduled",
      occurredAt: "2026-08-18T09:00:20.700Z",
      sequence: 28,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", toolCallId: "toolcall-terraform-1" },
      payload: { detail: { attempt: 2, reason: "State lock released", scheduledFor: "2026-08-18T09:00:25.000Z" } },
    }),
    envelope({
      id: "evt-arch-29",
      type: "retry.started",
      occurredAt: "2026-08-18T09:00:25.000Z",
      sequence: 29,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", toolCallId: "toolcall-terraform-1" },
      payload: { attempt: 2 },
    }),
    envelope({
      id: "evt-arch-30",
      type: "tool.started",
      occurredAt: "2026-08-18T09:00:25.100Z",
      sequence: 30,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", toolCallId: "toolcall-terraform-2" },
      payload: { action: { toolName: "terraform-apply", actionSummary: "Apply plan to create sandbox SQS queue (retry)", targetLabel: "sandbox/order-events" } },
    }),
    envelope({
      id: "evt-arch-31",
      type: "tool.completed",
      occurredAt: "2026-08-18T09:00:27.000Z",
      sequence: 31,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", toolCallId: "toolcall-terraform-2" },
      payload: { action: { toolName: "terraform-apply", actionSummary: "Apply plan to create sandbox SQS queue (retry)", targetLabel: "sandbox/order-events" }, status: "completed", resultSummary: "Sandbox queue order-events-sandbox created." },
    }),
    envelope({
      id: "evt-arch-32",
      type: "proposal.review.requested",
      occurredAt: "2026-08-18T09:00:27.500Z",
      sequence: 32,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", proposalId: "proposal-arch-1" },
      payload: { proposalId: "proposal-arch-1", label: "Adopt SQS-based order-events service (ADR-0042)" },
    }),
    envelope({
      id: "evt-arch-33",
      type: "proposal.review.resolved",
      occurredAt: "2026-08-18T09:00:40.000Z",
      sequence: 33,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", proposalId: "proposal-arch-1" },
      payload: { decision: { id: "decision-arch-1", action: "approve", decidedBy: { id: "user-jamie", kind: "human", displayName: "Jamie Chen" }, decidedAt: "2026-08-18T09:00:40.000Z", note: "Approved — matches existing SQS fan-out convention." } },
    }),
    envelope({
      id: "evt-arch-34",
      type: "artifact.produced",
      occurredAt: "2026-08-18T09:00:40.500Z",
      sequence: 34,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", artifactId: "artifact-adr-42" },
      payload: { artifact: { id: "artifact-adr-42", name: "ADR-0042: Adopt SQS-based order-events service", artifactType: "document", status: "completed", version: "1", url: "https://example.com/adr/0042" }, producedByNodeId: "decision-arch-1" },
    }),
    envelope({
      id: "evt-arch-35",
      type: "artifact.produced",
      occurredAt: "2026-08-18T09:00:40.700Z",
      sequence: 35,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2", artifactId: "artifact-diagram-42" },
      payload: { artifact: { id: "artifact-diagram-42", name: "order-events-service architecture diagram", artifactType: "diagram", status: "completed", url: "https://example.com/diagrams/order-events" }, producedByNodeId: "decision-arch-1" },
    }),
    envelope({
      id: "evt-arch-36",
      type: "step.completed",
      occurredAt: "2026-08-18T09:00:40.800Z",
      sequence: 36,
      correlation: { ...correlation, turnId: "turn-1", stepId: "step-2" },
      payload: {},
    }),
    envelope({
      id: "evt-arch-37",
      type: "turn.completed",
      occurredAt: "2026-08-18T09:00:41.000Z",
      sequence: 37,
      correlation: { ...correlation, turnId: "turn-1" },
      payload: {},
    }),
    envelope({
      id: "evt-arch-38",
      type: "task.completed",
      occurredAt: "2026-08-18T09:00:41.200Z",
      sequence: 38,
      correlation: { ...correlation, taskId: "task-design-1" },
      payload: { taskId: "task-design-1", status: "completed", outputRefs: ["artifact-adr-42", "artifact-diagram-42"] },
    }),
    envelope({
      id: "evt-arch-39",
      type: "run.completed",
      occurredAt: "2026-08-18T09:00:41.500Z",
      sequence: 39,
      correlation,
      payload: { runId: "run-arch-1", outputs: [] },
    }),
    envelope({
      id: "evt-arch-40",
      type: "execution.completed",
      occurredAt: "2026-08-18T09:00:41.700Z",
      sequence: 40,
      correlation,
      payload: { usage: { inputTokens: 4820, outputTokens: 1650, totalTokens: 6470 }, timing: { queuedMs: 120, runningMs: 41580, totalMs: 41700 } },
    }),
  ],
}

export const traceExecutionLabScenarios: readonly TraceExecutionLabScenario[] = [architectureAgentRunScenario]
