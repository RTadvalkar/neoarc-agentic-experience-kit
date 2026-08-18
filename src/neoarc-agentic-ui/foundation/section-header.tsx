/**
 * neoarc-agentic-ui / foundation / SectionHeader
 *
 * Purpose: consistent title + optional description + optional trailing
 * actions row, reused as the header for panels/cards across every family.
 *
 * Input model: `title`, optional `description`, optional `actions` slot.
 */

import * as React from "react"
import { cn } from "../lib/cn"

export interface SectionHeaderProps {
  readonly title: React.ReactNode
  readonly description?: React.ReactNode
  readonly actions?: React.ReactNode
  readonly className?: string
}

export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="truncate text-sm font-semibold text-[var(--neoarc-color-foreground)]">{title}</h3>
        {description ? (
          <p className="text-sm leading-relaxed text-[var(--neoarc-color-foreground-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
