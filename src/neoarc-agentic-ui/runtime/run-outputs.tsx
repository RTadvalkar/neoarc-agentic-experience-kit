/**
 * neoarc-agentic-ui / runtime / RunOutputs
 *
 * Purpose: list the artifacts a completed (or still-running, for
 * incrementally produced outputs) run has produced so far — wrapping the
 * existing `ArtifactRef` (`conversation.ts`) rather than a bespoke shape,
 * since "an artifact a run produced" and "an artifact referenced in a
 * message" are the same underlying concept. An empty list renders as an
 * explicit empty state, never a blank gap.
 *
 * Semantic UI events: `run.output.open`.
 */

import type { RunOutput } from "../../neoarc-agentic-contracts/runtime"
import type { RunOutputOpenPayload } from "../../neoarc-agentic-contracts/runtime-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { EmptyState } from "../foundation/empty-state"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"

export interface RunOutputsProps {
  readonly outputs: readonly RunOutput[]
  readonly onEmitOpen?: (event: AgenticUIEvent<RunOutputOpenPayload>) => void
  readonly className?: string
}

export function RunOutputs({ outputs, onEmitOpen, className }: RunOutputsProps) {
  if (outputs.length === 0) {
    return <EmptyState title="No outputs yet" description="Artifacts this run produces will appear here." />
  }

  return (
    <ul className={cn("flex flex-col gap-2", className)} aria-label="Run outputs">
      {outputs.map((output) => (
        <li key={output.id}>
          <button
            type="button"
            disabled={!onEmitOpen}
            onClick={() =>
              onEmitOpen?.(
                createUIEvent({
                  type: "run.output.open",
                  sourceComponent: "RunOutputs",
                  payload: { outputId: output.id },
                }),
              )
            }
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--neoarc-radius-md)] border px-2.5 py-2 text-left",
              "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)]",
              onEmitOpen ? "hover:bg-[var(--neoarc-color-surface-muted)]" : "cursor-default",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
              "disabled:cursor-default",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--neoarc-color-foreground)]">
              {output.artifact.name}
            </span>
            {output.artifact.artifactType ? (
              <span className="shrink-0 text-xs text-[var(--neoarc-color-foreground-subtle)]">{output.artifact.artifactType}</span>
            ) : null}
            {output.artifact.status ? <RuntimeStatusBadge status={output.artifact.status} /> : null}
            <Timestamp value={output.producedAt} variant="relative" className="shrink-0 text-xs" />
          </button>
        </li>
      ))}
    </ul>
  )
}
