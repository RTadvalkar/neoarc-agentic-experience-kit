/**
 * neoarc-agentic-ui / provenance / ProvenanceEntityBadge
 *
 * A small labeled badge for one `ProvenanceEntityKind`. Purely
 * presentational — reused by `ProvenanceNodeCard`, `ProvenanceLineageList`,
 * and the inspector so the same entity-kind vocabulary reads identically
 * everywhere in the Provenance family.
 */

import { Badge, type BadgeProps } from "../primitives/badge"
import type { ProvenanceEntityKind } from "../../neoarc-agentic-contracts/provenance"

type BadgeTone = NonNullable<BadgeProps["tone"]>

const LABEL: Record<ProvenanceEntityKind, string> = {
  intent: "Intent",
  mission: "Mission",
  task: "Task",
  knowledge: "Knowledge",
  relationship: "Relationship",
  tool: "Tool",
  decision: "Decision",
  proposal: "Proposal",
  artifact: "Artifact",
}

const TONE: Record<ProvenanceEntityKind, BadgeTone> = {
  intent: "neutral",
  mission: "info",
  task: "info",
  knowledge: "neutral",
  relationship: "neutral",
  tool: "neutral",
  decision: "warning",
  proposal: "warning",
  artifact: "success",
}

export interface ProvenanceEntityBadgeProps {
  readonly entityKind: ProvenanceEntityKind
  readonly className?: string
}

export function ProvenanceEntityBadge({ entityKind, className }: ProvenanceEntityBadgeProps) {
  return (
    <Badge tone={TONE[entityKind]} className={className}>
      {LABEL[entityKind]}
    </Badge>
  )
}
