/**
 * neoarc-agentic-ui / human-interaction / HumanOverrideDialog
 *
 * Purpose: collect the explicit justification a product's
 * `OverrideRequirement` demands before a proposal's decision can proceed
 * outside normal policy. Built on `@base-ui/react`'s `AlertDialog` for the
 * same reason as `ExecutionPermissionDialog` — this is a consequential,
 * rarely-reversible action that must not be dismissible by an accidental
 * click-outside.
 *
 * This component never decides whether an override is *required* — that
 * is `OverrideRequirement.required`, supplied by the product. It also
 * never claims the override succeeded: submitting only emits
 * `proposal.override.submit`; the caller must feed back an updated
 * `ProposalSummary.status` once the backend confirms.
 *
 * Semantic UI events: `proposal.override.submit`.
 */

import * as React from "react"
import { AlertDialog } from "@base-ui/react/alert-dialog"
import { ShieldAlert } from "lucide-react"
import type { OverrideRequirement, ProposalSummary } from "../../neoarc-agentic-contracts/proposal"
import type { ProposalOverrideSubmitPayload } from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { Spinner } from "../primitives/spinner"
import { cn } from "../lib/cn"

export interface HumanOverrideDialogProps {
  readonly proposalId: ProposalSummary["id"]
  readonly overrideRequirement: OverrideRequirement
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly submitting?: boolean
  readonly onEmitSubmit?: (event: AgenticUIEvent<ProposalOverrideSubmitPayload>) => void
  readonly className?: string
}

export function HumanOverrideDialog({
  proposalId,
  overrideRequirement,
  open,
  onOpenChange,
  submitting = false,
  onEmitSubmit,
  className,
}: HumanOverrideDialogProps) {
  const [justification, setJustification] = React.useState("")

  function handleOpenChange(next: boolean) {
    if (!next) setJustification("")
    onOpenChange(next)
  }

  function submit() {
    const trimmed = justification.trim()
    if (trimmed.length === 0) return
    onEmitSubmit?.(
      createUIEvent({
        type: "proposal.override.submit",
        sourceComponent: "HumanOverrideDialog",
        payload: { proposalId, justification: trimmed },
      }),
    )
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-[var(--neoarc-color-overlay)]" />
        <AlertDialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--neoarc-radius-lg)] border p-4",
            "border-[var(--neoarc-color-danger)] bg-[var(--neoarc-color-surface-raised)] shadow-[var(--neoarc-elevation-3)]",
            className,
          )}
        >
          <div className="flex items-start gap-2">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--neoarc-color-danger)]" />
            <div className="flex flex-col gap-1">
              <AlertDialog.Title className="text-sm font-semibold text-[var(--neoarc-color-foreground)]">
                Override required
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-[var(--neoarc-color-foreground-muted)]">
                {overrideRequirement.reason ?? "This decision requires an explicit human override."}
              </AlertDialog.Description>
              {overrideRequirement.requiredRole ? (
                <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
                  Requires role: <code className="font-mono">{overrideRequirement.requiredRole}</code>
                </span>
              ) : null}
            </div>
          </div>

          <label className="mt-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--neoarc-color-foreground-muted)]">
              Justification (required)
            </span>
            <textarea
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              rows={3}
              disabled={submitting}
              className={cn(
                "rounded-[var(--neoarc-radius-sm)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-2 py-1.5 text-sm",
                "text-[var(--neoarc-color-foreground)] placeholder:text-[var(--neoarc-color-foreground-subtle)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
              )}
              placeholder="Explain why this override is justified…"
            />
          </label>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--neoarc-color-foreground-muted)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting || justification.trim().length === 0}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--neoarc-radius-md)] border border-transparent px-3 py-1.5 text-xs font-medium",
                "bg-[var(--neoarc-color-danger)] text-[var(--neoarc-color-danger-foreground)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {submitting ? <Spinner size="sm" /> : null}
              Submit override
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
