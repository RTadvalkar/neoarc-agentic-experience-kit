/**
 * neoarc-agentic-ui / conversation / HumanMessage
 *
 * Purpose: render one human-authored `ConversationMessage`. Kept visually
 * distinct from `AgentResponse` (right-aligned, no citations/tool/handoff
 * chrome — a human message never carries agent-only fields) rather than
 * making one component branch heavily on author kind internally.
 *
 * Input model: `message: ConversationMessage` (author.kind === "human").
 */

import * as React from "react"
import type { ConversationMessage as ConversationMessageModel } from "../../neoarc-agentic-contracts/conversation"
import { AgentAvatar } from "../foundation/agent-avatar"
import { Timestamp } from "../foundation/timestamp"
import { MessageContentRenderer } from "./message-content-renderer"
import { AttachmentList } from "./attachment-list"
import { cn } from "../lib/cn"

export interface HumanMessageProps {
  readonly message: ConversationMessageModel
  readonly className?: string
}

export function HumanMessage({ message, className }: HumanMessageProps) {
  return (
    <div className={cn("flex items-start justify-end gap-3", className)}>
      <div className="flex max-w-[85%] flex-col items-end gap-1.5">
        <div className="rounded-[var(--neoarc-radius-lg)] rounded-tr-[var(--neoarc-radius-sm)] bg-[var(--neoarc-color-accent-muted)] px-3.5 py-2.5 text-[var(--neoarc-color-foreground)]">
          <MessageContentRenderer blocks={message.content} />
        </div>
        {message.attachments && message.attachments.length > 0 ? (
          <AttachmentList attachments={message.attachments} className="w-full max-w-72" />
        ) : null}
        <Timestamp value={message.createdAt} variant="relative" className="text-xs" />
      </div>
      <AgentAvatar
        displayName={message.author.displayName}
        avatarUrl={message.author.avatarUrl}
        initials={message.author.initials}
        kind={message.author.kind}
        size="sm"
      />
    </div>
  )
}
