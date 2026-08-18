/**
 * neoarc-agentic-projection / trace-node-definitions.test
 *
 * Deterministic replay-convergence + stable-identity tests for the Trace
 * projection family, run against the Execution Lab's "Architecture Agent
 * Run" scenario (`lib/showcase/trace-fixtures.ts`) — the same fixture the
 * Execution Lab's Trace tab renders, so this suite and the manually driven
 * UI prove the same thing about the same data (docs/04
 * CONVERSATION_PROJECTION_REPLAY.prompt.md §8, extended to Trace/Provenance
 * in docs/07_TRACE_AND_PROVENANCE.prompt.md).
 *
 * Two node kinds are checked, per `trace-node-definitions.ts`:
 *   - `trace.summary` — the one accumulating node, keyed by the trace's own
 *     stable `correlation.executionTraceId` (never event id), transitioning
 *     running -> completed/failed.
 *   - `trace.event` — one node per matched content event, keyed by the
 *     event's own `id` — Trace is an append-only chronological log, so the
 *     event id IS the stable business identity here.
 *
 * Every scenario is checked for:
 *   1. Replay convergence — full replay and live append produce the
 *      identical, identically ordered node list.
 *   2. Exactly one `trace.summary` node that ends in a terminal status.
 *   3. One `trace.event` node per matched event, zero key collisions, in
 *      original event order.
 *   4. Correlation identities survive projection unchanged on every node.
 *
 * Run with: node --test src/neoarc-agentic-projection/trace-node-definitions.test.mts
 */

import { test } from "node:test"
import assert from "node:assert/strict"

import { applyEvent, applyEvents, createProjectionStore, selectNodes } from "./projection-store.ts"
import { traceNodeDefinitions } from "./trace-node-definitions.ts"
import { traceExecutionLabScenarios } from "../../lib/showcase/trace-fixtures.ts"
import type { ExecutionTraceSummary, TraceEvent } from "../neoarc-agentic-contracts/trace"

function fullReplayNodes(events: Parameters<typeof applyEvents>[1]) {
  return selectNodes(applyEvents(createProjectionStore(), events, traceNodeDefinitions))
}

function liveAppendNodes(events: Parameters<typeof applyEvents>[1]) {
  const store = events.reduce((acc, event) => applyEvent(acc, event, traceNodeDefinitions), createProjectionStore())
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

test("exactly one trace.summary node exists, keyed by executionTraceId, ending in a terminal status", () => {
  const scenario = traceExecutionLabScenarios[0]
  const nodes = fullReplayNodes(scenario.events)

  const summaryNodes = nodes.filter((node) => node.kind === "trace.summary")
  assert.equal(summaryNodes.length, 1, "expected exactly one trace.summary node, found a duplicate or none")

  const executionTraceId = scenario.events[0].correlation?.executionTraceId
  assert.ok(executionTraceId)
  assert.equal(summaryNodes[0].key, `trace:summary:${executionTraceId}`)

  const summary = summaryNodes[0].data as ExecutionTraceSummary
  assert.ok(summary.status === "completed" || summary.status === "failed", `summary ended in non-terminal status "${summary.status}"`)
})

test("every matched content event produces exactly one trace.event node, in original event order, with no key collisions", () => {
  const scenario = traceExecutionLabScenarios[0]
  const nodes = fullReplayNodes(scenario.events)
  const eventNodes = nodes.filter((node) => node.kind === "trace.event")

  const keys = eventNodes.map((node) => node.key)
  assert.equal(new Set(keys).size, keys.length, "trace.event node keys collided")

  // trace.event nodes must appear in the same relative order as their
  // source events (structural bookend events like turn/step are skipped,
  // but nothing is ever reordered).
  const eventNodeIds = eventNodes.map((node) => (node.data as TraceEvent).id)
  const sourceEventIds = scenario.events.map((event) => event.id).filter((id) => eventNodeIds.includes(id))
  assert.deepEqual(eventNodeIds, sourceEventIds, "trace.event nodes were not in original event order")

  eventNodes.forEach((node) => {
    assert.equal(node.key, `trace:event:${(node.data as TraceEvent).id}`)
  })
})

test("every trace node carries its full correlation identity through unchanged", () => {
  const scenario = traceExecutionLabScenarios[0]
  const nodes = fullReplayNodes(scenario.events)
  const correlationByEventId = new Map(scenario.events.map((event) => [event.id, event.correlation]))

  for (const node of nodes) {
    if (node.kind === "trace.event") {
      const entry = node.data as TraceEvent
      assert.deepEqual(entry.correlation, correlationByEventId.get(entry.id), `trace.event ${entry.id} lost correlation identity during projection`)
    }
    if (node.kind === "trace.summary") {
      // The summary is keyed by executionTraceId and every event in this
      // scenario shares one trace, so its correlation must match any event.
      assert.equal(node.correlation?.executionTraceId, scenario.events[0].correlation?.executionTraceId)
    }
  }
})

test("resuming replay from an intermediate store converges with a from-scratch full replay", () => {
  for (const scenario of traceExecutionLabScenarios) {
    if (scenario.events.length < 2) continue
    const splitAt = Math.floor(scenario.events.length / 2)

    const fromScratch = fullReplayNodes(scenario.events)

    const prefixStore = applyEvents(createProjectionStore(), scenario.events.slice(0, splitAt), traceNodeDefinitions)
    const resumedStore = applyEvents(prefixStore, scenario.events.slice(splitAt), traceNodeDefinitions)

    assert.deepEqual(selectNodes(resumedStore), fromScratch, `scenario "${scenario.id}" failed to converge when resumed mid-replay`)
  }
})
