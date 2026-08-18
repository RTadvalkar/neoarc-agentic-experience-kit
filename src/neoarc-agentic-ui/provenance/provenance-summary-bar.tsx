/**
 * neoarc-agentic-ui / provenance / ProvenanceSummaryBar
 *
 * A compact "N intents, N missions, ..." count strip over a supplied
 * lineage, for use above `ProvenanceExplorer` or standalone in a smaller
 * surface (e.g. a sidebar). Counts are derived purely from the supplied
 * `lineage.nodes` array — never a separate fetched total.
 */

import { ProvenanceEntityBadge } from "./provenance-entity-badge"
import type { ProvenanceEntityKind, ProvenanceLineage } from "../../neoarc-agentic-contracts/provenance"

const ORDER: readonly ProvenanceEntityKind[] = [
  "intent",
  "mission",
  "task",
  "knowledge",
  "relationship",
  "tool",
  "decision",
  "proposal",
  "artifact",
]

export interface ProvenanceSummaryBarProps {
  readonly lineage: ProvenanceLineage
  readonly className?: string
}

export function ProvenanceSummaryBar({ lineage, className }: ProvenanceSummaryBarProps) {
  const counts = new Map<ProvenanceEntityKind, number>()
  for (const node of lineage.nodes) {
    counts.set(node.entityKind, (counts.get(node.entityKind) ?? 0) + 1)
  }

  const present = ORDER.filter((kind) => (counts.get(kind) ?? 0) > 0)

  if (present.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {present.map((kind) => (
        <div key={kind} className="flex items-center gap-1.5">
          <ProvenanceEntityBadge entityKind={kind} />
          <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">{counts.get(kind)}</span>
        </div>
      ))}
    </div>
  )
}
