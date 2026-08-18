/**
 * neoarc-agentic-contracts / runtime-events
 *
 * Slice 4 typed payloads for `AgenticEventEnvelope<TPayload>` (see
 * `events.ts`) describing runtime-category backend/runtime events —
 * missions, runs, tasks, and their hierarchical workflow structure.
 * `neoarc-agentic-projection/runtime-node-definitions.ts` consumes these.
 *
 * The eight representative event types called out by the Slice 4 brief
 * (`mission.started`, `run.started`, `task.started`, `task.progress`,
 * `task.completed`, `run.waiting_for_human`, `run.failed`,
 * `run.completed`) are all present. Two additional types —
 * `run.cancel_requested` / `run.cancelled` — are added because `RunStatus`
 * already models `cancel_requested`/`cancelled` as first-class states and
 * one of the six required Execution Lab scenarios ("cancel requested ->
 * cancelled") cannot be honestly demonstrated without a backend event
 * confirming each transition; every correlation still keys off the stable
 * `runId`, never array position or "the latest unfinished run".
 */

import type { OpaqueId } from "./shared"
import type { PendingInteraction } from "./human-interaction"
import type {
  AgentTask,
  HumanWaitReason,
  MissionSummary,
  ProgressSummary,
  RunError,
  RunOutput,
  RunSummary,
  WorkflowGroup,
} from "./runtime"

/** Every runtime-category event type this Slice defines. */
export const RUNTIME_EVENT_TYPES = [
  "mission.started",
  "run.started",
  "task.started",
  "task.progress",
  "task.completed",
  "run.waiting_for_human",
  "run.failed",
  "run.completed",
  "run.cancel_requested",
  "run.cancelled",
] as const

export type RuntimeEventType = (typeof RUNTIME_EVENT_TYPES)[number]

export interface MissionStartedPayload {
  readonly mission: MissionSummary
}

/** `workflow` is supplied once, at run start — the hierarchical structure a run's tasks belong to is a structural fact, not something that itself changes shape event-by-event in this Slice. */
export interface RunStartedPayload {
  readonly run: RunSummary
  readonly workflow: readonly WorkflowGroup[]
}

export interface TaskStartedPayload {
  readonly task: AgentTask
}

export interface TaskProgressPayload {
  readonly taskId: OpaqueId
  readonly progress: ProgressSummary
  readonly status?: "running" | "retrying"
}

export interface TaskCompletedPayload {
  readonly taskId: OpaqueId
  readonly status: "completed" | "failed" | "cancelled"
  readonly outputRefs?: readonly OpaqueId[]
}

export interface RunWaitingForHumanPayload {
  readonly runId: OpaqueId
  readonly reason: HumanWaitReason
  readonly interaction: PendingInteraction
}

export interface RunFailedPayload {
  readonly runId: OpaqueId
  readonly error: RunError
}

export interface RunCompletedPayload {
  readonly runId: OpaqueId
  readonly outputs?: readonly RunOutput[]
}

export interface RunCancelRequestedPayload {
  readonly runId: OpaqueId
}

export interface RunCancelledPayload {
  readonly runId: OpaqueId
}

/** Discriminated-by-caller union of every runtime event payload. Consumers narrow via `event.type`. */
export type RuntimeEventPayload =
  | MissionStartedPayload
  | RunStartedPayload
  | TaskStartedPayload
  | TaskProgressPayload
  | TaskCompletedPayload
  | RunWaitingForHumanPayload
  | RunFailedPayload
  | RunCompletedPayload
  | RunCancelRequestedPayload
  | RunCancelledPayload
