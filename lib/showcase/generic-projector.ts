/**
 * lib/showcase/generic-projector
 *
 * SHOWCASE-ONLY. Slice 1 introduces the projection seam but no concrete
 * `AgenticNodeDefinition`s — those arrive with the components that need
 * them starting Slice 2 (docs/03_BOOTSTRAP...prompt.md §6). This function
 * is a minimal, honest stand-in used only by the Execution Lab to prove the
 * envelope -> view node -> renderer registry pipeline end to end: every
 * fixture event projects to view node kind "foundation.event", which has no
 * registered renderer on any target, so it always resolves to the generic
 * fallback renderer. That is the point — it demonstrates unknown-kind
 * fallback, not a real node-kind catalog.
 */

import type { AgenticEventEnvelope } from "../../src/neoarc-agentic-contracts/events"
import type { AgenticViewNode, AgenticViewTarget } from "../../src/neoarc-agentic-projection/types"

export const DEMO_NODE_KIND = "foundation.event"

export function projectFoundationEvent<TPayload>(
  event: AgenticEventEnvelope<TPayload>,
  target: AgenticViewTarget,
): AgenticViewNode<AgenticEventEnvelope<TPayload>> {
  return {
    key: event.id,
    kind: DEMO_NODE_KIND,
    target,
    data: event,
    visibility: "visible",
    correlation: event.correlation,
  }
}
