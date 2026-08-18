# Event Model (Slice 1 — Foundation, Slice 2 — Conversation & Replay)

Two distinct event contracts exist in the kit. They are never merged, and
neither is derived from the other's shape.

## 1. `AgenticEventEnvelope` — backend/runtime events (inbound)

Defined in `src/neoarc-agentic-contracts/events.ts`. Produced by a **product
event adapter** translating a backend or runtime event into the kit's
normalized shape — see `INTEGRATION_GUIDE.md`.

```ts
interface AgenticEventEnvelope<TPayload = unknown> {
  id: OpaqueId
  type: string                     // namespaced, free-form, e.g. "foundation.agent.status_changed"
  occurredAt: ISOTimestamp
  sequence?: number                // monotonic ordering hint within a correlation scope
  durability: "durable" | "transient"
  correlation?: EventCorrelation
  payload: TPayload
}

interface EventCorrelation {
  executionTraceId?: OpaqueId
  missionId?: OpaqueId
  runId?: OpaqueId
  turnId?: OpaqueId
  stepId?: OpaqueId
  toolCallId?: OpaqueId
  taskId?: OpaqueId
  proposalId?: OpaqueId
  artifactId?: OpaqueId
}
```

Rules:

- `type` is illustrative, not a closed enum — see
  `docs/16_NORMALIZED_EVENT_VOCABULARY.json` for the vocabulary shape. New
  categories are added by later slices as documented type guards, never by
  widening this envelope.
- `payload` is `unknown` at this layer on purpose. Consumers narrow it with a
  type guard keyed on `type` (see `isEventOfType` in `events.ts`) or, in
  practice, a per-category discriminated union introduced by later slices.
- `durability: "transient"` marks events a live UI may drop without changing
  correctness (e.g. a typing indicator). `"durable"` events must be retained
  for replay/audit.
- Correlation must key off **stable business identity**. Never attach an
  event to "the latest unfinished item" — see `docs/02A §Replayability` and
  `PROJECTION_MODEL.md`.

### Slice 2: the conversation `payload` category

`src/neoarc-agentic-contracts/conversation-events.ts` defines the first
concrete, typed `payload` union: fifteen `conversation.*` event types
(`message.created/delta/completed`, `activity.updated`,
`tool.started/updated/completed`, `clarification.requested/resolved`,
`handoff.requested/completed`, `artifact.produced`, `notice.posted`,
`error.recorded`, `retry.scheduled`) — the exact set
`src/neoarc-agentic-projection/conversation-node-definitions.ts` knows how
to project. This is the pattern later slices follow for their own event
categories: a typed payload union narrowed by `event.type`, never a change
to the envelope shape itself. `lib/showcase/conversation-fixtures.ts` builds
real `AgenticEventEnvelope<ConversationEventPayload>` values from this union
for every Execution Lab conversation scenario.

## 2. `AgenticUIEvent` — semantic UI events (outbound)

Defined in `src/neoarc-agentic-contracts/ui-events.ts`. Emitted by
`neoarc-agentic-ui` components through typed callback props to signal user
intent.

```ts
interface AgenticUIEvent<TPayload = unknown> {
  type: AgenticUIEventType          // e.g. "inspector.node.select"
  occurredAt: ISOTimestamp
  sourceComponent: string           // e.g. "AgentStatusBadge" (for logging/debugging)
  correlation?: EventCorrelation
  payload: TPayload
}

type AgenticUIEventHandler<TPayload = unknown> = (event: AgenticUIEvent<TPayload>) => void
```

Rules:

- Emitting a UI event is **only a signal of intent**. Components never
  assume the action succeeded — they wait for the product/backend to feed
  authoritative state back in through controlled props. This mirrors
  `02B §Human interaction` and stays true for the permission/approval models
  introduced in Slice 3.
- `createUIEvent()` is the only place `occurredAt` defaults (to
  `new Date().toISOString()` if omitted) — components should use this helper
  rather than constructing the object literal by hand, to keep emission
  consistent.
- Slice 1 does not define concrete `AgenticUIEventType` string constants;
  those are introduced alongside the components that emit them. The
  Execution Lab's own `"inspector.node.select"`, emitted from the render
  canvas (`components/showcase/execution-lab/render-canvas.tsx`), is the
  Slice 1 example. Slice 2 adds the first product-facing set, defined in
  `src/neoarc-agentic-contracts/conversation-ui-events.ts`: `"citation.open"`,
  `"artifact.open"`, `"attachment.open"`, `"handoff.open"`,
  `"toolActivity.toggle"`, `"clarification.submit"`,
  `"conversation.message.send"`, `"conversation.stop.request"`,
  `"conversation.retry.request"`. The Execution Lab wires
  `ConversationNodeRenderer`'s `onEmitConversationEvent` into the same live
  event log, so `"citation.open"`, `"artifact.open"`, `"attachment.open"`,
  `"handoff.open"`, `"toolActivity.toggle"`, and `"clarification.submit"`
  are all directly reachable by interacting with rendered scenario nodes.
  `"conversation.message.send"` (`AgentComposer`) and
  `"conversation.stop.request"`/`"conversation.retry.request"`
  (`ResponseActions`, reachable only from a `running`/`failed` message) are
  not currently demoed in the Lab — no fixture scenario reaches a `failed`
  message status, and `AgentComposer` is not composed into the Lab, since
  replay is passive playback rather than live composition. Both remain
  fully implemented, typed, and covered by the component catalog; a future
  slice or a product integration can compose them directly.

## Why two contracts, not one

Collapsing "what happened in the backend" and "what the user just did in the
UI" into one shape would force UI intent through the same
correlation/durability semantics as backend facts, and would tempt product
code into treating a UI event as if it were already an authoritative fact.
Keeping them distinct enforces the read/write separation described in
`02A §Integration modes`.
