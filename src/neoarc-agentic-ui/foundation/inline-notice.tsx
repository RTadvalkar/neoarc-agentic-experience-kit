/**
 * neoarc-agentic-ui / foundation / InlineNotice
 *
 * Purpose: a calm, explicit inline banner for status/consequence messaging
 * (info/success/warning/danger). Never used for decorative content.
 *
 * Input model: `tone`, `title`, optional `description`, optional
 * `actions` slot.
 */

import * as React from "react"
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import { cn } from "../lib/cn"

export type InlineNoticeTone = "info" | "success" | "warning" | "danger"

export interface InlineNoticeProps {
  readonly tone: InlineNoticeTone
  readonly title: React.ReactNode
  readonly description?: React.ReactNode
  readonly actions?: React.ReactNode
  readonly className?: string
}

const toneConfig: Record<
  InlineNoticeTone,
  { icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  info: {
    icon: Info,
    classes:
      "border-[var(--neoarc-color-info-muted)] bg-[var(--neoarc-color-info-muted)] text-[var(--neoarc-color-info)]",
  },
  success: {
    icon: CircleCheck,
    classes:
      "border-[var(--neoarc-color-success-muted)] bg-[var(--neoarc-color-success-muted)] text-[var(--neoarc-color-success)]",
  },
  warning: {
    icon: TriangleAlert,
    classes:
      "border-[var(--neoarc-color-warning-muted)] bg-[var(--neoarc-color-warning-muted)] text-[var(--neoarc-color-warning)]",
  },
  danger: {
    icon: CircleAlert,
    classes:
      "border-[var(--neoarc-color-danger-muted)] bg-[var(--neoarc-color-danger-muted)] text-[var(--neoarc-color-danger)]",
  },
}

export function InlineNotice({ tone, title, description, actions, className }: InlineNoticeProps) {
  const { icon: Icon, classes } = toneConfig[tone]
  return (
    <div role="status" className={cn("flex items-start gap-3 rounded-[var(--neoarc-radius-md)] border p-3", classes, className)}>
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? <p className="text-sm leading-relaxed opacity-90">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
