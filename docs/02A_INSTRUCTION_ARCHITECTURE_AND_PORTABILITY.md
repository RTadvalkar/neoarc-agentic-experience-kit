# NeoArc Agentic Experience Kit — Architecture & Portability

You are building **NeoArc Agentic Experience Kit**, a reusable enterprise React UX framework for agentic products. It is not a standalone SaaS product and not a backend implementation.

## Reusable architecture

Maintain three logical reusable areas:

```text
neoarc-agentic-contracts
neoarc-agentic-projection
neoarc-agentic-ui
```

`neoarc-agentic-ui` MUST remain usable without `neoarc-agentic-projection`. Projection is optional and intended for replayable, streaming, event-driven experiences.

## Portability invariants

Reusable code must:

- use plain React;
- be framework-neutral where practical;
- use Tailwind and shadcn/Radix-style primitives if useful;
- use replaceable design tokens;
- receive data through typed controlled props;
- emit user intent through typed callbacks / semantic UI events;
- keep mock data outside reusable components;
- keep stable public contracts and exports.

Reusable code must NOT:

- import Next.js routing/image/server-action APIs;
- import Vercel SDKs;
- import DeepSeek Harness packages;
- import Cordis;
- call NeoArc backend APIs;
- import generated Spring/OpenAPI DTOs into visual components;
- call model providers;
- implement authentication or storage;
- hide product/backend state inside components.

## Integration modes

Support both:

```text
Backend DTO
→ product adapter
→ normalized UI view model
→ controlled component
```

and, when event projection is useful:

```text
backend/runtime event
→ product event adapter
→ AgenticEventEnvelope
→ optional projector
→ AgenticViewNode
→ renderer registry
→ controlled component
```

Do not force product backends to emit NeoArc UI event shapes directly.

## Normalized events

Use a typed event envelope with:

- id;
- type;
- ISO timestamp;
- optional sequence;
- durable/transient classification;
- optional correlation;
- typed payload.

Correlation should support optional identifiers such as:

```text
executionTraceId
missionId
runId
turnId
stepId
toolCallId
taskId
proposalId
artifactId
```

## Replayability

For projected node families:

- correlate events using stable business identity;
- never attach an update to “the latest unfinished item”;
- replay ordered events deterministically;
- live append and complete replay should converge;
- preserve stable node keys through updates/history prepends;
- do not depend on hidden mutable runtime state.

This is a UI/projection contract. NeoArc backends do not need to be fully event-sourced.

## Pluggable view nodes

Do NOT build one central mega-switch for all agentic content.

Support typed view nodes conceptually containing:

```text
key
kind
target
data
visibility
```

Initial targets:

```text
conversation
activity
trace
provenance
mission
inspector
```

Features/products must be able to register new renderers by target + kind without modifying the conversation core.

Unknown node kinds need a safe generic fallback.

## Surface registry

Provide a lightweight NeoArc-owned extension/surface registry for areas such as:

```text
agent.header
agent.context
conversation.before
conversation.node
conversation.after
composer.before
composer.main
composer.after
inspector.tabs
workspace.actions
```

Do not reproduce a general plugin runtime.

## Publication cadence

For projected updates support a concept equivalent to:

```text
immediate
animation-frame
none
```

Use animation-frame coalescing for high-frequency visual deltas. Publish terminal/structural changes immediately.

## Change discipline

Before every task:

1. inspect current structure;
2. preserve useful existing work and public contracts;
3. avoid duplicate concepts;
4. implement only the requested slice;
5. run available type/lint/build checks;
6. update contracts/docs/fixtures;
7. update the Execution Lab when relevant;
8. summarize public contract changes and assumptions.

Do not replatform working areas merely for cleanup.
