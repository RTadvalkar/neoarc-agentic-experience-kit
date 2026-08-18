"use client"

/**
 * components/showcase/execution-lab/replay-controls
 *
 * SHOWCASE-ONLY placeholder required by docs/03_BOOTSTRAP...prompt.md §10.
 * Slice 1 establishes the control surface; real Reset/Replay/Pause/Step
 * behavior over streamed events arrives in Slice 2
 * (docs/04_CONVERSATION_PROJECTION_REPLAY.prompt.md), which is why every
 * button here is disabled rather than wired to fake behavior.
 */

import { Pause, Play, RotateCcw, StepForward } from "lucide-react"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"

export function ReplayControls() {
  return (
    <div className="flex items-center gap-2 rounded-[var(--neoarc-radius-md)] border border-dashed border-[var(--neoarc-color-border)] px-2.5 py-1.5">
      <span className="text-xs font-medium text-[var(--neoarc-color-foreground-subtle)]">Replay</span>
      <div className="flex items-center gap-1">
        <button type="button" disabled aria-label="Reset" className="rounded-[var(--neoarc-radius-sm)] p-1.5 text-[var(--neoarc-color-foreground-subtle)] disabled:cursor-not-allowed">
          <RotateCcw className="size-3.5" aria-hidden="true" />
        </button>
        <button type="button" disabled aria-label="Play" className="rounded-[var(--neoarc-radius-sm)] p-1.5 text-[var(--neoarc-color-foreground-subtle)] disabled:cursor-not-allowed">
          <Play className="size-3.5" aria-hidden="true" />
        </button>
        <button type="button" disabled aria-label="Pause" className="rounded-[var(--neoarc-radius-sm)] p-1.5 text-[var(--neoarc-color-foreground-subtle)] disabled:cursor-not-allowed">
          <Pause className="size-3.5" aria-hidden="true" />
        </button>
        <button type="button" disabled aria-label="Step" className="rounded-[var(--neoarc-radius-sm)] p-1.5 text-[var(--neoarc-color-foreground-subtle)] disabled:cursor-not-allowed">
          <StepForward className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <Badge tone="neutral">Available in Slice 2</Badge>
    </div>
  )
}
