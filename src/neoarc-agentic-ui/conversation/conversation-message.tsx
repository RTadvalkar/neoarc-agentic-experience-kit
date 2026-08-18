/**
 * neoarc-agentic-ui / conversation / ConversationMessage
 *
 * Purpose: route one `ConversationMessage` model to `HumanMessage` or
 * `AgentResponse` based on `author.kind`. Named to match the underlying
 * normalized model (`neoarc-agentic-contracts/conversation.ts`'s
 * `ConversationMessage` interface) per docs/04 §5 component list — a
 * distinct type of the same name, imported here under a local alias to
 * keep the collision unambiguous within this file.
 *
 * Input model: `message: ConversationMessage`, plus every event callback
 * `AgentResponse` accepts (forwarded as-is; `HumanMessage` never emits
 * events, so they are simply unused when `author.kind === "human"`).
 */

import * as React from "react"
import type { ConversationMessage as ConversationMessageModel } from "../../neoarc-agentic-contracts/conversation"
import type { AgentResponseProps } from "./agent-response"
import { AgentResponse } from "./agent-response"
import { HumanMessage } from "./human-message"

export interface ConversationMessageProps
  extends Omit<AgentResponseProps, "message" | "className"> {
  readonly message: ConversationMessageModel
  readonly className?: string
}

export function ConversationMessage({ message, className, ...agentResponseEvents }: ConversationMessageProps) {
  if (message.author.kind === "human") {
    return <HumanMessage message={message} className={className} />
  }
  return <AgentResponse message={message} className={className} {...agentResponseEvents} />
}
