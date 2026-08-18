/**
 * neoarc-agentic-contracts / foundation
 *
 * Slice 1 normalized public models. These are the smallest reusable building
 * blocks that every later slice's contracts compose on top of.
 *
 * These types describe view models that a product adapter produces from a
 * backend DTO. They are never the DTO itself — see
 * docs/INTEGRATION_GUIDE.md.
 */

import type { ISOTimestamp, OpaqueId, UnavailableReason } from "./shared"

/** Kind of actor a normalized identity refers to. */
export type ActorKind = "human" | "agent" | "system" | "service"

/**
 * Normalized identity of any actor referenced in the UI — a human, an agent,
 * a system process, or a service account.
 */
export interface ActorSummary {
  readonly id: OpaqueId
  readonly kind: ActorKind
  readonly displayName: string
  readonly secondaryLabel?: string
  readonly avatarUrl?: string
  /** Short initials/fallback glyph when no avatar is available. */
  readonly initials?: string
}

/** Lifecycle status of an agent as observed by the product, not inferred. */
export type AgentLifecycleStatus =
  | "idle"
  | "active"
  | "waiting_for_human"
  | "degraded"
  | "unavailable"

/**
 * Normalized summary of an agent identity, distinct from a generic actor
 * because agents carry capability and lifecycle information humans do not.
 */
export interface AgentSummary {
  readonly id: OpaqueId
  readonly displayName: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly initials?: string
  readonly lifecycleStatus: AgentLifecycleStatus
  readonly capabilities?: readonly string[]
  readonly version?: string
}

/**
 * A normalized, opaque reference to "where" in a product a piece of UI is
 * scoped — a workspace, project, section, or similar. The kit never
 * interprets this beyond display; the product adapter supplies display
 * labels.
 */
export interface ContextRef {
  readonly id: OpaqueId
  readonly kind: string
  readonly label: string
  readonly parent?: ContextRef
}

/**
 * A named, boolean-valued permission set. The kit treats this as opaque
 * flags supplied by the product/backend — it is not security-authoritative
 * and never grants or checks permissions itself.
 */
export interface PermissionSet {
  readonly [permissionKey: string]: boolean
}

/** Why a specific action is unavailable, when it is unavailable. */
export type ActionUnavailableReason =
  | "permission_denied"
  | "not_supported"
  | "requires_human_review"
  | "runtime_unavailable"
  | UnavailableReason

/**
 * Whether a given user-facing action can currently be taken, and if not,
 * why — supplied by the product adapter, never inferred by the component.
 */
export interface ActionAvailability {
  readonly actionId: string
  readonly available: boolean
  readonly reason?: ActionUnavailableReason
  readonly label?: string
}

/**
 * Coarse-grained runtime status used across agents, runs, and tasks.
 *
 * Vocabulary is aligned with the normalized runtime event model (e.g.
 * `run.completed`, `task.completed`) so this shared contract does not drift
 * from the events later slices emit. Later slices may introduce a richer
 * `RunStatus` vocabulary for run-specific detail; this stays the coarse,
 * shared status every family (agents, runs, tasks) can render generically.
 */
export type RuntimeStatus =
  | "idle"
  | "queued"
  | "running"
  | "waiting_for_human"
  | "completed"
  | "failed"
  | "cancelled"
  | "retrying"

/** Supplied risk classification. The kit never computes this itself. */
export type RiskLevel = "none" | "low" | "medium" | "high" | "critical"

/**
 * Supplied trace visibility role. Mirrors the roles named in
 * docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md. The UI is not
 * security-authoritative — this value only affects what the UI renders,
 * never what the backend actually permits.
 */
export type TraceAccessLevel = "USER" | "OPERATOR" | "DEVELOPER" | "PLATFORM_ADMIN"

/**
 * Explicit state of a field that a backend/product adapter has withheld or
 * could not supply. `RedactedValue` and `TraceRedactedValue` (Slice 5) render
 * this instead of showing or fabricating a value.
 */
export interface RedactionState {
  readonly redacted: boolean
  readonly reason?: UnavailableReason
  /** Optional human-readable explanation supplied by the product adapter. */
  readonly note?: string
}

/** Re-exported for convenience so consumers can import timestamps from one place. */
export type { ISOTimestamp, OpaqueId }
