"use client"

/**
 * components/showcase/reference-experiences/mission-center-row
 *
 * SHOWCASE-ONLY layout helper for the Async Mission Center reference
 * experience. Composes existing `neoarc-agentic-ui` primitives/foundation
 * components (`Badge`, `RiskBadge`, `RunStatusBadge`, `Timestamp`) into one
 * scannable list row — never a new visual primitive, never a parallel
 * status vocabulary. Pending human work renders with a single calm,
 * consistent "Needs you" treatment (an accent badge + the presentation
 * intent's plain-language label) rather than a different bright color per
 * intent, so a scanning human's eye is drawn to *that one signal*, not to
 * a wall of alerts.
 */

import type { PendingInteraction, PresentationIntent } from "../../../src/neoarc-agentic-contracts/human-interaction"
import type { ProgressSummary, RiskLevel, RunSummary } from "../../../src/neoarc-agentic-contracts/runtime"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"
import { RiskBadge } from "../../../src/neoarc-agentic-ui/foundation/risk-badge"
import { Timestamp } from "../../../src/neoarc-agentic-ui/foundation/timestamp"
import { RunStatusBadge } from "../../../src/neoarc-agentic-ui/runtime/run-status-badge"
import { cn } from "../../../src/neoarc-agentic-ui/lib/cn"

const intentLabel: Record<PresentationIntent, string> = {
  clarification: "Clarification needed",
  "execution-permission": "Execution permission requested",
  "proposal-review": "Proposal awaiting review",
  "risk-acknowledgement": "Risk acknowledgement needed",
  override: "Override required",
  confirmation: "Confirmation needed",
}

function progressLabel(progress: ProgressSummary | undefined): string | undefined {
  if (!progress) return undefined
  const of = progress.totalSteps !== undefined ? `/${progress.totalSteps}` : ""
  return `${progress.completedSteps}${of} steps`
}

export interface MissionCenterRowProps {
  readonly title: string
  readonly run: RunSummary
  readonly riskLevel?: RiskLevel
  readonly pendingInteraction?: PendingInteraction
  readonly selected?: boolean
  readonly onSelect?: () => void
  readonly className?: string
}

export function MissionCenterRow({ title, run, riskLevel, pendingInteraction, selected, onSelect, className }: MissionCenterRowProps) {
  const progress = progressLabel(run.progress)
  const referenceTime = pendingInteraction?.requestedAt ?? run.startedAt ?? run.completedAt

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-[var(--neoarc-radius-md)] border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-[var(--neoarc-color-accent)] bg-[var(--neoarc-color-accent-muted)]"
          : "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] hover:bg-[var(--neoarc-color-surface-muted)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium text-[var(--neoarc-color-foreground)]">{title}</span>
        <RunStatusBadge status={run.status} className="shrink-0" />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--neoarc-color-foreground-subtle)]">
        {run.agent ? <span className="truncate">{run.agent.displayName}</span> : null}
        {progress ? (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{progress}</span>
          </>
        ) : null}
        {referenceTime ? (
          <>
            <span aria-hidden="true">&middot;</span>
            <Timestamp value={referenceTime} variant="relative" />
          </>
        ) : null}
      </div>

      {pendingInteraction ? (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <Badge tone="accent">Needs you</Badge>
          <span className="text-xs text-[var(--neoarc-color-foreground-muted)]">{intentLabel[pendingInteraction.presentationIntent]}</span>
          {riskLevel && riskLevel !== "none" ? <RiskBadge level={riskLevel} /> : null}
        </div>
      ) : riskLevel && (riskLevel === "high" || riskLevel === "critical") ? (
        <div className="pt-0.5">
          <RiskBadge level={riskLevel} />
        </div>
      ) : null}
    </button>
  )
}
