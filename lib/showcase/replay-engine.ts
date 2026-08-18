/**
 * lib/showcase/replay-engine
 *
 * SHOWCASE-ONLY. A tiny, pure, framework-neutral state machine for the
 * Execution Lab's Reset / Replay / Pause / Step Forward controls
 * (docs/04 §8). `currentIndex` is "how many of the scenario's events have
 * been applied so far" (0 = none, `totalEvents` = fully replayed).
 * Backward navigation is implemented exactly as the spec allows: reset,
 * then replay forward to the target index — there is no separate
 * "step backward" primitive, by design.
 *
 * Kept free of React/timers/DOM so it is trivially unit-testable and so the
 * React hook that drives it (`use-event-replay.ts`) stays a thin adapter.
 */

export interface ReplayState {
  readonly totalEvents: number
  readonly currentIndex: number
}

export function createReplayState(totalEvents: number): ReplayState {
  return { totalEvents, currentIndex: 0 }
}

/** Advance by exactly one event, clamped to `totalEvents`. */
export function stepForward(state: ReplayState): ReplayState {
  if (state.currentIndex >= state.totalEvents) return state
  return { ...state, currentIndex: state.currentIndex + 1 }
}

/** Reset to the start (index 0) — the "Reset" control, and the first half of "seek backward". */
export function resetReplay(state: ReplayState): ReplayState {
  if (state.currentIndex === 0) return state
  return { ...state, currentIndex: 0 }
}

/** Jump directly to an arbitrary index, clamped to `[0, totalEvents]` — used by "seek to index" in the event log. */
export function seekTo(state: ReplayState, index: number): ReplayState {
  const clamped = Math.max(0, Math.min(state.totalEvents, index))
  if (clamped === state.currentIndex) return state
  return { ...state, currentIndex: clamped }
}

export function isReplayComplete(state: ReplayState): boolean {
  return state.currentIndex >= state.totalEvents
}
