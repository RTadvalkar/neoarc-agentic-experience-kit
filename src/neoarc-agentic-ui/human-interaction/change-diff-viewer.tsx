/**
 * neoarc-agentic-ui / human-interaction / ChangeDiffViewer
 *
 * Purpose: render a proposal's supplied `ProposalSection[]` as grouped
 * before/after text changes. Deliberately text-only and line-based — never
 * attempts a semantic/structural diff of arbitrary binary content, and
 * never computes anything the product did not already supply in
 * `ProposalChange.before`/`.after`. A change with only `summary` (no
 * before/after text) renders as a plain summary line rather than an empty
 * diff.
 *
 * Semantic UI events: `proposal.change.open`, emitted when a change with a
 * before/after pair is expanded to full detail.
 */

import * as React from "react"
import { ChevronRight, FileText } from "lucide-react"
import type { ProposalChange, ProposalSection, ProposalSummary } from "../../neoarc-agentic-contracts/proposal"
import type { ProposalChangeOpenPayload } from "../../neoarc-agentic-contracts/human-interaction-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { cn } from "../lib/cn"

export interface ChangeDiffViewerProps {
  readonly proposalId: ProposalSummary["id"]
  readonly sections: readonly ProposalSection[]
  readonly onEmitChangeOpen?: (event: AgenticUIEvent<ProposalChangeOpenPayload>) => void
  readonly className?: string
}

function splitLines(text: string): readonly string[] {
  return text.split("\n")
}

function ChangeRow({
  proposalId,
  change,
  onEmitChangeOpen,
}: {
  readonly proposalId: ProposalSummary["id"]
  readonly change: ProposalChange
  readonly onEmitChangeOpen?: (event: AgenticUIEvent<ProposalChangeOpenPayload>) => void
}) {
  const [expanded, setExpanded] = React.useState(false)
  const hasDiff = change.before !== undefined || change.after !== undefined

  function toggle() {
    const next = !expanded
    setExpanded(next)
    if (next && hasDiff) {
      onEmitChangeOpen?.(
        createUIEvent({
          type: "proposal.change.open",
          sourceComponent: "ChangeDiffViewer",
          payload: { proposalId, changeId: change.id },
        }),
      )
    }
  }

  return (
    <li className="flex flex-col gap-1.5 py-2">
      <button
        type="button"
        disabled={!hasDiff}
        onClick={toggle}
        aria-expanded={hasDiff ? expanded : undefined}
        className={cn(
          "flex w-full items-start gap-2 text-left text-sm",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
          hasDiff ? "cursor-pointer" : "cursor-default",
        )}
      >
        {hasDiff ? (
          <ChevronRight
            aria-hidden="true"
            className={cn("mt-0.5 size-3.5 shrink-0 text-[var(--neoarc-color-foreground-subtle)] transition-transform", expanded && "rotate-90")}
          />
        ) : (
          <FileText aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[var(--neoarc-color-foreground-subtle)]" />
        )}
        <span className="flex flex-col gap-0.5">
          <span className="text-[var(--neoarc-color-foreground)]">{change.summary}</span>
          {change.path ? (
            <code className="text-xs text-[var(--neoarc-color-foreground-subtle)]">{change.path}</code>
          ) : null}
        </span>
      </button>
      {expanded && hasDiff ? (
        <div className="ml-5 overflow-hidden rounded-[var(--neoarc-radius-sm)] border border-[var(--neoarc-color-border)] font-mono text-xs">
          {change.before !== undefined ? (
            <div className="bg-[var(--neoarc-color-danger-muted)]">
              {splitLines(change.before).map((line, index) => (
                <div key={`before-${index}`} className="flex gap-2 px-2 py-0.5 text-[var(--neoarc-color-danger)]">
                  <span aria-hidden="true">-</span>
                  <span className="whitespace-pre-wrap">{line}</span>
                </div>
              ))}
            </div>
          ) : null}
          {change.after !== undefined ? (
            <div className="bg-[var(--neoarc-color-success-muted)]">
              {splitLines(change.after).map((line, index) => (
                <div key={`after-${index}`} className="flex gap-2 px-2 py-0.5 text-[var(--neoarc-color-success)]">
                  <span aria-hidden="true">+</span>
                  <span className="whitespace-pre-wrap">{line}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export function ChangeDiffViewer({ proposalId, sections, onEmitChangeOpen, className }: ChangeDiffViewerProps) {
  if (sections.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {sections.map((section) => (
        <div key={section.id} className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">
            {section.title}
          </span>
          <ul className="flex flex-col divide-y divide-[var(--neoarc-color-border)]">
            {section.changes.map((change) => (
              <ChangeRow key={change.id} proposalId={proposalId} change={change} onEmitChangeOpen={onEmitChangeOpen} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
