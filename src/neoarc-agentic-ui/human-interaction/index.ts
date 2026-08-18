/**
 * neoarc-agentic-ui / human-interaction
 *
 * Slice 3 component family: execution permission (`permission-*`,
 * "may this specific tool/action proceed?") and proposal review
 * (`proposal-*`, "should this proposal become authoritative?"), plus the
 * shared compact `PendingHumanInteractionSummary` entry point. See
 * `docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md` §Two
 * separate approval domains for why these are two families, not one.
 */

export * from "./execution-permission-card"
export * from "./execution-permission-dialog"
export * from "./permission-outcome-badge"
export * from "./permission-reason"

export * from "./change-diff-viewer"
export * from "./conflict-resolution-panel"
export * from "./decision-bar"
export * from "./decision-history"
export * from "./human-override-dialog"
export * from "./proposal-card"
export * from "./proposal-status-badge"
export * from "./proposal-status-timeline"
export * from "./proposal-viewer"

export * from "./pending-human-interaction-summary"
