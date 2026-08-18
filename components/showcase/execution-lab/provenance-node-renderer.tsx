"use client"

/**
 * components/showcase/execution-lab/provenance-node-renderer
 *
 * SHOWCASE-ONLY. The React renderer registered against every built-in
 * `provenance.*` (target, kind) pair in `executionLabRendererRegistry`
 * (lib/showcase/registry-bootstrap.ts). Unwraps the `AgenticViewNode` data
 * produced by `provenanceNodeDefinitions` and composes
 * `ProvenanceNodeCard` for `provenance.node` and `ProvenanceEdgeRow` for
 * `provenance.edge`. The edge row needs sibling node labels to resolve
 * `fromNodeId`/`toNodeId` — the flat render canvas doesn't provide the
 * full lineage, so it falls back to the raw ids, which is honest given
 * what this renderer alone can see (the full lineage graph is exercised
 * by `ProvenanceExplorer` in the Component Gallery instead).
 */

import type { AgenticViewNode } from "../../../src/neoarc-agentic-projection/types"
import type { ProvenanceEdge, ProvenanceNode } from "../../../src/neoarc-agentic-contracts/provenance"
import { ProvenanceNodeCard } from "../../../src/neoarc-agentic-ui/provenance/provenance-node-card"
import { ProvenanceEdgeRow } from "../../../src/neoarc-agentic-ui/provenance/provenance-edge-row"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"

export interface ProvenanceNodeRendererProps {
  readonly node: AgenticViewNode
  readonly onSelect?: (node: AgenticViewNode) => void
  readonly selected?: boolean
}

function isProvenanceNode(value: unknown): value is ProvenanceNode {
  return typeof value === "object" && value !== null && "entityKind" in value && "label" in value
}

function isProvenanceEdge(value: unknown): value is ProvenanceEdge {
  return typeof value === "object" && value !== null && "fromNodeId" in value && "toNodeId" in value
}

export function ProvenanceNodeRenderer({ node, onSelect, selected }: ProvenanceNodeRendererProps) {
  if (node.kind === "provenance.node" && isProvenanceNode(node.data)) {
    return <ProvenanceNodeCard node={node.data} selected={selected} onSelect={() => onSelect?.(node)} />
  }

  if (node.kind === "provenance.edge" && isProvenanceEdge(node.data)) {
    return (
      <Surface variant={selected ? "raised" : "base"} className="flex w-full flex-col gap-2 p-3">
        <button type="button" onClick={() => onSelect?.(node)} className="flex w-full items-center justify-between gap-2 text-left" aria-pressed={selected}>
          <Badge tone="outline">{node.kind}</Badge>
        </button>
        <ProvenanceEdgeRow edge={node.data} nodesById={new Map()} />
      </Surface>
    )
  }

  return (
    <Surface variant={selected ? "raised" : "base"} className="p-3 text-xs text-[var(--neoarc-color-foreground-subtle)]">
      Unrecognized provenance node payload for key {node.key}.
    </Surface>
  )
}
