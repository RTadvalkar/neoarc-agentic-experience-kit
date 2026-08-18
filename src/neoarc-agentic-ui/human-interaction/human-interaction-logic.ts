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
 * 2. `resolveExecutionPermissionCardMode` — every `ExecutionPermissionRequest`
 *    maps to exactly one of four mutually exclusive render modes (`pending`,
 *    `submitted`, `resolved`, `blocked`), and `unavailable` is never treated
 *    as a resolved success/failure outcome (see
 *    docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md §Two separate
 *    approval domains). The `ExecutionPermissionRequest` discriminated union
 *    already makes "resolved without an outcome" unrepresentable at the
 *    type level; this function only has to distinguish `unavailable` from
 *    every other resolved outcome.
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

export type ExecutionPermissionCardMode = "pending" | "submitted" | "resolved" | "blocked"

/**
 * Maps one `ExecutionPermissionRequest` to exactly one of four mutually
 * exclusive render modes:
 * - `"pending"` — `status === "pending"`. Action buttons render, enabled.
 * - `"submitted"` — `status === "submitted"`. Action buttons render,
 *   disabled, with an explicit "awaiting confirmation" indicator.
 * - `"resolved"` — `status === "resolved"` with any outcome other than
 *   `unavailable`. Rendered via `PermissionOutcomeBadge`; no action buttons.
 * - `"blocked"` — `status === "resolved"` and `outcome === "unavailable"`.
 *   Rendered via `PermissionBlockedState`, never `PermissionOutcomeBadge`.
 *
 * The switch is exhaustive over `ExecutionPermissionRequest["status"]`, so
 * a future status value added to the union will fail to compile here
 * rather than silently falling through to the wrong mode.
 */
export function resolveExecutionPermissionCardMode(
  request: ExecutionPermissionRequest,
): ExecutionPermissionCardMode {
  switch (request.status) {
    case "pending":
      return "pending"
    case "submitted":
      return "submitted"
    case "resolved":
      return request.outcome === "unavailable" ? "blocked" : "resolved"
  }
}
