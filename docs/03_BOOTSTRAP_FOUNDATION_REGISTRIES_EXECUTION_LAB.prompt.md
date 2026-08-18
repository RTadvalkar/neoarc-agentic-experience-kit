# Slice 1 — GREENFIELD Bootstrap, Foundation, Registries, and Execution Lab

This is a **greenfield project**. Assume there is no existing implementation worth preserving yet.

Obey both enabled NeoArc project instructions.

## Objective

Create the initial NeoArc Agentic Experience Kit from scratch.

This slice establishes architecture and developer ergonomics only. Do NOT build the complete agent product.

---

# 1. Bootstrap

Choose a sensible modern React development setup supported well by v0.

The showcase application may use the framework v0 prefers, but reusable source must remain plain React and portable.

Create these logical reusable roots:

```text
src/
  neoarc-agentic-contracts/
  neoarc-agentic-projection/
  neoarc-agentic-ui/
```

Create:

```text
docs/
  wiring/
  contracts/
  examples/
```

Create clear barrel exports.

Reusable code must not depend on Next.js routing/image/server APIs, Vercel SDKs, DeepSeek Harness, Cordis, backend SDKs, auth SDKs, databases or model-provider SDKs.

---

# 2. Design foundation

Create replaceable tokens for:

- background/surfaces;
- text;
- borders;
- accent;
- success;
- warning;
- danger;
- info;
- focus;
- radius;
- elevation;
- spacing;
- typography.

Support light/dark theme.

Use a restrained neutral default. Do not invent a permanent NeoArc brand palette.

---

# 3. Initial normalized contracts

Create typed normalized public models for:

```text
AgentSummary
ActorSummary
ContextRef
PermissionSet
ActionAvailability
RuntimeStatus
RiskLevel
TraceAccessLevel
RedactionState
```

IDs are opaque strings.

Public contract timestamps use ISO-8601 strings.

---

# 4. Agentic event envelope

Create a typed normalized `AgenticEventEnvelope`.

It must support:

```text
id
type
occurredAt
optional sequence
durability: durable | transient
optional correlation
typed payload
```

Correlation must allow optional:

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

Do not require every event to contain every id.

---

# 5. Semantic UI event envelope

Create a separate typed `AgenticUIEvent`.

It represents user intent emitted by reusable components.

Do NOT reuse backend/runtime event contracts for UI actions.

Support:

```text
type
occurredAt
sourceComponent
optional correlation
typed payload
```

---

# 6. Optional projection package

Create a small, understandable projection seam supporting concepts equivalent to:

```text
AgenticNodeDefinition
AgenticViewNode
AgenticViewTarget
MatchResult
ProjectionContext
PublicationCadence
```

Initial view targets:

```text
conversation
activity
trace
provenance
mission
inspector
```

Publication cadence:

```text
immediate
animation-frame
none
```

Do not create a giant framework.

Keep the projection package optional.

---

# 7. Renderer registry

Create a NeoArc-owned keyed renderer registry.

Requirements:

- renderer registration by target + node kind;
- generic fallback;
- feature-owned registration;
- easy public API;
- type-safe where practical;
- testable.

Do not use a single giant switch statement.

---

# 8. Surface registry

Create a lightweight named surface extension mechanism.

Initial surfaces may include:

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

Do not recreate a generic plugin system.

---

# 9. Foundation UI components

Create reusable components:

1. AgentAvatar
2. AgentIdentity
3. AgentStatusBadge
4. RuntimeStatusBadge
5. CapabilityBadge
6. RiskBadge
7. ContextBreadcrumb
8. EntitySwitcher
9. SectionHeader
10. InlineNotice
11. EmptyState
12. LoadingState
13. PermissionBlockedState
14. Timestamp
15. MetadataList
16. RedactedValue
17. TraceVisibilityBadge

Make them enterprise-grade and accessible.

---

# 10. Greenfield Execution Lab

Create a showcase-only **Execution Lab** route/page now.

It must already have:

- scenario selector;
- tabs:
  - Chat
  - Activity
  - Trace
  - Provenance
- render canvas;
- normalized input JSON inspector;
- projected-node inspector;
- semantic UI event log;
- replay controls placeholder;
- light/dark toggle;
- clear indication that this is development/showcase code.

For now use simple foundation scenarios.

---

# 11. Documentation

Create:

```text
docs/COMPONENT_CATALOG.md
docs/DATA_MODEL.md
docs/EVENT_MODEL.md
docs/PROJECTION_MODEL.md
docs/RENDERER_REGISTRY.md
docs/SURFACE_REGISTRY.md
docs/INTEGRATION_GUIDE.md
docs/ACCESSIBILITY.md
docs/TRACEABILITY_PRINCIPLES.md
```

Document both integration modes:

```text
DTO → adapter → view model → component
```

and:

```text
runtime event
→ event adapter
→ AgenticEventEnvelope
→ projector
→ AgenticViewNode
→ renderer
```

---

# 12. Verification

Run available:

- typecheck;
- lint;
- build;
- tests if configured.

Fix issues caused by this implementation.

At the end report:

1. project scaffold chosen;
2. reusable source roots;
3. public contracts;
4. projection seam;
5. renderer registry;
6. surface registry;
7. Execution Lab route;
8. documentation created;
9. checks executed and results;
10. assumptions/deferrals.

Do not start Slice 2 work.
