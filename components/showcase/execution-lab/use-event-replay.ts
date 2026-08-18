"use client"

/**
 * components/showcase/execution-lab/use-event-replay
 *
 * SHOWCASE-ONLY React adapter over the pure `lib/showcase/replay-engine`.
 * Owns the autoplay timer (Play advances one event every
 * `AUTOPLAY_INTERVAL_MS`); every other transition (Reset, Pause, Step
 * Forward, seek) is a direct, synchronous call into the pure engine. This
 * is the one place setTimeout appears — the engine itself stays free of
 * timers so it can be unit-tested deterministically.
 */

import { useEffect, useState } from "react"
import {
  createReplayState,
  isReplayComplete,
  resetReplay,
  seekTo,
  stepForward as pureStepForward,
  type ReplayState,
} from "../../../lib/showcase/replay-engine"

const AUTOPLAY_INTERVAL_MS = 900

export interface UseEventReplayResult {
  readonly currentIndex: number
  readonly totalEvents: number
  readonly isPlaying: boolean
  readonly isComplete: boolean
  readonly play: () => void
  readonly pause: () => void
  readonly reset: () => void
  readonly stepForward: () => void
  readonly seekTo: (index: number) => void
}

export function useEventReplay(totalEvents: number): UseEventReplayResult {
  const [state, setState] = useState<ReplayState>(() => createReplayState(totalEvents))
  const [playIntent, setPlayIntent] = useState(false)
  // Tracks the `totalEvents` the current `state` was built for. A new
  // scenario (different `totalEvents`) always restarts the replay from
  // zero — adjusted during render (React's documented pattern for
  // resetting state when a prop changes) rather than in an effect, so no
  // extra render is needed and no setState call ever runs unconditionally
  // inside an effect body.
  const [stateForTotal, setStateForTotal] = useState(totalEvents)
  if (stateForTotal !== totalEvents) {
    setStateForTotal(totalEvents)
    setState(createReplayState(totalEvents))
    setPlayIntent(false)
  }

  const complete = isReplayComplete(state)
  // "Actually playing" additionally requires not being complete, so pausing
  // on completion is a pure derivation rather than a setState call made
  // from inside the timer effect below.
  const isPlaying = playIntent && !complete

  useEffect(() => {
    if (!isPlaying) return
    const timeoutId = window.setTimeout(() => {
      setState((previous) => pureStepForward(previous))
    }, AUTOPLAY_INTERVAL_MS)
    return () => window.clearTimeout(timeoutId)
  }, [isPlaying, state])

  return {
    currentIndex: state.currentIndex,
    totalEvents: state.totalEvents,
    isPlaying,
    isComplete: complete,
    play: () => {
      if (complete) return
      setPlayIntent(true)
    },
    pause: () => setPlayIntent(false),
    reset: () => {
      setPlayIntent(false)
      setState((previous) => resetReplay(previous))
    },
    stepForward: () => {
      setPlayIntent(false)
      setState((previous) => pureStepForward(previous))
    },
    seekTo: (index: number) => {
      setPlayIntent(false)
      setState((previous) => seekTo(previous, index))
    },
  }
}
