"use client"

/**
 * components/showcase/execution-lab/replay-controls
 *
 * Slice 2 — real Reset / Replay / Pause / Step Forward behavior over the
 * active scenario's events (docs/04 §8), driven by `useEventReplay`. Also
 * shows the required "event index" readout (`currentIndex / totalEvents`).
 * Backward navigation is reset + replay-to-index, exactly as the spec
 * allows — there is no dedicated "step backward" control.
 */

import { Pause, Play, RotateCcw, StepForward } from "lucide-react"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"
import { cn } from "../../../src/neoarc-agentic-ui/lib/cn"
import type { UseEventReplayResult } from "./use-event-replay"

export interface ReplayControlsProps {
  readonly replay: UseEventReplayResult
}

const controlButtonClasses =
  "rounded-[var(--neoarc-radius-sm)] p-1.5 text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)] disabled:cursor-not-allowed disabled:text-[var(--neoarc-color-foreground-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"

export function ReplayControls({ replay }: ReplayControlsProps) {
  const { currentIndex, totalEvents, isPlaying, isComplete, play, pause, reset, stepForward } = replay
  const hasEvents = totalEvents > 0

  return (
    <div className="flex items-center gap-2 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] px-2.5 py-1.5">
      <span className="text-xs font-medium text-[var(--neoarc-color-foreground-subtle)]">Replay</span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={reset} disabled={!hasEvents || currentIndex === 0} aria-label="Reset" className={cn(controlButtonClasses)}>
          <RotateCcw className="size-3.5" aria-hidden="true" />
        </button>
        {isPlaying ? (
          <button type="button" onClick={pause} aria-label="Pause" className={controlButtonClasses}>
            <Pause className="size-3.5" aria-hidden="true" />
          </button>
        ) : (
          <button type="button" onClick={play} disabled={!hasEvents || isComplete} aria-label="Play" className={controlButtonClasses}>
            <Play className="size-3.5" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={stepForward}
          disabled={!hasEvents || isComplete}
          aria-label="Step forward"
          className={controlButtonClasses}
        >
          <StepForward className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <Badge tone={isComplete && hasEvents ? "success" : "neutral"} aria-live="polite">
        {hasEvents ? `${currentIndex} / ${totalEvents}` : "0 / 0"}
      </Badge>
    </div>
  )
}
