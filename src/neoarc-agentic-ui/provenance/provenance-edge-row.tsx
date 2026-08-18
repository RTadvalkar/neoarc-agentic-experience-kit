/**
 * neoarc-agentic-ui / provenance / ProvenanceEdgeRow
 *
 * One supplied lineage edge: from-node label -> relation -> to-node label.
 * Resolves node labels via a lookup the caller supplies (`nodesById`) so
 * this component never has to reach into a store itself — it only ever
 * renders what it is handed. If either endpoint is not found in the
 * lookup, that side falls back to the raw id — never fabricated.
 */

import { ArrowRight } from "lucide-react"
import type { ProvenanceEdge, ProvenanceNode } from "../../neoarc-agentic-contracts/provenance"

export interface ProvenanceEdgeRowProps {
  readonly edge: ProvenanceEdge
  readonly nodesById: ReadonlyMap<string, ProvenanceNode>
  readonly className?: string
}

export function ProvenanceEdgeRow({ edge, nodesById, className }: ProvenanceEdgeRowProps) {
  const fromLabel = nodesById.get(edge.fromNodeId)?.label ?? edge.fromNodeId
  const toLabel = nodesById.get(edge.toNodeId)?.label ?? edge.toNodeId

  return (
    <div className={`flex items-center gap-2 text-xs text-[var(--neoarc-color-foreground-muted)] ${className ?? ""}`}>
      <span className="truncate text-[var(--neoarc-color-foreground)]">{fromLabel}</span>
      <span className="inline-flex items-center gap-1 shrink-0 rounded-[var(--neoarc-radius-full)] bg-[var(--neoarc-color-surface-muted)] px-2 py-0.5">
        {edge.relation}
        <ArrowRight className="size-3" aria-hidden="true" />
      </span>
      <span className="truncate text-[var(--neoarc-color-foreground)]">{toLabel}</span>
    </div>
  )
}
