/**
 * neoarc-agentic-ui / conversation / ConversationEmptyState
 *
 * Purpose: the "nothing here yet" state for an empty `AgentConversation`,
 * distinct from the generic foundation `EmptyState` only in its default
 * copy/icon — composes `EmptyState` rather than duplicating its layout.
 *
 * Input model: optional `title`/`description` overrides.
 */

import * as React from "react"
import { MessageCircle } from "lucide-react"
import { EmptyState } from "../foundation/empty-state"

export interface ConversationEmptyStateProps {
  readonly title?: React.ReactNode
  readonly description?: React.ReactNode
  readonly className?: string
}

export function ConversationEmptyState({
  title = "No messages yet",
  description = "Send a message to start the conversation.",
  className,
}: ConversationEmptyStateProps) {
  return <EmptyState icon={MessageCircle} title={title} description={description} className={className} />
}
