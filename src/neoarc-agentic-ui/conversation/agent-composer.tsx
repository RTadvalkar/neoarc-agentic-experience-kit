/**
 * neoarc-agentic-ui / conversation / AgentComposer
 *
 * Purpose: the message input for `AgentConversation`. Manages its own draft
 * text as ephemeral internal UI state (not a normalized data model — see
 * docs/DATA_MODEL.md, draft text is never something a product adapter needs
 * to control) and emits typed semantic UI events for send/stop.
 *
 * Input model: optional `disabled`, `placeholder`, `isResponding` (shows a
 * Stop control in place of Send while an agent response is in flight).
 *
 * Semantic UI events: emits `"conversation.message.send"`
 * (`ConversationMessageSendPayload`) and, while `isResponding`,
 * `"conversation.stop.request"` (`ConversationStopRequestPayload`) — this
 * variant has no specific `messageId` to target, so callers that need
 * per-message stop should use `ResponseActions` on the in-flight message
 * instead; this is the conversation-level "stop the current turn" control.
 */

import * as React from "react"
import { Send, Square } from "lucide-react"
import type { OpaqueId } from "../../neoarc-agentic-contracts/shared"
import type {
  ConversationMessageSendPayload,
  ConversationStopRequestPayload,
} from "../../neoarc-agentic-contracts/conversation-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { cn } from "../lib/cn"

export interface AgentComposerProps {
  readonly disabled?: boolean
  readonly isResponding?: boolean
  readonly respondingMessageId?: OpaqueId
  readonly placeholder?: string
  readonly onEmitSendEvent?: (event: AgenticUIEvent<ConversationMessageSendPayload>) => void
  readonly onEmitStopEvent?: (event: AgenticUIEvent<ConversationStopRequestPayload>) => void
  readonly className?: string
}

export function AgentComposer({
  disabled = false,
  isResponding = false,
  respondingMessageId,
  placeholder = "Message the agent…",
  onEmitSendEvent,
  onEmitStopEvent,
  className,
}: AgentComposerProps) {
  const [draft, setDraft] = React.useState("")

  function submit() {
    const text = draft.trim()
    if (!text || disabled || isResponding) return
    onEmitSendEvent?.(
      createUIEvent({
        type: "conversation.message.send",
        sourceComponent: "AgentComposer",
        payload: { text },
      }),
    )
    setDraft("")
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className={cn(
        "flex items-end gap-2 rounded-[var(--neoarc-radius-lg)] border p-2",
        "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)]",
        className,
      )}
    >
      <label htmlFor="agent-composer-textarea" className="sr-only">
        Message the agent
      </label>
      <textarea
        id="agent-composer-textarea"
        value={draft}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          // Enter submits, Shift+Enter inserts a newline. Guard against CJK
          // IME composition (and Safari's unreliable final composition
          // event, keyCode 229) so confirming a composed character never
          // submits the form early.
          if (event.key !== "Enter" || event.shiftKey) return
          if (event.nativeEvent.isComposing || (event as unknown as { keyCode?: number }).keyCode === 229) return
          event.preventDefault()
          submit()
        }}
        className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-[var(--neoarc-color-foreground)] outline-none placeholder:text-[var(--neoarc-color-foreground-subtle)]"
      />
      {isResponding ? (
        <button
          type="button"
          onClick={() =>
            onEmitStopEvent?.(
              createUIEvent({
                type: "conversation.stop.request",
                sourceComponent: "AgentComposer",
                payload: { messageId: respondingMessageId ?? "" },
              }),
            )
          }
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-muted)] text-[var(--neoarc-color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
          aria-label="Stop response"
        >
          <Square aria-hidden="true" className="size-3.5" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={disabled || draft.trim().length === 0}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--neoarc-radius-md)] bg-[var(--neoarc-color-accent)] text-[var(--neoarc-color-accent-foreground)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
          aria-label="Send message"
        >
          <Send aria-hidden="true" className="size-3.5" />
        </button>
      )}
    </form>
  )
}
