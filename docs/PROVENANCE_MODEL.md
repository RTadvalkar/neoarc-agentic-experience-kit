> **Execution provenance != hidden chain-of-thought.**

# Provenance Model (Slice 5 — Trace & Provenance)

`ProvenanceLineage` and its supporting shapes
(`src/neoarc-agentic-contracts/provenance.ts`) model **information/decision
lineage** — "how did we get from user intent to this artifact?" — distinct
in purpose from `TRACE_MODEL.md`'s chronological forensic execution log,
even though both may render the same underlying facts (per
`docs/07_TRACE_AND_PROVENANCE.prompt.md` §"Alternate execution views," a
fact may have a different renderer in each target).

## 1. The lineage chain

Per `docs/02B_UX_TRACEABILITY_AND_HUMAN_CONTROL.prompt.md` §8, provenance
models the chain:

```
User Intent -> Mission -> Agent Task -> Knowledge/Relationships/Tools/Decisions -> Proposal -> Artifact
```

`ProvenanceEntityKind` enumerates exactly these nine stops, no more:

```ts
type ProvenanceEntityKind =
  | "intent" | "mission" | "task"
  | "knowledge" | "relationship" | "tool" | "decision"
  | "proposal" | "artifact"
```

A `ProvenanceNode` is one stop in the chain:

```ts
interface ProvenanceNode {
  readonly id: OpaqueId
  readonly entityKind: ProvenanceEntityKind
  readonly label: string
  readonly occurredAt?: string
  readonly correlation?: EventCorrelation
}
```

## 2. The supplied-edges-only rule

This is the load-bearing rule of the whole module, stated three times on
purpose — in the module doc comment, in `ProvenanceEdge`'s own doc comment,
and here — because it is the one invariant most likely to be violated by an
integration under time pressure:

> **The kit never infers a lineage edge from event ordering, timing
> proximity, or "this ran right before that." An absent edge means absent,
> not "not yet computed."**

```ts
interface ProvenanceEdge {
  readonly id: OpaqueId
  readonly fromNodeId: OpaqueId
  readonly toNodeId: OpaqueId
  readonly relation: string
}
```

`relation` is a free-form label the adapter supplies (`"produced"`,
`"used"`, `"informed"`, etc.) — never inferred by the kit from node ordering
or proximity. This is why `provenanceEdgeNodeDefinition`
(`provenance-node-definitions.ts`) only ever produces an edge when the
**source event itself** carries a producer reference
(`ArtifactProducedPayload.producedByNodeId`): an artifact produced without a
supplied `producedByNodeId` gets a node with **no incoming edge**, which is
the honest, correct result — not a gap the projector silently fills in by
guessing "it was probably the most recent decision." `ProvenanceEdgeRow`
and `ProvenanceLineageList` render a lineage with zero edges the same way:
correctly, as a set of disconnected nodes, never with a fabricated
connecting line.

```ts
interface ProvenanceLineage {
  readonly nodes: readonly ProvenanceNode[]
  readonly edges: readonly ProvenanceEdge[]
}
```

## 3. Reused, not re-declared

Provenance deliberately wraps two existing contracts rather than
re-declaring parallel shapes for evidence and artifacts:

```ts
interface EvidenceLineageEntry {
  readonly evidence: EvidenceSummary        // proposal.ts — not re-typed
  readonly usage: KnowledgeUsageCategory    // trace.ts — the same 4-value enum
}

interface ArtifactLineageEntry {
  readonly artifact: ArtifactRef            // conversation.ts — not re-typed
  readonly producedByNodeId?: OpaqueId
}
```

Reusing `KnowledgeUsageCategory` (`retrieved`/`selected`/`supplied`/`cited`)
here — rather than a second, provenance-specific usage enum — keeps the
"don't call everything retrieved 'used'" rule (`02B §Knowledge usage`)
consistent across both the Trace and Provenance views: a piece of knowledge
that was merely `retrieved` never gets upgraded to look more load-bearing
in the lineage view than it was in the trace.

## 4. Provenance spans two event categories, on purpose

`provenance-node-definitions.ts` is the one projector in this slice that
matches both trace-category event types (`knowledge.selected`,
`relationship.used`, `tool.completed`, `proposal.review.*`,
`artifact.produced`) and runtime-category ones
(`mission.started`, `task.started`, from `runtime-events.ts`) — because
lineage genuinely starts at the mission/task level, one layer up from where
Trace's own event set begins. This is a deliberate, documented exception:
every other Slice 5 projector stays within its own event category.

Note the entity-kind selectivity baked into the `match()` function: not
every `knowledge.*`/`relationship.*` event becomes a lineage node — only
`knowledge.selected` and `relationship.used` do, since those are the two
usage categories that actually informed a decision (per §"Relationship
usage," importance is never inferred solely from traversal — only
`relationship.used`, never `relationship.traversed`, earns a lineage node).
`knowledge.retrieved`/`.supplied`/`.cited` and `relationship.traversed`
still appear in Trace; they are deliberately absent from Provenance.

## 5. Correlation, not a parallel identity scheme

`ProvenanceNode.correlation` reuses `EventCorrelation` (`events.ts`) as-is,
the same shape `TraceEvent.correlation` uses. A node's `id` is always the
entity's own supplied business id (`payload.mission.id`,
`payload.task.taskId`, `payload.usage.knowledgeId`, `payload.artifact.id`,
etc.) — falling back to the source event's own `id` only when the payload
genuinely has no better identity to offer (e.g. a `user_input.received`
event becoming an `"intent"` node). This keeps `ProvenanceNode.id` stable
across live append and full replay for the same reason every other
accumulating node kind in this kit is keyed by business identity, never by
array position — see `PROJECTION_MODEL.md` §"Replayability invariant."

## 6. Where Provenance is rendered

`ProvenanceExplorer` is the root surface — a master-detail composition of
`ProvenanceLineageList` (left) and `ProvenanceInspector` (right) over one
supplied `ProvenanceLineage`, entirely controlled. `ProvenanceNodeCard`/
`ProvenanceEntityBadge` render one node; `ProvenanceEdgeRow` renders one
edge, always rendering `relation` as supplied text, never a computed
strength/weight it wasn't given. `ProvenanceEvidenceEntry`/
`ProvenanceArtifactEntry` render the two wrapper entries from §3.
`ProvenanceSummaryBar` renders nothing when a lineage has zero nodes, and
otherwise one badge+count per entity kind actually present — never a fixed
nine-slot grid with zeros filled in for kinds that never occurred. See
`COMPONENT_CATALOG.md`'s "Provenance family" section for the full
purpose/input/states/events/example breakdown of all nine components, and
`TRACE_REPLAY.md` for how the Architecture Agent Run scenario's Provenance
tab evolves across a real replay.
