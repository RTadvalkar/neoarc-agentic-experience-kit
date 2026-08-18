/**
 * neoarc-agentic-projection / activity-node-definitions.test
 *
 * Deterministic replay-convergence tests for the Activity projection
 * family, run against the Execution Lab's "Architecture Agent Run"
 * scenario (`lib/showcase/trace-fixtures.ts`).
 *
 * Activity is a one-shot, append-only feed per `activity-node-definitions.ts`
 * — every matched event produces exactly one `activity.entry` node keyed by
 * the event's own id, reusing the existing `ActivitySummary` shape rather
 * than a new type (see that file's module comment). This suite checks:
 *   1. Replay convergence.
 *   2. One node per matched event, in original event order, no collisions.
 *   3. Every entry's `label` is a short, always-safe one-liner (never the
 *      full raw payload) and `status` is a valid `RuntimeStatus`.
 *
 * Run with: node --test src/neoarc-agentic-projection/activity-node-definitions.test.mts
 */

import { test } from "node:test"
import assert from "node:assert/strict"

import { applyEvent, applyEvents, createProjectionStore, selectNodes } from "./projection-store.ts"
import { activityNodeDefinitions } from "./activity-node-definitions.ts"
import { traceExecutionLabScenarios } from "../../lib/showcase/trace-fixtures.ts"
import type { ActivitySummary } from "../neoarc-agentic-contracts/conversation"

const VALID_RUNTIME_STATUSES = new Set([
  "idle",
  "queued",
  "running",
  "waiting_for_human",
  "completed",
  "failed",
  "cancelled",
  "retrying",
])

function fullReplayNodes(events: Parameters<typeof applyEvents>[1]) {
  return selectNodes(applyEvents(createProjectionStore(), events, activityNodeDefinitions))
}

function liveAppendNodes(events: Parameters<typeof applyEvents>[1]) {
  const store = events.reduce((acc, event) => applyEvent(acc, event, activityNodeDefinitions), createProjectionStore())
  return selectNodes(store)
}

test("Architecture Agent Run scenario converges: full replay === live append", () => {
  for (const scenario of traceExecutionLabScenarios) {
    assert.deepEqual(
      fullReplayNodes(scenario.events),
      liveAppendNodes(scenario.events),
      `scenario "${scenario.id}" diverged between full replay and live append`,
    )
  }
})

test("every matched event produces exactly one activity.entry node, in original event order, with no key collisions", () => {
  const scenario = traceExecutionLabScenarios[0]
  const nodes = fullReplayNodes(scenario.events)

  const keys = nodes.map((node) => node.key)
  assert.equal(new Set(keys).size, keys.length, "activity.entry node keys collided")
  assert.ok(nodes.length > 0, "expected at least one activity entry to be produced")

  nodes.forEach((node) => {
    assert.match(node.key, /^activity:entry:/)
  })
})

test("every activity entry is a short, safe one-liner with a valid RuntimeStatus", () => {
  const scenario = traceExecutionLabScenarios[0]
  const nodes = fullReplayNodes(scenario.events)

  for (const node of nodes) {
    const summary = node.data as ActivitySummary
    assert.ok(summary.label.length > 0, "activity entry label must not be empty")
    assert.ok(summary.label.length < 200, "activity entry label should stay a terse one-liner, not the full raw payload")
    if (summary.status) {
      assert.ok(VALID_RUNTIME_STATUSES.has(summary.status), `"${summary.status}" is not a valid RuntimeStatus`)
    }
  }
})

test("resuming replay from an intermediate store converges with a from-scratch full replay", () => {
  for (const scenario of traceExecutionLabScenarios) {
    if (scenario.events.length < 2) continue
    const splitAt = Math.floor(scenario.events.length / 2)

    const fromScratch = fullReplayNodes(scenario.events)

    const prefixStore = applyEvents(createProjectionStore(), scenario.events.slice(0, splitAt), activityNodeDefinitions)
    const resumedStore = applyEvents(prefixStore, scenario.events.slice(splitAt), activityNodeDefinitions)

    assert.deepEqual(selectNodes(resumedStore), fromScratch, `scenario "${scenario.id}" failed to converge when resumed mid-replay`)
  }
})
