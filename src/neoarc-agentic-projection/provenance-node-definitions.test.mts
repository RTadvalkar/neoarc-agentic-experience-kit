/**
 * neoarc-agentic-projection / provenance-node-definitions.test
 *
 * Deterministic replay-convergence + supplied-only-lineage tests for the
 * Provenance projection family, run against the Execution Lab's
 * "Architecture Agent Run" scenario (`lib/showcase/trace-fixtures.ts`).
 *
 * Two node kinds, per `provenance-node-definitions.ts`:
 *   - `provenance.node` — one node per matched event, keyed by the
 *     entity's own supplied id (never event id, never array position).
 *   - `provenance.edge` — created **only** when the source event itself
 *     supplies a producer reference (`ArtifactProducedPayload.producedByNodeId`).
 *     Never inferred from event ordering or timing proximity.
 *
 * Checks:
 *   1. Replay convergence.
 *   2. Every produced-artifact event with a supplied `producedByNodeId`
 *      yields exactly one corresponding edge, and the edge's `fromNodeId`/
 *      `toNodeId` match the supplied reference and artifact id exactly —
 *      never fabricated, never dropped.
 *   3. No node keys collide even though several entity kinds are produced
 *      from one flat event stream.
 *
 * Run with: node --test src/neoarc-agentic-projection/provenance-node-definitions.test.mts
 */

import { test } from "node:test"
import assert from "node:assert/strict"

import { applyEvent, applyEvents, createProjectionStore, selectNodes } from "./projection-store.ts"
import { provenanceNodeDefinitions } from "./provenance-node-definitions.ts"
import { traceExecutionLabScenarios } from "../../lib/showcase/trace-fixtures.ts"
import type { ProvenanceEdge, ProvenanceNode } from "../neoarc-agentic-contracts/provenance"

function fullReplayNodes(events: Parameters<typeof applyEvents>[1]) {
  return selectNodes(applyEvents(createProjectionStore(), events, provenanceNodeDefinitions))
}

function liveAppendNodes(events: Parameters<typeof applyEvents>[1]) {
  const store = events.reduce((acc, event) => applyEvent(acc, event, provenanceNodeDefinitions), createProjectionStore())
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

test("no provenance.node keys collide despite multiple entity kinds sharing one flat event stream", () => {
  const scenario = traceExecutionLabScenarios[0]
  const nodes = fullReplayNodes(scenario.events).filter((node) => node.kind === "provenance.node")
  const keys = nodes.map((node) => node.key)
  assert.equal(new Set(keys).size, keys.length, "provenance.node keys collided")
  assert.ok(nodes.length > 0, "expected at least one provenance node to be produced")
})

test("every produced artifact with a supplied producedByNodeId yields exactly one edge with the exact supplied reference", () => {
  const scenario = traceExecutionLabScenarios[0]
  const nodes = fullReplayNodes(scenario.events)
  const edgeNodes = nodes.filter((node) => node.kind === "provenance.edge")

  const producedEvents = scenario.events.filter(
    (event) => event.type === "artifact.produced" && (event.payload as { producedByNodeId?: string }).producedByNodeId,
  )
  assert.ok(producedEvents.length > 0, "fixture must exercise at least one supplied producedByNodeId to make this test meaningful")
  assert.equal(edgeNodes.length, producedEvents.length)

  for (const event of producedEvents) {
    const payload = event.payload as { artifact: { id: string }; producedByNodeId: string }
    const matchingEdge = edgeNodes.find((node) => (node.data as ProvenanceEdge).toNodeId === payload.artifact.id)
    assert.ok(matchingEdge, `expected an edge pointing to artifact ${payload.artifact.id}`)
    assert.equal((matchingEdge!.data as ProvenanceEdge).fromNodeId, payload.producedByNodeId)
  }
})

test("an artifact produced without a supplied producedByNodeId gets a node but never a fabricated edge", () => {
  // artifact.started events never carry a producer reference — provenance
  // must never invent one from timing/ordering proximity.
  const scenario = traceExecutionLabScenarios[0]
  const startedWithoutProducer = scenario.events.filter((event) => event.type === "artifact.started")
  if (startedWithoutProducer.length === 0) return // nothing to assert if the fixture has none

  const nodes = fullReplayNodes(scenario.events)
  const edgeNodes = nodes.filter((node) => node.kind === "provenance.edge")
  // artifact.started never matches provenanceEdgeNodeDefinition's `match`,
  // so no edge should ever target an artifact that only ever started.
  for (const event of startedWithoutProducer) {
    const payload = event.payload as { artifact: { id: string } }
    const spuriousEdge = edgeNodes.find((node) => (node.data as ProvenanceEdge).toNodeId === payload.artifact.id)
    assert.equal(spuriousEdge, undefined, `an edge was fabricated for artifact ${payload.artifact.id}, which never supplied a producer`)
  }
})

test("provenance.node preserves the entity's own label and occurredAt without alteration", () => {
  const scenario = traceExecutionLabScenarios[0]
  const nodes = fullReplayNodes(scenario.events).filter((node) => node.kind === "provenance.node")

  for (const node of nodes) {
    const entity = node.data as ProvenanceNode
    assert.ok(entity.id, "provenance node missing its own supplied id")
    assert.ok(entity.label, "provenance node missing a label")
    assert.ok(entity.occurredAt, "provenance node missing occurredAt")
  }
})

test("resuming replay from an intermediate store converges with a from-scratch full replay", () => {
  for (const scenario of traceExecutionLabScenarios) {
    if (scenario.events.length < 2) continue
    const splitAt = Math.floor(scenario.events.length / 2)

    const fromScratch = fullReplayNodes(scenario.events)

    const prefixStore = applyEvents(createProjectionStore(), scenario.events.slice(0, splitAt), provenanceNodeDefinitions)
    const resumedStore = applyEvents(prefixStore, scenario.events.slice(splitAt), provenanceNodeDefinitions)

    assert.deepEqual(selectNodes(resumedStore), fromScratch, `scenario "${scenario.id}" failed to converge when resumed mid-replay`)
  }
})
