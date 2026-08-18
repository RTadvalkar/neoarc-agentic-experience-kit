"use client"

/**
 * neoarc-agentic-ui / provenance / ProvenanceExplorer
 *
 * Top-level Provenance surface: a master-detail composition of
 * `ProvenanceLineageList` (left) and `ProvenanceInspector` (right) over one
 * supplied `ProvenanceLineage`. Owns only the transient "which node is
 * selected" UI state — the lineage itself is fully controlled, supplied by
 * the caller (product adapter / projection store), never fetched or
 * mutated here.
 */

import * as React from "react"
import { ProvenanceLineageList } from "./provenance-lineage-list"
import { ProvenanceInspector } from "./provenance-inspector"
import { SectionHeader } from "../foundation/section-header"
import type { ProvenanceLineage, ProvenanceNode } from "../../neoarc-agentic-contracts/provenance"

export interface ProvenanceExplorerProps {
  readonly lineage: ProvenanceLineage
  readonly title?: React.ReactNode
  readonly className?: string
}

export function ProvenanceExplorer({ lineage, title = "Provenance", className }: ProvenanceExplorerProps) {
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | undefined>(undefined)
  const selectedNode = lineage.nodes.find((node) => node.id === selectedNodeId)

  function handleSelectNode(node: ProvenanceNode) {
    setSelectedNodeId(node.id)
  }

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      <SectionHeader title={title} description="How supplied lineage connects intent to the resulting artifact." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-h-0 overflow-y-auto rounded-[var(--neoarc-radius-lg)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] p-3">
          <ProvenanceLineageList lineage={lineage} selectedNodeId={selectedNodeId} onSelectNode={handleSelectNode} />
        </div>
        <div className="min-h-0 overflow-y-auto rounded-[var(--neoarc-radius-lg)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] p-3">
          <ProvenanceInspector node={selectedNode} lineage={lineage} />
        </div>
      </div>
    </div>
  )
}
