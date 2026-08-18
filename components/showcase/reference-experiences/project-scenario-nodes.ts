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
import type { AgenticNodeDefinition, AgenticViewNode } from "../../../src/neoarc-agentic-projection/types"
import type { AgenticEventEnvelope } from "../../../src/neoarc-agentic-contracts/events"

export function projectScenarioNodes(
  events: readonly AgenticEventEnvelope[],
  definitions: readonly AgenticNodeDefinition<unknown, unknown>[],
): readonly AgenticViewNode[] {
  return selectNodes(applyEvents(createProjectionStore(), events, definitions))
}
