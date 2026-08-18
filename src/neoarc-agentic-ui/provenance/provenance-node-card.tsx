/**
 * neoarc-agentic-ui / provenance / ProvenanceNodeCard
 *
 * One lineage node: entity-kind badge, label, and timestamp when supplied.
 * Deliberately terse — the surrounding `ProvenanceLineageList` supplies
 * the ordering and connective structure; this card only ever renders what
 * `ProvenanceNode` actually carries.
 */

import { ProvenanceEntityBadge } from "./provenance-entity-badge"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"
import type { ProvenanceNode } from "../../neoarc-agentic-contracts/provenance"

export interface ProvenanceNodeCardProps {
  readonly node: ProvenanceNode
  readonly selected?: boolean
  readonly onSelect?: (node: ProvenanceNode) => void
  readonly className?: string
}

export function ProvenanceNodeCard({ node, selected, onSelect, className }: ProvenanceNodeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(node)}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-[var(--neoarc-radius-md)] border px-3 py-2 text-left transition-colors",
        selected
          ? "border-[var(--neoarc-color-accent)] bg-[var(--neoarc-color-accent-muted)]"
          : "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] hover:bg-[var(--neoarc-color-surface-muted)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <ProvenanceEntityBadge entityKind={node.entityKind} />
        <span className="truncate text-sm text-[var(--neoarc-color-foreground)]">{node.label}</span>
      </div>
      {node.occurredAt ? <Timestamp value={node.occurredAt} className="shrink-0 text-xs" /> : null}
    </button>
  )
}
