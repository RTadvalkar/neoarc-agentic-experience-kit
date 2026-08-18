/**
 * neoarc-agentic-ui / conversation / GenericAgenticNodeFallback
 *
 * Purpose: the reusable, kit-owned fallback renderer for any
 * `AgenticViewNode` whose `(target, kind)` has no specific registration in
 * a `RendererRegistry` — see docs/RENDERER_REGISTRY.md. Registering this as
 * `registry.registerFallback(GenericAgenticNodeFallback)` is what lets
 * unknown node kinds render safely instead of throwing or disappearing.
 *
 * Portability note: every other component in this package renders directly
 * from a normalized model and has zero dependency on
 * `neoarc-agentic-projection`. This is the one deliberate exception — its
 * entire purpose is to render an `AgenticViewNode`, so it imports that one
 * type from the projection package. `neoarc-agentic-ui` remains usable
 * without `neoarc-agentic-projection` for every other component; a consumer
 * who never uses projection simply never imports this file.
 *
 * This component must stay correct for ANY node shape — it only ever shows
 * the node's identity (`key`/`kind`/`target`) plus, when the underlying
 * `data` looks like an `AgenticEventEnvelope`, its type and timestamp. It
 * never assumes a specific payload shape.
 */

import * as React from "react"
import type { AgenticViewNode } from "../../neoarc-agentic-projection/types"
import type { AgenticEventEnvelope } from "../../neoarc-agentic-contracts/events"
import { Badge } from "../primitives/badge"
import { Surface } from "../primitives/surface"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"

export interface GenericAgenticNodeFallbackProps {
  readonly node: AgenticViewNode
  readonly onSelect?: (node: AgenticViewNode) => void
  readonly selected?: boolean
  readonly className?: string
}

function isEventEnvelope(value: unknown): value is AgenticEventEnvelope {
  return typeof value === "object" && value !== null && "id" in value && "type" in value && "occurredAt" in value
}

export function GenericAgenticNodeFallback({ node, onSelect, selected, className }: GenericAgenticNodeFallbackProps) {
  const envelope = isEventEnvelope(node.data) ? node.data : undefined

  return (
    <Surface variant={selected ? "raised" : "base"} className={cn("flex w-full flex-col gap-2 p-3", className)}>
      <button
        type="button"
        onClick={() => onSelect?.(node)}
        aria-pressed={selected}
        className="flex w-full items-start justify-between gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge tone="outline">unregistered kind</Badge>
            <span className="truncate font-mono text-xs text-[var(--neoarc-color-foreground-subtle)]">{node.kind}</span>
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
