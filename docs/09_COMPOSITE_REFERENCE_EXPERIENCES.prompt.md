# Slice 7 — Composite Reference Experiences

Continue the existing NeoArc Agentic Experience Kit.

## Objective

Prove that the reusable primitives, projection model, registries and traceability compose into coherent enterprise experiences.

These pages are showcase/reference experiences.

Do not implement backend logic.

Do not duplicate components merely to make the demos easier.

---

# Reference A — Agent Workspace

Create an enterprise Agent Workspace with:

- product/workspace context;
- agent identity;
- Chat / Activity / Trace / Provenance tabs;
- conversation;
- active runtime;
- pending human interaction;
- proposal;
- evidence;
- artifact;
- contextual inspector.

Simulate:

```text
User asks for work
→ agent starts
→ safe activity
→ context/knowledge/relationship trace
→ clarification
→ user answer
→ runtime continues
→ proposal
→ evidence inspection
→ refinement request
→ revised proposal
→ approval
→ artifact
→ completion
```

Use local controlled mock state only.

---

# Reference B — Async Mission Center

Create list/detail UX for:

- queued;
- running;
- waiting for clarification;
- execution approval required;
- proposal review required;
- failed;
- completed;
- outputs.

Pending human work must be obvious.

---

# Reference C — Proposal Review Workspace

Show:

- proposal summary;
- change summary/diff;
- evidence;
- risk/policy;
- decision controls;
- revision history;
- trace/provenance links.

---

# Reference D — Execution Investigation

Create an operator/developer-oriented investigation surface for a poor result.

Include supplied data such as:

```text
Result
Agent/version
Runtime recipe/version
Model policy/version
Resolved model route
Knowledge retrieved
Knowledge selected
Relationships traversed
Tool activity
Failures/retries
Human decisions
Outputs
```

Provide filters and side inspector.

This is observable provenance, not hidden reasoning.

---

# Integration Inspector

Every reference experience should have a showcase-only Integration Inspector that can show:

- normalized view-model JSON;
- current normalized event;
- projected node state;
- latest semantic UI event;
- mock handler that processed it;
- reusable vs showcase-only boundaries.

---

# Documentation

Create:

```text
docs/examples/AGENT_WORKSPACE.md
docs/examples/ASYNC_MISSION_CENTER.md
docs/examples/PROPOSAL_REVIEW_WORKSPACE.md
docs/examples/EXECUTION_INVESTIGATION.md
```

For each describe:

- composition tree;
- required input data;
- event sources;
- controller responsibilities;
- backend responsibilities;
- product-specific seams.

Run checks.

Do not start hardening automatically.
