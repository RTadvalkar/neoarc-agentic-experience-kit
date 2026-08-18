/**
 * lib/showcase/conversation-gallery-fixtures
 *
 * SHOWCASE-ONLY. Direct-view-model fixtures for the Component Gallery's
 * Slice 2 conversation section (component-gallery.tsx). These exercise
 * every `src/neoarc-agentic-ui/conversation` component by constructing
 * `ConversationTimelineItem`/`ConversationThread` values directly, with NO
 * `AgenticEventEnvelope` or projection step involved — proving the direct
 * view-model integration mode from docs/04 §1 ("Direct view-model rendering
 * must remain possible") independently of the Scenario Replay tab's
 * projected-event path. Mock data only; never imported by
 * `src/neoarc-agentic-ui`.
 */

import type {
  ActivitySummary,
  ArtifactRef,
  AsyncWorkSummary,
  AttachmentRef,
  CitationRef,
  ClarificationRequest,
  ConversationMessage,
  ConversationThread,
  HandoffSummary,
  ToolActivitySummary,
} from "../../src/neoarc-agentic-contracts/conversation"

export const galleryHumanMessage: ConversationMessage = {
  id: "gallery-msg-human",
  author: { id: "gallery-user", kind: "human", displayName: "Priya Shah" },
  createdAt: "2026-08-18T09:00:00.000Z",
  content: [{ kind: "text", text: "Can you summarize the checkout redesign proposal?" }],
  status: "completed",
}

export const galleryAgentMessage: ConversationMessage = {
  id: "gallery-msg-agent",
  author: { id: "agent-gallery-ava", kind: "agent", displayName: "Ava" },
  createdAt: "2026-08-18T09:00:04.000Z",
  content: [
    { kind: "markdown", markdown: "The proposal **reduces checkout steps from 4 to 2** and adds saved payment methods." },
  ],
  status: "completed",
  citations: [
    { id: "gallery-cit-1", label: "Checkout redesign RFC", sourceLabel: "Internal docs", url: "https://example.com/rfc/checkout" },
  ],
  attachments: [{ id: "gallery-att-1", name: "checkout-flow.png", mimeType: "image/png", sizeBytes: 245_000 }],
  artifacts: [{ id: "gallery-art-1", name: "Checkout flow diagram", artifactType: "diagram", status: "completed" }],
}

export const galleryStreamingAgentMessage: ConversationMessage = {
  id: "gallery-msg-streaming",
  author: { id: "agent-gallery-ava", kind: "agent", displayName: "Ava" },
  createdAt: "2026-08-18T09:01:00.000Z",
  content: [{ kind: "text", text: "Let me pull the latest metrics" }],
  streaming: true,
}

export const galleryCitations: readonly CitationRef[] = [
  { id: "gallery-cit-1", label: "Checkout redesign RFC", sourceLabel: "Internal docs", url: "https://example.com/rfc/checkout" },
  { id: "gallery-cit-2", label: "Q2 conversion report", sourceLabel: "Analytics" },
]

export const galleryAttachments: readonly AttachmentRef[] = [
  { id: "gallery-att-1", name: "checkout-flow.png", mimeType: "image/png", sizeBytes: 245_000 },
  { id: "gallery-att-2", name: "notes.txt", mimeType: "text/plain" },
]

export const galleryArtifact: ArtifactRef = {
  id: "gallery-art-1",
  name: "Checkout flow diagram",
  artifactType: "diagram",
  version: "v3",
  status: "completed",
  url: "https://example.com/artifacts/checkout-flow",
}

export const galleryClarificationPending: ClarificationRequest = {
  id: "gallery-clarification-pending",
  question: "Which checkout variant should the proposal target?",
  options: ["Guest checkout", "Account-required checkout"],
  resolved: false,
}

export const galleryClarificationResolved: ClarificationRequest = {
  ...galleryClarificationPending,
  id: "gallery-clarification-resolved",
  resolved: true,
  resolution: "Guest checkout",
}

export const galleryActivitySummaries: readonly ActivitySummary[] = [
  { id: "gallery-activity-1", label: "Reviewing current requirements", occurredAt: "2026-08-18T09:00:01.000Z", status: "completed" },
  { id: "gallery-activity-2", label: "Retrieving approved knowledge", occurredAt: "2026-08-18T09:00:02.000Z", status: "running" },
  { id: "gallery-activity-3", label: "Preparing proposal", occurredAt: "2026-08-18T09:00:03.000Z", status: "queued" },
]

export const galleryToolRunning: ToolActivitySummary = {
  id: "gallery-tool-running",
  toolName: "order-lookup",
  status: "running",
  startedAt: "2026-08-18T09:00:05.000Z",
}

export const galleryToolCompleted: ToolActivitySummary = {
  id: "gallery-tool-completed",
  toolName: "order-lookup",
  status: "completed",
  summary: "Found order #48213",
  startedAt: "2026-08-18T09:00:05.000Z",
  completedAt: "2026-08-18T09:00:07.000Z",
}

export const galleryHandoffRunning: HandoffSummary = {
  id: "gallery-handoff-running",
  fromAgent: { id: "agent-gallery-ava", kind: "agent", displayName: "Ava" },
  toAgent: { id: "agent-gallery-billing", kind: "agent", displayName: "Billing specialist" },
  reason: "Requires billing system access outside Ava's permissions",
  status: "running",
}

export const galleryHandoffCompleted: HandoffSummary = {
  ...galleryHandoffRunning,
  id: "gallery-handoff-completed",
  status: "completed",
}

export const galleryAsyncWork: AsyncWorkSummary = {
  id: "gallery-async-work",
  label: "Generating account statement",
  status: "running",
  etaLabel: "About 2 minutes remaining",
}

/** A small direct-view-model `ConversationThread` — no events, no projection. */
export const galleryConversationThread: ConversationThread = {
  id: "gallery-thread-1",
  items: [
    { kind: "user-message", id: "gallery-item-1", createdAt: galleryHumanMessage.createdAt, message: galleryHumanMessage },
    { kind: "activity", id: "gallery-item-2", createdAt: "2026-08-18T09:00:02.000Z", activity: galleryActivitySummaries[1] },
    { kind: "agent-message", id: "gallery-item-3", createdAt: galleryAgentMessage.createdAt, message: galleryAgentMessage },
  ],
}
