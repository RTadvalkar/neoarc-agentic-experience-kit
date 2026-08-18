/**
 * neoarc-agentic-projection / runtime-node-definitions
 *
 * Slice 4 built-in `AgenticNodeDefinition`s for the runtime event family
 * (missions, runs, tasks). Target is always `"mission"` — the
 * `AgenticViewTarget` this seam was reserved for since Slice 1
 * (`neoarc-agentic-projection/types.ts`).
 *
 * Three node kinds, each keyed by stable business id, never by event id or
 * array position, so live-append and full replay converge exactly as the
 * conversation node family proves (`conversation-node-definitions.ts`):
 *
 * - `mission.mission` — one node per `mission.id`, one-shot (`mission.started`).
 * - `mission.run` — one node per `run.id`, accumulating across
 *   `run.started -> run.waiting_for_human/run.failed/run.completed/
 *   run.cancel_requested/run.cancelled`. Its projected data bundles the
 *   evolving `RunSummary` together with the workflow structure supplied at
 *   `run.started` and whichever terminal detail (pending interaction,
 *   error, outputs) the most recent event carried — see `RunProjection`.
 * - `mission.task` — one node per `taskId`, accumulating across
 *   `task.started -> task.progress -> task.completed`.
 */

import type {
  MissionStartedPayload,
  RunCancelledPayload,
  RunCancelRequestedPayload,
  RunCompletedPayload,
  RunFailedPayload,
  RunStartedPayload,
  RunWaitingForHumanPayload,
  TaskCompletedPayload,
  TaskProgressPayload,
  TaskStartedPayload,
} from "../neoarc-agentic-contracts/runtime-events"
import type {
  AgentTask,
  MissionSummary,
  RunError,
  RunOutput,
  RunSummary,
  WorkflowGroup,
} from "../neoarc-agentic-contracts/runtime"
import type { PendingInteraction } from "../neoarc-agentic-contracts/human-interaction"
import type { AgenticNodeDefinition, AgenticViewNode, MatchResult } from "./types"

const TARGET = "mission" as const

function keyFor(prefix: string, id: string): string {
  return `mission:${prefix}:${id}`
}

/** Projected data for the `mission.run` node kind — the evolving `RunSummary` plus its structural workflow and whichever terminal detail was most recently supplied. */
export interface RunProjection {
  readonly run: RunSummary
  readonly workflow: readonly WorkflowGroup[]
  readonly pendingInteraction?: PendingInteraction
  readonly error?: RunError
  readonly outputs?: readonly RunOutput[]
}

export const missionNodeDefinition: AgenticNodeDefinition<unknown, MissionSummary> = {
  kind: "mission.mission",
  target: TARGET,
  publicationCadence: "immediate",
  match(event): MatchResult {
    return event.type === "mission.started" ? { matched: true, kind: "mission.mission", target: TARGET } : { matched: false }
  },
  project(event) {
    const payload = event.payload as MissionStartedPayload
    const key = keyFor("mission", payload.mission.id)
    return { key, kind: "mission.mission", target: TARGET, data: payload.mission, visibility: "visible", correlation: event.correlation }
  },
}

export const runNodeDefinition: AgenticNodeDefinition<unknown, RunProjection> = {
  kind: "mission.run",
  target: TARGET,
  publicationCadence: "immediate",
  match(event): MatchResult {
    if (
      event.type === "run.started" ||
      event.type === "run.waiting_for_human" ||
      event.type === "run.failed" ||
      event.type === "run.completed" ||
      event.type === "run.cancel_requested" ||
      event.type === "run.cancelled"
    ) {
      return { matched: true, kind: "mission.run", target: TARGET }
    }
    return { matched: false }
  },
  project(event, context) {
    if (event.type === "run.started") {
      const payload = event.payload as RunStartedPayload
      const key = keyFor("run", payload.run.id)
      const data: RunProjection = { run: payload.run, workflow: payload.workflow }
      return { key, kind: "mission.run", target: TARGET, data, visibility: "visible", correlation: event.correlation }
    }

    // Every other runtime event references `runId` rather than embedding a
    // fresh `RunSummary`, so recover the accumulated projection first.
    const runId = (event.payload as { readonly runId: string }).runId
    const key = keyFor("run", runId)
    const existing = context.findExistingNode?.(key) as AgenticViewNode<RunProjection> | undefined
    const base: RunProjection =
      existing?.data ?? {
        run: { id: runId, label: `Run ${runId}`, status: "running", cancellation: "none" },
        workflow: [],
      }

    if (event.type === "run.waiting_for_human") {
      const payload = event.payload as RunWaitingForHumanPayload
      const data: RunProjection = {
        ...base,
        run: { ...base.run, status: "waiting_for_human", humanWaitReason: payload.reason },
        pendingInteraction: payload.interaction,
      }
      return { key, kind: "mission.run", target: TARGET, data, visibility: "visible", correlation: event.correlation }
    }

    if (event.type === "run.failed") {
      const payload = event.payload as RunFailedPayload
      const data: RunProjection = {
        ...base,
        run: { ...base.run, status: "failed", completedAt: event.occurredAt, retryability: payload.error.retryability },
        error: payload.error,
      }
      return { key, kind: "mission.run", target: TARGET, data, visibility: "visible", correlation: event.correlation }
    }

    if (event.type === "run.completed") {
      const payload = event.payload as RunCompletedPayload
      const data: RunProjection = {
        ...base,
        run: { ...base.run, status: "completed", completedAt: event.occurredAt },
        outputs: payload.outputs,
      }
      return { key, kind: "mission.run", target: TARGET, data, visibility: "visible", correlation: event.correlation }
    }

    if (event.type === "run.cancel_requested") {
      void (event.payload as RunCancelRequestedPayload)
      const data: RunProjection = { ...base, run: { ...base.run, status: "cancel_requested", cancellation: "requested" } }
      return { key, kind: "mission.run", target: TARGET, data, visibility: "visible", correlation: event.correlation }
    }

    // run.cancelled
    void (event.payload as RunCancelledPayload)
    const data: RunProjection = {
      ...base,
      run: { ...base.run, status: "cancelled", cancellation: "cancelled", completedAt: event.occurredAt },
    }
    return { key, kind: "mission.run", target: TARGET, data, visibility: "visible", correlation: event.correlation }
  },
}

export const taskNodeDefinition: AgenticNodeDefinition<unknown, AgentTask> = {
  kind: "mission.task",
  target: TARGET,
  publicationCadence: "animation-frame",
  match(event): MatchResult {
    if (event.type === "task.started" || event.type === "task.progress" || event.type === "task.completed") {
      return { matched: true, kind: "mission.task", target: TARGET }
    }
    return { matched: false }
  },
  project(event, context) {
    if (event.type === "task.started") {
      const payload = event.payload as TaskStartedPayload
      const key = keyFor("task", payload.task.taskId)
      return { key, kind: "mission.task", target: TARGET, data: payload.task, visibility: "visible", correlation: event.correlation }
    }

    if (event.type === "task.progress") {
      const payload = event.payload as TaskProgressPayload
      const key = keyFor("task", payload.taskId)
      const existing = context.findExistingNode?.(key) as AgenticViewNode<AgentTask> | undefined
      const base: AgentTask = existing?.data ?? { taskId: payload.taskId, title: `Task ${payload.taskId}`, status: "running" }
      const data: AgentTask = { ...base, progress: payload.progress, status: payload.status ?? base.status }
      return { key, kind: "mission.task", target: TARGET, data, visibility: "visible", correlation: event.correlation }
    }

    // task.completed
    const payload = event.payload as TaskCompletedPayload
    const key = keyFor("task", payload.taskId)
    const existing = context.findExistingNode?.(key) as AgenticViewNode<AgentTask> | undefined
    const base: AgentTask = existing?.data ?? { taskId: payload.taskId, title: `Task ${payload.taskId}`, status: "running" }
    const data: AgentTask = {
      ...base,
      status: payload.status,
      completedAt: event.occurredAt,
      outputRefs: payload.outputRefs ?? base.outputRefs,
    }
    return { key, kind: "mission.task", target: TARGET, data, visibility: "visible", correlation: event.correlation }
  },
}

/** Every built-in runtime node definition, in match-priority order. Pass straight to `applyEvent`/`applyEvents` (`projection-store.ts`). */
export const runtimeNodeDefinitions: readonly AgenticNodeDefinition<unknown, unknown>[] = [
  missionNodeDefinition as AgenticNodeDefinition<unknown, unknown>,
  runNodeDefinition as AgenticNodeDefinition<unknown, unknown>,
  taskNodeDefinition as AgenticNodeDefinition<unknown, unknown>,
]
