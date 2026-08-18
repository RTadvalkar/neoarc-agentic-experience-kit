/**
 * neoarc-agentic-contracts / provenance
 *
 * Slice 5. Information/decision lineage — "how did we get from user intent
 * to this artifact?" — distinct in purpose from `trace.ts` (chronological
 * forensic execution) even though both may render the same underlying
 * facts (per spec §"Alternate execution views", a fact may have a
 * different renderer in each target).
 *
 * `ProvenanceLineage` only ever contains edges the product adapter actually
 * supplied. The kit never infers a lineage edge from event ordering,
 * timing proximity, or "this ran right before that" — an absent edge means
 * absent, not "not yet computed". Reuses `EvidenceSummary` (`proposal.ts`)
 * and `ArtifactRef` (`conversation.ts`) rather than re-declaring them.
 */

import type { OpaqueId } from "./shared"
import type { EventCorrelation } from "./events"
import type { EvidenceSummary } from "./proposal"
import type { ArtifactRef } from "./conversation"
import type { KnowledgeUsageCategory } from "./trace"

/** The kind of entity one lineage node represents, per spec §8's chain (User Intent -> Mission -> Agent Task -> Knowledge/Relationships/Tools/Decisions -> Proposal -> Artifact). */
export type ProvenanceEntityKind =
  | "intent"
  | "mission"
  | "task"
  | "knowledge"
  | "relationship"
  | "tool"
  | "decision"
  | "proposal"
  | "artifact"

/** One node in a provenance lineage. */
export interface ProvenanceNode {
  readonly id: OpaqueId
  readonly entityKind: ProvenanceEntityKind
  readonly label: string
  readonly occurredAt?: string
  readonly correlation?: EventCorrelation
}

/**
 * One supplied edge between two lineage nodes. `relation` is a free-form
 * label supplied by the adapter (e.g. "produced", "used", "informed") —
 * never inferred by the kit from node ordering or proximity.
 */
export interface ProvenanceEdge {
  readonly id: OpaqueId
  readonly fromNodeId: OpaqueId
  readonly toNodeId: OpaqueId
  readonly relation: string
}

/** A full supplied lineage graph. Only ever contains supplied nodes/edges. */
export interface ProvenanceLineage {
  readonly nodes: readonly ProvenanceNode[]
  readonly edges: readonly ProvenanceEdge[]
}

/** One piece of evidence in a lineage, wrapping `EvidenceSummary` with how it was used — never a duplicate evidence shape. */
export interface EvidenceLineageEntry {
  readonly evidence: EvidenceSummary
  readonly usage: KnowledgeUsageCategory
}

/** One artifact in a lineage, wrapping `ArtifactRef` with which node produced it, when supplied. */
export interface ArtifactLineageEntry {
  readonly artifact: ArtifactRef
  readonly producedByNodeId?: OpaqueId
}
