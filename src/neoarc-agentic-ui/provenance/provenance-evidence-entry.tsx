/**
 * neoarc-agentic-ui / provenance / ProvenanceEvidenceEntry
 *
 * One piece of evidence within a lineage, paired with how it was actually
 * used (`KnowledgeUsageCategory` — retrieved/selected/supplied/cited).
 * Preserves the spec's distinction that not everything retrieved counts
 * as "used" — the usage badge is never collapsed into a generic label.
 */

import { ExternalLink } from "lucide-react"
import { KnowledgeUsageBadge } from "../trace/knowledge-usage-badge"
import type { EvidenceLineageEntry } from "../../neoarc-agentic-contracts/provenance"

export interface ProvenanceEvidenceEntryProps {
  readonly entry: EvidenceLineageEntry
  readonly className?: string
}

export function ProvenanceEvidenceEntry({ entry, className }: ProvenanceEvidenceEntryProps) {
  const { evidence, usage } = entry

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-3 py-2 ${className ?? ""}`}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm text-[var(--neoarc-color-foreground)]">{evidence.label}</span>
        {evidence.sourceLabel ? (
          <span className="truncate text-xs text-[var(--neoarc-color-foreground-subtle)]">{evidence.sourceLabel}</span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <KnowledgeUsageBadge category={usage} />
        {evidence.url ? (
          <a
            href={evidence.url}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)]"
            aria-label={`Open source for ${evidence.label}`}
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </div>
  )
}
