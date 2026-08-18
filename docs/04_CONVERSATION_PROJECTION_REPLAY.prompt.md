# Slice 2 — Conversation, Projection, Streaming, and Replay

Continue the greenfield NeoArc Agentic Experience Kit created in Slice 1.

Obey both enabled project instructions.

Do not replatform or rewrite Slice 1.

## Objective

Build an enterprise agent conversation layer supporting:

1. direct normalized message view models;
2. projected conversation nodes from normalized events.

It must remain extensible without a central mega-renderer.

---

# 1. Conversation models

Add/extend normalized contracts for:

```text
ConversationThread
ConversationMessage
MessageAuthor
MessageContentBlock
TextBlock
MarkdownBlock
CitationRef
AttachmentRef
ArtifactRef
ClarificationRequest
ActivitySummary
ToolActivitySummary
HandoffSummary
AsyncWorkSummary
```

Direct view-model rendering must remain possible.

---

# 2. Built-in projected node kinds

Create built-in node kinds similar to:

```text
conversation.user-message
conversation.agent-message
conversation.activity
conversation.tool
conversation.clarification
conversation.handoff
conversation.artifact
conversation.notice
conversation.error
conversation.retry
```

Register their renderers through the renderer registry.

Unknown node kinds must use the generic fallback.

---

# 3. Stable correlation and deterministic replay

Projected node families must:

- use stable business identity;
- explicitly correlate updates;
- never attach updates to "the latest unfinished node";
- replay ordered events deterministically;
- preserve node keys through updates;
- converge between live append and complete replay.

Document this rule.

---

# 4. Streaming

Support a controlled lifecycle such as:

```text
message/node created
→ content/activity updates
→ tool activity may interleave
→ terminal assistant state
```

Use animation-frame publication for high-frequency visual deltas where useful.

Do not implement SSE/WebSocket inside reusable packages.

---

# 5. Components

Create/document:

1. AgentConversation
2. ConversationMessage
3. AgentResponse
4. HumanMessage
5. MessageContentRenderer
6. AgentComposer
7. ClarificationCard
8. ActivitySummaryList
9. ToolActivityDisclosure
10. CitationGroup
11. AttachmentList
12. ArtifactReferenceCard
13. AgentHandoffCard
14. AsyncWorkCard
15. ResponseActions
16. ConversationEmptyState
17. GenericAgenticNodeFallback

---

# 6. Safe activity

Allowed:

```text
Reviewing current requirements
Retrieving approved knowledge
Traversing related decisions
Preparing proposal
Waiting for approval
```

Never render hidden chain-of-thought.

---

# 7. UI semantic events

Add typed events for:

```text
conversation.message.send
conversation.stop.request
conversation.retry.request
clarification.submit
citation.open
artifact.open
handoff.open
toolActivity.toggle
attachment.open
```

---

# 8. Execution Lab replay

Add real replay behavior.

Provide scenarios for:

- empty conversation;
- ordinary exchange;
- streaming assistant;
- tool running/completed;
- clarification pending/resolved;
- retry;
- handoff;
- async work.

Provide controls:

```text
Reset
Replay
Pause
Step Forward
```

Backward navigation may be implemented as reset + replay to target index.

Show:

- event index;
- current event;
- projected state;
- rendered nodes;
- final rendered UI.

---

# 9. Deterministic tests

Add tests/fixtures proving for representative nodes:

```text
complete replay == final incremental append state
```

Also verify stable node identity.

---

# 10. Documentation

Update:

```text
COMPONENT_CATALOG
DATA_MODEL
EVENT_MODEL
PROJECTION_MODEL
INTEGRATION_GUIDE
```

Add wiring docs for:

```text
AgentConversation
AgentComposer
ClarificationCard
ToolActivityDisclosure
```

Run all available checks.

Do not start human approval/proposal work from the next slice.
