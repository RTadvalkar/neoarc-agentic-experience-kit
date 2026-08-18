"use client"

import { Badge } from "../primitives/badge"
import type { KnowledgeUsageCategory } from "../../neoarc-agentic-contracts/trace"

/**
 * A small badge labeling how one piece of knowledge was used. Deliberately
 * a *closed* switch over `KnowledgeUsageCategory` — retrieved/selected/
 * supplied/cited are kept visually distinct rather than collapsed into a
 * single "used" label, per Gate 5's knowledge-usage criterion.
 */
export function KnowledgeUsageBadge({ category }: { readonly category: KnowledgeUsageCategory }) {
  const label: Record<KnowledgeUsageCategory, string> = {
    retrieved: "Retrieved",
    selected: "Selected",
    supplied: "Supplied",
    cited: "Cited",
  }
  const tone: Record<KnowledgeUsageCategory, "neutral" | "info" | "success"> = {
    retrieved: "neutral",
    selected: "info",
    supplied: "info",
    cited: "success",
  }
  return <Badge tone={tone[category]}>{label[category]}</Badge>
}
