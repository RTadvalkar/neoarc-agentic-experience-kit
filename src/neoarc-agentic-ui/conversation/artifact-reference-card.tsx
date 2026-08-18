/**
 * neoarc-agentic-ui / conversation / ArtifactReferenceCard
 *
 * Purpose: render a single supplied `ArtifactRef` (document, diagram, code
 * change, ...). Reused both inline on `AgentResponse` (message.artifacts)
 * and as the renderer for the standalone `conversation.artifact` projected
 * node kind — the same component, the same data shape, per
 * `neoarc-agentic-contracts/conversation.ts`'s module doc comment.
 *
 * Semantic UI events: emits `"artifact.open"` (`ArtifactOpenPayload`).
 */

import * as React from "react"
import { FileBox } from "lucide-react"
import type { ArtifactRef } from "../../neoarc-agentic-contracts/conversation"
import type { ArtifactOpenPayload } from "../../neoarc-agentic-contracts/conversation-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { Surface } from "../primitives/surface"
import { cn } from "../lib/cn"

export interface ArtifactReferenceCardProps {
  readonly artifact: ArtifactRef
  readonly onEmitEvent?: (event: AgenticUIEvent<ArtifactOpenPayload>) => void
  readonly className?: string
}

export function ArtifactReferenceCard({ artifact, onEmitEvent, className }: ArtifactReferenceCardProps) {
  return (
    <Surface variant="muted" className={cn("w-full", className)}>
      <button
        type="button"
        onClick={() =>
          onEmitEvent?.(
            createUIEvent({
              type: "artifact.open",
              sourceComponent: "ArtifactReferenceCard",
              payload: { artifactId: artifact.id },
            }),
          )
        }
        className="flex w-full items-center gap-3 rounded-[var(--neoarc-radius-lg)] p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
      >
        <FileBox aria-hidden="true" className="size-4 shrink-0 text-[var(--neoarc-color-foreground-subtle)]" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-[var(--neoarc-color-foreground)]">{artifact.name}</span>
          <span className="truncate text-xs text-[var(--neoarc-color-foreground-subtle)]">
            {[artifact.artifactType, artifact.version].filter(Boolean).join(" \u2022 ") || "Artifact"}
          </span>
        </div>
        {artifact.status ? <RuntimeStatusBadge status={artifact.status} /> : null}
      </button>
    </Surface>
  )
}
