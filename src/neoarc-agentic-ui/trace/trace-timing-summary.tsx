"use client"

import { MetadataList } from "../foundation/metadata-list"
import type { TraceTiming } from "../../neoarc-agentic-contracts/trace"

/** Renders supplied latency facts. Every field is optional and omitted entirely when not supplied — never computed by the kit. */
export function TraceTimingSummary({ timing }: { readonly timing: TraceTiming | undefined }) {
  if (!timing) return null
  const items = [
    timing.queuedMs !== undefined ? { key: "queued", label: "Queued", value: `${timing.queuedMs}ms` } : null,
    timing.runningMs !== undefined ? { key: "running", label: "Running", value: `${timing.runningMs}ms` } : null,
    timing.totalMs !== undefined ? { key: "total", label: "Total", value: `${timing.totalMs}ms` } : null,
  ].filter((item): item is { key: string; label: string; value: string } => item !== null)

  if (items.length === 0) return null
  return <MetadataList items={items} />
}
