# v0 Execution Guide — Greenfield NeoArc Agentic Experience Kit

## 1. Create a fresh v0 Project

Suggested name:

`neoarc-agentic-experience-kit`

Do not create this inside TestCopilot or another existing NeoArc application.

This project is a reusable asset factory and reference implementation.

---

# 2. Optional but strongly recommended: connect a dedicated Git repository

Suggested repository name:

`neoarc-agentic-experience-kit`

The purpose is to preserve checkpoints outside the v0 subscription.

Do not connect an existing production NeoArc repository.

---

# 3. Create TWO v0 custom instructions

v0 limits an individual instruction to roughly 5,000 characters.

Create two instructions and keep both enabled for all chats in this project.

## Instruction A

Use the complete contents of:

`02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md`

Suggested v0 instruction name:

`NeoArc — Architecture & Portability`

## Instruction B

Use the complete contents of:

`02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md`

Suggested v0 instruction name:

`NeoArc — UX, Traceability & Human Control`

Do not paste build-slice prompts into custom instructions.

The two instructions answer:

```text
A: What architecture and boundaries must always hold?
B: How must the agentic UX, traceability and human control behave?
```

The individual build prompt answers:

```text
What should v0 build now?
```

---

# 4. Start Slice 1 in a new v0 chat

Paste:

`03_BOOTSTRAP_FOUNDATION_REGISTRIES_EXECUTION_LAB.prompt.md`

This prompt explicitly assumes the project contains no implementation yet.

Let v0 scaffold the project.

Do not ask v0 to build the entire final system in this first chat.

---

# 5. Review before spending more credits

After v0 completes a slice:

1. open the running preview;
2. inspect the visual result;
3. inspect the file tree/code changes;
4. run or ask v0 to run the available build/type/lint checks;
5. use the relevant section of `11_V0_GATE_CHECKLIST.md`;
6. fix the current slice if needed;
7. checkpoint/commit the good result;
8. only then start the next slice in a **new chat inside the same Project**.

---

# 6. Build sequence

Use exactly this sequence.

## Slice 1

`03_BOOTSTRAP_FOUNDATION_REGISTRIES_EXECUTION_LAB.prompt.md`

Creates:

- greenfield project foundation;
- design tokens;
- contracts;
- event envelope;
- projection interfaces;
- renderer registry;
- surface registry;
- initial Execution Lab.

## Slice 2

`04_CONVERSATION_PROJECTION_REPLAY.prompt.md`

Creates:

- conversation;
- streaming-safe projection;
- pluggable node rendering;
- replay controls;
- deterministic fixtures.

## Slice 3

`05_HUMAN_INTERACTION_AND_PROPOSALS.prompt.md`

Creates:

- clarification;
- execution permission;
- proposal review;
- business decision controls;
- pending human interaction.

## Slice 4

`06_RUNTIME_MISSIONS_TASKS_WORKFLOWS.prompt.md`

Creates:

- missions/runs/tasks;
- hierarchical workflows;
- waiting-for-human states;
- runtime outputs and failure states.

## Slice 5

`07_TRACE_AND_PROVENANCE.prompt.md`

Creates:

- Trace;
- Provenance;
- knowledge usage;
- relationship usage;
- recipe/policy/model trace;
- replayable rich execution scenario.

## Slice 6

`08_EVIDENCE_CITATIONS_AND_ARTIFACTS.prompt.md`

Creates:

- evidence;
- citations;
- source previews;
- artifacts;
- grounding and lineage links.

## Slice 7

`09_COMPOSITE_REFERENCE_EXPERIENCES.prompt.md`

Creates showcase-only reference experiences:

- Agent Workspace;
- Async Mission Center;
- Proposal Review Workspace;
- Execution Investigation.

## Slice 8

`10_HARDEN_DOCUMENT_AND_CURSOR_HANDOFF.prompt.md`

No new feature family.

It performs:

- architecture audit;
- consistency cleanup;
- documentation completion;
- manifests;
- sample payloads/events;
- public exports;
- Cursor handoff preparation.

---

# 7. If v0 starts drifting

Use:

`12_FIX_CURRENT_GATE.prompt.md`

Do not ask it to continue building the next slice.

Common drift to stop immediately:

- backend/API implementation;
- database/auth work;
- Next.js/Vercel dependencies leaking into reusable packages;
- DeepSeek/Cordis dependencies;
- one giant renderer switch;
- hard-coded mock data inside reusable components;
- UI claiming approval success before authoritative state;
- rendering hidden chain-of-thought;
- fabricating knowledge/relationship provenance;
- duplicating components instead of using registries.

---

# 8. Keep prompts bounded

Do not combine slices to "save time".

A large single prompt may appear cheaper but creates:

- architectural drift;
- accidental rewrites;
- duplicate abstractions;
- lower-quality wiring docs;
- harder rollback.

The objective is durable reusable capital, not maximum code per prompt.

---

# 9. Do not ask v0 to integrate NeoArc backends

The kit must use:

- mock fixtures;
- local showcase controllers;
- normalized UI contracts.

Later Cursor will wire real NeoArc products.

That integration blueprint is already captured in:

`13_CURSOR_WIRING_BLUEPRINT.md`

---

# 10. Finish before cancelling v0

Before ending the subscription, ensure:

- Git repository contains the final source;
- all docs are committed;
- sample event fixtures are committed;
- component/event/renderer/surface manifests exist;
- Execution Lab runs locally;
- public reusable roots are clearly documented;
- no critical knowledge remains only inside a v0 chat.

The repository must stand on its own.
