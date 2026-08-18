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
 *   2. `ExecutionPermissionCard`'s four states are mutually exclusive and
 *      `unavailable` is never conflated with a resolved outcome.
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

test("resolveExecutionPermissionCardMode: pending and submitted both map to 'pending'", () => {
  assert.equal(resolveExecutionPermissionCardMode({ status: "pending" }), "pending")
  assert.equal(resolveExecutionPermissionCardMode({ status: "submitted" }), "pending")
})

test("resolveExecutionPermissionCardMode: resolved + unavailable maps to 'blocked', never 'resolved'", () => {
  assert.equal(resolveExecutionPermissionCardMode({ status: "resolved", outcome: "unavailable" }), "blocked")
})

test("resolveExecutionPermissionCardMode: resolved + any other outcome maps to 'resolved'", () => {
  assert.equal(resolveExecutionPermissionCardMode({ status: "resolved", outcome: "allowed_once" }), "resolved")
  assert.equal(resolveExecutionPermissionCardMode({ status: "resolved", outcome: "rejected" }), "resolved")
  assert.equal(resolveExecutionPermissionCardMode({ status: "resolved", outcome: "cancelled" }), "resolved")
})

test("resolveExecutionPermissionCardMode: the four modes are mutually exclusive across every status/outcome combination", () => {
  const statuses = ["pending", "submitted", "resolved", "cancelled"] as const
  const outcomes = [undefined, "allowed_once", "rejected", "cancelled", "unavailable"] as const
  for (const status of statuses) {
    for (const outcome of outcomes) {
      const mode = resolveExecutionPermissionCardMode({ status, outcome })
      if (status !== "resolved") {
        assert.equal(mode, "pending", `expected 'pending' for status=${status} outcome=${outcome}`)
      } else if (outcome === "unavailable") {
        assert.equal(mode, "blocked", `expected 'blocked' for status=${status} outcome=${outcome}`)
      } else {
        assert.equal(mode, "resolved", `expected 'resolved' for status=${status} outcome=${outcome}`)
      }
    }
  }
})
