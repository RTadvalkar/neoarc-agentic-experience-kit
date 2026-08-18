> **Execution provenance != hidden chain-of-thought.**

# Trace Replay (Slice 5 — Trace & Provenance)

How the Execution Lab's **Architecture Agent Run** scenario
(`lib/showcase/trace-fixtures.ts`) replays deterministically across the
Chat, Activity, Trace, Provenance, and Mission tabs — one real event stream,
five genuinely different renderings of it, per
`docs/07_TRACE_AND_PROVENANCE.prompt.md` §"Alternate execution views."

## 1. One event stream, one `correlation`

The scenario is 40 `AgenticEventEnvelope`s following an architecture agent
through a single turn: instruction/recipe/policy/model resolution, a
clarifying question, knowledge retrieval and a relationship traversal
informing a design decision, a tool call that fails and is retried, an
execution-permission gate before a sandbox deploy, a proposal review (an
ADR), and two produced artifacts. Every event shares a consistent
`correlation` — `executionTraceId: "trace-arch-1"`,
`missionId: "mission-arch-1"`, `runId: "run-arch-1"`, refined per-event with
`turnId`/`stepId`/`toolCallId`/`proposalId`/`artifactId` — so every tab's
projector keys off the same identities rather than each tab needing its own
correlation scheme.

The event payload type is a union of two existing categories —
`RuntimeEventPayload | TraceEventPayload` — nothing new. This is
deliberate: it proves lineage-spanning tabs (Provenance, Mission) can
consume the same stream as pure-Trace-category tabs (Trace, Activity)
without the scenario needing a third, showcase-specific payload shape.

## 2. Replay mechanics: pure engine, thin React adapter

`lib/showcase/replay-engine.ts` is a pure, framework-neutral state machine
— `{ totalEvents, currentIndex }` — with four operations: `stepForward`
(advance by exactly one), `resetReplay` (back to zero), `seekTo` (jump to
an arbitrary clamped index), and `isReplayComplete`. There is no separate
"step backward" primitive: backward navigation is `resetReplay` followed by
forward replay to the target index, exactly as `docs/04`'s replay spec
allows. Kept free of timers/React/DOM so it is unit-testable in isolation.

`components/showcase/execution-lab/use-event-replay.ts` is the one place a
timer exists: Play sets an intent flag and a `setTimeout` loop calls
`stepForward` once every 900ms; Pause clears the intent; Step Forward,
Reset, and seeking call directly into the pure engine, synchronously, no
timer involved. `currentIndex` becomes `visibleEventCount`, sliced into the
scenario's event array by `RenderCanvas`
(`components/showcase/execution-lab/render-canvas.tsx`) before every
render.

## 3. Projection: the same reducer, sliced five ways

`RenderCanvas` re-runs the **same pure reducer**
(`applyEvents`/`createProjectionStore`/`selectNodes` from
`projection-store.ts`) on every render, over `scenario.events.slice(0,
visibleEventCount)` — never an incrementally-mutated store carried across
renders. This is what makes "replaying" and "jumping to event 23 directly"
produce identical output: there is no hidden accumulated state a seek could
skip past. For the Architecture Agent Run scenario specifically, the
definitions list passed to the reducer is the union of `traceNodeDefinitions`,
`provenanceNodeDefinitions`, `activityNodeDefinitions`, and
`runtimeNodeDefinitions` — every projector family whose target the tab bar
exposes — after which `selectNodes(store).filter((node) => node.target ===
target)` narrows to whichever tab is active. One projection pass produces
nodes for every target at once; the active tab only changes which subset is
rendered, not what was computed.

Concretely, across the same 40 events:

| Tab (`AgenticViewTarget`) | Node definitions consumed | What actually renders |
|---|---|---|
| **Trace** | `traceNodeDefinitions` | One `trace.summary` node (running → completed, keyed by `executionTraceId`) plus one `trace.event` node per matched content event (keyed by the event's own id) — the full forensic, chronological log, grouped into turns/steps by `TraceExplorer` reading `correlation.turnId`/`stepId` off each node. |
| **Provenance** | `provenanceNodeDefinitions` | `provenance.node` entries only for the subset of events that supply real lineage identity (`user_input.received`, `mission.started`, `task.started`, `knowledge.selected`, `relationship.used`, `tool.completed`, `proposal.review.*`, `artifact.produced`), plus `provenance.edge` entries only where an event supplies a producer reference (both `artifact.produced` events here carry `producedByNodeId: "decision-arch-1"`, so both artifacts get a real incoming edge from the decision node — not an inferred one). |
| **Activity** | `activityNodeDefinitions` | One terse, always-safe one-line status per matched event (`task.started` → `"Started: Design service boundaries"`, `tool.failed` → `"Failed: Apply plan..."`, etc.) — the same underlying facts as Trace, reduced to a concise progress feed. |
| **Mission** | `runtimeNodeDefinitions` | `mission.mission`/`mission.run`/`mission.task` nodes — the hierarchical run view (`MissionHeader`, `RunStatusPanel`, `AgentTaskRow`) built from this scenario's `mission.started`/`run.started`/`task.started`/`task.completed`/`run.completed` events, exactly as it would be for a Slice 4 runtime-only scenario. |
| **Chat** | `conversationNodeDefinitions` | No nodes — this scenario contains no `conversation.*`-category events by design (it demonstrates Trace/Provenance/Activity/Mission, not the conversation family). `RenderCanvas` renders its `EmptyState` ("This scenario has no events for this view"), which is the correct, honest result for a tab with nothing to show — not a bug to route around with placeholder content. |

## 4. Why live append and full replay converge here too

`ProjectionStore` upserts nodes by `key`, never by array position, and
records first-appearance order separately from node content — so
re-projecting an already-seen key updates it in place rather than
reordering it (`applyEvent`'s doc comment, `PROJECTION_MODEL.md`
§"Replayability invariant"). This guarantee is what makes Play (event-by-
event live append) and jumping straight to `visibleEventCount = 40` (full
replay) produce the byte-identical node list for every tab. Two keying
strategies are exercised by this one scenario:

- **Business-id keying** (accumulating nodes): `trace.summary` keyed by
  `executionTraceId`; `mission.mission`/`mission.run`/`mission.task` keyed
  by `missionId`/`runId`/`taskId`; `provenance.node` keyed by each entity's
  own supplied id (`payload.mission.id`, `payload.task.taskId`, etc.). Each
  of these nodes gets re-projected multiple times across the 40 events
  (e.g. `trace.summary` transitions `execution.started` → `execution.completed`)
  without ever changing its position in the rendered list.
- **Event-id keying** (one-shot nodes): `trace.event` and `activity.entry`
  are keyed by the source event's own `id` — Trace and Activity are both
  inherently append-only logs, so there is no separate accumulating
  business identity to key by; each matched event produces exactly one
  node, once, forever.

## 5. Automated proof, not just visual inspection

`src/neoarc-agentic-projection/trace-node-definitions.test.mts` and
`provenance-node-definitions.test.mts` run this exact scenario
(`traceExecutionLabScenarios[0]`, the same fixture the Execution Lab
renders) through both `fullReplayNodes` (`applyEvents` in one call) and
`liveAppendNodes` (`events.reduce(applyEvent, ...)`, one event at a time)
and assert `deepEqual` between them — the same convergence property
`conversation-node-definitions.test.mts` established for Slice 2, extended
here to the Trace/Provenance families. Additional assertions per suite:
exactly one `trace.summary` node exists and ends in a terminal status; one
`trace.event`/`provenance.node` per matched event with zero key collisions,
in original event order; correlation identities survive projection
unchanged on every node; `provenance.edge` entries appear only where a
producer reference was actually supplied. Run with `npm test` (Node's
built-in test runner) alongside every other suite in the kit.

## 6. Browser verification

Manually verified in the Execution Lab (both light and dark themes, via
`agent-browser`): selecting the Architecture Agent Run scenario, then
Play/Step through all 40 events with each of the five tabs active in turn
— Trace's chronological log growing turn-by-turn and step-by-step;
Provenance's lineage list gaining nodes and, once both `artifact.produced`
events replay, two edges from the decision node; Activity's terse feed
updating one line per matched event; Mission's `RunStatusPanel`/
`AgentTaskRow` reflecting the same run's lifecycle; Chat correctly showing
its empty state throughout, since this scenario carries no conversation
events. Redacted/unavailable states (an `insufficient_access` resolved-
model route, a redacted tool result) were verified independently through
the Component Gallery's Trace/Provenance sections
(`lib/showcase/trace-gallery-fixtures.ts`) rather than by contriving a
redacted event in this particular scenario — see
`TRACE_ACCESS_AND_REDACTION.md` §5 for the full state matrix.
