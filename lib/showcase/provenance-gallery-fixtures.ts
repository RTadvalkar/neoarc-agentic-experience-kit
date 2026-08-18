/**
 * lib/showcase/provenance-gallery-fixtures
 *
 * SHOWCASE-ONLY. Fixtures for the Provenance UI family entries in the
 * Foundation Component Gallery (`component-gallery.tsx`). Kept out of
 * `src/neoarc-agentic-ui` per docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md
 * ("keep mock data outside reusable components").
 */

import type {
  ArtifactLineageEntry,
  EvidenceLineageEntry,
  ProvenanceEntityKind,
  ProvenanceLineage,
} from "../../src/neoarc-agentic-contracts/provenance"

export const galleryProvenanceEntityKinds: readonly ProvenanceEntityKind[] = [
  "intent",
  "mission",
  "task",
  "knowledge",
  "relationship",
  "tool",
  "decision",
  "proposal",
  "artifact",
]

export const galleryProvenanceLineage: ProvenanceLineage = {
  nodes: [
    { id: "node-intent", entityKind: "intent", label: "Design an async order-events service", occurredAt: "2026-08-18T09:00:02.400Z" },
    { id: "node-mission", entityKind: "mission", label: "Introduce an async order-events service", occurredAt: "2026-08-18T09:00:00.500Z" },
    { id: "node-task", entityKind: "task", label: "Design service boundaries", occurredAt: "2026-08-18T09:00:03.000Z" },
    { id: "node-relationship", entityKind: "relationship", label: "orders-service depends_on orders-table", occurredAt: "2026-08-18T09:00:11.200Z" },
    { id: "node-decision", entityKind: "decision", label: "Approved: matches existing SQS fan-out convention", occurredAt: "2026-08-18T09:00:40.000Z" },
    { id: "node-proposal", entityKind: "proposal", label: "Adopt SQS-based order-events service (ADR-0042)", occurredAt: "2026-08-18T09:00:27.500Z" },
    { id: "node-artifact", entityKind: "artifact", label: "ADR-0042: Adopt SQS-based order-events service", occurredAt: "2026-08-18T09:00:40.500Z" },
  ],
  edges: [
    { id: "edge-1", fromNodeId: "node-intent", toNodeId: "node-mission", relation: "informed" },
    { id: "edge-2", fromNodeId: "node-mission", toNodeId: "node-task", relation: "produced" },
    { id: "edge-3", fromNodeId: "node-task", toNodeId: "node-relationship", relation: "used" },
    { id: "edge-4", fromNodeId: "node-relationship", toNodeId: "node-proposal", relation: "informed" },
    { id: "edge-5", fromNodeId: "node-proposal", toNodeId: "node-decision", relation: "resolved by" },
    { id: "edge-6", fromNodeId: "node-decision", toNodeId: "node-artifact", relation: "produced" },
  ],
}

export const galleryEvidenceLineageEntry: EvidenceLineageEntry = {
  evidence: { id: "evidence-events-pattern", label: "Async events pattern guide", sourceLabel: "internal-wiki", url: "https://example.com/wiki/async-events-pattern" },
  usage: "cited",
}

export const galleryArtifactLineageEntry: ArtifactLineageEntry = {
  artifact: { id: "artifact-adr-42", name: "ADR-0042: Adopt SQS-based order-events service", artifactType: "document", status: "completed", version: "1", url: "https://example.com/adr/0042" },
  producedByNodeId: "node-decision",
}

export const galleryArtifactLineageEntryNoProducer: ArtifactLineageEntry = {
  artifact: { id: "artifact-diagram-42", name: "order-events-service architecture diagram", artifactType: "diagram", status: "completed", url: "https://example.com/diagrams/order-events" },
}
