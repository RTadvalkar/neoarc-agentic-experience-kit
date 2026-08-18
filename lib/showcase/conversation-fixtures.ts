/**
 * lib/showcase/conversation-fixtures
 *
 * SHOWCASE-ONLY. Slice 2 conversation scenarios for the Execution Lab
 * (app/execution-lab), covering every scenario docs/04 §8 requires: empty
 * conversation, ordinary exchange, streaming assistant, tool
 * running/completed, clarification pending/resolved, retry, handoff, and
 * async work. Every event here is a real `AgenticEventEnvelope` shaped by
 * `conversation-events.ts` — the Execution Lab feeds these through the
 * exact same `applyEvents`/`applyEvent` reducer
 * (`neoarc-agentic-projection/projection-store.ts`) and built-in
 * `conversationNodeDefinitions` a real product integration would use. Mock
 * data lives here, outside any reusable `src/neoarc-agentic-*` package, per
 * docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md.
 */

import type { AgenticEventEnvelope } from "../../src/neoarc-agentic-contracts/events"
import type { AgentSummary, ContextRef } from "../../src/neoarc-agentic-contracts/foundation"
import type { ConversationEventPayload } from "../../src/neoarc-agentic-contracts/conversation-events"
import type { MessageAuthor } from "../../src/neoarc-agentic-contracts/conversation"

export interface ConversationExecutionLabScenario {
  readonly family: "conversation"
  readonly id: string
  readonly label: string
  readonly description: string
  readonly agent: AgentSummary
  readonly context: ContextRef
  readonly events: readonly AgenticEventEnvelope<ConversationEventPayload>[]
}

const supportAgent: AgentSummary = {
  id: "agent-nova",
  displayName: "Nova",
  description: "Support agent",
  lifecycleStatus: "active",
  capabilities: ["knowledge-retrieval", "ticket-drafting"],
  version: "2.1.0",
}

const humanAuthor: MessageAuthor = { id: "user-jordan", kind: "human", displayName: "Jordan" }
const novaAuthor: MessageAuthor = { id: "agent-nova", kind: "agent", displayName: "Nova" }

const workspaceContext: ContextRef = { id: "ctx-workspace", kind: "workspace", label: "Acme Platform" }
const supportContext: ContextRef = { id: "ctx-support", kind: "section", label: "Support", parent: workspaceContext }

function envelope<TPayload extends ConversationEventPayload>(
  input: Omit<AgenticEventEnvelope<TPayload>, "durability"> & { durability?: AgenticEventEnvelope<TPayload>["durability"] },
): AgenticEventEnvelope<TPayload> {
  return { durability: "durable", ...input }
}

export const conversationExecutionLabScenarios: readonly ConversationExecutionLabScenario[] = [
  {
    family: "conversation",
    id: "conversation-empty",
    label: "Empty conversation",
    description: "No events yet. Proves `ConversationEmptyState` renders before any turn begins.",
    agent: supportAgent,
    context: supportContext,
    events: [],
  },
  {
    family: "conversation",
    id: "conversation-ordinary-exchange",
    label: "Ordinary exchange",
    description: "A human message followed by a complete agent reply with citations. No streaming deltas.",
    agent: supportAgent,
    context: supportContext,
    events: [
      envelope({
        id: "evt-oe-1",
        type: "conversation.message.created",
        occurredAt: "2026-08-18T10:00:00.000Z",
        sequence: 1,
        correlation: { turnId: "turn-1" },
        payload: { messageId: "msg-1", author: humanAuthor, initialContent: [{ kind: "text", text: "What is our refund window?" }] },
      }),
      envelope({
        id: "evt-oe-2",
        type: "conversation.message.completed",
        occurredAt: "2026-08-18T10:00:01.000Z",
        sequence: 2,
        correlation: { turnId: "turn-1" },
        payload: { messageId: "msg-1", status: "completed" },
      }),
      envelope({
        id: "evt-oe-3",
        type: "conversation.message.created",
        occurredAt: "2026-08-18T10:00:03.000Z",
        sequence: 3,
        correlation: { turnId: "turn-2" },
        payload: {
          messageId: "msg-2",
          author: novaAuthor,
          initialContent: [{ kind: "text", text: "Standard refunds are available within 30 days of purchase." }],
        },
      }),
      envelope({
        id: "evt-oe-4",
        type: "conversation.message.completed",
        occurredAt: "2026-08-18T10:00:04.000Z",
        sequence: 4,
        correlation: { turnId: "turn-2" },
        payload: {
          messageId: "msg-2",
          status: "completed",
          citations: [{ id: "cit-1", label: "Refund policy", sourceLabel: "Help Center", url: "https://example.com/refunds" }],
        },
      }),
    ],
  },
  {
    family: "conversation",
    id: "conversation-streaming-assistant",
    label: "Streaming assistant",
    description: "Agent message created, then appended via three content deltas, then completed. Proves live-append text merging.",
    agent: supportAgent,
    context: supportContext,
    events: [
      envelope({
        id: "evt-sa-1",
        type: "conversation.message.created",
        occurredAt: "2026-08-18T10:05:00.000Z",
        sequence: 1,
        correlation: { turnId: "turn-3" },
        payload: { messageId: "msg-3", author: novaAuthor },
      }),
      envelope({
        id: "evt-sa-2",
        type: "conversation.message.delta",
        occurredAt: "2026-08-18T10:05:01.000Z",
        sequence: 2,
        correlation: { turnId: "turn-3" },
        payload: { messageId: "msg-3", delta: { kind: "text", text: "Let me check your account." } },
      }),
      envelope({
        id: "evt-sa-3",
        type: "conversation.message.delta",
        occurredAt: "2026-08-18T10:05:02.000Z",
        sequence: 3,
        correlation: { turnId: "turn-3" },
        payload: { messageId: "msg-3", delta: { kind: "text", text: " Your last order shipped yesterday." } },
      }),
      envelope({
        id: "evt-sa-4",
        type: "conversation.message.delta",
        occurredAt: "2026-08-18T10:05:03.000Z",
        sequence: 4,
        correlation: { turnId: "turn-3" },
        payload: { messageId: "msg-3", delta: { kind: "text", text: " It should arrive within two business days." } },
      }),
      envelope({
        id: "evt-sa-5",
        type: "conversation.message.completed",
        occurredAt: "2026-08-18T10:05:04.000Z",
        sequence: 5,
        correlation: { turnId: "turn-3" },
        payload: { messageId: "msg-3", status: "completed" },
      }),
    ],
  },
  {
    family: "conversation",
    id: "conversation-tool-activity",
    label: "Tool running / completed",
    description: "A safe activity summary, then a tool invocation moving from running to completed, interleaved with the reply it supports.",
    agent: supportAgent,
    context: supportContext,
    events: [
      envelope({
        id: "evt-ta-1",
        type: "conversation.activity.updated",
        occurredAt: "2026-08-18T10:10:00.000Z",
        sequence: 1,
        correlation: { turnId: "turn-4" },
        payload: { activity: { id: "activity-1", label: "Retrieving approved knowledge", occurredAt: "2026-08-18T10:10:00.000Z", status: "running" } },
      }),
      envelope({
        id: "evt-ta-2",
        type: "conversation.tool.started",
        occurredAt: "2026-08-18T10:10:01.000Z",
        sequence: 2,
        correlation: { turnId: "turn-4", toolCallId: "tool-1" },
        payload: { tool: { id: "tool-1", toolName: "order-lookup", status: "running", startedAt: "2026-08-18T10:10:01.000Z" } },
      }),
      envelope({
        id: "evt-ta-3",
        type: "conversation.tool.completed",
        occurredAt: "2026-08-18T10:10:03.000Z",
        sequence: 3,
        correlation: { turnId: "turn-4", toolCallId: "tool-1" },
        payload: {
          tool: {
            id: "tool-1",
            toolName: "order-lookup",
            status: "completed",
            summary: "Found order #48213",
            startedAt: "2026-08-18T10:10:01.000Z",
            completedAt: "2026-08-18T10:10:03.000Z",
          },
        },
      }),
      envelope({
        id: "evt-ta-4",
        type: "conversation.message.created",
        occurredAt: "2026-08-18T10:10:04.000Z",
        sequence: 4,
        correlation: { turnId: "turn-4" },
        payload: {
          messageId: "msg-4",
          author: novaAuthor,
          initialContent: [{ kind: "text", text: "Order #48213 is out for delivery today." }],
        },
      }),
      envelope({
        id: "evt-ta-5",
        type: "conversation.message.completed",
        occurredAt: "2026-08-18T10:10:05.000Z",
        sequence: 5,
        correlation: { turnId: "turn-4" },
        payload: { messageId: "msg-4", status: "completed" },
      }),
    ],
  },
  {
    family: "conversation",
    id: "conversation-clarification",
    label: "Clarification pending / resolved",
    description: "The agent asks a clarifying question, then the human resolves it, then the agent replies.",
    agent: supportAgent,
    context: supportContext,
    events: [
      envelope({
        id: "evt-cl-1",
        type: "conversation.clarification.requested",
        occurredAt: "2026-08-18T10:15:00.000Z",
        sequence: 1,
        correlation: { turnId: "turn-5" },
        payload: {
          clarification: {
            id: "clarification-1",
            question: "Which order would you like to cancel?",
            options: ["#48213", "#48097"],
            resolved: false,
          },
        },
      }),
      envelope({
        id: "evt-cl-2",
        type: "conversation.clarification.resolved",
        occurredAt: "2026-08-18T10:15:12.000Z",
        sequence: 2,
        correlation: { turnId: "turn-5" },
        payload: { clarificationId: "clarification-1", resolution: "#48097" },
      }),
      envelope({
        id: "evt-cl-3",
        type: "conversation.message.created",
        occurredAt: "2026-08-18T10:15:13.000Z",
        sequence: 3,
        correlation: { turnId: "turn-5" },
        payload: { messageId: "msg-5", author: novaAuthor, initialContent: [{ kind: "text", text: "Order #48097 has been cancelled." }] },
      }),
      envelope({
        id: "evt-cl-4",
        type: "conversation.message.completed",
        occurredAt: "2026-08-18T10:15:14.000Z",
        sequence: 4,
        correlation: { turnId: "turn-5" },
        payload: { messageId: "msg-5", status: "completed" },
      }),
    ],
  },
  {
    family: "conversation",
    id: "conversation-retry",
    label: "Retry",
    description: "A message fails, a retry is scheduled and explained, then the retried attempt completes.",
    agent: supportAgent,
    context: supportContext,
    events: [
      envelope({
        id: "evt-rt-1",
        type: "conversation.message.created",
        occurredAt: "2026-08-18T10:20:00.000Z",
        sequence: 1,
        correlation: { turnId: "turn-6" },
        payload: { messageId: "msg-6", author: novaAuthor },
      }),
      envelope({
        id: "evt-rt-2",
        type: "conversation.error.recorded",
        occurredAt: "2026-08-18T10:20:02.000Z",
        sequence: 2,
        correlation: { turnId: "turn-6" },
        payload: { error: { message: "Order system timed out.", retryable: true, causeSummary: "Upstream order service did not respond in time." } },
      }),
      envelope({
        id: "evt-rt-3",
        type: "conversation.retry.scheduled",
        occurredAt: "2026-08-18T10:20:03.000Z",
        sequence: 3,
        correlation: { turnId: "turn-6" },
        payload: { retry: { attempt: 1, maxAttempts: 3, reason: "Upstream order service timeout", nextAttemptAt: "2026-08-18T10:20:05.000Z" } },
      }),
      envelope({
        id: "evt-rt-4",
        type: "conversation.message.completed",
        occurredAt: "2026-08-18T10:20:06.000Z",
        sequence: 4,
        correlation: { turnId: "turn-6" },
        payload: { messageId: "msg-6", status: "completed" },
      }),
    ],
  },
  {
    family: "conversation",
    id: "conversation-handoff",
    label: "Handoff",
    description: "Nova hands off to a billing specialist agent, then the handoff completes.",
    agent: supportAgent,
    context: supportContext,
    events: [
      envelope({
        id: "evt-ho-1",
        type: "conversation.handoff.requested",
        occurredAt: "2026-08-18T10:25:00.000Z",
        sequence: 1,
        correlation: { turnId: "turn-7" },
        payload: {
          handoff: {
            id: "handoff-1",
            fromAgent: { id: "agent-nova", kind: "agent", displayName: "Nova" },
            toAgent: { id: "agent-billing", kind: "agent", displayName: "Billing specialist" },
            reason: "Requires billing system access outside Nova's permissions",
            status: "running",
          },
        },
      }),
      envelope({
        id: "evt-ho-2",
        type: "conversation.handoff.completed",
        occurredAt: "2026-08-18T10:25:20.000Z",
        sequence: 2,
        correlation: { turnId: "turn-7" },
        payload: { handoffId: "handoff-1", status: "completed" },
      }),
    ],
  },
  {
    family: "conversation",
    id: "conversation-async-work",
    label: "Async work",
    description: "The agent posts a notice that work continues outside this turn, then produces an artifact once that work finishes.",
    agent: supportAgent,
    context: supportContext,
    events: [
      envelope({
        id: "evt-aw-1",
        type: "conversation.notice.posted",
        occurredAt: "2026-08-18T10:30:00.000Z",
        sequence: 1,
        correlation: { turnId: "turn-8", taskId: "task-1" },
        payload: { notice: { tone: "info", title: "Generating your account statement", description: "This can take a few minutes — you can leave this conversation." } },
      }),
      envelope({
        id: "evt-aw-2",
        type: "conversation.artifact.produced",
        occurredAt: "2026-08-18T10:32:10.000Z",
        sequence: 2,
        correlation: { turnId: "turn-8", taskId: "task-1" },
        payload: { artifact: { id: "artifact-1", name: "Account statement — July 2026", artifactType: "document", status: "completed", url: "https://example.com/statements/july-2026" } },
      }),
    ],
  },
]
