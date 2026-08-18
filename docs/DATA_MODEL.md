# Data Model (Slice 1 — Foundation)

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

## Composition rules

- Every optional/absent value in a normalized contract must be representable
  as "not supplied" — no field silently defaults to a fabricated value.
- New contracts introduced in later slices (conversation, runtime, proposals,
  trace/provenance, evidence) build on top of `shared.ts` and `foundation.ts`
  rather than duplicating `OpaqueId`, `RuntimeStatus`, `RiskLevel`, or
  `TraceAccessLevel`.
- `neoarc-agentic-contracts` never imports React, Next.js, or any transport
  library. It is safe to use from a non-React consumer.
