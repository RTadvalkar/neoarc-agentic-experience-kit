/**
 * neoarc-agentic-projection / projection-store
 *
 * A minimal, generic, pure reducer that turns an ordered sequence of
 * `AgenticEventEnvelope`s into a keyed set of `AgenticViewNode`s using a
 * list of `AgenticNodeDefinition`s. This is the piece that makes the
 * replayability invariant (docs/02A §Replayability, `PROJECTION_MODEL.md`
 * §Replayability invariant) a structural guarantee rather than a
 * convention every feature has to reimplement correctly:
 *
 *   applyEvents(store, events)                 // full replay
 *   events.reduce(applyEvent, store)            // live append, one at a time
 *
 * are the *same* fold over the *same* reducer, so they converge by
 * construction as long as every `AgenticNodeDefinition.project()` only
 * derives its node from the event plus `context.findExistingNode` (never
 * from array position or "the latest node"). Deterministic
 * replay-convergence tests exercise this for the built-in conversation node
 * family — see `conversation-node-definitions.ts` and its test file.
 *
 * Framework-neutral: no React, no DOM, no timers. Any live/streaming/
 * animation-frame-coalesced update loop is built by a consumer (e.g. the
 * Execution Lab's replay engine) on top of this pure reducer, honoring each
 * matched definition's `publicationCadence` however that consumer sees fit
 * — this module does not itself schedule anything.
 */

import type { AgenticEventEnvelope } from "../neoarc-agentic-contracts/events"
import type { OpaqueId } from "../neoarc-agentic-contracts/shared"
import type { AgenticNodeDefinition, AgenticViewNode } from "./types"

/**
 * A keyed, ordered set of projected nodes. `order` records the sequence in
 * which each key first appeared — required so re-projecting the same key
 * (an update) never reorders it, which is what lets live-append and full
 * replay converge on the same node list, not just the same node contents.
 */
export interface ProjectionStore {
  readonly nodesByKey: ReadonlyMap<OpaqueId, AgenticViewNode>
  readonly order: readonly OpaqueId[]
}

export function createProjectionStore(): ProjectionStore {
  return { nodesByKey: new Map(), order: [] }
}

/** Ordered list of every node currently in the store, safe to render as-is. */
export function selectNodes(store: ProjectionStore): readonly AgenticViewNode[] {
  return store.order.map((key) => store.nodesByKey.get(key)).filter((node): node is AgenticViewNode => node !== undefined)
}

/**
 * Apply exactly one event to a store, returning a NEW store (never mutates
 * the input) with the resulting node upserted. If no definition matches the
 * event, the store is returned unchanged — an unrecognized event type is
 * not an error, it simply projects nothing (the generic renderer fallback
 * handles unrecognized *node kinds*; this handles events with no matching
 * definition at all, e.g. a foundation-only fixture event fed through a
 * conversation-only definition list).
 */
export function applyEvent(
  store: ProjectionStore,
  event: AgenticEventEnvelope,
  definitions: readonly AgenticNodeDefinition[],
): ProjectionStore {
  for (const definition of definitions) {
    const match = definition.match(event)
    if (!match.matched) continue

    const context = {
      correlation: event.correlation,
      findExistingNode: (key: OpaqueId) => store.nodesByKey.get(key),
    }
    const node = definition.project(event, context)

    const nextNodesByKey = new Map(store.nodesByKey)
    nextNodesByKey.set(node.key, node)
    const nextOrder = store.order.includes(node.key) ? store.order : [...store.order, node.key]

    return { nodesByKey: nextNodesByKey, order: nextOrder }
  }
  return store
}

/**
 * Apply an ordered sequence of events to a store in one call — a full
 * replay. Equivalent to calling `applyEvent` once per event in order; kept
 * as a named helper so "full replay" and "live append" read as the two
 * deliberate call patterns they are, even though they share one
 * implementation underneath.
 */
export function applyEvents(
  store: ProjectionStore,
  events: readonly AgenticEventEnvelope[],
  definitions: readonly AgenticNodeDefinition[],
): ProjectionStore {
  return events.reduce((acc, event) => applyEvent(acc, event, definitions), store)
}
