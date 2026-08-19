/**
 * components/showcase/reference-experiences/project-scenario-nodes
 *
 * SHOWCASE-ONLY. A tiny composition helper shared by the Agent Workspace
 * and Execution Investigation reference experiences (and mirroring
 * `render-canvas.tsx`'s own per-target projection loop in the Execution
 * Lab): given a slice of visible events and one target's node
 * definitions, fold them through the existing `neoarc-agentic-projection`
 * store and hand back the ordered nodes. This is not a new projection
 * mechanism — it is `createProjectionStore` + `applyEvents` +
 * `selectNodes`, composed once so neither reference page repeats the same
 * three-line reduction inline for each of its five targets.
 */

import { applyEvents, createProjectionStore, selectNodes } from "../../../src/neoarc-agentic-projection/projection-store"
import type { AgenticNodeDefinition, AgenticViewNode, AgenticViewTarget } from "../../../src/neoarc-agentic-projection/types"
import type { AgenticEventEnvelope } from "../../../src/neoarc-agentic-contracts/events"

/**
 * `target` is filtered post-projection (never used to skip a definition
 * pre-match), mirroring `render-canvas.tsx`'s own
 * `selectNodes(store).filter((node) => node.target === target)` — the
 * union-of-definitions design means one shared event list can legitimately
 * project nodes for several targets, so filtering happens after the fold,
 * not by trimming the definitions list per call site.
 */
export function projectScenarioNodes(
  events: readonly AgenticEventEnvelope[],
  definitions: readonly AgenticNodeDefinition<unknown, unknown>[],
  target?: AgenticViewTarget,
): readonly AgenticViewNode[] {
  const nodes = selectNodes(applyEvents(createProjectionStore(), events, definitions))
  return target ? nodes.filter((node) => node.target === target) : nodes
}
