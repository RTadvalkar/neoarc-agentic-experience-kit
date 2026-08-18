"use client"

/**
 * components/showcase/execution-lab/generic-fallback-renderer
 *
 * SHOWCASE-ONLY. The React renderer registered as the Renderer Registry's
 * fallback (`registerFallback`) for the Execution Lab. Renders any
 * `AgenticViewNode` whose (target, kind) has no specific registration —
 * every fixture node in Slice 1, since no concrete kinds are registered yet.
 *
 * This is intentionally generic: it must stay correct for ANY node shape,
 * so it only shows the node's identity (key/kind/target) plus its raw data,
 * never assuming a specific payload shape.
 */

import type { AgenticViewNode } from "../../../src/neoarc-agentic-projection/types"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"
import { Timestamp } from "../../../src/neoarc-agentic-ui/foundation/timestamp"
import type { AgenticEventEnvelope } from "../../../src/neoarc-agentic-contracts/events"

export interface GenericFallbackRendererProps {
  readonly node: AgenticViewNode
  readonly onSelect?: (node: AgenticViewNode) => void
  readonly selected?: boolean
}

function isEventEnvelope(value: unknown): value is AgenticEventEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "type" in value &&
    "occurredAt" in value
  )
}

export function GenericFallbackRenderer({ node, onSelect, selected }: GenericFallbackRendererProps) {
  const envelope = isEventEnvelope(node.data) ? node.data : undefined

  return (
    <Surface
      variant={selected ? "raised" : "base"}
      className="flex w-full flex-col gap-2 p-3 text-left transition-colors"
    >
      <button
        type="button"
        onClick={() => onSelect?.(node)}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-pressed={selected}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge tone="outline">unregistered kind</Badge>
            <span className="truncate text-xs font-mono text-[var(--neoarc-color-foreground-subtle)]">
              {node.kind}
            </span>
          </div>
          <span className="truncate text-sm font-medium text-[var(--neoarc-color-foreground)]">
            {envelope ? envelope.type : node.key}
          </span>
        </div>
        {envelope ? <Timestamp value={envelope.occurredAt} variant="relative" /> : null}
      </button>
    </Surface>
  )
}
