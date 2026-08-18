/**
 * neoarc-agentic-projection
 *
 * Optional projection seam: event → projected view node → renderer registry.
 * `neoarc-agentic-ui` never requires this package to function — it is only
 * needed by products that want replayable, streaming, event-driven
 * experiences. See docs/PROJECTION_MODEL.md.
 */

export * from "./types"
export * from "./renderer-registry"
export * from "./surface-registry"
export * from "./projection-store"
export * from "./conversation-node-definitions"
