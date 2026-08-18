/**
 * neoarc-agentic-projection / runtime-node-definitions.test
 *
 * Deterministic replay-convergence + stable-identity + invariant tests for
 * the built-in runtime node family, run against the exact fixture scenarios
 * the Execution Lab uses (`lib/showcase/runtime-fixtures.ts`) so this suite
 * and the Mission-tab UI are proving the same thing about the same data.
 *
 * Every scenario is checked for:
 *   1. Replay convergence — full replay (`applyEvents`) and live append
 *      (`events.reduce(applyEvent, ...)`) produce the identical node list.
 *   2. Stable run/task identity — lifecycle updates never duplicate or
 *      reorder a node keyed by `runId`/`taskId`.
 *   3. Explicit failure — a later `run.*`/`task.*` before `*.started` throws
 *      `ProjectionInvariantError` rather than inventing a synthetic node.
 *   4. No synthetic facts — projected labels/titles come only from the
 *      corresponding `*.started` payload, never `Run <id>` / `Task <id>`.
 *
 * Run with: node --test src/neoarc-agentic-projection/runtime-node-definitions.test.mts
 */

import { test } from "node:test"
import assert from "node:assert/strict"

import { applyEvent, applyEvents, createProjectionStore, selectNodes } from "./projection-store.ts"
import { ProjectionInvariantError } from "./projection-invariant.ts"
import { runtimeNodeDefinitions, type RunProjection } from "./runtime-node-definitions.ts"
import { runtimeExecutionLabScenarios } from "../../lib/showcase/runtime-fixtures.ts"
import type { AgenticEventEnvelope } from "../neoarc-agentic-contracts/events.ts"
import type { AgentTask, RunSummary } from "../neoarc-agentic-contracts/runtime.ts"
import type {
  RunCancelledPayload,
  RunCancelRequestedPayload,
  RunCompletedPayload,
  RunFailedPayload,
  RunWaitingForHumanPayload,
  TaskCompletedPayload,
  TaskProgressPayload,
} from "../neoarc-agentic-contracts/runtime-events.ts"

function fullReplayNodes(events: Parameters<typeof applyEvents>[1]) {
  return selectNodes(applyEvents(createProjectionStore(), events, runtimeNodeDefinitions))
}

function liveAppendNodes(events: Parameters<typeof applyEvents>[1]) {
  const store = events.reduce((acc, event) => applyEvent(acc, event, runtimeNodeDefinitions), createProjectionStore())
  return selectNodes(store)
}

function orphanEnvelope<TPayload>(type: string, payload: TPayload): AgenticEventEnvelope<TPayload> {
  return {
    id: `evt-orphan-${type}`,
    type,
    occurredAt: "2026-08-18T12:00:00.000Z",
    durability: "durable",
    payload,
  }
}

function assertThrowsInvariant(event: AgenticEventEnvelope, requiredPredecessor: string) {
  assert.throws(
    () => applyEvent(createProjectionStore(), event, runtimeNodeDefinitions),
    (err: unknown) => {
      assert.ok(err instanceof ProjectionInvariantError)
      assert.equal(err.eventType, event.type)
      assert.equal(err.requiredPredecessor, requiredPredecessor)
      return true
    },
  )
}

test("every Execution Lab scenario converges: full replay === live append", () => {
  assert.equal(runtimeExecutionLabScenarios.length, 6)
  for (const scenario of runtimeExecutionLabScenarios) {
    assert.deepEqual(
      fullReplayNodes(scenario.events),
      liveAppendNodes(scenario.events),
      `scenario "${scenario.id}" diverged between full replay and live append`,
    )
  }
})

test("run node identity remains stable through lifecycle updates", () => {
  const scenario = runtimeExecutionLabScenarios.find((s) => s.id === "runtime-cancel-requested-cancelled")
  assert.ok(scenario)

  let store = createProjectionStore()
  const runKeySnapshots: string[][] = []
  for (const event of scenario.events) {
    store = applyEvent(store, event, runtimeNodeDefinitions)
    runKeySnapshots.push(selectNodes(store).filter((node) => node.kind === "mission.run").map((node) => node.key))
  }

  const expectedKey = "mission:run:run-close-4"
  assert.deepEqual(runKeySnapshots, [[expectedKey], [expectedKey], [expectedKey]])

  const finalRun = selectNodes(store).find((node) => node.kind === "mission.run")
  assert.ok(finalRun)
  assert.equal(finalRun.key, expectedKey)
  assert.equal((finalRun.data as RunProjection).run.status, "cancelled")
  assert.equal((finalRun.data as RunProjection).run.cancellation, "cancelled")
  assert.equal((finalRun.data as RunProjection).run.label, "Close run — attempt 4")
})

test("task node identity remains stable through progress and completion", () => {
  const scenario = runtimeExecutionLabScenarios.find((s) => s.id === "runtime-multi-task-progress")
  assert.ok(scenario)

  let store = createProjectionStore()
  const taskKeySnapshots: string[][] = []
  for (const event of scenario.events) {
    store = applyEvent(store, event, runtimeNodeDefinitions)
    taskKeySnapshots.push(selectNodes(store).filter((node) => node.kind === "mission.task").map((node) => node.key))
  }

  const extract6a = "mission:task:task-extract-6a"
  const extract6b = "mission:task:task-extract-6b"
  assert.deepEqual(taskKeySnapshots, [
    [],
    [extract6a],
    [extract6a, extract6b],
    [extract6a, extract6b],
    [extract6a, extract6b],
    [extract6a, extract6b],
    [extract6a, extract6b],
  ])

  const taskNodes = selectNodes(store).filter((node) => node.kind === "mission.task")
  assert.equal(taskNodes.length, 2)
  assert.equal((taskNodes[0].data as AgentTask).title, "Extract North region entries")
  assert.equal((taskNodes[0].data as AgentTask).status, "completed")
  assert.equal((taskNodes[1].data as AgentTask).title, "Extract South region entries")
  assert.equal((taskNodes[1].data as AgentTask).status, "completed")
})

test("run update before run.started fails explicitly", () => {
  const runId = "run-orphan"
  const waiting: AgenticEventEnvelope<RunWaitingForHumanPayload> = orphanEnvelope("run.waiting_for_human", {
    runId,
    reason: "execution-permission",
    interaction: {
      id: "interaction-orphan",
      presentationIntent: "execution-permission",
      label: "Approve write",
      requestedAt: "2026-08-18T12:00:00.000Z",
    },
  })
  const failed: AgenticEventEnvelope<RunFailedPayload> = orphanEnvelope("run.failed", {
    runId,
    error: {
      id: "error-orphan",
      message: "Ledger service timed out",
      retryability: { retryable: true },
      occurredAt: "2026-08-18T12:00:00.000Z",
    },
  })
  const completed: AgenticEventEnvelope<RunCompletedPayload> = orphanEnvelope("run.completed", { runId })
  const cancelRequested: AgenticEventEnvelope<RunCancelRequestedPayload> = orphanEnvelope("run.cancel_requested", { runId })
  const cancelled: AgenticEventEnvelope<RunCancelledPayload> = orphanEnvelope("run.cancelled", { runId })

  for (const event of [waiting, failed, completed, cancelRequested, cancelled]) {
    assertThrowsInvariant(event, "run.started")
  }
})

test("task update before task.started fails explicitly", () => {
  const progress: AgenticEventEnvelope<TaskProgressPayload> = orphanEnvelope("task.progress", {
    taskId: "task-orphan",
    progress: { completedSteps: 1, totalSteps: 4 },
  })
  const completed: AgenticEventEnvelope<TaskCompletedPayload> = orphanEnvelope("task.completed", {
    taskId: "task-orphan",
    status: "completed",
  })

  assertThrowsInvariant(progress, "task.started")
  assertThrowsInvariant(completed, "task.started")
})

test("no synthetic runtime facts are introduced", () => {
  for (const scenario of runtimeExecutionLabScenarios) {
    const startedRunLabels = new Map<string, string>()
    const startedTaskTitles = new Map<string, string>()
    for (const event of scenario.events) {
      if (event.type === "run.started") {
        const run = (event.payload as { run: RunSummary }).run
        startedRunLabels.set(run.id, run.label)
      }
      if (event.type === "task.started") {
        const task = (event.payload as { task: AgentTask }).task
        startedTaskTitles.set(task.taskId, task.title)
      }
    }

    const nodes = fullReplayNodes(scenario.events)
    for (const node of nodes) {
      if (node.kind === "mission.run") {
        const run = (node.data as RunProjection).run
        assert.notEqual(run.label, `Run ${run.id}`, `scenario "${scenario.id}" invented a Run <id> label`)
        assert.equal(run.label, startedRunLabels.get(run.id), `scenario "${scenario.id}" run label drifted from run.started`)
      }
      if (node.kind === "mission.task") {
        const task = node.data as AgentTask
        assert.notEqual(task.title, `Task ${task.taskId}`, `scenario "${scenario.id}" invented a Task <id> title`)
        assert.equal(
          task.title,
          startedTaskTitles.get(task.taskId),
          `scenario "${scenario.id}" task title drifted from task.started`,
        )
      }
    }
  }
})
