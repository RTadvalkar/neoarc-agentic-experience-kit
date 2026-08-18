/**
 * neoarc-agentic-ui / human-interaction / human-interaction-logic.test
 *
 * Tests the two semantic boundaries `human-interaction-logic.ts` exists to
 * enforce (docs/05_HUMAN_INTERACTION_AND_PROPOSALS.prompt.md, and
 * docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md §Two separate
 * approval domains):
 *
 *   1. `DecisionBar` renders decision actions exactly as supplied, except
 *      it never fabricates an `override` control unless the caller has
 *      actually wired a handler for it.
 *   2. `ExecutionPermissionCard`'s four render modes (`pending`,
 *      `submitted`, `resolved`, `blocked`) are mutually exclusive and
 *      `unavailable` is never conflated with a resolved outcome. Each test
 *      below constructs a literal, legal `ExecutionPermissionRequest` — the
 *      compile-time guarantee that "resolved" always carries an `outcome`
 *      and that `status: "cancelled"` cannot exist is asserted separately
 *      in `human-interaction.type-invariants.ts` (`tsc --noEmit` only, not
 *      a runtime test).
 *
 * Run with: node --test src/neoarc-agentic-ui/human-interaction/human-interaction-logic.test.mts
 */

import { test } from "node:test"
import assert from "node:assert/strict"

import {
  resolveAvailableDecisionActions,
  resolveExecutionPermissionCardMode,
  resolveVisibleDecisionPermissions,
} from "./human-interaction-logic.ts"
import type { DecisionPermission } from "../../neoarc-agentic-contracts/proposal.ts"
import type {
  ExecutionPermissionOutcome,
  ExecutionPermissionRequest,
} from "../../neoarc-agentic-contracts/human-interaction.ts"

test("resolveVisibleDecisionPermissions passes non-override actions through unchanged", () => {
  const permissions: readonly DecisionPermission[] = [
    { action: "approve", available: true },
    { action: "reject", available: true },
    { action: "defer", available: false, reason: "Waiting on evidence" },
  ]
  assert.deepEqual(resolveVisibleDecisionPermissions(permissions, false), permissions)
  assert.deepEqual(resolveVisibleDecisionPermissions(permissions, true), permissions)
})

test("resolveVisibleDecisionPermissions drops override when no handler is wired", () => {
  const permissions: readonly DecisionPermission[] = [
    { action: "approve", available: true },
    { action: "override", available: true },
  ]
  const withoutHandler = resolveVisibleDecisionPermissions(permissions, false)
  assert.deepEqual(withoutHandler.map((p) => p.action), ["approve"])
})

test("resolveVisibleDecisionPermissions keeps override when a handler is wired", () => {
  const permissions: readonly DecisionPermission[] = [
    { action: "approve", available: true },
    { action: "override", available: true },
  ]
  const withHandler = resolveVisibleDecisionPermissions(permissions, true)
  assert.deepEqual(withHandler.map((p) => p.action), ["approve", "override"])
})

test("resolveAvailableDecisionActions excludes unavailable actions and unwired override", () => {
  const permissions: readonly DecisionPermission[] = [
    { action: "approve", available: false, reason: "Unresolved conflicts" },
    { action: "reject", available: true },
    { action: "override", available: true },
  ]
  assert.deepEqual(resolveAvailableDecisionActions(permissions, false), ["reject"])
  assert.deepEqual(resolveAvailableDecisionActions(permissions, true), ["reject", "override"])
})

// A minimal fixture for each of the three lifecycle states. Only the fields
// `resolveExecutionPermissionCardMode` actually inspects are populated —
// this is the literal, legal `ExecutionPermissionRequest` shape a caller
// would construct, not a partial `{ status, outcome }` bag. That shape is
// deliberately unconstructable for "resolved" without an `outcome`, and
// `status: "cancelled"` is not a member of the union at all — both are
// enforced by the compiler, not by this test (see
// `human-interaction.type-invariants.ts`).
const baseAction = { toolName: "send-email", actionSummary: "Send a confirmation email" }
const requestedAt = "2026-08-18T09:00:00.000Z"

test("resolveExecutionPermissionCardMode: 'pending' status maps to the 'pending' mode", () => {
  const request: ExecutionPermissionRequest = {
    id: "req-pending",
    action: baseAction,
    requestedAt,
    status: "pending",
  }
  assert.equal(resolveExecutionPermissionCardMode(request), "pending")
})

test("resolveExecutionPermissionCardMode: 'submitted' status maps to its own distinct 'submitted' mode, not 'pending'", () => {
  const request: ExecutionPermissionRequest = {
    id: "req-submitted",
    action: baseAction,
    requestedAt,
    status: "submitted",
  }
  assert.equal(resolveExecutionPermissionCardMode(request), "submitted")
})

test("resolveExecutionPermissionCardMode: resolved + a non-unavailable outcome maps to 'resolved'", () => {
  const outcomes: readonly ExecutionPermissionOutcome[] = ["allowed_once", "rejected", "cancelled"]
  for (const outcome of outcomes) {
    const request: ExecutionPermissionRequest = {
      id: `req-resolved-${outcome}`,
      action: baseAction,
      requestedAt,
      status: "resolved",
      outcome,
    }
    assert.equal(resolveExecutionPermissionCardMode(request), "resolved", `expected 'resolved' for outcome=${outcome}`)
  }
})

test("resolveExecutionPermissionCardMode: resolved + 'unavailable' maps to 'blocked', never 'resolved'", () => {
  const request: ExecutionPermissionRequest = {
    id: "req-blocked",
    action: baseAction,
    requestedAt,
    status: "resolved",
    outcome: "unavailable",
    unavailableReason: "The tool is temporarily disabled.",
  }
  assert.equal(resolveExecutionPermissionCardMode(request), "blocked")
})
