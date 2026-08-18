# Data Model (Slice 1 — Foundation, Slice 2 — Conversation & Replay)

Owning package: `src/neoarc-agentic-contracts`. Plain TypeScript, zero
framework/runtime dependencies. Every type here is a **normalized view
model**, never a backend DTO — see `INTEGRATION_GUIDE.md` for the adapter
boundary that produces these values.

## Shared primitives (`shared.ts`)

| Type | Shape | Purpose |
|---|---|---|
| `OpaqueId` | `string` | All entity ids. Consumers must not parse/format/assume structure. |
| `ISOTimestamp` | `string` | ISO-8601 timestamp. |
| `Maybe<T>` | `T \| undefined` | Ordinary optionality. |
| `UnavailableReason` | `"not_supplied" \| "not_available" \| "redacted" \| "insufficient_access"` | Distinguishes *why* a value is missing — never collapsed to a single "unknown". |
| `Unavailable` / `Available<T>` / `AvailableOr<T>` | discriminated union | A field that is either present or explicitly, honestly absent with a reason. |

## Foundation identity & status models (`foundation.ts`)

| Type | Key fields | Notes |
|---|---|---|
| `ActorSummary` | `id, kind (human\|agent\|system\|service), displayName, secondaryLabel?, avatarUrl?, initials?` | Any actor referenced in the UI. |
| `AgentSummary` | `id, displayName, lifecycleStatus, capabilities?, version?` | Distinct from `ActorSummary` — agents carry capability/lifecycle info humans do not. |
| `AgentLifecycleStatus` | `idle \| active \| waiting_for_human \| degraded \| unavailable` | Observed, not inferred. |
| `ContextRef` | `id, kind, label, parent?` | Opaque "where in the product" scope; kit never interprets beyond display. |
| `PermissionSet` | `{ [key: string]: boolean }` | Opaque flags from the product/backend. **Not security-authoritative.** |
| `ActionAvailability` | `actionId, available, reason?, label?` | Whether a specific action can be taken right now, supplied — never inferred client-side. |
| `ActionUnavailableReason` | `permission_denied \| not_supported \| requires_human_review \| runtime_unavailable \| UnavailableReason` | |
| `RuntimeStatus` | `idle \| queued \| running \| waiting_for_human \| completed \| failed \| cancelled \| retrying` | Coarse-grained status reused by agents/runs/tasks in later slices. Vocabulary is aligned with normalized runtime events (`run.completed`, `task.completed`); Slice 4 may still introduce a richer `RunStatus`. |
| `RiskLevel` | `none \| low \| medium \| high \| critical` | Supplied classification; the kit never computes risk. |
| `TraceAccessLevel` | `USER \| OPERATOR \| DEVELOPER \| PLATFORM_ADMIN` | Mirrors `02B` visibility roles. UI-only; not authoritative. |
| `RedactionState` | `redacted, reason?, note?` | Rendered by `RedactedValue` instead of showing/fabricating a value. |

## Event contracts (`events.ts`, `ui-events.ts`)

See `EVENT_MODEL.md` for the full description of `AgenticEventEnvelope`,
`EventCorrelation`, and `AgenticUIEvent`. Summarized here for completeness:

- `AgenticEventEnvelope<TPayload>` — normalized backend/runtime event: `id,
  type, occurredAt, sequence?, durability, correlation?, payload`.
- `EventCorrelation` — optional `executionTraceId, missionId, runId, turnId,
  stepId, toolCallId, taskId, proposalId, artifactId`.
- `AgenticUIEvent<TPayload>` — normalized user-intent event emitted by a
  component: `type, occurredAt, sourceComponent, correlation?, payload`.

## Projection seam types (`neoarc-agentic-projection/types.ts`)

See `PROJECTION_MODEL.md`. Summarized: `AgenticViewTarget`,
`PublicationCadence`, `AgenticViewNodeVisibility`, `AgenticViewNode<TData>`,
`MatchResult`, `ProjectionContext`, `AgenticNodeDefinition<TPayload, TData>`.

## Conversation models (`conversation.ts`, Slice 2)

`ConversationThread.items: readonly ConversationTimelineItem[]` is what
`AgentConversation` renders directly — and, on the projected path, exactly
what `AgenticViewNode<ConversationTimelineItem>.data` holds once
`conversation-node-definitions.ts` projects an event. One shape, two ways
in; see the module doc comment in `conversation.ts` and
`INTEGRATION_GUIDE.md`'s two integration modes.

| Type | Key fields | Notes |
|---|---|---|
| `MessageAuthor` | alias of `ActorSummary` | Kept as a distinct name for call-site clarity; not a duplicated shape. |
| `TextBlock` / `MarkdownBlock` | `kind, text` / `kind, markdown` | `MessageContentBlock` union rendered by `MessageContentRenderer`'s dependency-free formatter — never `dangerouslySetInnerHTML`. |
| `CitationRef` | `id, label, sourceLabel?, url?, retrievedAt?` | Never fabricated; only ever what a message supplies. |
| `AttachmentRef` | `id, name, mimeType?, sizeBytes?, url?` | Metadata only — no inline content assumed safe to preview. |
| `ArtifactRef` | `id, name, artifactType?, version?, status?, url?` | Reused both inline on a message and as the standalone `conversation.artifact` item payload. |
| `ClarificationRequest` | `id, question, options?, resolved, resolution?` | `resolved`/`resolution` are both explicit — never inferred from a later message. |
| `ActivitySummary` | `id, label, occurredAt, status?` | A safe observable summary line, never a chain-of-thought fragment (`docs/TRACEABILITY_PRINCIPLES.md` §1). |
| `ToolActivitySummary` | `id, toolName, status, summary?, startedAt?, completedAt?` | `summary` is the only thing ever rendered — raw tool I/O is never assumed safe. |
| `HandoffSummary` | `id, fromAgent, toAgent, reason?, status` | `fromAgent`/`toAgent` are `ActorSummary`, not duplicated agent fields. |
| `AsyncWorkSummary` | `id, label, status, etaLabel?` | Direct-view-model only — no built-in projected node kind covers this. |
| `ConversationNoticePayload` / `ConversationErrorPayload` / `ConversationRetryPayload` | tone/title/description; message/retryable/causeSummary?; attempt/maxAttempts?/reason?/nextAttemptAt? | The three one-shot, envelope-identified item payloads (see `PROJECTION_MODEL.md`). |
| `ConversationMessage` | `id, author, createdAt, content, citations?, attachments?, artifacts?, status?, streaming?, correlation?` | One shape for both human and agent authors; `author.kind` decides rendering. `streaming: true` marks a message still receiving `conversation.message.delta` events. |
| `ConversationTimelineItem` | discriminated union of 10 kinds | `ConversationItemKind` mirrors the ten built-in projected node kinds 1:1: `user-message, agent-message, activity, tool, clarification, handoff, artifact, notice, error, retry`. |
| `ConversationThread` | `id, items` | The direct-path root value. |

## Composition rules

- Every optional/absent value in a normalized contract must be representable
  as "not supplied" — no field silently defaults to a fabricated value.
- New contracts introduced in later slices (conversation, runtime, proposals,
  trace/provenance, evidence) build on top of `shared.ts` and `foundation.ts`
  rather than duplicating `OpaqueId`, `RuntimeStatus`, `RiskLevel`, or
  `TraceAccessLevel`.
- `neoarc-agentic-contracts` never imports React, Next.js, or any transport
  library. It is safe to use from a non-React consumer.
