# NeoArc Agentic Experience Kit — Cursor Wiring Blueprint

This document is the durable architecture target for later integration, even if Cursor rewrites implementation details.

---

# 1. Reusable layers

```text
neoarc-agentic-contracts
neoarc-agentic-projection   optional
neoarc-agentic-ui
```

The UI must remain usable without projection.

---

# 2. Direct integration path

Use for snapshot-oriented UI.

```text
Backend DTO
   ↓
Generated/product API client
   ↓
Product-specific adapter
   ↓
Normalized NeoArc view model
   ↓
Controlled component
```

Avoid:

```ts
ProposalCard(props: OpenApiGeneratedProposalResponseDTO)
```

Prefer:

```ts
ProposalCard({
  proposal: ProposalSummary,
  onEvent
})
```

---

# 3. Event/projection path

Use for streaming/replay/trace/runtime.

```text
Backend/runtime event
   ↓
Product event adapter
   ↓
AgenticEventEnvelope
   ↓
Projection
   ↓
AgenticViewNode
   ↓
Renderer registry
   ↓
Reusable component
```

Backend services do not need to emit UI event names natively.

---

# 4. Semantic user action path

```text
User interaction
   ↓
Reusable component
   ↓
AgenticUIEvent
   ↓
Product handler
   ↓
authorization/concurrency/business validation
   ↓
Backend command/API
   ↓
Authoritative result/event
   ↓
Adapter
   ↓
Updated UI state
```

Never make the component authoritative.

---

# 5. Product ownership boundaries

## Kit owns

- normalized UI contracts;
- normalized event envelope;
- optional projection;
- node contracts;
- renderer registry;
- surface registry;
- semantic UI events;
- visual state;
- accessibility;
- replay fixtures/reference behavior.

## Product application owns

- routing;
- authentication;
- authorization source;
- generated API clients;
- API DTOs;
- product adapters;
- SSE/WebSocket/polling;
- application cache/store;
- command handlers;
- navigation;
- telemetry policy.

## Backend owns

- authoritative mission/run/proposal state;
- persistence;
- concurrency;
- policy;
- agent orchestration;
- tool execution;
- model resolution;
- knowledge truth;
- relationship truth;
- evidence truth;
- business approval/finalization;
- data visibility/redaction decisions.

---

# 6. Correlation

Prefer a shared:

```text
executionTraceId
```

plus optional:

```text
missionId
runId
turnId
stepId
toolCallId
taskId
proposalId
artifactId
```

Do not require every source to provide every id.

---

# 7. Replay

Projection code must be deterministic over normalized ordered events.

For important node families test:

```text
replay(all events)
==
state produced by incremental append of the same events
```

Preserve stable node keys.

---

# 8. Renderer extension

Adding a new product-specific agentic node should conceptually require:

```text
1. normalized payload type
2. stable node kind
3. projector/node definition if event driven
4. renderer registration
5. optional Activity renderer
6. optional Trace renderer
7. optional Provenance renderer
8. semantic UI events
9. wiring documentation
```

Avoid central mega-switches.

---

# 9. Surface extension

Products should extend declared UI surfaces rather than fork major composite components.

Examples:

```text
TestCopilot
→ relationship inspector tab

NeoArc Platform
→ metering/agent-policy inspector tab

Cursor integration
→ tool/file-change renderer
```

---

# 10. Execution permission vs business approval

Keep separate contracts.

## Execution permission

```text
May this tool/action proceed?
```

Examples:

```text
allowed_once
rejected
cancelled
unavailable
```

## Business approval

```text
Should this proposal/change become authoritative?
```

Examples:

```text
approve/apply
refine
reject
defer
override
```

---

# 11. Traceability

Capture observable/supplied execution provenance:

- instruction identity/version;
- user input;
- context;
- runtime recipe/version;
- model policy/version;
- resolved model route;
- knowledge usage;
- relationship usage;
- tools;
- agent/tasks;
- human interactions;
- proposals;
- evidence;
- artifacts;
- timing;
- usage;
- errors/retries.

Do not capture hidden chain-of-thought.

---

# 12. Knowledge usage

Preserve:

```text
retrieved
selected
supplied
cited
```

Do not call every retrieved item "used".

---

# 13. Relationship usage

Capture supplied:

```text
source
predicate
target
optional traversal depth
usage category
```

Do not infer semantic importance automatically.

---

# 14. Trace access/redaction

Client UI is not security-authoritative.

Product/backend adapter decides what is present/redacted.

UI supports:

```text
not supplied
not available
redacted
insufficient access
```

---

# 15. Streaming

Transport remains product-owned.

Conceptual:

```ts
stream.onEvent(raw => {
  const normalized = adapter.toAgenticEvent(raw)
  projector.append(normalized)
})
```

Use animation-frame publication for high-frequency visual deltas where useful.

---

# 16. Recommended Cursor integration order

Do not integrate the entire kit into a NeoArc product in one refactor.

Recommended order:

```text
1. ProposalCard
2. EvidenceDrawer
3. AgentConversation
4. Runtime Mission/Run
5. Trace
6. Provenance
7. product-specific renderer/surface extensions
```

For each vertical slice:

1. map real backend DTO/event;
2. implement product adapter;
3. render normalized component;
4. capture semantic UI event;
5. wire one authoritative backend action;
6. feed authoritative result back;
7. test mapper/handler/state transitions.

---

# 17. Packaging later

Once stable, consider package extraction such as:

```text
@neoarc/agentic-contracts
@neoarc/agentic-projection
@neoarc/agentic-ui
```

Do not make npm/package extraction a prerequisite for first product integration.
