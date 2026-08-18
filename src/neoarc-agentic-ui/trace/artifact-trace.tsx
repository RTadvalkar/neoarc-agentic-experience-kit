"use client"

import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { Badge } from "../primitives/badge"
import type { ArtifactRef } from "../../neoarc-agentic-contracts/conversation"

/** Renders one artifact fact for the Trace view, reusing `ArtifactRef` as-is rather than re-declaring it. */
export function ArtifactTrace({ detail }: { readonly detail: ArtifactRef }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[var(--neoarc-color-foreground)]">{detail.name}</span>
        {detail.artifactType ? <Badge tone="outline">{detail.artifactType}</Badge> : null}
        {detail.version ? <Badge tone="neutral">{detail.version}</Badge> : null}
      </div>
      {detail.status ? <RuntimeStatusBadge status={detail.status} /> : null}
    </div>
  )
}
