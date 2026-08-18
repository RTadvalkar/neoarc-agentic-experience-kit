# NeoArc Agentic Experience Kit — FINAL v0 Greenfield Pack

This is the **single authoritative pack** to use from now on.

Ignore all earlier NeoArc Agentic Experience Kit prompt packs and split-instruction archives.

This final pack assumes:

- the v0 project is **greenfield**;
- no source code has been created yet;
- NeoArc wants reusable agentic UX, not a one-off application;
- the strongest reusable ideas identified from DeepSeek Harness are adopted conceptually;
- NeoArc does **not** depend on DeepSeek Harness, Cordis, or its runtime;
- everything needed for v0 execution and later Cursor handoff is included here.

---

# What we are building

## NeoArc Agentic Experience Kit

A reusable enterprise React experience framework for agentic NeoArc products.

It contains:

```text
neoarc-agentic-contracts
neoarc-agentic-projection
neoarc-agentic-ui
```

and a showcase-only:

```text
Execution Lab
```

The kit must be useful across:

- NeoArc Platform;
- TestCopilot;
- BusinessBuddy;
- future NeoArc products;
- future agent execution adapters such as Cursor or another harness.

---

# Core architecture

The kit supports two integration modes.

## Direct view-model mode

```text
Backend DTO
   ↓
Product adapter
   ↓
Normalized NeoArc UI view model
   ↓
Controlled reusable component
   ↓
Semantic UI event
   ↓
Product handler
```

Use this for snapshot-oriented UI such as ProposalCard, EvidenceDrawer, ArtifactCard, MissionSummary.

## Event/projection mode

```text
Backend/runtime event
   ↓
Product event adapter
   ↓
AgenticEventEnvelope
   ↓
Optional Projection Engine
   ↓
AgenticViewNode
   ↓
Renderer / Surface Registry
   ↓
Controlled reusable component
   ↓
Semantic UI event
   ↓
Product handler
```

Use this for streaming conversations, tools, runtime execution, replay, trace, activity and provenance.

---

# Major concepts adopted after DeepSeek Harness analysis

We are adopting the **ideas**, not the DeepSeek implementation:

1. durable facts separated from presentation;
2. replayable projections;
3. stable business identity for correlated events;
4. pluggable keyed node renderers;
5. multiple UI views over the same execution facts;
6. animation-frame coalescing for high-frequency UI publication;
7. explicit execution permission;
8. hierarchical workflow/run visualization;
9. forensic trajectory/trace views;
10. pure UI primitives separated from runtime services.

NeoArc extends these with:

- Semantic Runtime Recipe identity/version;
- Model Policy identity/version;
- resolved model routing;
- governed knowledge usage;
- relationship traversal;
- evidence lineage;
- proposals;
- human decisions;
- artifacts;
- product/workspace context.

---

# Four primary user/developer views

The same execution can be viewed as:

```text
Chat
Activity
Trace
Provenance
```

## Chat

Human-facing agent interaction.

## Activity

Concise, safe progress.

## Trace

Chronological forensic execution history.

## Provenance

Information and decision lineage.

Trace/provenance must never expose hidden chain-of-thought.

---

# How to use this pack

Read:

`01_V0_EXECUTION_GUIDE.md`

Then create one v0 project and enable **both** custom instructions:

- `02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md`
- `02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md`

Run build prompts in this exact order:

1. `03_BOOTSTRAP_FOUNDATION_REGISTRIES_EXECUTION_LAB.prompt.md`
2. `04_CONVERSATION_PROJECTION_REPLAY.prompt.md`
3. `05_HUMAN_INTERACTION_AND_PROPOSALS.prompt.md`
4. `06_RUNTIME_MISSIONS_TASKS_WORKFLOWS.prompt.md`
5. `07_TRACE_AND_PROVENANCE.prompt.md`
6. `08_EVIDENCE_CITATIONS_AND_ARTIFACTS.prompt.md`
7. `09_COMPOSITE_REFERENCE_EXPERIENCES.prompt.md`
8. `10_HARDEN_DOCUMENT_AND_CURSOR_HANDOFF.prompt.md`

Run **one prompt at a time**.

Do not paste all build prompts into one v0 chat.

After every slice, use:

`11_V0_GATE_CHECKLIST.md`

If a gate fails, use:

`12_FIX_CURRENT_GATE.prompt.md`

Do not move to the next slice until the current gate is healthy.

---

# Final output expected from v0

The finished repository should approximately contain:

```text
src/
  neoarc-agentic-contracts/
  neoarc-agentic-projection/
  neoarc-agentic-ui/

docs/
  wiring/
  contracts/
  examples/

showcase or app/
  Execution Lab
  Agent Workspace
  Mission Center
  Proposal Review
  Execution Investigation
```

The exact framework folders may differ.

The logical separation must not.

---

# Important rule

The most valuable deliverable is not just JSX.

It is:

```text
visual behavior
+ normalized data contracts
+ state contracts
+ semantic event contracts
+ replay model
+ projection seams
+ renderer/surface extension seams
+ trace/provenance semantics
+ examples
+ Cursor wiring documentation
```

That is what makes the kit durable after v0 is gone.
