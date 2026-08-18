> **Execution provenance != hidden chain-of-thought.**

# Trace Model (Slice 5 — Trace & Provenance)

`TraceEvent` and its supporting shapes (`src/neoarc-agentic-contracts/trace.ts`)
model **observable, supplied execution facts** for the forensic Trace view.
There is no `"reasoning"` `TraceEventKind`, no field anywhere in this module
that carries a model's private thoughts, and nothing here is computed,
inferred, or fabricated by the kit — every field is either present because
a product adapter supplied it, or explicitly marked unavailable via
`AvailableOr`/`UnavailableReason` (`shared.ts`). See
`TRACE_ACCESS_AND_REDACTION.md` for how withholding actually works, and
`TRACEABILITY_PRINCIPLES.md` for the standing rule this module implements.

## 1. `TraceEventKind` catalog

Fifteen kinds, each corresponding to one category of observable fact from
`docs/02B_UX_TRACEABILITY_AND_HUMAN_CONTROL.prompt.md` §"Execution
provenance, not private reasoning":

| Kind | Detail shape | Reused contract |
|---|---|---|
| `system-instruction` | `SystemInstructionTraceDetail` | — |
| `user-input` | `UserInputTraceDetail` | — |
| `context` | `ContextTraceDetail` | — |
| `runtime-recipe` | `RuntimeRecipeTraceDetail` | — |
| `model-policy` | `ModelPolicyTraceDetail` | — |
| `resolved-model` | `AvailableOr<TraceModelRoute>` | — |
| `knowledge` | `KnowledgeUsage` | — |
| `relationship` | `RelationshipUsage` | — |
| `tool` | `ToolTraceDetail` | `ToolActionIdentity` (`human-interaction.ts`) |
| `agent-activity` | `AgentActivityTraceDetail` | — |
| `human-interaction` | `HumanInteractionTraceDetail` | — |
| `proposal` | `ProposalTraceDetail` | — |
| `artifact` | `ArtifactRef` | `ArtifactRef` (`conversation.ts`) |
| `error` | `RunError` | `RunError` (`runtime.ts`) |
| `retry` | `RetryTraceDetail` | — |

`TraceEventDetail` is the discriminated union pairing each `kind` with its
value. Components narrow through a **closed switch** (`TraceInspector`,
`TraceEventRow`) — never a fallthrough default that guesses shape from an
unrecognized kind. This is a deliberate, minimal set: the kit reuses
existing contracts rather than re-declaring parallel shapes wherever one
already exists (`ActorSummary`, `RunError`, `ArtifactRef`,
`ToolActionIdentity`, `PendingInteraction`, `HumanDecision`,
`EventCorrelation`, `TraceAccessLevel`, `RedactionState` — see the module
doc comment in `trace.ts` for the full list). Adding a sixteenth kind means
adding a new detail interface and a new arm to that union and every
downstream switch — never widening an existing kind to carry a second
unrelated shape.

### Two approval domains stay visually distinct here too

`HumanInteractionTraceDetail.domain` is deliberately narrower than the full
`PresentationIntent` (`human-interaction.ts`): the `"human-interaction"`
`TraceEventKind` only ever covers `human.clarification.*`/`permission.*`
events (`HumanInteractionTraceDomain = "clarification" | "execution-permission"`).
Business decisions (`proposal.review.*`) project to the separate
`"proposal"` kind instead — mirroring the standing rule in
`02B §Two separate approval domains` that execution permission and business
decisions are never collapsed into one generic model, all the way down into
the Trace contract.

### `resolved-model` is permission-aware by construction

`TraceEventDetail`'s `"resolved-model"` arm wraps `TraceModelRoute` in
`AvailableOr`, not directly. Whether the resolved model is shown at all is a
permission decision a product adapter makes (it may withhold it as
`insufficient_access`) — the type makes "unavailable because of access"
representable without a sentinel value or a second optional field.

## 2. Structural grouping: `TraceTurn` / `TraceStep`

Trace is inherently an **append-only chronological log** — `TraceEvent.id`
is the event's own stable identity, and there is no separate accumulating
"trace node" business identity the way a run or task has one (contrast with
`traceSummaryNodeDefinition` below, which is the one genuinely accumulating
node). `TraceTurn`/`TraceStep` are stable groupings that reference events
**by id** — they never duplicate event content:

```ts
interface TraceTurn {
  readonly id: OpaqueId
  readonly label?: string
  readonly occurredAt: ISOTimestamp
  readonly eventIds: readonly OpaqueId[]
}
```

`TraceStep` is identical plus a `turnId` back-reference. In practice,
`TraceExplorer`/`TraceTimeline` don't consume these grouping types directly
— they group the flat `"trace.event"` node list into turns/steps
client-side by reading `correlation.turnId`/`stepId` off each already-
projected node (see `trace-node-definitions.ts`'s module comment). The
types exist so a product integration that isn't going through the
projection layer at all (the direct DTO → adapter → view model path) has a
documented, stable shape for the same grouping.

## 3. Top-level summary: `ExecutionTraceSummary`

```ts
interface ExecutionTraceSummary {
  readonly id: OpaqueId
  readonly startedAt: ISOTimestamp
  readonly completedAt?: ISOTimestamp
  readonly status: RuntimeStatus
  readonly accessLevel: TraceAccessLevel
  readonly usage?: TraceUsage
  readonly timing?: TraceTiming
}
```

`accessLevel` is **descriptive**, not enforced: it documents which
`TraceAccessLevel` the supplied data already reflects, because the UI is
never the security boundary (see `TRACE_ACCESS_AND_REDACTION.md`).
`TraceUsage` (token/cost) and `TraceTiming` (latency) are both entirely
optional, supplied-only facts — never computed, estimated, or defaulted by
the kit. `TraceSummaryBar`/`TraceUsageSummary`/`TraceTimingSummary` render
"not supplied" honestly when these are absent rather than showing a zero.

## 4. Correlation model

`TraceEvent.correlation` reuses `EventCorrelation` (`events.ts`) as-is —
the same nine optional keys (`executionTraceId`, `missionId`, `runId`,
`turnId`, `stepId`, `toolCallId`, `taskId`, `proposalId`, `artifactId`)
every other event category correlates through. Trace does not introduce a
parallel correlation shape. Grouping, filtering, and cross-linking to
Activity/Provenance/Mission all key off these same identities — see
`TRACE_REPLAY.md` for how this plays out across a real scenario, and
`PROVENANCE_MODEL.md` for how the same correlation keys let a fact appear
with a different renderer in the lineage view.

## 5. Backend event vocabulary: `trace-events.ts`

`src/neoarc-agentic-contracts/trace-events.ts` defines the typed
`AgenticEventEnvelope<TPayload>` payloads a product event adapter produces
for the Trace/Provenance/Activity/Mission projectors to consume. Every one
of the 34 `TRACE_EVENT_TYPES` string values is taken **verbatim** from
`docs/16_NORMALIZED_EVENT_VOCABULARY.json`'s `execution`/`turnStep`/
`inputContext`/`knowledge`/`relationship`/`tool`/`humanInteraction`/
`artifact`/`retryError` categories — no new type strings are invented here.

The envelope's own `id` doubles as `TraceEvent.id` once projected, so these
payloads never re-carry an event id, and correlation lives on the envelope
(`EventCorrelation`), never duplicated into the payload either. Structural
bookend events (`turn.started`/`completed`, `step.started`/`completed`)
carry only a `label?` or nothing at all — they exist purely so
`correlation.turnId`/`stepId` grouping has explicit start/end markers in the
raw stream, even though the projector doesn't turn them into their own
content node (see §2 above and `trace-node-definitions.ts`).

## 6. Why Trace and Provenance are two files, not one

Both consume overlapping raw facts, but they answer different questions —
"what happened, in order" (Trace) vs. "how did we get from intent to
artifact" (Provenance) — and are rendered by entirely different components
against entirely different node shapes (`TraceEvent` vs. `ProvenanceNode`/
`ProvenanceEdge`). See `PROVENANCE_MODEL.md` for the lineage side, and
`docs/07_TRACE_AND_PROVENANCE.prompt.md` §"Alternate execution views" for
why the same fact legitimately has a different renderer in each target.
