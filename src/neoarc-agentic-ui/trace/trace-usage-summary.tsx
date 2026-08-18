"use client"

import { MetadataList } from "../foundation/metadata-list"
import type { TraceUsage } from "../../neoarc-agentic-contracts/trace"

/** Renders supplied token/cost usage facts. Every field is optional and omitted entirely (never shown as "0" or "unknown") when not supplied. */
export function TraceUsageSummary({ usage }: { readonly usage: TraceUsage | undefined }) {
  if (!usage) return null
  const items = [
    usage.inputTokens !== undefined
      ? { key: "input-tokens", label: "Input tokens", value: usage.inputTokens.toLocaleString() }
      : null,
    usage.outputTokens !== undefined
      ? { key: "output-tokens", label: "Output tokens", value: usage.outputTokens.toLocaleString() }
      : null,
    usage.totalTokens !== undefined
      ? { key: "total-tokens", label: "Total tokens", value: usage.totalTokens.toLocaleString() }
      : null,
    usage.costLabel ? { key: "cost", label: "Cost", value: usage.costLabel } : null,
  ].filter((item): item is { key: string; label: string; value: string } => item !== null)

  if (items.length === 0) return null
  return <MetadataList items={items} />
}
