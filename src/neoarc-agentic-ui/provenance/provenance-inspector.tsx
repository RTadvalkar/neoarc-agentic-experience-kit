/**
 * neoarc-agentic-ui / provenance / ProvenanceInspector
 *
 * Detail panel for one selected `ProvenanceNode`: entity kind, label,
 * timestamp, and its incoming/outgoing supplied edges (resolved via the
 * full lineage the caller supplies). Renders "No node selected" rather
 * than an arbitrary default when nothing is selected.
 */

import { ProvenanceEntityBadge } from "./provenance-entity-badge"
import { ProvenanceEdgeRow } from "./provenance-edge-row"
import { Timestamp } from "../foundation/timestamp"
import { EmptyState } from "../foundation/empty-state"
import { SectionHeader } from "../foundation/section-header"
import type { ProvenanceLineage, ProvenanceNode } from "../../neoarc-agentic-contracts/provenance"

export interface ProvenanceInspectorProps {
  readonly node: ProvenanceNode | undefined
  readonly lineage: ProvenanceLineage
  readonly className?: string
}

export function ProvenanceInspector({ node, lineage, className }: ProvenanceInspectorProps) {
  if (!node) {
    return <EmptyState title="No node selected" description="Select a lineage node to inspect its provenance." />
  }

  const nodesById = new Map(lineage.nodes.map((entry) => [entry.id, entry]))
  const incoming = lineage.edges.filter((edge) => edge.toNodeId === node.id)
  const outgoing = lineage.edges.filter((edge) => edge.fromNodeId === node.id)

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <ProvenanceEntityBadge entityKind={node.entityKind} />
        <h3 className="text-sm font-medium text-[var(--neoarc-color-foreground)]">{node.label}</h3>
      </div>
      {node.occurredAt ? <Timestamp value={node.occurredAt} className="text-xs" /> : null}

      <div className="flex flex-col gap-2">
        <SectionHeader title="Incoming" />
        {incoming.length === 0 ? (
          <p className="text-xs text-[var(--neoarc-color-foreground-subtle)]">No supplied incoming edges.</p>
        ) : (
          incoming.map((edge) => <ProvenanceEdgeRow key={edge.id} edge={edge} nodesById={nodesById} />)
        )}
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader title="Outgoing" />
        {outgoing.length === 0 ? (
          <p className="text-xs text-[var(--neoarc-color-foreground-subtle)]">No supplied outgoing edges.</p>
        ) : (
          outgoing.map((edge) => <ProvenanceEdgeRow key={edge.id} edge={edge} nodesById={nodesById} />)
        )}
      </div>
    </div>
  )
}
