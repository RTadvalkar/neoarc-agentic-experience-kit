/**
 * neoarc-agentic-ui / human-interaction / human-interaction-logic
 *
 * Pure derivation logic shared by `DecisionBar` and `ExecutionPermissionCard`,
 * extracted out of JSX so the two central semantic boundaries this family
 * exists to enforce are independently testable:
 *
 * 1. `resolveVisibleDecisionPermissions` — a proposal's `DecisionAction`s
 *    are rendered exactly as the product supplies them in
 *    `decisionPermissions`, never as a hardcoded five-button row. The one
 *    exception is `override`, which `DecisionBar` never renders unless the
 *    caller has actually wired `onRequestOverride` — an override button
 *    that opens no dialog would be worse than not rendering one at all.
 *
 * 2. `resolveExecutionPermissionCardMode` — the same
 *    `ExecutionPermissionRequest.status`/`outcome` pair always maps to
 *    exactly one of four mutually exclusive render modes, and
 *    `unavailable` is never treated as a resolved success/failure outcome
 *    (see docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md §Two
 *    separate approval domains).
 *
 * No React, no JSX — importable from a plain `node --test` module.
 */

import type { DecisionAction, DecisionPermission } from "../../neoarc-agentic-contracts/proposal"
import type { ExecutionPermissionRequest } from "../../neoarc-agentic-contracts/human-interaction"

/**
 * Filters `decisionPermissions` down to what `DecisionBar` should render.
 * Every action passes through unchanged except `override`, which is
 * dropped unless `hasOverrideHandler` is true — `DecisionBar` must never
 * fabricate an override control the caller has not wired a dialog for.
 */
export function resolveVisibleDecisionPermissions(
  decisionPermissions: readonly DecisionPermission[],
  hasOverrideHandler: boolean,
): readonly DecisionPermission[] {
  return decisionPermissions.filter(
    (permission) => permission.action !== "override" || hasOverrideHandler,
  )
}

/** The set of `DecisionAction`s a `DecisionBar` would currently render as an enabled, clickable control. */
export function resolveAvailableDecisionActions(
  decisionPermissions: readonly DecisionPermission[],
  hasOverrideHandler: boolean,
): readonly DecisionAction[] {
  return resolveVisibleDecisionPermissions(decisionPermissions, hasOverrideHandler)
    .filter((permission) => permission.available)
    .map((permission) => permission.action)
}

export type ExecutionPermissionCardMode = "blocked" | "resolved" | "pending"

/**
 * Maps one `ExecutionPermissionRequest` to exactly one render mode:
 * - `"blocked"` — `status === "resolved"` and `outcome === "unavailable"`.
 *   Rendered via `PermissionBlockedState`, never `PermissionOutcomeBadge`.
 * - `"resolved"` — `status === "resolved"` with any other outcome.
 *   Rendered via `PermissionOutcomeBadge`; action buttons never appear.
 * - `"pending"` — anything else (`pending` or `submitted`). Action
 *   buttons render, disabled while `status === "submitted"`.
 */
export function resolveExecutionPermissionCardMode(
  request: Pick<ExecutionPermissionRequest, "status" | "outcome">,
): ExecutionPermissionCardMode {
  if (request.status !== "resolved") return "pending"
  return request.outcome === "unavailable" ? "blocked" : "resolved"
}
