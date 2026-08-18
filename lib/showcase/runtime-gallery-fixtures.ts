/**
 * lib/showcase/runtime-gallery-fixtures
 *
 * SHOWCASE-ONLY fixture data for the Slice 4 Component Gallery entries in
 * `component-gallery.tsx`. Kept out of `src/neoarc-agentic-ui` per
 * docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md ("keep mock data
 * outside reusable components").
 */

import type { ActorSummary } from "../../src/neoarc-agentic-contracts/foundation"
import type {
  AgentTask,
  MissionSummary,
  RunError,
  RunOutput,
  RunStatus,
  RunSummary,
  WorkflowGroup,
} from "../../src/neoarc-agentic-contracts/runtime"
import type { PendingInteraction } from "../../src/neoarc-agentic-contracts/human-interaction"

export const galleryRunStatuses: readonly RunStatus[] = [
  "queued",
  "starting",
  "running",
  "waiting_for_human",
  "paused",
  "completed",
  "failed",
  "cancel_requested",
  "cancelled",
]

const galleryActor: ActorSummary = { id: "actor-ava", kind: "agent", displayName: "Ava" }
const galleryReviewActor: ActorSummary = { id: "actor-priya", kind: "agent", displayName: "Priya" }

export const galleryMission: MissionSummary = {
  id: "mission-gallery",
  title: "Quarterly close reconciliation",
  description: "Reconcile ledger entries and produce the quarterly close report.",
  status: "running",
  riskLevel: "medium",
  createdAt: "2026-08-18T08:00:00.000Z",
}

export const galleryRunRunning: RunSummary = {
  id: "run-gallery-running",
  missionId: "mission-gallery",
  label: "Close run — attempt 1",
  agent: galleryActor,
  status: "running",
  progress: { completedSteps: 2, totalSteps: 4, label: "Reconciling batch 2 of 4" },
  cancellation: "none",
  startedAt: "2026-08-18T11:00:00.000Z",
}

export const galleryRunCancelRequested: RunSummary = {
  ...galleryRunRunning,
  id: "run-gallery-cancel-requested",
  status: "cancel_requested",
  cancellation: "requested",
}

export const galleryRunFailedRetryable: RunSummary = {
  id: "run-gallery-failed",
  missionId: "mission-gallery",
  label: "Close run — attempt 2",
  agent: galleryActor,
  status: "failed",
  cancellation: "none",
  retryability: { retryable: true },
  startedAt: "2026-08-18T11:10:00.000Z",
  completedAt: "2026-08-18T11:10:12.000Z",
}

export const galleryRunFailedNotRetryable: RunSummary = {
  ...galleryRunFailedRetryable,
  id: "run-gallery-failed-final",
  retryability: { retryable: false, reason: "Maximum retry attempts reached" },
}

export const galleryRunPaused: RunSummary = {
  id: "run-gallery-paused",
  missionId: "mission-gallery",
  label: "Close run — attempt 3",
  agent: galleryActor,
  status: "paused",
  cancellation: "none",
  startedAt: "2026-08-18T11:20:00.000Z",
}

export const galleryRunCompleted: RunSummary = {
  id: "run-gallery-completed",
  missionId: "mission-gallery",
  label: "Close run — attempt 4",
  agent: galleryActor,
  status: "completed",
  cancellation: "none",
  startedAt: "2026-08-18T11:30:00.000Z",
  completedAt: "2026-08-18T11:31:30.000Z",
}

export const galleryPendingInteraction: PendingInteraction = {
  id: "interaction-gallery",
  presentationIntent: "execution-permission",
  label: "Approve write to ledger correction entry #4821",
  requestedAt: "2026-08-18T11:10:15.000Z",
}

export const galleryRunError: RunError = {
  id: "error-gallery",
  message: "Ledger service timed out",
  causeSummary: "Upstream ledger service did not respond within 30s.",
  retryability: { retryable: true },
  occurredAt: "2026-08-18T11:20:12.000Z",
}

export const galleryRunOutputs: readonly RunOutput[] = [
  {
    id: "output-gallery-report",
    artifact: { id: "artifact-gallery-report", name: "Quarterly close report — Q2 2026", artifactType: "document", status: "completed", url: "https://example.com/reports/q2-2026" },
    producedAt: "2026-08-18T11:41:28.000Z",
  },
  {
    id: "output-gallery-ledger",
    artifact: { id: "artifact-gallery-ledger", name: "Reconciled ledger export.csv", artifactType: "file", status: "completed", url: "https://example.com/exports/ledger-q2-2026.csv" },
    producedAt: "2026-08-18T11:41:29.000Z",
  },
]

export const galleryTaskRunning: AgentTask = {
  taskId: "task-gallery-1",
  title: "Extract ledger entries",
  status: "running",
  missionId: "mission-gallery",
  runId: "run-gallery-running",
  producedBy: galleryActor,
  progress: { completedSteps: 2, totalSteps: 4 },
  startedAt: "2026-08-18T11:00:03.000Z",
}

export const galleryTaskCompleted: AgentTask = {
  taskId: "task-gallery-2",
  title: "Review reconciled entries",
  status: "completed",
  missionId: "mission-gallery",
  runId: "run-gallery-running",
  producedBy: galleryReviewActor,
  inputRefs: ["artifact-ledger-extract"],
  outputRefs: ["artifact-review-summary"],
  knowledgeRefs: ["kb-refund-policy"],
  toolCallRefs: ["tool-order-lookup"],
  startedAt: "2026-08-18T11:00:21.000Z",
  completedAt: "2026-08-18T11:02:40.000Z",
}

export const galleryTaskFailed: AgentTask = {
  taskId: "task-gallery-3",
  title: "Post final entries to general ledger",
  status: "failed",
  missionId: "mission-gallery",
  runId: "run-gallery-running",
  startedAt: "2026-08-18T11:03:00.000Z",
  completedAt: "2026-08-18T11:03:20.000Z",
}

export const galleryWorkflowGroups: readonly WorkflowGroup[] = [
  { id: "phase-gallery-extraction", label: "Extraction", status: "completed", members: [{ id: "member-1", taskId: "task-gallery-2" }] },
  { id: "phase-gallery-review", label: "Review", status: "running", members: [{ id: "member-2", taskId: "task-gallery-1" }] },
  { id: "phase-gallery-posting", label: "Posting", status: "failed", members: [{ id: "member-3", taskId: "task-gallery-3" }] },
]

export const galleryWorkflowTasks: ReadonlyMap<string, AgentTask> = new Map([
  [galleryTaskRunning.taskId, galleryTaskRunning],
  [galleryTaskCompleted.taskId, galleryTaskCompleted],
  [galleryTaskFailed.taskId, galleryTaskFailed],
])

export const galleryExecutionSteps = [
  { id: "step-1", label: "Run queued", status: "completed" as const, occurredAt: "2026-08-18T11:00:00.000Z" },
  { id: "step-2", label: "Extraction started", status: "completed" as const, occurredAt: "2026-08-18T11:00:03.000Z", taskId: "task-gallery-2" },
  { id: "step-3", label: "Review started", status: "running" as const, occurredAt: "2026-08-18T11:00:21.000Z", taskId: "task-gallery-1" },
  { id: "step-4", label: "Posting failed", status: "failed" as const, occurredAt: "2026-08-18T11:03:20.000Z", taskId: "task-gallery-3" },
]
