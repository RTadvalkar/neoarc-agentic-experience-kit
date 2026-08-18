/**
 * neoarc-agentic-ui / conversation / ResponseActions
 *
 * Purpose: the small action row under an in-progress or failed agent
 * response — "Stop" while `status` is `"running"`, "Retry" while `status`
 * is `"failed"`. Renders nothing for any other status; the kit never shows
 * an action the current state does not honestly support.
 *
 * Semantic UI events: emits `"conversation.stop.request"`
 * (`ConversationStopRequestPayload`) and `"conversation.retry.request"`
 * (`ConversationRetryRequestPayload`). Emitting either is a request only —
 * the product adapter owns whether the backend actually stops/retries and
 * must feed the authoritative result back through `status`.
 */

import * as React from "react"
import { RotateCcw, Square } from "lucide-react"
import type { OpaqueId } from "../../neoarc-agentic-contracts/shared"
import type { RuntimeStatus } from "../../neoarc-agentic-contracts/foundation"
import type {
  ConversationRetryRequestPayload,
  ConversationStopRequestPayload,
} from "../../neoarc-agentic-contracts/conversation-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { cn } from "../lib/cn"

export interface ResponseActionsProps {
  readonly messageId: OpaqueId
  readonly status?: RuntimeStatus
  readonly onEmitStopEvent?: (event: AgenticUIEvent<ConversationStopRequestPayload>) => void
  readonly onEmitRetryEvent?: (event: AgenticUIEvent<ConversationRetryRequestPayload>) => void
  readonly className?: string
}

const actionButtonClasses = cn(
  "inline-flex items-center gap-1.5 rounded-[var(--neoarc-radius-md)] border px-2.5 py-1 text-xs font-medium",
  "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground-muted)]",
  "hover:text-[var(--neoarc-color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
)

export function ResponseActions({
  messageId,
  status,
  onEmitStopEvent,
  onEmitRetryEvent,
  className,
}: ResponseActionsProps) {
  if (status === "running" || status === "queued") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          type="button"
          className={actionButtonClasses}
          onClick={() =>
            onEmitStopEvent?.(
              createUIEvent({
                type: "conversation.stop.request",
                sourceComponent: "ResponseActions",
                payload: { messageId },
              }),
            )
          }
        >
          <Square aria-hidden="true" className="size-3" />
          Stop
        </button>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          type="button"
          className={actionButtonClasses}
          onClick={() =>
            onEmitRetryEvent?.(
              createUIEvent({
                type: "conversation.retry.request",
                sourceComponent: "ResponseActions",
                payload: { messageId },
              }),
            )
          }
        >
          <RotateCcw aria-hidden="true" className="size-3" />
          Retry
        </button>
      </div>
    )
  }

  return null
}
