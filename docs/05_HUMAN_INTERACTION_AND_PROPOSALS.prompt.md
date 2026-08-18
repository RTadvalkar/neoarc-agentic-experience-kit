# Slice 3 — Human Interaction, Execution Permission, and Business Proposals

Continue the existing greenfield kit.

Obey both enabled project instructions.

## Objective

Build human-in-the-loop UX while preserving a hard distinction between:

```text
execution permission
```

and:

```text
business decision / proposal approval
```

---

# 1. Generic human interaction

Add normalized contracts for:

```text
HumanInteractionRequest
HumanInteractionKind
PendingInteraction
PresentationIntent
InteractionOption
InteractionStatus
```

Support presentation intents:

```text
clarification
execution-permission
proposal-review
risk-acknowledgement
override
confirmation
```

A specialized renderer must not remove otherwise valid actions.

---

# 2. Execution permission

Model the question:

```text
May this specific tool/action proceed?
```

Normalized outcomes:

```text
allowed_once
rejected
cancelled
unavailable
```

Create:

1. ExecutionPermissionCard
2. ExecutionPermissionDialog
3. PermissionReason
4. PermissionOutcomeBadge

Attach the request to supplied tool/action identity.

Do not duplicate raw sensitive tool arguments.

Use safe supplied summaries.

The backend/product remains authoritative.

---

# 3. Proposal/business decision contracts

Add:

```text
ProposalSummary
ProposalRevision
ProposalSection
ProposalChange
ProposalStatus
DecisionAction
DecisionPermission
EvidenceSummary
RiskFinding
PolicyFinding
ConflictSummary
HumanDecision
OverrideRequirement
```

---

# 4. Proposal components

Create/document:

1. ProposalCard
2. ProposalViewer
3. ProposalSummaryHeader
4. ChangeSummary
5. ChangeList
6. ChangeDiffViewer
7. DecisionBar
8. RefinementRequestDialog
9. RejectDialog
10. EvidenceDrawer
11. RiskFindingsPanel
12. PolicyFindingsPanel
13. ConflictResolutionPanel
14. HumanOverrideDialog
15. DecisionHistory
16. ProposalStatusTimeline

---

# 5. Business decision actions

Support product-configurable action availability:

```text
approve/apply
refine
reject/discard
defer
override
```

Do not assume all actions are always present.

The UI emits intent.

It must not claim authoritative success until supplied with authoritative resulting state.

---

# 6. Pending-human summary

Support normalized session/mission summaries such as:

```text
Waiting for clarification
Execution approval required
Proposal review required
Risk acknowledgement required
Override required
```

---

# 7. Semantic UI events

Execution permission:

```text
permission.allowOnce.request
permission.reject.request
permission.cancel.request
```

Proposal/business decision:

```text
proposal.open
proposal.apply.request
proposal.refine.request
proposal.reject.request
proposal.defer.request
proposal.override.submit
proposal.evidence.open
proposal.change.open
proposal.conflict.resolve
proposal.history.open
```

---

# 8. Execution Lab scenarios

Add:

- clarification;
- execution permission;
- permission unavailable;
- clean proposal;
- proposal with evidence;
- stale proposal;
- policy warning;
- conflict;
- override required;
- action pending;
- action failed;
- finalized proposal.

Show semantic event payloads.

---

# 9. Documentation

Create/update:

```text
docs/HUMAN_INTERACTION_MODEL.md
docs/APPROVAL_SEMANTICS.md
```

Explicitly document:

```text
execution permission != business approval
```

Run checks.

Do not start runtime mission/workflow work from the next slice.
