# Slice 5 — Agent Execution Trace and Provenance

Continue the existing greenfield kit.

## Objective

Create first-class **Agent Execution Provenance**.

This feature must help users/operators/developers understand what observable inputs, knowledge, relationships, tools, configurations and decisions contributed to an execution.

It must NOT expose hidden chain-of-thought.

---

# 1. Trace contracts

Create normalized contracts for:

```text
ExecutionTraceSummary
TraceEvent
TraceEventKind
TraceTurn
TraceStep
TraceActor
TraceModelRoute
TraceUsage
TraceTiming
TraceError
TraceRedaction
TraceAccess
```

Trace kinds must be able to represent supplied facts such as:

```text
system-instruction
user-input
context
runtime-recipe
model-policy
resolved-model
knowledge
relationship
tool
agent-activity
human-interaction
proposal
artifact
error
retry
```

---

# 2. Knowledge usage

Create `KnowledgeUsage`.

It must distinguish:

```text
retrieved
selected
supplied
cited
```

Optional supplied fields may include:

```text
knowledgeId
version
title
type
source
score
usage category
```

Never invent a score/confidence.

---

# 3. Relationship usage

Create `RelationshipUsage`.

Support supplied:

```text
relationshipId
source entity
predicate
target entity
traversal depth
usage category
```

Usage categories may include:

```text
retrieval
context
evidence
impact
```

Do not infer importance solely because an edge was traversed.

---

# 4. Trace components

Create/document:

1. TraceExplorer
2. TraceTimeline
3. TraceTurn
4. TraceStep
5. TraceEventRow
6. TraceInspector
7. SystemInstructionTrace
8. UserInputTrace
9. ContextTrace
10. RuntimeRecipeTrace
11. ModelPolicyTrace
12. ResolvedModelTrace
13. KnowledgeTrace
14. RelationshipTrace
15. ToolTrace
16. HumanDecisionTrace
17. ArtifactTrace
18. TraceUsageSummary
19. TraceTimingSummary
20. TraceRedactedValue

---

# 5. Trace UX

Create a forensic chronological view with:

- turn/step grouping;
- filtering;
- search;
- event selection;
- inspector panel;
- timing/usage summaries;
- safe details;
- unknown/redacted handling.

Do not make it look like normal chat.

---

# 6. Trace access/redaction

Support supplied levels conceptually:

```text
USER
OPERATOR
DEVELOPER
PLATFORM_ADMIN
```

The UI is not security-authoritative.

Support:

```text
not supplied
not available
redacted
insufficient access
```

Do not render secrets, credentials, auth headers or unsafe raw tool payloads.

---

# 7. Provenance components

Create/document:

1. ProvenanceExplorer
2. ProvenanceSummary
3. KnowledgeUsageList
4. RelationshipUsageList
5. EvidenceLineage
6. ArtifactLineage
7. ProvenanceNode
8. ProvenanceEdge
9. ProvenanceInspector

Use a simple readable lineage/graph representation only where it helps.

Do not turn the kit into a full graph database viewer.

---

# 8. Provenance lineage

Support supplied relationships such as:

```text
User Intent
   ↓
Mission
   ↓
Agent Task
   ↓
Knowledge / Relationships / Tools / Decisions
   ↓
Proposal
   ↓
Artifact
```

Only render supplied lineage edges.

---

# 9. Alternate projections

Demonstrate the same normalized facts through:

```text
Chat
Activity
Trace
Provenance
```

Example:

A tool call may appear as:

```text
Chat       collapsed business card
Activity   concise one-line status
Trace      detailed chronological event
Provenance lineage contribution when relevant
```

---

# 10. Rich Execution Lab scenario

Create a strong scenario named:

`Architecture Agent Run`

Include normalized events such as:

- execution started;
- system instruction identity/version;
- runtime recipe identity/version;
- model policy identity/version;
- resolved model route;
- user input;
- product/workspace context;
- knowledge retrieved;
- knowledge selected;
- relationships traversed;
- tool calls;
- proposal produced;
- human decision;
- artifact produced;
- execution completed.

Provide replay controls:

```text
Reset
Replay
Pause
Step
Speed
```

where practical.

Show:

- current event;
- current trace state;
- current projected nodes;
- Chat / Activity / Trace / Provenance.

---

# 11. Documentation

Create:

```text
docs/TRACE_MODEL.md
docs/PROVENANCE_MODEL.md
docs/TRACE_ACCESS_AND_REDACTION.md
docs/TRACE_REPLAY.md
```

State prominently:

```text
Execution provenance != hidden chain-of-thought.
```

Run checks.

Do not start evidence/artifact slice.
