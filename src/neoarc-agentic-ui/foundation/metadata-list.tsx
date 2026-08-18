/**
 * neoarc-agentic-ui / foundation / MetadataList
 *
 * Purpose: render a label/value list (inspector panels, trace detail rows,
 * proposal metadata, ...). Values may be plain nodes or wrapped in
 * `RedactedValue` upstream by the caller — this component does not know
 * about redaction itself, keeping it reusable for any label/value data.
 *
 * Input model: `items: { key, label, value }[]`.
 */

import * as React from "react"
import { cn } from "../lib/cn"

export interface MetadataListItem {
  readonly key: string
  readonly label: React.ReactNode
  readonly value: React.ReactNode
}

export interface MetadataListProps {
  readonly items: readonly MetadataListItem[]
  readonly className?: string
}

export function MetadataList({ items, className }: MetadataListProps) {
  return (
    <dl className={cn("grid grid-cols-[minmax(0,auto)_1fr] gap-x-4 gap-y-2", className)}>
      {items.map((item) => (
        <React.Fragment key={item.key}>
          <dt className="text-xs font-medium text-[var(--neoarc-color-foreground-subtle)]">{item.label}</dt>
          <dd className="min-w-0 text-sm text-[var(--neoarc-color-foreground)]">{item.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}
