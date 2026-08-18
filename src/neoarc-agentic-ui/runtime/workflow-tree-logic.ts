/**
 * neoarc-agentic-ui / runtime / workflow-tree-logic
 *
 * Pure derivation logic for `WorkflowRunTree`'s collapse/expand behavior,
 * extracted out of JSX so the central UX guarantee this component exists to
 * enforce is independently testable: a running, failed, waiting-for-human,
 * or cancelled branch must never disappear behind a collapse, no matter
 * what the human last clicked. Only a clean, terminal-and-uneventful state
 * (`completed`, `idle`, `cancelled` once resolved is intentionally treated
 * as still force-open — see below) may actually collapse.
 *
 * No React, no JSX — importable from a plain `node --test` module.
 */

import type { RuntimeStatus } from "../../neoarc-agentic-contracts/foundation"

/**
 * Whether a `WorkflowGroup`/task row's status is "in progress or needs
 * attention" and must therefore stay visibly expanded regardless of any
 * prior manual collapse. `cancelled` is included deliberately —
 * "cancellation/interruption remains visible" is a named requirement, not
 * an oversight. Only `completed` and `idle` are considered clean enough to
 * collapse.
 */
export function isForceExpandedStatus(status: RuntimeStatus): boolean {
  return (
    status === "running" ||
    status === "queued" ||
    status === "waiting_for_human" ||
    status === "failed" ||
    status === "retrying" ||
    status === "cancelled"
  )
}

/**
 * Resolves whether one `WorkflowGroup` should currently render expanded.
 * `userExpanded` is the human's own last toggle (`undefined` = no manual
 * toggle yet, so the status-derived default applies). Critical statuses
 * always win over a manual collapse — the human can still choose to look
 * away from a clean branch, but never lose visibility into an active or
 * failed one by accident.
 */
export function resolveGroupExpanded(status: RuntimeStatus, userExpanded: boolean | undefined): boolean {
  if (isForceExpandedStatus(status)) return true
  return userExpanded ?? true
}

/** Whether the manual expand/collapse toggle should even be shown — hidden while a status forces the branch open, since toggling it would have no visible effect. */
export function isGroupToggleable(status: RuntimeStatus): boolean {
  return !isForceExpandedStatus(status)
}
