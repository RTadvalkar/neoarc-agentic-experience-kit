/**
 * lib/showcase/fixtures
 *
 * SHOWCASE-ONLY fixture data for the Execution Lab (app/execution-lab).
 * Not part of any `src/neoarc-agentic-*` reusable package — see
 * docs/implementation/MASTER_IMPLEMENTATION_PLAN.md. Mock data must live
 * outside reusable components per docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md.
 *
 * Slice 1 has not introduced any concrete conversation/runtime/trace node
 * kinds yet. These fixtures intentionally use only Slice 1 foundation
 * contracts (AgentSummary, ContextRef, RuntimeStatus, RiskLevel,
 * TraceAccessLevel) as illustrative event payloads, wrapped in the generic
 * `AgenticEventEnvelope`. Every fixture event type is prefixed
 * `foundation.` to make clear it is a Slice 1 demo type, not a canonical
 * event from docs/16_NORMALIZED_EVENT_VOCABULARY.json (those arrive with
 * their owning slices).
 */

import type { AgenticEventEnvelope } from "../../src/neoarc-agentic-contracts/events"
import type { AgentSummary, ContextRef, RiskLevel, RuntimeStatus, TraceAccessLevel } from "../../src/neoarc-agentic-contracts/foundation"

export interface FoundationAgentStatusPayload {
  readonly agent: AgentSummary
}

export interface FoundationRuntimePayload {
  readonly status: RuntimeStatus
  readonly label: string
}

export interface FoundationRiskPayload {
  readonly level: RiskLevel
  readonly note: string
}

export interface FoundationTraceVisibilityPayload {
  readonly level: TraceAccessLevel
  readonly note: string
}

export type FoundationScenarioPayload =
  | FoundationAgentStatusPayload
  | FoundationRuntimePayload
  | FoundationRiskPayload
  | FoundationTraceVisibilityPayload

export interface FoundationExecutionLabScenario {
  readonly family: "foundation"
  readonly id: string
  readonly label: string
  readonly description: string
  readonly agent: AgentSummary
  readonly context: ContextRef
  readonly events: readonly AgenticEventEnvelope<FoundationScenarioPayload>[]
}

const architectureAgent: AgentSummary = {
  id: "agent-ava",
  displayName: "Ava",
  description: "Architecture agent",
  lifecycleStatus: "active",
  capabilities: ["code-review", "dependency-graph", "risk-assessment"],
  version: "1.4.0",
}

const researchAgent: AgentSummary = {
  id: "agent-rex",
  displayName: "Rex",
  description: "Research agent",
  lifecycleStatus: "idle",
  capabilities: ["web-search", "citation-check"],
  version: "0.9.2",
}

const workspaceContext: ContextRef = { id: "ctx-workspace", kind: "workspace", label: "Acme Platform" }
const projectContext: ContextRef = {
  id: "ctx-project",
  kind: "project",
  label: "Checkout Redesign",
  parent: workspaceContext,
}
const sectionContext: ContextRef = {
  id: "ctx-section",
  kind: "section",
  label: "Payments",
  parent: projectContext,
}

function envelope<TPayload>(
  input: Omit<AgenticEventEnvelope<TPayload>, "durability"> & { durability?: AgenticEventEnvelope<TPayload>["durability"] },
): AgenticEventEnvelope<TPayload> {
  return { durability: "durable", ...input }
}

export const executionLabScenarios: readonly FoundationExecutionLabScenario[] = [
  {
    family: "foundation",
    id: "agent-lifecycle",
    label: "Agent lifecycle",
    description:
      "Ava moves from idle to active to waiting-for-human as she works through a review. Demonstrates AgentSummary/AgentLifecycleStatus flowing through the event envelope.",
    agent: architectureAgent,
    context: sectionContext,
    events: [
      envelope<FoundationAgentStatusPayload>({
        id: "evt-1",
        type: "foundation.agent.status_changed",
        occurredAt: "2026-08-18T09:00:00.000Z",
        sequence: 1,
        correlation: { executionTraceId: "trace-001", runId: "run-001" },
        payload: { agent: { ...architectureAgent, lifecycleStatus: "idle" } },
      }),
      envelope<FoundationAgentStatusPayload>({
        id: "evt-2",
        type: "foundation.agent.status_changed",
        occurredAt: "2026-08-18T09:00:04.000Z",
        sequence: 2,
        correlation: { executionTraceId: "trace-001", runId: "run-001" },
        payload: { agent: { ...architectureAgent, lifecycleStatus: "active" } },
      }),
      envelope<FoundationAgentStatusPayload>({
        id: "evt-3",
        type: "foundation.agent.status_changed",
        occurredAt: "2026-08-18T09:00:12.000Z",
        sequence: 3,
        correlation: { executionTraceId: "trace-001", runId: "run-001" },
        payload: { agent: { ...architectureAgent, lifecycleStatus: "waiting_for_human" } },
      }),
    ],
  },
  {
    family: "foundation",
    id: "runtime-lifecycle",
    label: "Runtime lifecycle",
    description:
      "A run moves queued -> running -> completed. Demonstrates RuntimeStatus, the shared status vocabulary later slices reuse for agents, runs, and tasks.",
    agent: researchAgent,
    context: projectContext,
    events: [
      envelope<FoundationRuntimePayload>({
        id: "evt-4",
        type: "foundation.runtime.status_changed",
        occurredAt: "2026-08-18T09:05:00.000Z",
        sequence: 1,
        correlation: { executionTraceId: "trace-002", runId: "run-002" },
        payload: { status: "queued", label: "Queued for execution" },
      }),
      envelope<FoundationRuntimePayload>({
        id: "evt-5",
        type: "foundation.runtime.status_changed",
        occurredAt: "2026-08-18T09:05:02.000Z",
        sequence: 2,
        correlation: { executionTraceId: "trace-002", runId: "run-002" },
        payload: { status: "running", label: "Gathering citations" },
      }),
      envelope<FoundationRuntimePayload>({
        id: "evt-6",
        type: "foundation.runtime.status_changed",
        occurredAt: "2026-08-18T09:05:41.000Z",
        sequence: 3,
        correlation: { executionTraceId: "trace-002", runId: "run-002" },
        payload: { status: "completed", label: "Citation check complete" },
      }),
    ],
  },
  {
    family: "foundation",
    id: "risk-and-visibility",
    label: "Risk & trace visibility",
    description:
      "A risk classification is supplied alongside a trace-access-level change. Demonstrates RiskLevel and TraceAccessLevel as supplied, never inferred, facts.",
    agent: architectureAgent,
    context: workspaceContext,
    events: [
      envelope<FoundationRiskPayload>({
        id: "evt-7",
        type: "foundation.risk.flagged",
        occurredAt: "2026-08-18T09:10:00.000Z",
        sequence: 1,
        correlation: { executionTraceId: "trace-003", proposalId: "proposal-001" },
        payload: { level: "medium", note: "Touches production payment routing config" },
      }),
      envelope<FoundationTraceVisibilityPayload>({
        id: "evt-8",
        type: "foundation.trace.visibility_set",
        occurredAt: "2026-08-18T09:10:05.000Z",
        sequence: 2,
        correlation: { executionTraceId: "trace-003", proposalId: "proposal-001" },
        payload: { level: "OPERATOR", note: "Escalated to operator review" },
      }),
    ],
  },
]
