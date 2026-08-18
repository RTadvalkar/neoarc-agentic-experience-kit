/**
 * components/showcase/execution-lab/find-source-event
 *
 * SHOWCASE-ONLY. `AgenticViewNode.key` is a stable business id
 * (`conversation:<prefix>:<businessId>`) and is *never* derived from an
 * event id — see the contract note in
 * `src/neoarc-agentic-projection/conversation-node-definitions.ts`. That
 * means a rendered node cannot be matched back to "the" event that produced
 * it by comparing ids directly; a node's business id (e.g. a `messageId`)
 * can appear in more than one event as the item moves through its
 * lifecycle (created -> completed).
 *
 * This helper recovers a best-effort "source envelope" for the Execution
 * Lab's inspector panel by:
 * 1. extracting the node's business id from its key,
 * 2. finding every visible event that references that business id, either
 *    as the event's own `id` (for envelope-identified node kinds such as
 *    `notice`/`error`/`retry`) or anywhere as a value inside its `payload`
 *    (for entity-identified kinds such as messages, tools, clarifications,
 *    handoffs, artifacts — these vary in shape: a flat `messageId` field, a
 *    nested `tool.id`, etc., so the match is on value, not a fixed key),
 *    and
 * 3. returning the most recent match, i.e. the event that produced the
 *    node's current rendered state.
 *
 * This is inspector convenience logic for the showcase surface only — it is
 * not part of the reusable projection contract and must not be imported
 * from `neoarc-agentic-projection` or `neoarc-agentic-ui`.
 */

import type { AgenticEventEnvelope } from "../../../src/neoarc-agentic-contracts/events"
import type { AgenticViewNode } from "../../../src/neoarc-agentic-projection/types"

function businessIdFromNodeKey(key: string): string {
  const [, , ...rest] = key.split(":")
  return rest.join(":")
}

function payloadReferencesId(value: unknown, id: string, depth = 0): boolean {
  if (value === id) return true
  if (depth > 5 || value === null || typeof value !== "object") return false
  if (Array.isArray(value)) return value.some((entry) => payloadReferencesId(entry, id, depth + 1))
  return Object.values(value).some((entryValue) => payloadReferencesId(entryValue, id, depth + 1))
}

/**
 * Returns the most recent event, among `visibleEvents`, that produced
 * `node`'s current rendered state, or `undefined` if none reference it.
 */
export function findSourceEventForNode(
  visibleEvents: readonly AgenticEventEnvelope[],
  node: AgenticViewNode,
): AgenticEventEnvelope | undefined {
  const businessId = businessIdFromNodeKey(node.key)
  if (!businessId) return undefined

  const matches = visibleEvents.filter(
    (event) => event.id === businessId || payloadReferencesId(event.payload, businessId),
  )
  return matches.at(-1)
}
