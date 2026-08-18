/**
 * neoarc-agentic-contracts / trace-ui-events
 *
 * Slice 5 typed payloads for `AgenticUIEvent<TPayload>` (see `ui-events.ts`)
 * emitted by the Trace and Provenance component families
 * (`src/neoarc-agentic-ui/trace`, `src/neoarc-agentic-ui/provenance`).
 * Every one of these is a signal of user intent only (select/filter/search)
 * — none of them mutate trace data, since the Trace/Provenance views are
 * read-only forensic surfaces.
 */

import type { OpaqueId } from "./shared"
import type { TraceEventKind } from "./trace"
import type { ProvenanceEntityKind } from "./provenance"

/** Every Trace/Provenance semantic UI event type this Slice defines. */
export const TRACE_UI_EVENT_TYPES = [
  "trace.event.select",
  "trace.filter.change",
  "trace.search.change",
  "provenance.node.select",
  "provenance.edge.select",
] as const

export type TraceUIEventType = (typeof TRACE_UI_EVENT_TYPES)[number]

/** Emitted by `TraceEventRow`/`TraceTimeline` when the human selects one event for inspection. */
export interface TraceEventSelectPayload {
  readonly eventId: OpaqueId
}

/** Emitted by `TraceExplorer` when the human changes which `TraceEventKind`s are shown. `undefined` means "all kinds". */
export interface TraceFilterChangePayload {
  readonly kinds?: readonly TraceEventKind[]
}

/** Emitted by `TraceExplorer` when the human changes the free-text search query. */
export interface TraceSearchChangePayload {
  readonly query: string
}

/** Emitted by `ProvenanceExplorer`/`ProvenanceNode` when the human selects one lineage node. */
export interface ProvenanceNodeSelectPayload {
  readonly nodeId: OpaqueId
  readonly entityKind: ProvenanceEntityKind
}

/** Emitted by `ProvenanceExplorer`/`ProvenanceEdge` when the human selects one lineage edge. */
export interface ProvenanceEdgeSelectPayload {
  readonly edgeId: OpaqueId
}

/** Discriminated-by-caller union of every Trace/Provenance UI event payload. */
export type TraceUIEventPayload =
  | TraceEventSelectPayload
  | TraceFilterChangePayload
  | TraceSearchChangePayload
  | ProvenanceNodeSelectPayload
  | ProvenanceEdgeSelectPayload
