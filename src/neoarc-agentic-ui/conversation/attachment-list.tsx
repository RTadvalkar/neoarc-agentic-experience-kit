/**
 * neoarc-agentic-ui / conversation / AttachmentList
 *
 * Purpose: render a message's supplied `AttachmentRef[]`. Never assumes
 * file content is safe to preview inline — only shows name/type/size, and
 * defers to the product adapter (via the emitted event) to decide how
 * opening an attachment is handled.
 *
 * Semantic UI events: emits `"attachment.open"` (`AttachmentOpenPayload`).
 */

import * as React from "react"
import { Paperclip } from "lucide-react"
import type { AttachmentRef } from "../../neoarc-agentic-contracts/conversation"
import type { AttachmentOpenPayload } from "../../neoarc-agentic-contracts/conversation-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { cn } from "../lib/cn"

export interface AttachmentListProps {
  readonly attachments: readonly AttachmentRef[]
  readonly onEmitEvent?: (event: AgenticUIEvent<AttachmentOpenPayload>) => void
  readonly className?: string
}

function formatSize(bytes?: number): string | undefined {
  if (bytes === undefined) return undefined
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentList({ attachments, onEmitEvent, className }: AttachmentListProps) {
  if (attachments.length === 0) return null

  return (
    <ul className={cn("flex flex-col gap-1", className)} aria-label="Attachments">
      {attachments.map((attachment) => (
        <li key={attachment.id}>
          <button
            type="button"
            onClick={() =>
              onEmitEvent?.(
                createUIEvent({
                  type: "attachment.open",
                  sourceComponent: "AttachmentList",
                  payload: { attachmentId: attachment.id },
                }),
              )
            }
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--neoarc-radius-md)] border px-2.5 py-1.5 text-left text-sm",
              "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground)]",
              "hover:bg-[var(--neoarc-color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
            )}
          >
            <Paperclip aria-hidden="true" className="size-3.5 shrink-0 text-[var(--neoarc-color-foreground-subtle)]" />
            <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
            {attachment.sizeBytes !== undefined ? (
              <span className="shrink-0 text-xs text-[var(--neoarc-color-foreground-subtle)]">
                {formatSize(attachment.sizeBytes)}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  )
}
