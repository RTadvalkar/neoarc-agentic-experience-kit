"use client"

import { Badge } from "../primitives/badge"
import type { RelationshipUsageCategory } from "../../neoarc-agentic-contracts/trace"

/**
 * A small badge labeling how one relationship traversal/edge was used.
 * Closed switch over `RelationshipUsageCategory` — importance is never
 * inferred solely from traversal depth, per Gate 5's relationship-usage
 * criterion; only the supplied category drives the label/tone.
 */
export function RelationshipUsageBadge({ category }: { readonly category: RelationshipUsageCategory }) {
  const label: Record<RelationshipUsageCategory, string> = {
    retrieval: "Retrieval",
    context: "Context",
    evidence: "Evidence",
    impact: "Impact",
  }
  const tone: Record<RelationshipUsageCategory, "neutral" | "info" | "warning" | "danger"> = {
    retrieval: "neutral",
    context: "info",
    evidence: "info",
    impact: "warning",
  }
  return <Badge tone={tone[category]}>{label[category]}</Badge>
}
