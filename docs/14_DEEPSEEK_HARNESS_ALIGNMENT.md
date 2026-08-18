# DeepSeek Harness Alignment — What NeoArc Reuses and What It Does Not

This document records the outcome of the DeepSeek Harness assessment so future developers do not repeat the same architecture debate.

---

# What DeepSeek Harness demonstrated usefully

DeepSeek Harness provided strong examples of:

- typed append/replay-oriented execution facts;
- stable event identity/correlation;
- pluggable conversation node assembly;
- keyed renderers;
- alternate views such as Chat and Trajectory;
- tool presentation separated from core conversation topology;
- explicit user approval seam;
- hierarchical workflow visualization;
- pure React UI primitives separated from runtime services.

These patterns influenced NeoArc Agentic Experience Kit.

---

# What NeoArc adopts conceptually

## 1. Durable facts separated from presentation

NeoArc UI should be able to project normalized runtime facts into multiple views.

## 2. Replayability

The same normalized ordered event sequence should reconstruct the same UI state.

## 3. Stable identity

Updates correlate through stable business ids, not "whatever is currently active".

## 4. Renderer extensibility

New product/tool/proposal node kinds register renderers rather than modify one central conversation switch.

## 5. Multiple projections

NeoArc extends the idea to:

```text
Chat
Activity
Trace
Provenance
```

## 6. Approval distinction

NeoArc explicitly separates tool/action execution permission from business proposal approval.

## 7. Hierarchical runtime UX

Workflow phases/members are displayed as lifecycle-aware hierarchical disclosure.

---

# What NeoArc adds beyond the DeepSeek pattern

NeoArc needs traceability for:

- Agent/Profile identity/version;
- Semantic Runtime Recipe identity/version;
- Model Policy identity/version;
- resolved model target;
- product/workspace/project context;
- governed knowledge retrieval/selection/supply/citation;
- canonical relationship traversal/use;
- evidence;
- business proposals;
- human decisions;
- artifacts;
- product lifecycle/evaluation use.

This is central to improving NeoArc agent quality and diagnosing whether a poor result came from:

```text
routing
recipe/configuration
retrieval
relationship traversal
context assembly
tool output
model output
human decision
```

rather than blindly tweaking prompts.

---

# What NeoArc deliberately does NOT adopt

Do not introduce:

- Cordis;
- DeepSeek's "everything is a plugin" runtime;
- DeepSeek profiles/bundles;
- DeepSeek agent loop;
- DeepSeek persistence implementation;
- DeepSeek Web UI packages as architectural dependencies;
- DeepSeek provider/model runtime;
- DeepSeek-specific public type names.

DeepSeek's architecture is an inspiration source, not NeoArc's runtime foundation.

---

# ACP naming warning

DeepSeek Harness uses "ACP" for:

```text
Agent Client Protocol
```

NeoArc uses ACP for:

```text
Agent Control Plane
```

These are different concepts.

A DeepSeek/ACP-compatible execution harness may later be evaluated as one possible enterprise execution-plane adapter, but it is not the NeoArc Agent Control Plane.
