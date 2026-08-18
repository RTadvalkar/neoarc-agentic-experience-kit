"use client"

import { SectionHeader } from "../foundation/section-header"
import { RelationshipUsageBadge } from "./relationship-usage-badge"
import type { RelationshipUsage } from "../../neoarc-agentic-contracts/trace"

/**
 * Renders one supplied relationship traversal: source → predicate → target,
 * with the usage category as a badge and traversal depth shown only when
 * supplied. Never infers importance from depth alone.
 */
export function RelationshipTrace({ detail }: { readonly detail: RelationshipUsage }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionHeader title="Relationship used" />
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--neoarc-color-foreground)]">
        <span className="font-medium">{detail.sourceEntity}</span>
        <span className="text-[var(--neoarc-color-foreground-muted)]">{detail.predicate}</span>
        <span className="font-medium">{detail.targetEntity}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RelationshipUsageBadge category={detail.usageCategory} />
        {detail.traversalDepth !== undefined ? (
          <span className="text-xs text-[var(--neoarc-color-foreground-muted)]">
            Traversal depth {detail.traversalDepth}
          </span>
        ) : null}
      </div>
    </div>
  )
}
