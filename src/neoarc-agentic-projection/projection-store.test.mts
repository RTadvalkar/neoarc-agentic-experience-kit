/**
 * neoarc-agentic-projection / projection-store.test
 *
 * Deterministic proof, at the generic-reducer level, of the replayability
 * invariant `projection-store.ts` documents: full replay
 * (`applyEvents(store, events, defs)`) and live append
 * (`events.reduce(applyEvent, store)`) are the same fold over the same
 * reducer, so they converge by construction as long as a definition's
 * `project()` only derives its node from the event plus
 * `context.findExistingNode` — never from array position or "the latest
 * unfinished item" (docs/02A §Replayability).
 *
 * This file exercises the reducer itself with a minimal synthetic node
 * family, deliberately independent of the conversation domain — the
 * conversation-specific version of this proof, run against every Execution
 * Lab fixture scenario, lives in `conversation-node-definitions.test.mts`.
 *
 * Run with: node --test src/neoarc-agentic-projection/projection-store.test.mts
 */

import { test } from "node:test"
import assert from "node:assert/strict"

import { applyEvent, applyEvents, createProjectionStore, selectNodes } from "./projection-store.ts"
import type { AgenticNodeDefinition, AgenticViewNode } from "./types.ts"
import type { AgenticEventEnvelope } from "../neoarc-agentic-contracts/events.ts"

interface CounterPayload {
  readonly entityId: string
  readonly amount: number
}

/**
 * A synthetic node family: each event carries a business id
 * (`entityId`) and an amount to add to a running total for that entity.
 * The counter is derived purely from `context.findExistingNode` — the
 * property every real `AgenticNodeDefinition` must also have.
 */
const counterDefinition: AgenticNodeDefinition<unknown, { total: number }> = {
  kind: "test.counter",
  target: "test",
  publicationCadence: "immediate",
  match(event) {
    return event.type === "test.counter.incremented" ? { matched: true, kind: "test.counter", target: "test" } : { matched: false }
  },
  project(event, context) {
    const payload = event.payload as CounterPayload
    const key = `counter:${payload.entityId}`
    const existing = context.findExistingNode?.(key) as AgenticViewNode<{ total: number }> | undefined
    return {
      key,
      kind: "test.counter",
      target: "test",
      data: { total: (existing?.data.total ?? 0) + payload.amount },
      visibility: "visible",
      correlation: event.correlation,
    }
  },
}

function counterEvent(id: string, entityId: string, amount: number, sequence: number): AgenticEventEnvelope<CounterPayload> {
  return {
    id,
    type: "test.counter.incremented",
    occurredAt: `2026-01-01T00:00:0${sequence}.000Z`,
    sequence,
    durability: "durable",
    payload: { entityId, amount },
  }
}

test("full replay and live append converge on the same node list", () => {
  const events = [
    counterEvent("evt-1", "a", 1, 1),
    counterEvent("evt-2", "b", 10, 2),
    counterEvent("evt-3", "a", 2, 3),
    counterEvent("evt-4", "a", 3, 4),
    counterEvent("evt-5", "b", 20, 5),
  ]

  const fullReplay = applyEvents(createProjectionStore(), events, [counterDefinition])
  const liveAppend = events.reduce((store, event) => applyEvent(store, event, [counterDefinition]), createProjectionStore())

  assert.deepEqual(selectNodes(fullReplay), selectNodes(liveAppend))
})

test("re-projecting the same key updates the node in place, never reordering it", () => {
  const events = [
    counterEvent("evt-1", "a", 1, 1),
    counterEvent("evt-2", "b", 1, 2),
    counterEvent("evt-3", "a", 1, 3), // updates "a" again — must not move it after "b"
  ]

  const store = applyEvents(createProjectionStore(), events, [counterDefinition])
  const nodes = selectNodes(store)

  assert.deepEqual(nodes.map((node) => node.key), ["counter:a", "counter:b"])
  assert.equal((nodes[0].data as { total: number }).total, 2)
  assert.equal((nodes[1].data as { total: number }).total, 1)
})

test("an event with no matching definition leaves the store unchanged", () => {
  const before = applyEvents(createProjectionStore(), [counterEvent("evt-1", "a", 1, 1)], [counterDefinition])

  const unrelatedEvent: AgenticEventEnvelope = {
    id: "evt-unrelated",
    type: "foundation.something.happened",
    occurredAt: "2026-01-01T00:00:09.000Z",
    durability: "transient",
    payload: {},
  }

  const after = applyEvent(before, unrelatedEvent, [counterDefinition])

  assert.equal(after, before) // same reference: truly unchanged, not just equal
})

test("applyEvent never mutates its input store", () => {
  const store = createProjectionStore()
  const nextStore = applyEvent(store, counterEvent("evt-1", "a", 1, 1), [counterDefinition])

  assert.deepEqual(store.order, [])
  assert.equal(store.nodesByKey.size, 0)
  assert.deepEqual(nextStore.order, ["counter:a"])
})

test("replaying a prefix and continuing from there converges with a from-scratch full replay", () => {
  // Proves the store depends on no hidden mutable runtime state: resuming
  // from an intermediate, independently-computed store must produce the
  // same result as replaying every event from an empty store.
  const events = [
    counterEvent("evt-1", "a", 1, 1),
    counterEvent("evt-2", "b", 5, 2),
    counterEvent("evt-3", "a", 4, 3),
    counterEvent("evt-4", "c", 2, 4),
  ]

  const fromScratch = applyEvents(createProjectionStore(), events, [counterDefinition])

  const prefixStore = applyEvents(createProjectionStore(), events.slice(0, 2), [counterDefinition])
  const resumed = applyEvents(prefixStore, events.slice(2), [counterDefinition])

  assert.deepEqual(selectNodes(fromScratch), selectNodes(resumed))
})
