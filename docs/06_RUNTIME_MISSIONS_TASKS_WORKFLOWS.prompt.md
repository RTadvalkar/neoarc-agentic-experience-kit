# Slice 4 — Runtime Missions, Tasks, Workflows, and Pending Human Work

Continue the existing NeoArc Agentic Experience Kit.

## Objective

Build reusable runtime visualization for agent missions/tasks/workflows without exposing hidden reasoning.

Support flat timeline and hierarchical execution views.

---

# 1. Runtime contracts

Add/extend:

```text
MissionSummary
RunSummary
RunStatus
RunPhase
AgentTask
ExecutionStep
ExecutionStepStatus
ExecutionActor
RunOutput
RunError
Retryability
CancellationState
HumanWaitReason
ProgressSummary
WorkflowGroup
WorkflowMember
```

Recommended normalized run states:

```text
queued
starting
running
waiting_for_human
paused
completed
failed
cancel_requested
cancelled
```

---

# 2. Traceable AgentTask

An `AgentTask` must be able to carry supplied references such as:

```text
taskId
title
status
missionId
runId
producedBy
inputRefs
knowledgeRefs
relationshipRefs
toolCallRefs
outputRefs
startedAt
completedAt
```

Never fabricate missing links.

---

# 3. Components

Create/document:

1. MissionHeader
2. RunStatusPanel
3. ExecutionTimeline
4. ExecutionStepRow
5. ProgressSummary
6. WaitingForHumanBanner
7. RunActions
8. RunErrorPanel
9. RetryPanel
10. CancellationDialog
11. RunOutputs
12. AgentHandoffTimelineItem
13. RunMetadataDrawer
14. LiveActivityIndicator
15. AgentTaskRow
16. AgentTaskInspector
17. WorkflowRunTree
18. WorkflowPhaseRow
19. WorkflowMemberRow

---

# 4. Hierarchical workflow

Support:

```text
Run
 ├─ Phase
 │   ├─ member
 │   └─ member
 └─ Phase
     └─ member
```

UX behavior:

- active/error/cancelled/interrupted branches remain visibly open;
- clean completed branches may collapse;
- new activity can force a relevant branch open again;
- critical status must not become invisible behind collapse.

---

# 5. Runtime projection fixtures

Use normalized fixture events conceptually including:

```text
mission.started
run.started
task.started
task.progress
tool.started
tool.completed
task.completed
run.waiting_for_human
run.completed
run.failed
```

Projection must preserve stable identity and replayability.

---

# 6. Pending human interaction

Mission/session summaries must clearly surface:

```text
Running
Waiting for you
Approval required
Review required
Failed
Completed
```

from supplied normalized state.

---

# 7. Semantic UI events

Add:

```text
run.cancel.request
run.retry.request
run.resume.request
run.output.open
run.step.open
run.task.open
run.metadata.open
run.humanAction.open
```

---

# 8. Execution Lab

Add scenarios for:

- queued;
- running;
- multi-phase workflow;
- multiple agents;
- handoff;
- waiting for clarification;
- execution approval required;
- proposal review required;
- recoverable failure;
- non-retryable failure;
- cancel requested;
- completed with outputs.

---

# 9. Documentation

Create/update:

```text
docs/STATE_MODEL.md
docs/RUNTIME_MODEL.md
docs/wiring/runtime/
```

Backend remains authoritative.

Run checks.

Do not start Trace/Provenance slice.
