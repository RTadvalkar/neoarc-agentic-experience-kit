/**
 * neoarc-agentic-ui / human-interaction / ExecutionPermissionDialog
 *
 * Purpose: the modal presentation of the same "may this specific tool/
 * action proceed?" request `ExecutionPermissionCard` renders inline.
 * Built on `@base-ui/react`'s `AlertDialog` — a consequential decision
 * should not be dismissible by an accidental click-outside the way a plain
 * `Dialog` is, so this uses the alert-dialog primitive rather than
 * hand-rolling modal semantics. Reuses `ExecutionPermissionCard` for the
 * body so the two presentations never drift.
 *
 * Fully controlled: `open`/`onOpenChange` are owned by the caller, exactly
 * like `EntitySwitcher`'s controlled-value pattern.
 */

import * as React from "react"
import { AlertDialog } from "@base-ui/react/alert-dialog"
import type { ExecutionPermissionRequest } from "../../neoarc-agentic-contracts/human-interaction"
import type {
  PermissionAllowOnceRequestPayload,
  PermissionCancelRequestPayload,
  PermissionRejectRequestPayload,
} from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import type { AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { cn } from "../lib/cn"
import { ExecutionPermissionCard } from "./execution-permission-card"

export interface ExecutionPermissionDialogProps {
  readonly request: ExecutionPermissionRequest
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly trigger?: React.ReactNode
  readonly onEmitAllowOnce?: (event: AgenticUIEvent<PermissionAllowOnceRequestPayload>) => void
  readonly onEmitReject?: (event: AgenticUIEvent<PermissionRejectRequestPayload>) => void
  readonly onEmitCancel?: (event: AgenticUIEvent<PermissionCancelRequestPayload>) => void
  readonly className?: string
}

export function ExecutionPermissionDialog({
  request,
  open,
  onOpenChange,
  trigger,
  onEmitAllowOnce,
  onEmitReject,
  onEmitCancel,
  className,
}: ExecutionPermissionDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialog.Trigger render={<span>{trigger}</span>} /> : null}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-[var(--neoarc-color-overlay)]" />
        <AlertDialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--neoarc-radius-lg)] border p-4",
            "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-raised)] shadow-[var(--neoarc-elevation-3)]",
            className,
          )}
        >
          <AlertDialog.Title className="sr-only">Execution permission requested</AlertDialog.Title>
          <AlertDialog.Description className="sr-only">
            {request.action.actionSummary}
          </AlertDialog.Description>
          {/*
            Deliberately does not auto-close on any emitted event: closing
            immediately would hide the `submitted` ("action pending") state
            this component exists to make visible. The caller decides when
            to close — typically once an authoritative `resolved` request is
            fed back through props, or if the human explicitly cancels.
          */}
          <ExecutionPermissionCard
            request={request}
            onEmitAllowOnce={onEmitAllowOnce}
            onEmitReject={onEmitReject}
            onEmitCancel={(event) => {
              onEmitCancel?.(event)
              onOpenChange(false)
            }}
          />
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
