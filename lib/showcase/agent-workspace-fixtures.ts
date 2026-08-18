/**
 * lib/showcase/agent-workspace-fixtures
 *
 * SHOWCASE-ONLY. Narrative fixtures for the Agent Workspace reference
 * experience (`app/agent-workspace`), themed consistently with the
 * existing "Architecture agent run" trace scenario
 * (`lib/showcase/trace-fixtures.ts`'s `architectureAgentRunScenario`) so
 * the workspace's Chat/Activity/Trace/Provenance tabs and its pending-
 * human-work panels tell one coherent story. These are normalized
 * instances of the already-existing `ClarificationRequest` /
 * `ExecutionPermissionRequest` / `ProposalSummary` contracts — never a new
 * shape — mirroring the same tool/decision the trace scenario's
 * `permission.requested`/`proposal.review.requested` events describe, just
 * with the fuller detail those two components need that the trace payload
 * intentionally keeps shallow (`PendingInteraction`).
 *
 * Mock data only; never imported by `src/neoarc-agentic-ui` or
 * `src/neoarc-agentic-projection`.
 */

import type { ClarificationRequest } from "../../src/neoarc-agentic-contracts/conversation"
import type { ExecutionPermissionRequestPending } from "../../src/neoarc-agentic-contracts/human-interaction"
import type { ProposalSummary } from "../../src/neoarc-agentic-contracts/proposal"

/**
 * Ordered journey stages for the workspace's progress rail, keyed by the
 * 1-based replay position (`currentIndex`) at which the
 * `architectureAgentRunScenario` fixture first reaches that beat — derived
 * directly from that scenario's own event order, not invented separately.
 */
export interface WorkspaceJourneyStage {
  readonly id: string
  readonly label: string
  readonly threshold: number
}

export const workspaceJourneyStages: readonly WorkspaceJourneyStage[] = [
  { id: "started", label: "Session started", threshold: 1 },
  { id: "request", label: "User request received", threshold: 9 },
  { id: "context", label: "Context established", threshold: 12 },
  { id: "clarification", label: "Clarification", threshold: 14 },
  { id: "knowledge", label: "Knowledge & relationships", threshold: 17 },
  { id: "permission", label: "Execution permission", threshold: 25 },
  { id: "retry", label: "Tool retry", threshold: 28 },
  { id: "proposal", label: "Proposal review", threshold: 34 },
  { id: "artifacts", label: "Artifacts produced", threshold: 36 },
  { id: "completed", label: "Completed", threshold: 44 },
]

/** Index (0-based) of the furthest journey stage reached by `currentIndex` visible events. */
export function deriveWorkspaceStageIndex(currentIndex: number): number {
  let reached = -1
  workspaceJourneyStages.forEach((stage, index) => {
    if (currentIndex >= stage.threshold) reached = index
  })
  return reached
}

export const workspaceClarification: ClarificationRequest = {
  id: "workspace-clarification-1",
  question: "Should the new order-events topic be shared with the existing order-service topic, or dedicated?",
  options: ["Use the existing order-service topic", "Provision a dedicated order-events topic"],
  resolved: false,
}

export const workspaceExecutionPermission: ExecutionPermissionRequestPending = {
  id: "workspace-permission-1",
  status: "pending",
  action: {
    toolName: "provision-sandbox-environment",
    actionSummary: "Provision an ephemeral sandbox to trial the async order-events topic",
    targetLabel: "order-events-sandbox",
  },
  riskLevel: "medium",
  consequenceSummary:
    "Creates billable sandbox infrastructure until it is torn down. No production traffic is affected.",
  requestedAt: "2026-08-18T09:08:00.000Z",
}

export const workspaceProposal: ProposalSummary = {
  id: "workspace-proposal-1",
  title: "Introduce an async order-events service",
  status: "ready_for_review",
  revision: { revision: 1, createdAt: "2026-08-18T09:14:00.000Z" },
  summary:
    "Adopts a dedicated async order-events topic to decouple the order and payments services, based on the coupling analysis and dependency graph reviewed this run.",
  sections: [
    {
      id: "workspace-section-adr",
      title: "Architecture Decision Record",
      changes: [
        {
          id: "workspace-change-1",
          summary: "Adopt a dedicated async order-events topic",
          path: "docs/adr/0007-async-order-events.md",
          before: "(no ADR on file)",
          after:
            "ADR-0007: Introduce an async order-events service using a dedicated Kafka topic, replacing the synchronous order -> payments call.",
        },
      ],
    },
  ],
  evidence: [
    { id: "workspace-evidence-1", label: "Order/payments coupling analysis", sourceLabel: "Knowledge base" },
    { id: "workspace-evidence-2", label: "Payments service dependency graph", sourceLabel: "Relationship graph" },
  ],
  riskFindings: [
    {
      id: "workspace-risk-1",
      level: "medium",
      summary: "Introduces an additional async dependency the on-call team will need to monitor.",
    },
  ],
  decisionPermissions: [
    { action: "approve", available: true },
    { action: "refine", available: true },
    { action: "reject", available: true },
    { action: "defer", available: true },
  ],
}
