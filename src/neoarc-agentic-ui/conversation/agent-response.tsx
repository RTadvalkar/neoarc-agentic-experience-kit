/**
 * neoarc-agentic-ui / conversation / AgentResponse
 *
 * Purpose: render one agent-authored `ConversationMessage`, including its
 * streaming state, citations, attachments, artifacts, and stop/retry
 * actions. This is the single place all agent-message chrome composes —
 * `ConversationMessage` (the component) only decides whether to route to
 * this or to `HumanMessage`; it never duplicates this layout.
 *
 * Input model: `message: ConversationMessage` (author.kind !== "human").
 *
 * States: streaming (in-progress, `message.streaming === true`); terminal
 * completed/failed/cancelled (`message.status`); with/without
 * citations/attachments/artifacts.
 *
 * Semantic UI events: forwards `"citation.open"`, `"attachment.open"`,
 * `"artifact.open"` (from the respective child components) and
 * `"conversation.stop.request"` / `"conversation.retry.request"` (from
 * `ResponseActions`).
 */

import * as React from "react"
import type { ConversationMessage as ConversationMessageModel } from "../../neoarc-agentic-contracts/conversation"
import type {
  ArtifactOpenPayload,
  AttachmentOpenPayload,
  CitationOpenPayload,
  ConversationRetryRequestPayload,
  ConversationStopRequestPayload,
} from "../../neoarc-agentic-contracts/conversation-ui-events"
import type { AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { AgentAvatar } from "../foundation/agent-avatar"
import { Timestamp } from "../foundation/timestamp"
import { Spinner } from "../primitives/spinner"
import { MessageContentRenderer } from "./message-content-renderer"
import { CitationGroup } from "./citation-group"
import { AttachmentList } from "./attachment-list"
import { ArtifactReferenceCard } from "./artifact-reference-card"
import { ResponseActions } from "./response-actions"
import { cn } from "../lib/cn"

export interface AgentResponseProps {
  readonly message: ConversationMessageModel
  readonly onEmitCitationEvent?: (event: AgenticUIEvent<CitationOpenPayload>) => void
  readonly onEmitAttachmentEvent?: (event: AgenticUIEvent<AttachmentOpenPayload>) => void
  readonly onEmitArtifactEvent?: (event: AgenticUIEvent<ArtifactOpenPayload>) => void
  readonly onEmitStopEvent?: (event: AgenticUIEvent<ConversationStopRequestPayload>) => void
  readonly onEmitRetryEvent?: (event: AgenticUIEvent<ConversationRetryRequestPayload>) => void
  readonly className?: string
}

export function AgentResponse({
  message,
  onEmitCitationEvent,
  onEmitAttachmentEvent,
  onEmitArtifactEvent,
  onEmitStopEvent,
  onEmitRetryEvent,
  className,
}: AgentResponseProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <AgentAvatar
        displayName={message.author.displayName}
        avatarUrl={message.author.avatarUrl}
        initials={message.author.initials}
        kind={message.author.kind}
        size="sm"
      />
      <div className="flex max-w-[85%] flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--neoarc-color-foreground)]">{message.author.displayName}</span>
          <Timestamp value={message.createdAt} variant="relative" className="text-xs" />
        </div>
        <div className="rounded-[var(--neoarc-radius-lg)] rounded-tl-[var(--neoarc-radius-sm)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-3.5 py-2.5">
          <MessageContentRenderer blocks={message.content} />
          {message.streaming ? (
            <span role="status" className="mt-1 inline-flex items-center gap-1.5">
              <Spinner size="sm" />
              <span className="sr-only">Response is still streaming</span>
            </span>
          ) : null}
        </div>
        {message.citations && message.citations.length > 0 ? (
          <CitationGroup citations={message.citations} onEmitEvent={onEmitCitationEvent} />
        ) : null}
        {message.attachments && message.attachments.length > 0 ? (
          <AttachmentList attachments={message.attachments} onEmitEvent={onEmitAttachmentEvent} className="max-w-96" />
        ) : null}
        {message.artifacts && message.artifacts.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {message.artifacts.map((artifact) => (
              <ArtifactReferenceCard key={artifact.id} artifact={artifact} onEmitEvent={onEmitArtifactEvent} />
            ))}
          </div>
        ) : null}
        <ResponseActions
          messageId={message.id}
          status={message.streaming ? "running" : message.status}
          onEmitStopEvent={onEmitStopEvent}
          onEmitRetryEvent={onEmitRetryEvent}
        />
      </div>
    </div>
  )
}
