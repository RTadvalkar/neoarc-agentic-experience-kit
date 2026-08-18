/**
 * neoarc-agentic-ui / human-interaction / PendingHumanInteractionSummary
 *
 * Purpose: render one `PendingInteraction` — the deliberately shallow,
 * session/mission-scoped summary contract (see `human-interaction.ts`) —
 * for composing into a list of things currently waiting on a human (e.g. a
 * Mission Center panel). This is a summary/entry-point only: clicking it
 * emits `onOpen` so the caller can route to the concrete detail component
 * (`ExecutionPermissionCard`/Dialog for `execution-permission`,
 * `ProposalCard`/Viewer for `proposal-review`, `ClarificationCard` for
 * `clarification`, ...). This component never renders that detail itself
 * and never fabricates it from the shallow summary alone.
 */

import * as React from "react"
import {
  AlertTriangle,
  CheckSquare,
  HelpCircle,
  MessageCircleQuestion,
  ShieldQuestion,
  Undo2,
} from "lucide-react"
import type { PendingInteraction, PresentationIntent } from "../../neoarc-agentic-contracts/human-interaction"
import { RiskBadge } from "../foundation/risk-badge"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"

const intentMeta: Record<PresentationIntent, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  clarification: { label: "Clarification needed", icon: MessageCircleQuestion },
  "execution-permission": { label: "Execution permission requested", icon: ShieldQuestion },
  "proposal-review": { label: "Proposal awaiting review", icon: CheckSquare },
  "risk-acknowledgement": { label: "Risk acknowledgement needed", icon: AlertTriangle },
  override: { label: "Override required", icon: Undo2 },
  confirmation: { label: "Confirmation needed", icon: HelpCircle },
}

export interface PendingHumanInteractionSummaryProps {
  readonly interaction: PendingInteraction
  readonly onOpen?: (interaction: PendingInteraction) => void
  readonly className?: string
}

export function PendingHumanInteractionSummary({
  interaction,
  onOpen,
  className,
}: PendingHumanInteractionSummaryProps) {
  const { label, icon: Icon } = intentMeta[interaction.presentationIntent]

  return (
    <button
      type="button"
      onClick={() => onOpen?.(interaction)}
      className={cn(
        "flex w-full items-start gap-2 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] p-2.5 text-left",
        "hover:bg-[var(--neoarc-color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--neoarc-color-accent)]" />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-xs font-medium text-[var(--neoarc-color-foreground-subtle)]">{label}</span>
        <span className="text-sm text-[var(--neoarc-color-foreground)]">{interaction.label}</span>
        <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
          <Timestamp value={interaction.requestedAt} variant="relative" />
        </span>
      </div>
      {interaction.riskLevel ? <RiskBadge level={interaction.riskLevel} /> : null}
    </button>
  )
}
