"use client"

/**
 * components/showcase/execution-lab/trace-node-renderer
 *
 * SHOWCASE-ONLY. The React renderer registered against every built-in
 * `trace.*` (target, kind) pair in `executionLabRendererRegistry`
 * (lib/showcase/registry-bootstrap.ts). Unwraps the `AgenticViewNode` data
 * produced by `traceNodeDefinitions` and composes the matching
 * `src/neoarc-agentic-ui/trace` components — `TraceEventRow` for
 * `trace.event` (an `ExecutionTraceSummary` header renders once above the
 * canvas via `RenderCanvas`'s caller, not per-row here), and inline
 * `ExecutionTraceSummary` metadata (usage/timing) for `trace.summary`.
 */

import type { AgenticViewNode } from "../../../src/neoarc-agentic-projection/types"
import type { ExecutionTraceSummary, TraceEvent } from "../../../src/neoarc-agentic-contracts/trace"
import { TraceEventRow } from "../../../src/neoarc-agentic-ui/trace/trace-event-row"
import { TraceUsageSummary } from "../../../src/neoarc-agentic-ui/trace/trace-usage-summary"
import { TraceTimingSummary } from "../../../src/neoarc-agentic-ui/trace/trace-timing-summary"
import { RuntimeStatusBadge } from "../../../src/neoarc-agentic-ui/foundation/runtime-status-badge"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"

export interface TraceNodeRendererProps {
  readonly node: AgenticViewNode
  readonly onSelect?: (node: AgenticViewNode) => void
  readonly selected?: boolean
}

function isExecutionTraceSummary(value: unknown): value is ExecutionTraceSummary {
  return typeof value === "object" && value !== null && "startedAt" in value && "status" in value
}

function isTraceEvent(value: unknown): value is TraceEvent {
  return typeof value === "object" && value !== null && "detail" in value && "occurredAt" in value
}

export function TraceNodeRenderer({ node, onSelect, selected }: TraceNodeRendererProps) {
  if (node.kind === "trace.summary" && isExecutionTraceSummary(node.data)) {
    const summary = node.data
    return (
      <Surface variant={selected ? "raised" : "base"} className="flex w-full flex-col gap-2 p-3">
        <button type="button" onClick={() => onSelect?.(node)} className="flex w-full items-center justify-between gap-2 text-left" aria-pressed={selected}>
          <Badge tone="outline">{node.kind}</Badge>
          <RuntimeStatusBadge status={summary.status} />
        </button>
        {summary.usage ? <TraceUsageSummary usage={summary.usage} /> : null}
        {summary.timing ? <TraceTimingSummary timing={summary.timing} /> : null}
      </Surface>
    )
  }

  if (node.kind === "trace.event" && isTraceEvent(node.data)) {
    return <TraceEventRow event={node.data} selected={selected} onEmitSelect={() => onSelect?.(node)} />
  }

  return (
    <Surface variant={selected ? "raised" : "base"} className="p-3 text-xs text-[var(--neoarc-color-foreground-subtle)]">
      Unrecognized trace node payload for key {node.key}.
    </Surface>
  )
}
