# Data Model (Slice 1 — Foundation, Slice 2 — Conversation & Replay, Slice 5 — Trace & Provenance)

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

## Trace & Provenance models (`trace.ts`, `provenance.ts`, Slice 5)

See `TRACE_MODEL.md`, `PROVENANCE_MODEL.md`, and `TRACE_ACCESS_AND_REDACTION.md`
for the full picture. Summarized here: `trace.ts` models chronological,
forensic execution facts (`TraceEvent`, one per observable event, grouped
by `TraceTurn`/`TraceStep`); `provenance.ts` models lineage instead — the
same underlying facts, connected as a graph rather than a timeline.
Deliberately reuses rather than re-declares: `RunError` (`runtime.ts`),
`ArtifactRef`/`ActivitySummary` (`conversation.ts`), `ToolActionIdentity`
(`human-interaction.ts`), `EvidenceSummary` (`proposal.ts`).

| Type | Key fields | Notes |
|---|---|---|
| `TraceEventKind` | 15-member union (`system-instruction, user-input, context, runtime-recipe, model-policy, resolved-model, knowledge, relationship, tool, agent-activity, human-interaction, proposal, artifact, error, retry`) | No `"reasoning"` kind — chain-of-thought is structurally unrepresentable, not just avoided by convention. |
| `TraceEventDetail` | discriminated union keyed by `kind`, mirroring `TraceEventKind` | Consumers narrow through a closed switch (`TraceInspector`) — never a fallthrough default that guesses shape. |
| `TraceModelRoute` | `modelId, provider?, version?` | Always `AvailableOr`-wrapped in `TraceEventDetail` — resolved-model visibility is permission-aware, not a plain optional field. |
| `KnowledgeUsageCategory` | `retrieved \| selected \| supplied \| cited` | Never collapsed into a single "used" concept — see Gate 5. |
| `KnowledgeUsage` | `knowledgeId?, title?, sourceType?, usageCategory, score?` | `score` is optional and never computed/defaulted when absent. |
| `RelationshipUsageCategory` | `retrieval \| context \| evidence \| impact` | Importance is never inferred solely from traversal — `usageCategory` must be supplied. |
| `RelationshipUsage` | `relationshipId?, sourceEntity, predicate, targetEntity, traversalDepth?, usageCategory` | |
| `HumanInteractionTraceDomain` | `clarification \| execution-permission` | Deliberately excludes business decisions — those project to the separate `"proposal"` `TraceEventKind` so the two approval domains stay visually distinct. |
| `TraceEvent` | `id, occurredAt, detail, actor?, correlation?` | Trace is an append-only chronological log — there is no separate accumulating "trace node" business identity the way a run or task has one; `id` is the event's own identity. |
| `TraceTurn` / `TraceStep` | `id, (turnId,) label?, occurredAt, eventIds` | Stable groupings that reference events by id — never duplicate event content. |
| `ExecutionTraceSummary` | `id, startedAt, completedAt?, status, accessLevel, usage?, timing?` | `accessLevel` documents which `TraceAccessLevel` the supplied data already reflects — descriptive, never enforced by the UI. |
| `ProvenanceEntityKind` | 9-member union (`intent, mission, task, knowledge, relationship, tool, decision, proposal, artifact`) | Mirrors the User Intent → Mission → Agent Task → Knowledge/Relationships/Tools/Decisions → Proposal → Artifact chain. |
| `ProvenanceNode` / `ProvenanceEdge` | `id, entityKind, label, occurredAt?, correlation?` / `id, fromNodeId, toNodeId, relation` | `relation` is a free-form label the adapter supplies — never inferred from node ordering or timing proximity. |
| `ProvenanceLineage` | `nodes, edges` | Only ever contains supplied nodes/edges — an absent edge means absent, never "not yet computed". |
| `EvidenceLineageEntry` / `ArtifactLineageEntry` | `evidence, usage` / `artifact, producedByNodeId?` | Wrap `EvidenceSummary`/`ArtifactRef` rather than duplicating their shape. |

`TraceAccessLevel`/`RedactionState` (`foundation.ts`, listed above) and the
shared `UnavailableReason`/`AvailableOr` (`shared.ts`) are the primitives
Trace/Provenance build on for redaction and honest-absence — see
`TRACE_ACCESS_AND_REDACTION.md`.

## Composition rules

- Every optional/absent value in a normalized contract must be representable
  as "not supplied" — no field silently defaults to a fabricated value.
- New contracts introduced in later slices (conversation, runtime, proposals,
  trace/provenance, evidence) build on top of `shared.ts` and `foundation.ts`
  rather than duplicating `OpaqueId`, `RuntimeStatus`, `RiskLevel`, or
  `TraceAccessLevel`.
- `neoarc-agentic-contracts` never imports React, Next.js, or any transport
  library. It is safe to use from a non-React consumer.
