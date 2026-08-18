/**
 * neoarc-agentic-ui / runtime / WaitingForHumanBanner
 *
 * Purpose: make it unmissable that a run is blocked on a human, and on
 * what kind of decision — reusing `PendingInteraction` rather than
 * inventing a parallel "blocked reason" shape. Never renders the
 * underlying `ExecutionPermissionCard`/`ClarificationCard`/proposal
 * detail itself; opening that detail is `onEmitOpen`'s job, kept in the
 * calling surface (Chat/Activity/Trace) that actually owns which
 * component renders which presentation intent.
 *
 * Semantic UI events: `run.humanAction.open`.
 */

import type { HumanWaitReason } from "../../neoarc-agentic-contracts/runtime"
import type { PendingInteraction } from "../../neoarc-agentic-contracts/human-interaction"
import type { RunHumanActionOpenPayload } from "../../neoarc-agentic-contracts/runtime-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { InlineNotice } from "../foundation/inline-notice"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"

export interface WaitingForHumanBannerProps {
  readonly reason: HumanWaitReason
  readonly interaction: PendingInteraction
  readonly onEmitOpen?: (event: AgenticUIEvent<RunHumanActionOpenPayload>) => void
  readonly className?: string
}

const reasonCopy: Record<HumanWaitReason, string> = {
  clarification: "This run is paused until a clarifying question is answered.",
  "execution-permission": "This run is paused until a tool action is approved or rejected.",
  "proposal-review": "This run is paused until a proposed change is reviewed.",
  override: "This run is paused pending a human override decision.",
}

export function WaitingForHumanBanner({ reason, interaction, onEmitOpen, className }: WaitingForHumanBannerProps) {
  return (
    <InlineNotice
      tone="warning"
      title={interaction.label}
      className={cn(className)}
      description={
        <span className="flex flex-col gap-1">
          <span>{reasonCopy[reason]}</span>
          <span className="text-xs opacity-80">
            Waiting since <Timestamp value={interaction.requestedAt} variant="relative" />
          </span>
        </span>
      }
      actions={
        onEmitOpen ? (
          <button
            type="button"
            onClick={() =>
              onEmitOpen(
                createUIEvent({
                  type: "run.humanAction.open",
                  sourceComponent: "WaitingForHumanBanner",
                  payload: { interactionId: interaction.id },
                }),
              )
            }
            className={cn(
              "shrink-0 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)]",
              "px-3 py-1.5 text-xs font-medium text-[var(--neoarc-color-foreground)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
            )}
          >
            Review
          </button>
        ) : undefined
      }
    />
  )
}
