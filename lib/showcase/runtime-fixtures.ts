/**
 * lib/showcase/runtime-fixtures
 *
 * SHOWCASE-ONLY. Slice 4 runtime scenarios for the Execution Lab
 * (app/execution-lab), rendered on the "Mission" tab (`AgenticViewTarget`
 * "mission"). Every event here is a real `AgenticEventEnvelope` shaped by
 * `runtime-events.ts` — the Execution Lab feeds these through the exact
 * same `applyEvents` reducer + `runtimeNodeDefinitions`
 * (`neoarc-agentic-projection`) a real product integration would use.
 * Mock data lives here, outside any reusable `src/neoarc-agentic-*`
 * package, per docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md.
 *
 * Six integrated scenarios, covering the budget-approved slice of
 * docs/06's required cases (full 12-scenario coverage deferred — see
 * docs/implementation/EXECUTION_STATUS.md):
 *  1. Queued -> running (multi-phase workflow, multiple agents/tasks, handoff)
 *  2. Waiting for human interaction
 *  3. Recoverable failure -> retry
 *  4. Cancel requested -> cancelled
 *  5. Completed with outputs
 *  6. Task progress across a multi-task run (progress + retrying)
 */

import type { AgenticEventEnvelope } from "../../src/neoarc-agentic-contracts/events"
import type { ActorSummary, AgentSummary, ContextRef } from "../../src/neoarc-agentic-contracts/foundation"
import type { RuntimeEventPayload } from "../../src/neoarc-agentic-contracts/runtime-events"
import type { MissionSummary } from "../../src/neoarc-agentic-contracts/runtime"

export interface RuntimeExecutionLabScenario {
  readonly family: "runtime"
  readonly id: string
  readonly label: string
  readonly description: string
  readonly agent: AgentSummary
  readonly context: ContextRef
  readonly events: readonly AgenticEventEnvelope<RuntimeEventPayload>[]
}

const workspaceContext: ContextRef = { id: "ctx-workspace", kind: "workspace", label: "Acme Platform" }
const opsContext: ContextRef = { id: "ctx-ops", kind: "section", label: "Operations", parent: workspaceContext }

const orchestratorAgent: AgentSummary = {
  id: "agent-orchestrator",
  displayName: "Orchestrator",
  description: "Runtime mission orchestrator",
  lifecycleStatus: "active",
  capabilities: ["mission-planning", "task-dispatch"],
  version: "1.0.0",
}

const dataAgent: AgentSummary = {
  id: "agent-data",
  displayName: "Data agent",
  description: "Handles data extraction tasks",
  lifecycleStatus: "active",
  capabilities: ["extraction"],
  version: "1.0.0",
}

const reviewAgent: AgentSummary = {
  id: "agent-review",
  displayName: "Review agent",
  description: "Handles review/approval tasks",
  lifecycleStatus: "active",
  capabilities: ["review"],
  version: "1.0.0",
}

/** `RunSummary.agent` / `AgentTask.producedBy` are `ActorSummary` (foundation.ts), a leaner shape than `AgentSummary` — adapt rather than duplicate fixture data. */
function asActor(agent: AgentSummary): ActorSummary {
  return { id: agent.id, kind: "agent", displayName: agent.displayName }
}

const orchestratorActor = asActor(orchestratorAgent)
const dataActor = asActor(dataAgent)
const reviewActor = asActor(reviewAgent)

function envelope<TPayload extends RuntimeEventPayload>(
  input: Omit<AgenticEventEnvelope<TPayload>, "durability"> & { durability?: AgenticEventEnvelope<TPayload>["durability"] },
): AgenticEventEnvelope<TPayload> {
  return { durability: "durable", ...input }
}

const missionQuarterlyClose: MissionSummary = {
  id: "mission-quarterly-close",
  title: "Quarterly close reconciliation",
  description: "Reconcile ledger entries and produce the quarterly close report.",
  status: "running",
  riskLevel: "medium",
  createdAt: "2026-08-18T08:00:00.000Z",
}

export const runtimeExecutionLabScenarios: readonly RuntimeExecutionLabScenario[] = [
  {
    family: "runtime",
    id: "runtime-multi-phase-handoff",
    label: "Multi-phase workflow with handoff",
    description:
      "A mission starts a run structured into two workflow phases (extraction, review) spanning two agents. Tasks start and hand off from the data agent to the review agent as the run progresses from queued through running.",
    agent: orchestratorAgent,
    context: opsContext,
    events: [
      envelope({
        id: "evt-mp-1",
        type: "mission.started",
        occurredAt: "2026-08-18T11:00:00.000Z",
        sequence: 1,
        correlation: { missionId: "mission-quarterly-close" },
        payload: { mission: missionQuarterlyClose },
      }),
      envelope({
        id: "evt-mp-2",
        type: "run.started",
        occurredAt: "2026-08-18T11:00:01.000Z",
        sequence: 2,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-1" },
        payload: {
          run: {
            id: "run-close-1",
            missionId: "mission-quarterly-close",
            label: "Close run — attempt 1",
            agent: orchestratorActor,
            status: "queued",
            cancellation: "none",
            correlation: { missionId: "mission-quarterly-close", runId: "run-close-1" },
          },
          workflow: [
            { id: "phase-extraction", label: "Extraction", status: "queued", members: [{ id: "member-1", taskId: "task-extract-1" }] },
            { id: "phase-review", label: "Review", status: "queued", members: [{ id: "member-2", taskId: "task-review-1" }] },
          ],
        },
      }),
      envelope({
        id: "evt-mp-3",
        type: "task.started",
        occurredAt: "2026-08-18T11:00:03.000Z",
        sequence: 3,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-1", taskId: "task-extract-1" },
        payload: {
          task: {
            taskId: "task-extract-1",
            title: "Extract ledger entries",
            status: "running",
            missionId: "mission-quarterly-close",
            runId: "run-close-1",
            producedBy: dataActor,
            startedAt: "2026-08-18T11:00:03.000Z",
          },
        },
      }),
      envelope({
        id: "evt-mp-4",
        type: "task.completed",
        occurredAt: "2026-08-18T11:00:20.000Z",
        sequence: 4,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-1", taskId: "task-extract-1" },
        payload: { taskId: "task-extract-1", status: "completed", outputRefs: ["artifact-ledger-extract"] },
      }),
      envelope({
        id: "evt-mp-5",
        type: "task.started",
        occurredAt: "2026-08-18T11:00:21.000Z",
        sequence: 5,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-1", taskId: "task-review-1" },
        payload: {
          task: {
            taskId: "task-review-1",
            title: "Review reconciled entries",
            status: "running",
            missionId: "mission-quarterly-close",
            runId: "run-close-1",
            producedBy: reviewActor,
            inputRefs: ["artifact-ledger-extract"],
            startedAt: "2026-08-18T11:00:21.000Z",
          },
        },
      }),
    ],
  },
  {
    family: "runtime",
    id: "runtime-waiting-for-human",
    label: "Waiting for human interaction",
    description:
      "The review task surfaces a discrepancy that requires an execution permission decision before the run can continue, pausing the run.",
    agent: orchestratorAgent,
    context: opsContext,
    events: [
      envelope({
        id: "evt-wh-1",
        type: "mission.started",
        occurredAt: "2026-08-18T11:10:00.000Z",
        sequence: 1,
        correlation: { missionId: "mission-quarterly-close" },
        payload: { mission: missionQuarterlyClose },
      }),
      envelope({
        id: "evt-wh-2",
        type: "run.started",
        occurredAt: "2026-08-18T11:10:01.000Z",
        sequence: 2,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-2" },
        payload: {
          run: { id: "run-close-2", missionId: "mission-quarterly-close", label: "Close run — attempt 2", agent: reviewActor, status: "running", cancellation: "none" },
          workflow: [{ id: "phase-review", label: "Review", status: "running", members: [{ id: "member-1", taskId: "task-review-2" }] }],
        },
      }),
      envelope({
        id: "evt-wh-3",
        type: "run.waiting_for_human",
        occurredAt: "2026-08-18T11:10:15.000Z",
        sequence: 3,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-2" },
        payload: {
          runId: "run-close-2",
          reason: "execution-permission",
          interaction: {
            id: "interaction-close-2",
            presentationIntent: "execution-permission",
            label: "Approve write to ledger correction entry #4821",
            requestedAt: "2026-08-18T11:10:15.000Z",
          },
        },
      }),
    ],
  },
  {
    family: "runtime",
    id: "runtime-recoverable-failure-retry",
    label: "Recoverable failure -> retry",
    description: "The run fails with a retryable upstream timeout, then a retried run starts and completes successfully.",
    agent: orchestratorAgent,
    context: opsContext,
    events: [
      envelope({
        id: "evt-rf-1",
        type: "run.started",
        occurredAt: "2026-08-18T11:20:00.000Z",
        sequence: 1,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-3" },
        payload: {
          run: { id: "run-close-3", missionId: "mission-quarterly-close", label: "Close run — attempt 3", agent: dataActor, status: "running", cancellation: "none" },
          workflow: [{ id: "phase-extraction", label: "Extraction", status: "running", members: [{ id: "member-1", taskId: "task-extract-3" }] }],
        },
      }),
      envelope({
        id: "evt-rf-2",
        type: "run.failed",
        occurredAt: "2026-08-18T11:20:12.000Z",
        sequence: 2,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-3" },
        payload: {
          runId: "run-close-3",
          error: {
            id: "error-close-3",
            message: "Ledger service timed out",
            causeSummary: "Upstream ledger service did not respond within 30s.",
            retryability: { retryable: true },
            occurredAt: "2026-08-18T11:20:12.000Z",
          },
        },
      }),
      envelope({
        id: "evt-rf-3",
        type: "run.completed",
        occurredAt: "2026-08-18T11:21:05.000Z",
        sequence: 3,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-3" },
        payload: { runId: "run-close-3", outputs: [] },
      }),
    ],
  },
  {
    family: "runtime",
    id: "runtime-cancel-requested-cancelled",
    label: "Cancel requested -> cancelled",
    description: "A human requests cancellation of a running run; the runtime confirms the run has actually stopped.",
    agent: orchestratorAgent,
    context: opsContext,
    events: [
      envelope({
        id: "evt-cc-1",
        type: "run.started",
        occurredAt: "2026-08-18T11:30:00.000Z",
        sequence: 1,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-4" },
        payload: {
          run: { id: "run-close-4", missionId: "mission-quarterly-close", label: "Close run — attempt 4", agent: dataActor, status: "running", cancellation: "none" },
          workflow: [{ id: "phase-extraction", label: "Extraction", status: "running", members: [{ id: "member-1", taskId: "task-extract-4" }] }],
        },
      }),
      envelope({
        id: "evt-cc-2",
        type: "run.cancel_requested",
        occurredAt: "2026-08-18T11:30:08.000Z",
        sequence: 2,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-4" },
        payload: { runId: "run-close-4" },
      }),
      envelope({
        id: "evt-cc-3",
        type: "run.cancelled",
        occurredAt: "2026-08-18T11:30:11.000Z",
        sequence: 3,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-4" },
        payload: { runId: "run-close-4" },
      }),
    ],
  },
  {
    family: "runtime",
    id: "runtime-completed-with-outputs",
    label: "Completed with outputs",
    description: "A run completes successfully and produces two artifacts — the quarterly close report and its supporting ledger export.",
    agent: orchestratorAgent,
    context: opsContext,
    events: [
      envelope({
        id: "evt-co-1",
        type: "run.started",
        occurredAt: "2026-08-18T11:40:00.000Z",
        sequence: 1,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-5" },
        payload: {
          run: { id: "run-close-5", missionId: "mission-quarterly-close", label: "Close run — attempt 5", agent: orchestratorActor, status: "running", cancellation: "none" },
          workflow: [
            { id: "phase-extraction", label: "Extraction", status: "completed", members: [{ id: "member-1", taskId: "task-extract-5" }] },
            { id: "phase-review", label: "Review", status: "completed", members: [{ id: "member-2", taskId: "task-review-5" }] },
          ],
        },
      }),
      envelope({
        id: "evt-co-2",
        type: "run.completed",
        occurredAt: "2026-08-18T11:41:30.000Z",
        sequence: 2,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-5" },
        payload: {
          runId: "run-close-5",
          outputs: [
            {
              id: "output-report",
              artifact: { id: "artifact-report", name: "Quarterly close report — Q2 2026", artifactType: "document", status: "completed", url: "https://example.com/reports/q2-2026" },
              producedAt: "2026-08-18T11:41:28.000Z",
            },
            {
              id: "output-ledger",
              artifact: { id: "artifact-ledger", name: "Reconciled ledger export.csv", artifactType: "file", status: "completed", url: "https://example.com/exports/ledger-q2-2026.csv" },
              taskId: "task-extract-5",
              producedAt: "2026-08-18T11:41:29.000Z",
            },
          ],
        },
      }),
    ],
  },
  {
    family: "runtime",
    id: "runtime-multi-task-progress",
    label: "Multi-task progress (with a retry mid-flight)",
    description: "Two tasks in the same run progress in parallel; one task hits a transient retry before both complete.",
    agent: orchestratorAgent,
    context: opsContext,
    events: [
      envelope({
        id: "evt-tp-1",
        type: "run.started",
        occurredAt: "2026-08-18T11:50:00.000Z",
        sequence: 1,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-6" },
        payload: {
          run: { id: "run-close-6", missionId: "mission-quarterly-close", label: "Close run — attempt 6", agent: orchestratorActor, status: "running", cancellation: "none" },
          workflow: [{ id: "phase-extraction", label: "Extraction", status: "running", members: [{ id: "member-1", taskId: "task-extract-6a" }, { id: "member-2", taskId: "task-extract-6b" }] }],
        },
      }),
      envelope({
        id: "evt-tp-2",
        type: "task.started",
        occurredAt: "2026-08-18T11:50:01.000Z",
        sequence: 2,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-6", taskId: "task-extract-6a" },
        payload: { task: { taskId: "task-extract-6a", title: "Extract North region entries", status: "running", producedBy: dataActor, startedAt: "2026-08-18T11:50:01.000Z" } },
      }),
      envelope({
        id: "evt-tp-3",
        type: "task.started",
        occurredAt: "2026-08-18T11:50:01.000Z",
        sequence: 3,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-6", taskId: "task-extract-6b" },
        payload: { task: { taskId: "task-extract-6b", title: "Extract South region entries", status: "running", producedBy: dataActor, startedAt: "2026-08-18T11:50:01.000Z" } },
      }),
      envelope({
        id: "evt-tp-4",
        type: "task.progress",
        occurredAt: "2026-08-18T11:50:05.000Z",
        sequence: 4,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-6", taskId: "task-extract-6a" },
        payload: { taskId: "task-extract-6a", progress: { completedSteps: 2, totalSteps: 4, label: "Parsing batch 2 of 4" } },
      }),
      envelope({
        id: "evt-tp-5",
        type: "task.progress",
        occurredAt: "2026-08-18T11:50:06.000Z",
        sequence: 5,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-6", taskId: "task-extract-6b" },
        payload: { taskId: "task-extract-6b", progress: { completedSteps: 1, totalSteps: 3, label: "Retrying after a transient read error" }, status: "retrying" },
      }),
      envelope({
        id: "evt-tp-6",
        type: "task.completed",
        occurredAt: "2026-08-18T11:50:20.000Z",
        sequence: 6,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-6", taskId: "task-extract-6a" },
        payload: { taskId: "task-extract-6a", status: "completed", outputRefs: ["artifact-north-extract"] },
      }),
      envelope({
        id: "evt-tp-7",
        type: "task.completed",
        occurredAt: "2026-08-18T11:50:24.000Z",
        sequence: 7,
        correlation: { missionId: "mission-quarterly-close", runId: "run-close-6", taskId: "task-extract-6b" },
        payload: { taskId: "task-extract-6b", status: "completed", outputRefs: ["artifact-south-extract"] },
      }),
    ],
  },
]
