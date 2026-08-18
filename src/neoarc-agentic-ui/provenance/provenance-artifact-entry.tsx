/**
 * neoarc-agentic-ui / provenance / ProvenanceArtifactEntry
 *
 * One artifact within a lineage. Reuses `ArtifactReferenceCard`
 * (`conversation/`) for the artifact itself rather than re-declaring
 * artifact rendering, and adds only the provenance-specific "produced by"
 * framing on top. When `producedByNodeId` is absent, that line is omitted
 * entirely — never inferred, never rendered as "unknown producer".
 */

import { ArtifactReferenceCard } from "../conversation/artifact-reference-card"
import type { ArtifactLineageEntry } from "../../neoarc-agentic-contracts/provenance"
import type { ProvenanceNode } from "../../neoarc-agentic-contracts/provenance"

export interface ProvenanceArtifactEntryProps {
  readonly entry: ArtifactLineageEntry
  readonly nodesById?: ReadonlyMap<string, ProvenanceNode>
  readonly className?: string
}

export function ProvenanceArtifactEntry({ entry, nodesById, className }: ProvenanceArtifactEntryProps) {
  const producer = entry.producedByNodeId ? nodesById?.get(entry.producedByNodeId) : undefined

  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <ArtifactReferenceCard artifact={entry.artifact} />
      {entry.producedByNodeId ? (
        <span className="pl-1 text-xs text-[var(--neoarc-color-foreground-subtle)]">
          Produced by {producer?.label ?? entry.producedByNodeId}
        </span>
      ) : null}
    </div>
  )
}
