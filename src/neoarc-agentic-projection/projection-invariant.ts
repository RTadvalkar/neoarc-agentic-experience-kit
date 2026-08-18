/**
 * neoarc-agentic-projection / projection-invariant
 *
 * Small helper for node definitions that accumulate across a lifecycle
 * (`run.started` then later `run.*`, `task.started` then later `task.*`).
 * When a later event arrives with no predecessor node for that business
 * key, fail explicitly rather than inventing labels, titles, status, or
 * cancellation state the stream never supplied.
 *
 * Does not change `AgenticNodeDefinition` or the store reducer — `project()`
 * already may throw, and `applyEvent` lets that propagate.
 */

import type { AgenticViewNode } from "./types"

/** Thrown when a later lifecycle event arrives before its required predecessor. */
export class ProjectionInvariantError extends Error {
  readonly eventType: string
  readonly nodeKey: string
  readonly requiredPredecessor: string

  constructor(eventType: string, nodeKey: string, requiredPredecessor: string) {
    super(
      `${eventType} for ${nodeKey} requires a prior ${requiredPredecessor}; refusing to invent a synthetic node`,
    )
    this.name = "ProjectionInvariantError"
    this.eventType = eventType
    this.nodeKey = nodeKey
    this.requiredPredecessor = requiredPredecessor
  }
}

/** Return the existing node, or throw `ProjectionInvariantError` if it is missing. */
export function requireExistingNode<T>(
  existing: AgenticViewNode<T> | undefined,
  eventType: string,
  nodeKey: string,
  requiredPredecessor: string,
): AgenticViewNode<T> {
  if (!existing) {
    throw new ProjectionInvariantError(eventType, nodeKey, requiredPredecessor)
  }
  return existing
}
