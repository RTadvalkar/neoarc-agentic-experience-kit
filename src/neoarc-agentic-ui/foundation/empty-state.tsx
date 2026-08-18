/**
 * neoarc-agentic-ui / foundation / EmptyState
 *
 * Purpose: a calm "nothing here yet" state for lists/panels, distinct from
 * `LoadingState` (in progress) and `PermissionBlockedState` (denied).
 *
 * Input model: `title`, optional `description`, optional `icon`, optional
 * `action` slot.
 */

import * as React from "react"
import { Inbox } from "lucide-react"
import { cn } from "../lib/cn"

export interface EmptyStateProps {
  readonly title: React.ReactNode
  readonly description?: React.ReactNode
  readonly icon?: React.ComponentType<{ className?: string }>
  readonly action?: React.ReactNode
  readonly className?: string
}

export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--neoarc-radius-lg)] border border-dashed p-8 text-center",
        "border-[var(--neoarc-color-border)]",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-6 text-[var(--neoarc-color-foreground-subtle)]" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[var(--neoarc-color-foreground)]">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm leading-relaxed text-[var(--neoarc-color-foreground-muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}
