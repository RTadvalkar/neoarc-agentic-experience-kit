/**
 * neoarc-agentic-ui / runtime / MissionHeader
 *
 * Purpose: identify the mission a run belongs to — title, supplied risk
 * level, creation time, and (when supplied) the label of the run currently
 * in view. Pure display; a mission's own coarse `RuntimeStatus` is reused
 * from `foundation.ts` rather than a bespoke mission-status vocabulary,
 * since a mission's lifecycle does not need `RunStatus`'s richer
 * transitional states.
 */

import { RiskBadge } from "../foundation/risk-badge"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { Timestamp } from "../foundation/timestamp"
import type { MissionSummary, RunSummary } from "../../neoarc-agentic-contracts/runtime"
import { cn } from "../lib/cn"

export interface MissionHeaderProps {
  readonly mission: MissionSummary
  readonly run?: RunSummary
  readonly className?: string
}

export function MissionHeader({ mission, run, className }: MissionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-[var(--neoarc-color-foreground)]">{mission.title}</h2>
        <RuntimeStatusBadge status={mission.status} />
        {mission.riskLevel ? <RiskBadge level={mission.riskLevel} /> : null}
      </div>
      {mission.description ? (
        <p className="text-sm leading-relaxed text-[var(--neoarc-color-foreground-muted)]">{mission.description}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--neoarc-color-foreground-subtle)]">
        <span>
          Created <Timestamp value={mission.createdAt} variant="relative" />
        </span>
        {run ? (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>
              Current run: <span className="font-medium text-[var(--neoarc-color-foreground-muted)]">{run.label}</span>
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
}
