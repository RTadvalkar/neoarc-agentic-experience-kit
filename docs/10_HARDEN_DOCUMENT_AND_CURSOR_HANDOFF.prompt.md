# Slice 8 — Harden, Document, and Prepare Cursor Handoff

Continue the completed NeoArc Agentic Experience Kit.

## Objective

Do NOT add a new feature family.

Audit and harden the project so Cursor can later extract, improve, package and integrate the kit without access to v0 chat history.

---

# 1. Architecture audit

Find and fix:

- DeepSeek/Cordis imports;
- Vercel/Next-specific APIs leaking into reusable roots;
- direct backend/network calls in reusable components;
- mock data embedded in reusable components;
- generated backend DTOs imported by UI components;
- duplicate enums/models;
- giant central renderer switches;
- unstable array-index UI keys;
- undocumented callbacks/events;
- projection logic relying on hidden mutable runtime state;
- trace fields rendered without visibility/redaction handling;
- execution permission conflated with business approval;
- inaccessible interactions;
- showcase-only code exported as public reusable API.

Avoid broad aesthetic rewrites.

---

# 2. Canonical docs

Ensure these are complete and internally consistent:

```text
docs/COMPONENT_CATALOG.md
docs/DATA_MODEL.md
docs/EVENT_MODEL.md
docs/STATE_MODEL.md
docs/PROJECTION_MODEL.md
docs/TRACE_MODEL.md
docs/PROVENANCE_MODEL.md
docs/HUMAN_INTERACTION_MODEL.md
docs/APPROVAL_SEMANTICS.md
docs/PUBLIC_API.md
docs/INTEGRATION_GUIDE.md
```

---

# 3. Component catalog

For important components record:

```text
name
family
purpose
input model
key semantic events
major states
trace/redaction concerns
reusable vs showcase-only
wiring doc
```

---

# 4. Event catalog

Document normalized events with:

```text
event type
durability
correlation identity
payload type
producer category
projection consumers
replay expectations
redaction concerns
```

Clearly state these are normalized adapter-facing UI/runtime contracts, not necessarily backend-native events.

---

# 5. Add a new view node guide

Create:

```text
docs/ADDING_A_VIEW_NODE.md
```

Show:

```text
new product/runtime event
→ product adapter
→ normalized event
→ node definition/projector
→ renderer registration
→ optional Activity/Trace/Provenance rendering
```

No central mega-switch.

---

# 6. Surface extension guide

Create:

```text
docs/ADDING_A_SURFACE_EXTENSION.md
```

Show how a product contributes product-specific UI to declared surfaces without forking AgentWorkspace.

---

# 7. Cursor handoff

Create/strengthen:

```text
docs/CURSOR_HANDOFF.md
```

It must explain:

## reusable roots

```text
neoarc-agentic-contracts
neoarc-agentic-projection
neoarc-agentic-ui
```

## showcase-only roots

Execution Lab, reference pages, demo controllers, mock fixtures/navigation.

## direct mode

```text
backend DTO
→ adapter
→ normalized view model
→ component
```

## event mode

```text
backend/runtime event
→ adapter
→ AgenticEventEnvelope
→ projector
→ AgenticViewNode
→ renderer
```

## user action path

```text
component
→ AgenticUIEvent
→ product handler
→ authoritative backend command
→ authoritative updated state/event
→ adapter
→ UI
```

## streaming

SSE/WebSocket/polling are product-owned.

## auth

application-owned.

## trace security

product/backend decides which values are supplied/redacted.

## replay

normalized fixtures reproduce projected UI state.

---

# 8. Machine-readable manifests

Create valid JSON:

```text
docs/component-manifest.json
docs/event-manifest.json
docs/renderer-manifest.json
docs/surface-manifest.json
```

---

# 9. Golden samples

Create:

```text
docs/examples/sample-execution-events.json
docs/examples/sample-agent-workspace-viewmodel.json
docs/examples/sample-semantic-ui-events.json
```

The execution event sample must be coherent enough to replay into:

```text
Chat
Activity
Trace
Provenance
```

Label them as normalized fixtures, not API responses.

---

# 10. Public exports

Audit barrel exports.

Reusable public API must not accidentally expose:

- demo controllers;
- mock fixtures unless intentionally test support;
- framework page code;
- Execution Lab internals.

---

# 11. Accessibility/quality pass

Review:

- keyboard operation;
- visible focus;
- dialogs;
- labels;
- non-color status;
- reduced motion;
- long content;
- responsive behavior;
- trace ledger usability;
- inspector accessibility.

Fix material issues.

---

# 12. Verification

Run available:

- typecheck;
- lint;
- build;
- tests.

Fix issues caused by the project.

At completion report:

1. reusable roots;
2. showcase-only roots;
3. public contracts;
4. projection/replay mechanism;
5. renderer registry;
6. surface registry;
7. trace/provenance model;
8. approval distinction;
9. manifests and samples;
10. checks/results;
11. known gaps;
12. safest first Cursor integration slice.

Do not add backend integration.
