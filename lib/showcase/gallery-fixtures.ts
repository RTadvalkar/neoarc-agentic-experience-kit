/**
 * lib/showcase/gallery-fixtures
 *
 * SHOWCASE-ONLY fixture data for the Foundation Component Gallery
 * (components/showcase/execution-lab/component-gallery). Not part of any
 * `src/neoarc-agentic-*` reusable package — mock data must live outside
 * reusable components per docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md.
 *
 * This is separate from lib/showcase/fixtures.ts (event-driven scenarios for
 * the Execution/Chat/Activity/Trace/Provenance tabs). Gallery fixtures exist
 * purely to exercise every foundation component's props/states directly,
 * without going through the projection pipeline.
 */

import type {
  ActionAvailability,
  AgentLifecycleStatus,
  AgentSummary,
  ContextRef,
  RedactionState,
  RiskLevel,
  RuntimeStatus,
  TraceAccessLevel,
} from "../../src/neoarc-agentic-contracts/foundation"
import type { MetadataListItem } from "../../src/neoarc-agentic-ui/foundation/metadata-list"

export const galleryAgent: AgentSummary = {
  id: "agent-gallery-ava",
  displayName: "Ava",
  description: "Architecture agent",
  lifecycleStatus: "active",
  capabilities: ["code-review", "dependency-graph", "risk-assessment"],
  version: "1.4.0",
}

export const galleryHumanActorName = "Priya Shah"

export const galleryWorkspaceContext: ContextRef = {
  id: "gallery-ctx-workspace",
  kind: "workspace",
  label: "Acme Platform",
}

export const galleryProjectContext: ContextRef = {
  id: "gallery-ctx-project",
  kind: "project",
  label: "Checkout Redesign",
  parent: galleryWorkspaceContext,
}

export const gallerySectionContext: ContextRef = {
  id: "gallery-ctx-section",
  kind: "section",
  label: "Payments",
  parent: galleryProjectContext,
}

/** All entities `EntitySwitcher` can switch between, root-first. */
export const galleryEntities: readonly ContextRef[] = [
  galleryWorkspaceContext,
  galleryProjectContext,
  gallerySectionContext,
  { id: "gallery-ctx-section-2", kind: "section", label: "Fulfillment", parent: galleryProjectContext },
]

export const galleryAgentLifecycleStatuses: readonly AgentLifecycleStatus[] = [
  "idle",
  "active",
  "waiting_for_human",
  "degraded",
  "unavailable",
]

export const galleryRuntimeStatuses: readonly RuntimeStatus[] = [
  "idle",
  "queued",
  "running",
  "waiting_for_human",
  "completed",
  "failed",
  "cancelled",
  "retrying",
]

export const galleryRiskLevels: readonly RiskLevel[] = ["none", "low", "medium", "high", "critical"]

export const galleryTraceAccessLevels: readonly TraceAccessLevel[] = [
  "USER",
  "OPERATOR",
  "DEVELOPER",
  "PLATFORM_ADMIN",
]

export const galleryCapabilities: readonly string[] = ["code-review", "web-search", "risk-assessment"]

export const galleryMetadataItems: readonly MetadataListItem[] = [
  { key: "run-id", label: "Run ID", value: "run-4f2a" },
  { key: "model", label: "Model policy", value: "policy-v3" },
  { key: "started-at", label: "Started at", value: "2026-08-18T09:05:00.000Z" },
  { key: "retries", label: "Retries", value: "0" },
]

/** One representative `RedactionState` per `UnavailableReason`, plus a visible value. */
export const galleryRedactionStates: readonly { readonly label: string; readonly state: RedactionState }[] = [
  { label: "Visible", state: { redacted: false } },
  { label: "Not supplied", state: { redacted: true, reason: "not_supplied" } },
  { label: "Not available", state: { redacted: true, reason: "not_available" } },
  { label: "Redacted", state: { redacted: true, reason: "redacted", note: "Contains customer PII" } },
  { label: "Insufficient access", state: { redacted: true, reason: "insufficient_access" } },
]

/** One representative `ActionAvailability` per `ActionUnavailableReason`. */
export const galleryActionAvailabilities: readonly ActionAvailability[] = [
  {
    actionId: "approve-proposal",
    available: false,
    reason: "permission_denied",
    label: "Approve proposal",
  },
  {
    actionId: "rerun-task",
    available: false,
    reason: "requires_human_review",
    label: "Re-run task",
  },
  {
    actionId: "export-trace",
    available: false,
    reason: "runtime_unavailable",
    label: "Export trace",
  },
]

/** Fixed instants so relative-time rendering is deterministic in the gallery. */
export const galleryTimestampNow = Date.parse("2026-08-18T09:10:41.000Z")
export const galleryTimestampRecent = "2026-08-18T09:10:36.000Z"
export const galleryTimestampOlder = "2026-08-18T07:42:00.000Z"
export const galleryTimestampInvalid = "not-a-real-timestamp"
