/**
 * lib/showcase/proposal-review-fixtures
 *
 * SHOWCASE-ONLY. Static view-model fixtures for the Proposal Review
 * Workspace reference experience (`app/proposal-review`) — a dedicated
 * business/governance decision surface, not a chat-shaped review card.
 * The primary ("hero") proposal is deliberately rich: unresolved
 * conflicts, mixed policy findings, an override requirement, and one
 * already-recorded prior decision, so every decision-semantics affordance
 * (`DecisionBar`, `ConflictResolutionPanel`, `HumanOverrideDialog`,
 * `DecisionHistory`) has something real to render. Two lighter related
 * proposals demonstrate the calmer `ready_for_review` and already-`approved`
 * states in the sidebar.
 *
 * Trace/Provenance/Evidence fixtures here are hand-authored, direct view
 * models (`TraceEvent[]`, `ProvenanceLineage`, `EvidenceLineageEntry[]`) —
 * not projected from an event stream — since `TraceExplorer`/
 * `ProvenanceExplorer`/`ProvenanceEvidenceEntry` are all designed to accept
 * either path. Mock data only; never imported by `src/neoarc-agentic-ui`
 * or `src/neoarc-agentic-projection`.
 */

import type { ActorSummary } from "../../src/neoarc-agentic-contracts/foundation"
import type { ProposalSummary } from "../../src/neoarc-agentic-contracts/proposal"
import type { TraceEvent } from "../../src/neoarc-agentic-contracts/trace"
import type { EvidenceLineageEntry, ProvenanceLineage } from "../../src/neoarc-agentic-contracts/provenance"

const governanceAgent: ActorSummary = { id: "agent-governance", kind: "agent", displayName: "Data governance reviewer" }
const securityLead: ActorSummary = { id: "user-morgan", kind: "human", displayName: "Morgan Lee" }
const platformLead: ActorSummary = { id: "user-priya", kind: "human", displayName: "Priya Nair" }

// ---------------------------------------------------------------------------
// Hero proposal
// ---------------------------------------------------------------------------

export const heroProposal: ProposalSummary = {
  id: "proposal-pii-encryption",
  title: "Migrate customer PII fields to encrypted-at-rest storage",
  status: "conflicted",
  revision: { revision: 2, createdAt: "2026-08-17T14:00:00.000Z", summary: "Revised scope to exclude the archived-accounts table after the first defer." },
  summary:
    "Encrypts the five customer PII columns identified in the Q2 data classification sweep, and adds a rotation policy for the new column-level keys.",
  sections: [
    {
      id: "section-schema",
      title: "Schema changes",
      changes: [
        {
          id: "change-schema-1",
          summary: "Encrypt customers.email and customers.phone at rest",
          path: "migrations/0042_encrypt_customer_contact.sql",
          before: "email varchar(255),\nphone varchar(32),",
          after: "email varchar(255) ENCRYPTED,\nphone varchar(32) ENCRYPTED,",
        },
        {
          id: "change-schema-2",
          summary: "Add column-level key rotation metadata table",
          path: "migrations/0043_add_key_rotation_metadata.sql",
          before: "(no rotation metadata table on file)",
          after: "CREATE TABLE key_rotation_metadata (\n  column_ref text PRIMARY KEY,\n  rotated_at timestamptz NOT NULL\n);",
        },
      ],
    },
    {
      id: "section-access",
      title: "Access policy changes",
      changes: [
        {
          id: "change-access-1",
          summary: "Restrict direct column access to the customer-support and billing roles",
          path: "policies/pii-column-access.yaml",
          before: "roles: [customer-support, billing, analytics]",
          after: "roles: [customer-support, billing]",
        },
      ],
    },
  ],
  evidence: [
    { id: "evidence-classification", label: "Q2 PII data classification sweep", sourceLabel: "Data governance knowledge base", url: "https://example.com/kb/pii-classification-q2" },
    { id: "evidence-requirements", label: "Encryption-at-rest requirements (SEC-114)", sourceLabel: "Security policy repository", url: "https://example.com/policies/sec-114" },
    { id: "evidence-analytics-usage", label: "Analytics role column access audit", sourceLabel: "Access audit log" },
  ],
  riskFindings: [
    { id: "risk-migration-window", level: "medium", summary: "The migration requires a maintenance window; billing lookups will degrade for up to 4 minutes." },
    { id: "risk-analytics-access", level: "high", summary: "Removing analytics role access may break two existing dashboards that read customers.email directly." },
  ],
  policyFindings: [
    { id: "policy-encryption", policyName: "Encryption-at-rest (SEC-114)", outcome: "pass", summary: "Proposed column encryption satisfies SEC-114's key-rotation cadence requirement." },
    { id: "policy-access-parity", policyName: "Least-privilege column access", outcome: "warning", summary: "Two dashboards still reference the analytics role's prior access; confirm they are migrated before this lands." },
  ],
  conflicts: [
    {
      id: "conflict-pr-482",
      summary: "This proposal's schema change touches the same customers table PR-482 already modified.",
      conflictingWith: "PR-482: Add audit logging trigger to customers table",
      resolved: false,
    },
  ],
  decisionPermissions: [
    { action: "approve", available: false, reason: "Unresolved conflicts must be resolved before this proposal can be approved." },
    { action: "refine", available: true },
    { action: "reject", available: true },
    { action: "defer", available: true },
  ],
  overrideRequirement: {
    required: true,
    reason: "Changes to encryption of PII columns above medium risk require an explicit security-lead override.",
    requiredRole: "security-lead",
  },
  decisionHistory: [
    {
      id: "decision-defer-1",
      action: "defer",
      decidedBy: platformLead,
      decidedAt: "2026-08-15T16:30:00.000Z",
      note: "Deferred pending confirmation that the archived-accounts table could be excluded from this pass.",
    },
  ],
  correlation: { missionId: "mission-pii-encryption", proposalId: "proposal-pii-encryption" },
}

/** Decision-permission state once the sole conflict above is marked resolved — the kit never computes this itself, so the calling page must supply the update alongside the resolved conflict. */
export const heroProposalDecisionPermissionsAfterConflictResolved: ProposalSummary["decisionPermissions"] = [
  { action: "approve", available: true },
  { action: "refine", available: true },
  { action: "reject", available: true },
  { action: "defer", available: true },
]

// ---------------------------------------------------------------------------
// Related proposals (sidebar)
// ---------------------------------------------------------------------------

export const relatedProposalReadyForReview: ProposalSummary = {
  id: "proposal-analytics-replica",
  title: "Add a read-replica for the analytics workload",
  status: "ready_for_review",
  revision: { revision: 1, createdAt: "2026-08-18T09:00:00.000Z" },
  summary: "Offloads the analytics dashboard queries onto a dedicated read-replica to reduce primary database load.",
  sections: [
    {
      id: "section-infra",
      title: "Infrastructure",
      changes: [{ id: "change-replica-1", summary: "Provision a read-replica in the primary region", path: "infra/db/replicas.tf" }],
    },
  ],
  evidence: [{ id: "evidence-load", label: "Primary DB load report — last 30 days", sourceLabel: "Observability dashboard" }],
  riskFindings: [{ id: "risk-replica-lag", level: "low", summary: "Replica lag may briefly show stale dashboard data during peak load." }],
  decisionPermissions: [
    { action: "approve", available: true },
    { action: "refine", available: true },
    { action: "reject", available: true },
    { action: "defer", available: true },
  ],
}

export const relatedProposalApproved: ProposalSummary = {
  id: "proposal-credential-rotation",
  title: "Rotate service-account credentials on a quarterly cadence",
  status: "approved",
  revision: { revision: 1, createdAt: "2026-08-10T10:00:00.000Z" },
  summary: "Establishes an automated quarterly rotation for the seven long-lived service-account credentials flagged in the last audit.",
  sections: [
    {
      id: "section-rotation",
      title: "Rotation policy",
      changes: [{ id: "change-rotation-1", summary: "Add quarterly rotation schedule for service-account credentials", path: "policies/credential-rotation.yaml" }],
    },
  ],
  decisionPermissions: [
    { action: "approve", available: false, reason: "Already approved." },
    { action: "refine", available: false, reason: "Already approved." },
    { action: "reject", available: false, reason: "Already approved." },
    { action: "defer", available: false, reason: "Already approved." },
  ],
  decisionHistory: [
    {
      id: "decision-approve-1",
      action: "approve",
      decidedBy: securityLead,
      decidedAt: "2026-08-11T13:00:00.000Z",
      note: "Approved as scoped — rollout tracked separately in the infra board.",
    },
  ],
}

export const proposalReviewSidebarItems: readonly ProposalSummary[] = [heroProposal, relatedProposalReadyForReview, relatedProposalApproved]

// ---------------------------------------------------------------------------
// Trace (progressive disclosure — chronological execution facts)
// ---------------------------------------------------------------------------

export const heroProposalTraceEvents: readonly TraceEvent[] = [
  {
    id: "trace-pii-1",
    occurredAt: "2026-08-17T13:50:00.000Z",
    actor: governanceAgent,
    detail: { kind: "system-instruction", value: { label: "Data governance reviewer agent", version: "3.1.0" } },
  },
  {
    id: "trace-pii-2",
    occurredAt: "2026-08-17T13:50:05.000Z",
    actor: governanceAgent,
    detail: { kind: "context", value: { label: "Workspace", value: "Data Platform" } },
  },
  {
    id: "trace-pii-3",
    occurredAt: "2026-08-17T13:51:00.000Z",
    actor: governanceAgent,
    detail: { kind: "knowledge", value: { knowledgeId: "kb-pii-classification-q2", title: "Q2 PII data classification sweep", usageCategory: "retrieved" } },
  },
  {
    id: "trace-pii-4",
    occurredAt: "2026-08-17T13:51:20.000Z",
    actor: governanceAgent,
    detail: { kind: "knowledge", value: { knowledgeId: "kb-sec-114", title: "Encryption-at-rest requirements (SEC-114)", usageCategory: "selected" } },
  },
  {
    id: "trace-pii-5",
    occurredAt: "2026-08-17T13:52:00.000Z",
    actor: governanceAgent,
    detail: {
      kind: "relationship",
      value: {
        relationshipId: "rel-pii-fields-table",
        sourceEntity: "customers.email, customers.phone",
        predicate: "stored_in",
        targetEntity: "customers table",
        usageCategory: "impact",
      },
    },
  },
  {
    id: "trace-pii-6",
    occurredAt: "2026-08-17T13:53:10.000Z",
    actor: governanceAgent,
    detail: {
      kind: "tool",
      value: {
        action: { toolName: "policy-lint", actionSummary: "Run policy compliance check against the proposed schema change" },
        status: "completed",
        resultSummary: "1 warning: least-privilege column access — two dashboards still reference the analytics role.",
      },
    },
  },
  {
    id: "trace-pii-7",
    occurredAt: "2026-08-17T13:55:00.000Z",
    actor: governanceAgent,
    detail: { kind: "proposal", value: { proposalId: "proposal-pii-encryption", label: "Proposal created", action: "created" } },
  },
  {
    id: "trace-pii-8",
    occurredAt: "2026-08-17T13:58:00.000Z",
    actor: governanceAgent,
    detail: { kind: "proposal", value: { proposalId: "proposal-pii-encryption", label: "Conflict detected with PR-482", action: "conflict_detected" } },
  },
]

// ---------------------------------------------------------------------------
// Provenance (progressive disclosure — supplied lineage, edges only when supplied)
// ---------------------------------------------------------------------------

export const heroProposalLineage: ProvenanceLineage = {
  nodes: [
    { id: "node-intent", entityKind: "intent", label: "Reduce PII exposure risk", occurredAt: "2026-08-17T13:49:00.000Z" },
    { id: "node-mission", entityKind: "mission", label: "Data governance quarterly review", occurredAt: "2026-08-17T13:49:30.000Z" },
    { id: "node-task", entityKind: "task", label: "Classify and encrypt PII fields", occurredAt: "2026-08-17T13:50:00.000Z" },
    { id: "node-knowledge", entityKind: "knowledge", label: "Q2 PII data classification sweep", occurredAt: "2026-08-17T13:51:00.000Z" },
    { id: "node-relationship", entityKind: "relationship", label: "customers.email/phone -> stored_in -> customers table", occurredAt: "2026-08-17T13:52:00.000Z" },
    { id: "node-tool", entityKind: "tool", label: "policy-lint compliance check", occurredAt: "2026-08-17T13:53:10.000Z" },
    { id: "node-proposal", entityKind: "proposal", label: "Migrate customer PII fields to encrypted-at-rest storage", occurredAt: "2026-08-17T13:55:00.000Z" },
    { id: "node-artifact", entityKind: "artifact", label: "ADR-0012: PII column encryption plan", occurredAt: "2026-08-17T13:56:00.000Z" },
  ],
  edges: [
    { id: "edge-1", fromNodeId: "node-intent", toNodeId: "node-mission", relation: "scoped" },
    { id: "edge-2", fromNodeId: "node-mission", toNodeId: "node-task", relation: "assigned" },
    { id: "edge-3", fromNodeId: "node-task", toNodeId: "node-knowledge", relation: "used" },
    { id: "edge-4", fromNodeId: "node-task", toNodeId: "node-relationship", relation: "traversed" },
    { id: "edge-5", fromNodeId: "node-task", toNodeId: "node-tool", relation: "invoked" },
    { id: "edge-6", fromNodeId: "node-tool", toNodeId: "node-proposal", relation: "informed" },
    { id: "edge-7", fromNodeId: "node-knowledge", toNodeId: "node-proposal", relation: "informed" },
    { id: "edge-8", fromNodeId: "node-proposal", toNodeId: "node-artifact", relation: "produced" },
  ],
}

export const heroProposalEvidenceLineage: readonly EvidenceLineageEntry[] = [
  { evidence: { id: "evidence-classification", label: "Q2 PII data classification sweep", sourceLabel: "Data governance knowledge base", url: "https://example.com/kb/pii-classification-q2" }, usage: "retrieved" },
  { evidence: { id: "evidence-requirements", label: "Encryption-at-rest requirements (SEC-114)", sourceLabel: "Security policy repository", url: "https://example.com/policies/sec-114" }, usage: "selected" },
  { evidence: { id: "evidence-analytics-usage", label: "Analytics role column access audit", sourceLabel: "Access audit log" }, usage: "cited" },
]
