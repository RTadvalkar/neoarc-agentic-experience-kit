/**
 * neoarc-agentic-ui / runtime / RunStatusPanel
 *
 * Purpose: the compact "how is this run doing right now" summary — status,
 * supplied progress, cancellation-in-flight notice, and start/completion
 * timestamps. Never renders retry/cancel controls itself — see
 * `RunActions` — and never renders the pending human interaction detail
 * itself — see `WaitingForHumanBanner`.
 */

import type { ProgressSummary as ProgressSummaryModel, RunSummary } from "../../neoarc-agentic-contracts/runtime"
import { InlineNotice } from "../foundation/inline-notice"
import { MetadataList, type MetadataListItem } from "../foundation/metadata-list"
import { Timestamp } from "../foundation/timestamp"
import { RunStatusBadge } from "./run-status-badge"
import { cn } from "../lib/cn"

export interface RunStatusPanelProps {
  readonly run: RunSummary
  readonly className?: string
}

function progressLabel(progress: ProgressSummaryModel | undefined): string | undefined {
  if (!progress) return undefined
  const of = progress.totalSteps !== undefined ? ` of ${progress.totalSteps}` : ""
  return `${progress.completedSteps}${of} step${progress.completedSteps === 1 && progress.totalSteps === undefined ? "" : "s"}${progress.label ? ` — ${progress.label}` : ""}`
}

export function RunStatusPanel({ run, className }: RunStatusPanelProps) {
  const items: MetadataListItem[] = []
  if (run.agent) items.push({ key: "agent", label: "Agent", value: run.agent.displayName })
  const progress = progressLabel(run.progress)
  if (progress) items.push({ key: "progress", label: "Progress", value: progress })
  if (run.startedAt) items.push({ key: "started", label: "Started", value: <Timestamp value={run.startedAt} variant="relative" /> })
  if (run.completedAt) items.push({ key: "completed", label: "Completed", value: <Timestamp value={run.completedAt} variant="relative" /> })

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[var(--neoarc-color-foreground)]">{run.label}</span>
        <RunStatusBadge status={run.status} />
      </div>
      {run.cancellation === "requested" ? (
        <InlineNotice
          tone="warning"
          title="Cancellation requested"
          description="Waiting for the runtime to confirm cancellation. This run has not stopped yet."
        />
      ) : null}
      {items.length > 0 ? <MetadataList items={items} /> : null}
    </div>
  )
}
