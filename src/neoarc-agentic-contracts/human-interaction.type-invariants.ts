/**
 * neoarc-agentic-contracts / human-interaction.type-invariants
 *
 * COMPILE-TIME ONLY. Not a runtime test — nothing here executes any
 * assertion. Its only job is to make specific illegal
 * `ExecutionPermissionRequest` shapes fail `tsc --noEmit`, so a future edit
 * that widens the union back to something unsound is caught by typecheck
 * rather than discovered later at runtime. See Gate 3 review notes:
 * "Fix ExecutionPermissionRequest so invalid lifecycle/outcome
 * combinations are unrepresentable."
 *
 * If any `@ts-expect-error` below stops being a real error, the
 * discriminated union in `human-interaction.ts` has regressed.
 */

import type { ExecutionPermissionRequest } from "./human-interaction"

const action = { toolName: "send-email", actionSummary: "Send a confirmation email" } as const
const requestedAt = "2026-08-18T09:00:00.000Z" as const

// Legal: pending, no outcome field present.
export const legalPending: ExecutionPermissionRequest = {
  id: "invariant-pending",
  action,
  requestedAt,
  status: "pending",
}

// Legal: submitted, no outcome field present.
export const legalSubmitted: ExecutionPermissionRequest = {
  id: "invariant-submitted",
  action,
  requestedAt,
  status: "submitted",
}

// Legal: resolved with a required outcome.
export const legalResolved: ExecutionPermissionRequest = {
  id: "invariant-resolved",
  action,
  requestedAt,
  status: "resolved",
  outcome: "allowed_once",
}

// Legal: execution-permission cancellation is `resolved` + `outcome:
// "cancelled"`, never a standalone actionable lifecycle status.
export const legalCancelledOutcome: ExecutionPermissionRequest = {
  id: "invariant-cancelled-outcome",
  action,
  requestedAt,
  status: "resolved",
  outcome: "cancelled",
}

// Illegal: `status: "resolved"` with no `outcome` must not typecheck.
// @ts-expect-error resolved requires an outcome
export const illegalResolvedWithoutOutcome: ExecutionPermissionRequest = {
  id: "invariant-resolved-without-outcome",
  action,
  requestedAt,
  status: "resolved",
}

// Illegal: "cancelled" is not a valid `status` for an execution-permission
// request — only `pending` | `submitted` | `resolved` are. Cancellation is
// an `outcome`, never a lifecycle status.
export const illegalCancelledAsStatus: ExecutionPermissionRequest = {
  id: "invariant-cancelled-as-status",
  action,
  requestedAt,
  // @ts-expect-error "cancelled" is not an ExecutionPermissionRequest status
  status: "cancelled",
}

// Illegal: `pending` must not carry an `outcome` — it is not part of that
// branch of the union.
export const illegalPendingWithOutcome: ExecutionPermissionRequest = {
  id: "invariant-pending-with-outcome",
  action,
  requestedAt,
  status: "pending",
  // @ts-expect-error pending must not carry an outcome
  outcome: "allowed_once",
}
