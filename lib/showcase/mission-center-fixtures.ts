/**
 * lib/showcase/mission-center-fixtures
 *
 * SHOWCASE-ONLY. Static, directly-authored view-model fixtures for the
 * Async Mission Center reference experience (`app/mission-center`). Unlike
 * the "Architecture Agent Run" scenario (`trace-fixtures.ts`), these are
 * NOT an event stream fed through `neoarc-agentic-projection` — they are
 * the "product adapter already built the normalized view model" path
 * `MissionHeader`/`RunStatusPanel`/`WorkflowRunTree`/etc. are equally
 * designed to accept directly. Eight representative missions/runs, one
 * per state a mission center must make scannable: queued, running, three
 * distinct "needs you" presentation intents (clarification, execution
 * permission, proposal review), a retryable failure, a plain completion,
 * and a completion with produced outputs.
 *
 * Mock data only; never imported by `src/neoarc-agentic-ui` or
 * `src/neoarc-agentic-projection`.
 */

import type { ActorSummary, AgentSummary, ContextRef, RiskLevel } from "../../src/neoarc-agentic-contracts/foundation"
import type {
  AgentTask,
  HumanWaitReason,
  MissionSummary,
  RunError,
  RunOutput,
  RunSummary,
  WorkflowGroup,
} from "../../src/neoarc-agentic-contracts/runtime"
import type { PendingInteraction } from "../../src/neoarc-agentic-contracts/human-interaction"
import type { ClarificationRequest } from "../../src/neoarc-agentic-contracts/conversation"
import type { ExecutionPermissionRequestPending } from "../../src/neoarc-agentic-contracts/human-interaction"
import type { ProposalSummary } from "../../src/neoarc-agentic-contracts/proposal"

export const missionCenterContext: ContextRef = { id: "ctx-mission-center", kind: "workspace", label: "Acme Platform" }

const migrationAgent: AgentSummary = {
  id: "agent-migration",
  displayName: "Migration agent",
  description: "Handles data migration tasks",
  lifecycleStatus: "active",
  capabilities: ["migration", "validation"],
  version: "1.2.0",
}

const catalogAgent: AgentSummary = {
  id: "agent-catalog",
  displayName: "Catalog agent",
  description: "Handles vendor catalog reconciliation",
  lifecycleStatus: "active",
  capabilities: ["catalog-sync"],
  version: "1.0.0",
}

const opsAgent: AgentSummary = {
  id: "agent-ops",
  displayName: "Ops agent",
  description: "Handles infrastructure and pricing operations",
  lifecycleStatus: "active",
  capabilities: ["provisioning", "pricing"],
  version: "1.1.0",
}

const reconciliationAgent: AgentSummary = {
  id: "agent-reconciliation",
  displayName: "Reconciliation agent",
  description: "Handles ledger and compliance reconciliation",
  lifecycleStatus: "active",
  capabilities: ["reconciliation", "reporting"],
  version: "1.3.0",
}

function asActor(agent: AgentSummary): ActorSummary {
  return { id: agent.id, kind: "agent", displayName: agent.displayName }
}

const migrationActor = asActor(migrationAgent)
const catalogActor = asActor(catalogAgent)
const opsActor = asActor(opsAgent)
const reconciliationActor = asActor(reconciliationAgent)

function taskMap(tasks: readonly AgentTask[]): ReadonlyMap<string, AgentTask> {
  return new Map(tasks.map((task) => [task.taskId, task]))
}

export interface MissionCenterItem {
  readonly id: string
  readonly mission: MissionSummary
  readonly run: RunSummary
  readonly workflow: readonly WorkflowGroup[]
  readonly tasks: ReadonlyMap<string, AgentTask>
  readonly pendingInteraction?: PendingInteraction
  readonly humanWaitReason?: HumanWaitReason
  readonly error?: RunError
  readonly outputs?: readonly RunOutput[]
}

// ---------------------------------------------------------------------------
// 1. Queued
// ---------------------------------------------------------------------------

const item1Tasks: readonly AgentTask[] = [
  { taskId: "task-nightly-1", title: "Reconcile ledger deltas", status: "queued", missionId: "mission-nightly", runId: "run-nightly-1" },
]

export const missionQueued: MissionCenterItem = {
  id: "queued-nightly-reconciliation",
  mission: {
    id: "mission-nightly",
    title: "Nightly reconciliation sweep",
    description: "Routine end-of-day reconciliation across all regional ledgers.",
    status: "queued",
    riskLevel: "low" as RiskLevel,
    createdAt: "2026-08-19T02:00:00.000Z",
  },
  run: {
    id: "run-nightly-1",
    missionId: "mission-nightly",
    label: "Nightly sweep — run 1",
    agent: reconciliationActor,
    status: "queued",
    cancellation: "none",
  },
  workflow: [{ id: "phase-nightly", label: "Reconciliation", status: "queued", members: [{ id: "member-1", taskId: "task-nightly-1" }] }],
  tasks: taskMap(item1Tasks),
}

// ---------------------------------------------------------------------------
// 2. Running
// ---------------------------------------------------------------------------

const item2Tasks: readonly AgentTask[] = [
  {
    taskId: "task-migration-extract",
    title: "Extract legacy CRM records",
    status: "completed",
    missionId: "mission-migration",
    runId: "run-migration-1",
    producedBy: migrationActor,
    startedAt: "2026-08-19T08:00:00.000Z",
    completedAt: "2026-08-19T08:04:00.000Z",
    outputRefs: ["artifact-crm-export"],
  },
  {
    taskId: "task-migration-transform",
    title: "Transform records to new schema",
    status: "running",
    missionId: "mission-migration",
    runId: "run-migration-1",
    producedBy: migrationActor,
    progress: { completedSteps: 3, totalSteps: 6, label: "Mapping custom fields" },
    startedAt: "2026-08-19T08:04:10.000Z",
    inputRefs: ["artifact-crm-export"],
  },
  {
    taskId: "task-migration-load",
    title: "Load into destination CRM",
    status: "idle",
    missionId: "mission-migration",
    runId: "run-migration-1",
  },
]

export const missionRunning: MissionCenterItem = {
  id: "running-data-migration",
  mission: {
    id: "mission-migration",
    title: "Customer data migration to new CRM",
    description: "Migrate all active customer records from the legacy CRM to the new platform.",
    status: "running",
    riskLevel: "medium",
    createdAt: "2026-08-19T07:55:00.000Z",
  },
  run: {
    id: "run-migration-1",
    missionId: "mission-migration",
    label: "Migration run — attempt 1",
    agent: migrationActor,
    status: "running",
    progress: { completedSteps: 3, totalSteps: 6, label: "Transforming records" },
    cancellation: "none",
    startedAt: "2026-08-19T08:00:00.000Z",
  },
  workflow: [
    { id: "phase-extract", label: "Extract", status: "completed", members: [{ id: "member-1", taskId: "task-migration-extract" }] },
    { id: "phase-transform", label: "Transform", status: "running", members: [{ id: "member-2", taskId: "task-migration-transform" }] },
    { id: "phase-load", label: "Load", status: "idle", members: [{ id: "member-3", taskId: "task-migration-load" }] },
  ],
  tasks: taskMap(item2Tasks),
}

// ---------------------------------------------------------------------------
// 3. Needs you — clarification
// ---------------------------------------------------------------------------

const item3Tasks: readonly AgentTask[] = [
  {
    taskId: "task-catalog-align",
    title: "Align vendor catalog fields",
    status: "waiting_for_human",
    missionId: "mission-catalog",
    runId: "run-catalog-1",
    producedBy: catalogActor,
    startedAt: "2026-08-19T09:10:00.000Z",
  },
]

export const missionNeedsClarification: MissionCenterItem = {
  id: "needs-clarification-schema",
  mission: {
    id: "mission-catalog",
    title: "Vendor catalog schema alignment",
    description: "Align three vendor catalog feeds onto the shared product schema before the next sync.",
    status: "waiting_for_human",
    riskLevel: "low",
    createdAt: "2026-08-19T09:05:00.000Z",
  },
  run: {
    id: "run-catalog-1",
    missionId: "mission-catalog",
    label: "Catalog alignment run",
    agent: catalogActor,
    status: "waiting_for_human",
    cancellation: "none",
    humanWaitReason: "clarification",
    startedAt: "2026-08-19T09:06:00.000Z",
  },
  workflow: [{ id: "phase-align", label: "Alignment", status: "waiting_for_human", members: [{ id: "member-1", taskId: "task-catalog-align" }] }],
  tasks: taskMap(item3Tasks),
  humanWaitReason: "clarification",
  pendingInteraction: {
    id: "interaction-catalog-1",
    presentationIntent: "clarification",
    label: "Which vendor feed's unit-of-measure convention should win when two feeds disagree?",
    requestedAt: "2026-08-19T09:11:00.000Z",
    riskLevel: "low",
  },
}

export const missionCenterClarification: ClarificationRequest = {
  id: "mission-clarification-catalog-1",
  question: "Vendor A reports units in cases, Vendor B in eaches. Which unit-of-measure convention should the merged catalog use?",
  options: ["Standardize on cases", "Standardize on eaches", "Keep both, tagged per vendor"],
  resolved: false,
}

// ---------------------------------------------------------------------------
// 4. Needs you — execution permission
// ---------------------------------------------------------------------------

const item4Tasks: readonly AgentTask[] = [
  {
    taskId: "task-sandbox-provision",
    title: "Provision staging environment copy",
    status: "waiting_for_human",
    missionId: "mission-sandbox",
    runId: "run-sandbox-1",
    producedBy: opsActor,
    startedAt: "2026-08-19T10:20:00.000Z",
  },
]

export const missionNeedsPermission: MissionCenterItem = {
  id: "needs-permission-sandbox",
  mission: {
    id: "mission-sandbox",
    title: "Provision staging environment copy",
    description: "Clone production configuration into an isolated staging environment for load testing.",
    status: "waiting_for_human",
    riskLevel: "medium",
    createdAt: "2026-08-19T10:15:00.000Z",
  },
  run: {
    id: "run-sandbox-1",
    missionId: "mission-sandbox",
    label: "Sandbox provisioning run",
    agent: opsActor,
    status: "waiting_for_human",
    cancellation: "none",
    humanWaitReason: "execution-permission",
    startedAt: "2026-08-19T10:16:00.000Z",
  },
  workflow: [{ id: "phase-provision", label: "Provisioning", status: "waiting_for_human", members: [{ id: "member-1", taskId: "task-sandbox-provision" }] }],
  tasks: taskMap(item4Tasks),
  humanWaitReason: "execution-permission",
  pendingInteraction: {
    id: "interaction-sandbox-1",
    presentationIntent: "execution-permission",
    label: "Approve provisioning a full staging environment clone",
    requestedAt: "2026-08-19T10:21:00.000Z",
    riskLevel: "medium",
  },
}

export const missionCenterPermission: ExecutionPermissionRequestPending = {
  id: "mission-permission-sandbox-1",
  status: "pending",
  action: {
    toolName: "provision-staging-clone",
    actionSummary: "Provision a full staging environment clone of production for load testing",
    targetLabel: "staging-clone-load-test",
  },
  riskLevel: "medium",
  consequenceSummary: "Creates billable infrastructure that persists until manually torn down. No production traffic is affected.",
  requestedAt: "2026-08-19T10:21:00.000Z",
}

// ---------------------------------------------------------------------------
// 5. Needs you — proposal review
// ---------------------------------------------------------------------------

const item5Tasks: readonly AgentTask[] = [
  {
    taskId: "task-pricing-analysis",
    title: "Analyze regional pricing elasticity",
    status: "waiting_for_human",
    missionId: "mission-pricing",
    runId: "run-pricing-1",
    producedBy: opsActor,
    startedAt: "2026-08-19T11:00:00.000Z",
  },
]

export const missionNeedsProposal: MissionCenterItem = {
  id: "needs-proposal-pricing",
  mission: {
    id: "mission-pricing",
    title: "Adjust regional pricing tiers",
    description: "Rebalance pricing tiers for the EMEA region based on the latest elasticity analysis.",
    status: "waiting_for_human",
    riskLevel: "high",
    createdAt: "2026-08-19T10:55:00.000Z",
  },
  run: {
    id: "run-pricing-1",
    missionId: "mission-pricing",
    label: "Pricing adjustment run",
    agent: opsActor,
    status: "waiting_for_human",
    cancellation: "none",
    humanWaitReason: "proposal-review",
    startedAt: "2026-08-19T11:01:00.000Z",
  },
  workflow: [{ id: "phase-pricing", label: "Analysis & proposal", status: "waiting_for_human", members: [{ id: "member-1", taskId: "task-pricing-analysis" }] }],
  tasks: taskMap(item5Tasks),
  humanWaitReason: "proposal-review",
  pendingInteraction: {
    id: "interaction-pricing-1",
    presentationIntent: "proposal-review",
    label: "Review proposed EMEA pricing tier adjustment",
    requestedAt: "2026-08-19T11:08:00.000Z",
    riskLevel: "high",
  },
}

export const missionCenterProposal: ProposalSummary = {
  id: "mission-proposal-pricing-1",
  title: "Rebalance EMEA pricing tiers",
  status: "ready_for_review",
  revision: { revision: 1, createdAt: "2026-08-19T11:08:00.000Z" },
  summary: "Raises the mid tier by 6% and introduces a new entry tier for the EMEA region based on the latest elasticity analysis.",
  sections: [
    {
      id: "pricing-section-tiers",
      title: "Pricing tiers",
      changes: [
        {
          id: "pricing-change-mid",
          summary: "Raise EMEA mid tier price",
          path: "pricing/emea/mid-tier.json",
          before: "{ \"tier\": \"mid\", \"price\": 49 }",
          after: "{ \"tier\": \"mid\", \"price\": 52 }",
        },
        {
          id: "pricing-change-entry",
          summary: "Introduce EMEA entry tier",
          path: "pricing/emea/entry-tier.json",
          before: "(no entry tier on file)",
          after: "{ \"tier\": \"entry\", \"price\": 19 }",
        },
      ],
    },
  ],
  evidence: [
    { id: "pricing-evidence-1", label: "EMEA price elasticity analysis (Q2 2026)", sourceLabel: "Knowledge base" },
    { id: "pricing-evidence-2", label: "Competitor pricing snapshot", sourceLabel: "Market data feed" },
  ],
  riskFindings: [
    { id: "pricing-risk-1", level: "high", summary: "A 6% increase may increase EMEA churn in the first billing cycle." },
  ],
  policyFindings: [
    { id: "pricing-policy-1", policyName: "Regional pricing parity", outcome: "warning", summary: "Mid-tier gap between EMEA and NA widens beyond the recommended 15% band." },
  ],
  decisionPermissions: [
    { action: "approve", available: true },
    { action: "refine", available: true },
    { action: "reject", available: true },
    { action: "defer", available: true },
  ],
  overrideRequirement: { required: true, reason: "Pricing changes above 5% require an explicit override.", requiredRole: "pricing-lead" },
}

// ---------------------------------------------------------------------------
// 6. Failed / retryable
// ---------------------------------------------------------------------------

const item6Tasks: readonly AgentTask[] = [
  {
    taskId: "task-vendor-sync",
    title: "Sync vendor price list",
    status: "failed",
    missionId: "mission-vendor-sync",
    runId: "run-vendor-sync-1",
    producedBy: catalogActor,
    startedAt: "2026-08-19T06:00:00.000Z",
    completedAt: "2026-08-19T06:00:45.000Z",
  },
]

export const missionFailed: MissionCenterItem = {
  id: "failed-vendor-sync",
  mission: {
    id: "mission-vendor-sync",
    title: "Vendor price sync",
    description: "Pull the latest price list from the primary vendor feed and reconcile against the catalog.",
    status: "failed",
    riskLevel: "low",
    createdAt: "2026-08-19T05:58:00.000Z",
  },
  run: {
    id: "run-vendor-sync-1",
    missionId: "mission-vendor-sync",
    label: "Vendor sync — attempt 1",
    agent: catalogActor,
    status: "failed",
    cancellation: "none",
    retryability: { retryable: true },
    startedAt: "2026-08-19T06:00:00.000Z",
    completedAt: "2026-08-19T06:00:45.000Z",
  },
  workflow: [{ id: "phase-sync", label: "Sync", status: "failed", members: [{ id: "member-1", taskId: "task-vendor-sync" }] }],
  tasks: taskMap(item6Tasks),
  error: {
    id: "error-vendor-sync-1",
    message: "Vendor feed returned HTTP 503",
    causeSummary: "The vendor's price-list endpoint was temporarily unavailable.",
    retryability: { retryable: true },
    occurredAt: "2026-08-19T06:00:45.000Z",
    taskId: "task-vendor-sync",
  },
}

// ---------------------------------------------------------------------------
// 7. Completed (no outputs)
// ---------------------------------------------------------------------------

const item7Tasks: readonly AgentTask[] = [
  {
    taskId: "task-compliance-check",
    title: "Run weekly compliance checklist",
    status: "completed",
    missionId: "mission-compliance",
    runId: "run-compliance-1",
    producedBy: reconciliationActor,
    startedAt: "2026-08-18T22:00:00.000Z",
    completedAt: "2026-08-18T22:03:00.000Z",
  },
]

export const missionCompleted: MissionCenterItem = {
  id: "completed-compliance-report",
  mission: {
    id: "mission-compliance",
    title: "Weekly compliance report",
    description: "Run the standing weekly compliance checklist across all active regions.",
    status: "completed",
    riskLevel: "none",
    createdAt: "2026-08-18T21:55:00.000Z",
  },
  run: {
    id: "run-compliance-1",
    missionId: "mission-compliance",
    label: "Compliance run — week 33",
    agent: reconciliationActor,
    status: "completed",
    cancellation: "none",
    startedAt: "2026-08-18T22:00:00.000Z",
    completedAt: "2026-08-18T22:03:00.000Z",
  },
  workflow: [{ id: "phase-check", label: "Checklist", status: "completed", members: [{ id: "member-1", taskId: "task-compliance-check" }] }],
  tasks: taskMap(item7Tasks),
}

// ---------------------------------------------------------------------------
// 8. Completed with outputs
// ---------------------------------------------------------------------------

const item8Tasks: readonly AgentTask[] = [
  {
    taskId: "task-close-extract",
    title: "Extract ledger entries",
    status: "completed",
    missionId: "mission-quarterly-close-mc",
    runId: "run-quarterly-close-mc-1",
    producedBy: reconciliationActor,
    startedAt: "2026-08-18T20:00:00.000Z",
    completedAt: "2026-08-18T20:20:00.000Z",
    outputRefs: ["artifact-mc-ledger-export"],
  },
  {
    taskId: "task-close-report",
    title: "Produce close report",
    status: "completed",
    missionId: "mission-quarterly-close-mc",
    runId: "run-quarterly-close-mc-1",
    producedBy: reconciliationActor,
    startedAt: "2026-08-18T20:20:05.000Z",
    completedAt: "2026-08-18T20:41:30.000Z",
    outputRefs: ["artifact-mc-report"],
  },
]

export const missionCompletedWithOutputs: MissionCenterItem = {
  id: "completed-quarterly-close",
  mission: {
    id: "mission-quarterly-close-mc",
    title: "Quarterly close reconciliation",
    description: "Reconcile ledger entries and produce the quarterly close report.",
    status: "completed",
    riskLevel: "medium",
    createdAt: "2026-08-18T19:55:00.000Z",
  },
  run: {
    id: "run-quarterly-close-mc-1",
    missionId: "mission-quarterly-close-mc",
    label: "Close run — final",
    agent: reconciliationActor,
    status: "completed",
    cancellation: "none",
    startedAt: "2026-08-18T20:00:00.000Z",
    completedAt: "2026-08-18T20:41:30.000Z",
  },
  workflow: [
    { id: "phase-extract", label: "Extraction", status: "completed", members: [{ id: "member-1", taskId: "task-close-extract" }] },
    { id: "phase-report", label: "Reporting", status: "completed", members: [{ id: "member-2", taskId: "task-close-report" }] },
  ],
  tasks: taskMap(item8Tasks),
  outputs: [
    {
      id: "output-mc-report",
      artifact: { id: "artifact-mc-report", name: "Quarterly close report — Q2 2026", artifactType: "document", status: "completed", url: "https://example.com/reports/q2-2026" },
      taskId: "task-close-report",
      producedAt: "2026-08-18T20:41:28.000Z",
    },
    {
      id: "output-mc-ledger",
      artifact: { id: "artifact-mc-ledger-export", name: "Reconciled ledger export.csv", artifactType: "file", status: "completed", url: "https://example.com/exports/ledger-q2-2026.csv" },
      taskId: "task-close-extract",
      producedAt: "2026-08-18T20:20:00.000Z",
    },
  ],
}

export const missionCenterItems: readonly MissionCenterItem[] = [
  missionNeedsProposal,
  missionNeedsPermission,
  missionNeedsClarification,
  missionRunning,
  missionQueued,
  missionFailed,
  missionCompletedWithOutputs,
  missionCompleted,
]
