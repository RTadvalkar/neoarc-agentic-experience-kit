/**
 * neoarc-agentic-ui / runtime / workflow-tree-logic.test
 *
 * Tests the central UX guarantee `workflow-tree-logic.ts` exists to
 * enforce: a running, queued, waiting-for-human, failed, retrying, or
 * cancelled `WorkflowGroup` must render expanded regardless of the
 * human's last manual collapse, and only `completed`/`idle` groups may
 * actually respect a manual toggle.
 *
 * Run with: node --test src/neoarc-agentic-ui/runtime/workflow-tree-logic.test.mts
 */

import { test } from "node:test"
import assert from "node:assert/strict"

import {
  isForceExpandedStatus,
  isGroupToggleable,
  resolveGroupExpanded,
} from "./workflow-tree-logic.ts"
import type { RuntimeStatus } from "../../neoarc-agentic-contracts/foundation.ts"

const forceExpandedStatuses: readonly RuntimeStatus[] = [
  "running",
  "queued",
  "waiting_for_human",
  "failed",
  "retrying",
  "cancelled",
]

const collapsibleStatuses: readonly RuntimeStatus[] = ["completed", "idle"]

test("isForceExpandedStatus is true for every critical/in-progress status", () => {
  for (const status of forceExpandedStatuses) {
    assert.equal(isForceExpandedStatus(status), true, `expected ${status} to be force-expanded`)
  }
})

test("isForceExpandedStatus is false only for completed/idle", () => {
  for (const status of collapsibleStatuses) {
    assert.equal(isForceExpandedStatus(status), false, `expected ${status} to be collapsible`)
  }
})

test("resolveGroupExpanded ignores a manual collapse for a running group", () => {
  assert.equal(resolveGroupExpanded("running", false), true)
})

test("resolveGroupExpanded ignores a manual collapse for a cancelled group", () => {
  assert.equal(resolveGroupExpanded("cancelled", false), true)
})

test("resolveGroupExpanded honors a manual collapse for a completed group", () => {
  assert.equal(resolveGroupExpanded("completed", false), false)
})

test("resolveGroupExpanded defaults to expanded for a completed group with no manual toggle yet", () => {
  assert.equal(resolveGroupExpanded("completed", undefined), true)
})

test("resolveGroupExpanded honors a manual re-expand for a completed group", () => {
  assert.equal(resolveGroupExpanded("completed", true), true)
})

test("isGroupToggleable is false while a status forces the branch open", () => {
  for (const status of forceExpandedStatuses) {
    assert.equal(isGroupToggleable(status), false, `expected ${status} to be non-toggleable`)
  }
})

test("isGroupToggleable is true for completed/idle", () => {
  for (const status of collapsibleStatuses) {
    assert.equal(isGroupToggleable(status), true, `expected ${status} to be toggleable`)
  }
})
