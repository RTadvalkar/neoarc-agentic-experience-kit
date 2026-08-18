# Integration Guide (Slice 1 — Foundation)

This document is for a **product** integrating the NeoArc Agentic
Experience Kit — not for the kit's own internals. It defines who is
responsible for each step in both supported integration paths, per
`02A §Integration modes`.

## Path A — Direct (most features, most of the time)

```
backend DTO → product adapter → normalized UI view model → controlled component
```

1. **Backend DTO** — whatever shape your service/API actually returns. The
   kit never sees this.
2. **Product adapter** — a function you own (e.g. `toAgentSummary(dto):
   AgentSummary`) that maps your DTO onto a kit contract from
   `src/neoarc-agentic-contracts`. This is where authentication, business
   rules, and redaction decisions live — never inside a kit component.
3. **Normalized view model** — the resulting `AgentSummary`, `ActorSummary`,
   `ContextRef`, etc.
4. **Controlled component** — a `neoarc-agentic-ui` component receiving the
   view model as props and emitting `AgenticUIEvent`s through callbacks.

Use this path for anything that isn't inherently a stream of runtime
events — most identity, status, and metadata display.

## Path B — Event/projection (streaming, replayable experiences)

```
backend/runtime event → product event adapter → AgenticEventEnvelope
  → optional projector → AgenticViewNode → Renderer Registry → controlled component
```

1. **Backend/runtime event** — a webhook payload, SSE/WebSocket message, or
   polled delta from your runtime. The kit never dictates this shape — see
   `02A`: "Do not force product backends to emit NeoArc UI event shapes
   directly."
2. **Product event adapter** — your code, mapping the raw event onto an
   `AgenticEventEnvelope<TPayload>` (`src/neoarc-agentic-contracts/events.ts`).
   You decide `durability` and which `EventCorrelation` ids apply.
3. **Optional projector** — an `AgenticNodeDefinition` (yours or the kit's,
   from Slice 2 onward) turning the envelope into an `AgenticViewNode`. Slice
   1 ships the seam and one worked example
   (`lib/showcase/generic-projector.ts`) for illustration.
4. **Renderer Registry** — resolves `(target, kind)` to a React component.
5. **Controlled component** — renders the node's `data`.

Use this path when you have (or want) replay, live-append convergence, or
multiple simultaneous views (Chat/Activity/Trace/Provenance) of the same
underlying event stream.

## Responsibilities at a glance

| Concern | Owned by |
|---|---|
| Auth, session, backend calls | Product / backend. Never the kit. |
| Deciding what's redacted vs. visible | Product adapter, using `TraceAccessLevel`/`RedactionState` from the kit's contracts as the vocabulary — the kit is not security-authoritative. |
| Mapping DTO → view model | Product adapter. |
| Mapping runtime event → `AgenticEventEnvelope` | Product event adapter. |
| Projecting envelope → `AgenticViewNode` | `AgenticNodeDefinition` (kit-provided for built-in kinds from Slice 2 forward, or product-provided for custom kinds). |
| Resolving node → component | `RendererRegistry` (kit). |
| Rendering | `neoarc-agentic-ui` components (kit). |
| Handling emitted `AgenticUIEvent`s | Product — turn them into real backend calls, then feed results back via props. The kit never assumes success. |

## Adapters are not optional

`neoarc-agentic-ui` components never accept a raw backend DTO as a prop, and
never call a backend directly. If a prop's shape looks like your API
response, you have skipped the adapter step — see `02A`'s explicit
"Reusable code must NOT... hide product/backend state inside components."

## Slice 1 worked example

`app/execution-lab/page.tsx` demonstrates Path B end-to-end using fixture
data (`lib/showcase/fixtures.ts`) standing in for "the backend": fixture
`AgenticEventEnvelope`s are projected via `projectFoundationEvent()`
(`lib/showcase/generic-projector.ts`) into `AgenticViewNode`s, resolved
through `executionLabRendererRegistry`
(`lib/showcase/registry-bootstrap.ts`), and rendered by
`FoundationSummaryCard` or the `GenericAgenticNodeFallback`. This is
showcase-only wiring — see `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md`
for why fixtures never live inside `src/`.
