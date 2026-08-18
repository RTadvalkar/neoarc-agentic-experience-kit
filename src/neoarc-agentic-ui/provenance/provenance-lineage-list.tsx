/**
 * neoarc-agentic-ui / provenance / ProvenanceLineageList
 *
 * Renders a full supplied `ProvenanceLineage` as an ordered node list (by
 * `occurredAt` when supplied, otherwise supplied array order) with each
 * node's outgoing supplied edges rendered immediately beneath it. This is
 * a list rendering of the same graph — not a duplicate data model — chosen
 * over a canvas/force-graph so it stays keyboard- and screen-reader
 * navigable, per the kit's accessibility requirements. A future
 * `ProvenanceLineageGraph` (canvas) could render the identical
 * `ProvenanceLineage` differently without changing this contract.
 */

import { ProvenanceNodeCard } from "./provenance-node-card"
import { ProvenanceEdgeRow } from "./provenance-edge-row"
import { EmptyState } from "../foundation/empty-state"
import type { ProvenanceLineage, ProvenanceNode } from "../../neoarc-agentic-contracts/provenance"

export interface ProvenanceLineageListProps {
  readonly lineage: ProvenanceLineage
  readonly selectedNodeId?: string
  readonly onSelectNode?: (node: ProvenanceNode) => void
  readonly className?: string
}

export function ProvenanceLineageList({ lineage, selectedNodeId, onSelectNode, className }: ProvenanceLineageListProps) {
  if (lineage.nodes.length === 0) {
    return <EmptyState title="No lineage yet" description="No supplied provenance nodes for this run yet." />
  }

  const nodesById = new Map(lineage.nodes.map((node) => [node.id, node]))
  const edgesByFromNodeId = new Map<string, typeof lineage.edges>()
  for (const edge of lineage.edges) {
    const existing = edgesByFromNodeId.get(edge.fromNodeId) ?? []
    edgesByFromNodeId.set(edge.fromNodeId, [...existing, edge])
  }

  const orderedNodes = [...lineage.nodes].sort((a, b) => {
    if (!a.occurredAt || !b.occurredAt) return 0
    return a.occurredAt.localeCompare(b.occurredAt)
  })

  return (
    <ol className={`flex flex-col gap-2 ${className ?? ""}`}>
      {orderedNodes.map((node) => {
        const outgoing = edgesByFromNodeId.get(node.id) ?? []
        return (
          <li key={node.id} className="flex flex-col gap-1.5">
            <ProvenanceNodeCard node={node} selected={node.id === selectedNodeId} onSelect={onSelectNode} />
            {outgoing.length > 0 ? (
              <div className="flex flex-col gap-1 pl-4">
                {outgoing.map((edge) => (
                  <ProvenanceEdgeRow key={edge.id} edge={edge} nodesById={nodesById} />
                ))}
              </div>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
