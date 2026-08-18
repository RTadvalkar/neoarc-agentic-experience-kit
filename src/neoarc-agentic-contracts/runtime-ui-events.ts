/**
 * neoarc-agentic-contracts / runtime-ui-events
 *
 * Slice 4 typed payloads for `AgenticUIEvent<TPayload>` (see `ui-events.ts`)
 * emitted by the runtime component family (`src/neoarc-agentic-ui/runtime`).
 * Every one of these is a signal of user intent only — emitting
 * `run.cancel.request` never means the run is cancelled, emitting
 * `run.retry.request` never means the retry succeeded. The product adapter
 * owns calling its real backend and feeding the authoritative result back
 * in through controlled props (`RunSummary.status`/`cancellation`).
 *
 * Only the six event types the runtime UX actually implements are defined
 * here — `run.step.open`/`run.metadata.open` are intentionally omitted
 * since no shipped Slice 4 component opens a step or metadata detail view.
 */

import type { OpaqueId } from "./shared"

/** Every runtime semantic UI event type this Slice defines. */
export const RUNTIME_UI_EVENT_TYPES = [
  "run.cancel.request",
  "run.retry.request",
  "run.resume.request",
  "run.output.open",
  "run.task.open",
  "run.humanAction.open",
] as const

export type RuntimeUIEventType = (typeof RUNTIME_UI_EVENT_TYPES)[number]

/** Emitted by `RunActions` when the human requests cancellation of a running/queued/waiting/paused run. */
export interface RunCancelRequestPayload {
  readonly runId: OpaqueId
}

/** Emitted by `RunActions`/`RunErrorPanel` when the human requests a failed/cancelled run be retried. */
export interface RunRetryRequestPayload {
  readonly runId: OpaqueId
}

/** Emitted by `RunActions` when the human requests a paused run resume. */
export interface RunResumeRequestPayload {
  readonly runId: OpaqueId
}

/** Emitted by `RunOutputs` when the human opens a specific produced output. */
export interface RunOutputOpenPayload {
  readonly outputId: OpaqueId
}

/** Emitted by `AgentTaskRow`/`WorkflowRunTree` when the human opens a specific task for inspection. */
export interface RunTaskOpenPayload {
  readonly taskId: OpaqueId
}

/** Emitted by `WaitingForHumanBanner` when the human opens the pending human interaction blocking the run. */
export interface RunHumanActionOpenPayload {
  readonly interactionId: OpaqueId
}

/** Discriminated-by-caller union of every runtime UI event payload. */
export type RuntimeUIEventPayload =
  | RunCancelRequestPayload
  | RunRetryRequestPayload
  | RunResumeRequestPayload
  | RunOutputOpenPayload
  | RunTaskOpenPayload
  | RunHumanActionOpenPayload
