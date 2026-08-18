# Event Model (Slice 1 — Foundation)

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
  those are introduced alongside the components that emit them, starting in
  Slice 2. The Execution Lab currently only emits `"inspector.node.select"`
  from the render canvas, logged for inspection — see `RENDER_CANVAS` in
  `components/showcase/execution-lab/render-canvas.tsx`.

## Why two contracts, not one

Collapsing "what happened in the backend" and "what the user just did in the
UI" into one shape would force UI intent through the same
correlation/durability semantics as backend facts, and would tempt product
code into treating a UI event as if it were already an authoritative fact.
Keeping them distinct enforces the read/write separation described in
`02A §Integration modes`.
