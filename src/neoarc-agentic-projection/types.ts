/**
 * neoarc-agentic-projection / types
 *
 * The projection seam turns a stream of `AgenticEventEnvelope`s into
 * `AgenticViewNode`s that a renderer registry can render, without dictating
 * how a consumer actually renders them. This package stays optional:
 * `neoarc-agentic-ui` must render correctly when given view models directly
 * (the "DTO → adapter → view model → component" path) and never imports
 * from this package for that path to work.
 *
 * Kept framework-neutral: no React types are imported here. `TRenderer` in
 * the renderer registry is supplied by the consuming package (e.g.
 * `neoarc-agentic-ui` instantiates it with a React component type).
 */

import type { AgenticEventEnvelope, EventCorrelation } from "../neoarc-agentic-contracts/events"
import type { OpaqueId } from "../neoarc-agentic-contracts/shared"

/**
 * Where a projected node is intended to be rendered. New targets may be
 * added by later slices without changing this union's meaning for existing
 * targets.
 */
export type AgenticViewTarget =
  | "conversation"
  | "activity"
  | "trace"
  | "provenance"
  | "mission"
  | "inspector"

/**
 * How urgently a projected update should be published to subscribers.
 * - "immediate": publish synchronously (terminal/structural changes).
 * - "animation-frame": coalesce high-frequency deltas into one frame.
 * - "none": do not auto-publish; caller decides (e.g. batch replay).
 */
export type PublicationCadence = "immediate" | "animation-frame" | "none"

/**
 * Visibility of a projected node, independent of its data. Node kinds may
 * choose to honor `TraceAccessLevel`/`RedactionState` (from
 * neoarc-agentic-contracts) when computing this, but the projection package
 * itself does not enforce security — see docs/02B §Trace access and redaction.
 */
export type AgenticViewNodeVisibility = "visible" | "hidden" | "collapsed"

/**
 * A single projected node ready for rendering. `key` must be a stable
 * business identity (e.g. a message id, a task id) — never derived from
 * array position or "the latest unfinished item" — so that live append and
 * full replay converge on the same tree. See docs/02A §Replayability.
 */
export interface AgenticViewNode<TData = unknown> {
  readonly key: OpaqueId
  readonly kind: string
  readonly target: AgenticViewTarget
  readonly data: TData
  readonly visibility: AgenticViewNodeVisibility
  /** Correlation carried through from the originating event, if any. */
  readonly correlation?: EventCorrelation
}

/** Result of asking a node definition whether it can project a given event. */
export type MatchResult =
  | { readonly matched: false }
  | { readonly matched: true; readonly kind: string; readonly target: AgenticViewTarget }

/**
 * Context passed to a node definition's `project` function. Kept minimal in
 * Slice 1; later slices may extend it with read-only lookups (e.g. "find the
 * existing node for this business key") without changing this contract's
 * shape for existing fields.
 */
export interface ProjectionContext {
  readonly correlation?: EventCorrelation
  /** Look up a previously projected node by stable key, if the projector supports it. */
  readonly findExistingNode?: (key: OpaqueId) => AgenticViewNode | undefined
}

/**
 * A feature-owned definition describing how to recognize and project one
 * event category into one or more view node kinds. Registering a new
 * `AgenticNodeDefinition` must never require modifying a central switch
 * statement elsewhere in the kit — see docs/02A §Pluggable view nodes.
 */
export interface AgenticNodeDefinition<TPayload = unknown, TData = unknown> {
  readonly kind: string
  readonly target: AgenticViewTarget
  readonly publicationCadence: PublicationCadence
  /** Whether this definition can project the given event at all. */
  readonly match: (event: AgenticEventEnvelope<TPayload>) => MatchResult
  /** Produce (or update) a view node from the event. */
  readonly project: (
    event: AgenticEventEnvelope<TPayload>,
    context: ProjectionContext,
  ) => AgenticViewNode<TData>
}
