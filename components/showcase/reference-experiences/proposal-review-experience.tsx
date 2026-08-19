"use client"

/**
 * components/showcase/reference-experiences/proposal-review-experience
 *
 * SHOWCASE-ONLY reference experience: a dedicated business/governance
 * decision surface at `/proposal-review` — deliberately not a large
 * chat-shaped review card. Composes existing `neoarc-agentic-ui`
 * human-interaction components (`ChangeDiffViewer`, `ConflictResolutionPanel`,
 * `DecisionBar`, `HumanOverrideDialog`, `DecisionHistory`,
 * `ProposalStatusTimeline`) directly, rather than the single stacked
 * `ProposalViewer`, so the page can give the main change diff full width
 * and push evidence/risk/conflict/trace/provenance context into
 * progressive-disclosure tabs — the layout the brief's information
 * hierarchy calls for. Trace and Provenance reuse the exact same
 * `TraceExplorer`/`ProvenanceExplorer` components the Execution
 * Investigation experience uses, operating here on hand-authored direct
 * view models (`lib/showcase/proposal-review-fixtures.ts`) instead of a
 * replayed event stream.
 *
 * Local-only controller state demonstrates the full decision lifecycle —
 * ready -> action requested -> pending authoritative confirmation ->
 * resulting state — exactly like the Agent Workspace / Mission Center
 * experiences; there is no backend call anywhere in this file.
 */

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ExternalLink, ShieldAlert } from "lucide-react"
import type { ConflictSummary, DecisionAction, ProposalSummary } from "../../../src/neoarc-agentic-contracts/proposal"
import type { AgenticUIEvent } from "../../../src/neoarc-agentic-contracts/ui-events"
import type {
  ProposalApplyRequestPayload,
  ProposalConflictResolvePayload,
  ProposalDeferRequestPayload,
  ProposalOverrideSubmitPayload,
  ProposalRefineRequestPayload,
  ProposalRejectRequestPayload,
} from "../../../src/neoarc-agentic-contracts/human-interaction-ui-events"
import { SectionHeader } from "../../../src/neoarc-agentic-ui/foundation/section-header"
import { InlineNotice } from "../../../src/neoarc-agentic-ui/foundation/inline-notice"
import { EmptyState } from "../../../src/neoarc-agentic-ui/foundation/empty-state"
import { RiskBadge } from "../../../src/neoarc-agentic-ui/foundation/risk-badge"
import { Timestamp } from "../../../src/neoarc-agentic-ui/foundation/timestamp"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { ProposalStatusBadge } from "../../../src/neoarc-agentic-ui/human-interaction/proposal-status-badge"
import { ChangeDiffViewer } from "../../../src/neoarc-agentic-ui/human-interaction/change-diff-viewer"
import { ConflictResolutionPanel } from "../../../src/neoarc-agentic-ui/human-interaction/conflict-resolution-panel"
import { DecisionBar } from "../../../src/neoarc-agentic-ui/human-interaction/decision-bar"
import { DecisionHistory } from "../../../src/neoarc-agentic-ui/human-interaction/decision-history"
import { HumanOverrideDialog } from "../../../src/neoarc-agentic-ui/human-interaction/human-override-dialog"
import { ProposalStatusTimeline } from "../../../src/neoarc-agentic-ui/human-interaction/proposal-status-timeline"
import { ProvenanceEvidenceEntry } from "../../../src/neoarc-agentic-ui/provenance/provenance-evidence-entry"
import { ProvenanceExplorer } from "../../../src/neoarc-agentic-ui/provenance/provenance-explorer"
import { TraceExplorer } from "../../../src/neoarc-agentic-ui/trace/trace-explorer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import {
  heroProposal,
  heroProposalDecisionPermissionsAfterConflictResolved,
  heroProposalEvidenceLineage,
  heroProposalLineage,
  heroProposalTraceEvents,
  proposalReviewSidebarItems,
} from "../../../lib/showcase/proposal-review-fixtures"
import { ThemeToggle } from "../execution-lab/theme-toggle"
import { IntegrationInspector } from "./integration-inspector"

const policyOutcomeTone = { pass: "success", warning: "warning", violation: "danger" } as const
const riskRank: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3, critical: 4 }

function highestRiskLevel(findings: ProposalSummary["riskFindings"]): ProposalSummary["riskFindings"] extends undefined ? undefined : string | undefined {
  if (!findings || findings.length === 0) return undefined
  return findings.reduce((highest, finding) => (riskRank[finding.level] > riskRank[highest] ? finding.level : highest), findings[0].level)
}

export function ProposalReviewExperience() {
  const [proposalsById, setProposalsById] = React.useState<Record<string, ProposalSummary>>(() =>
    Object.fromEntries(proposalReviewSidebarItems.map((proposal) => [proposal.id, proposal])),
  )
  const [activeId, setActiveId] = React.useState<string>(heroProposal.id)
  const [overrideOpen, setOverrideOpen] = React.useState(false)
  const [uiEvents, setUiEvents] = React.useState<readonly AgenticUIEvent[]>([])

  const activeProposal = proposalsById[activeId]
  const isHero = activeId === heroProposal.id
  const latestUiEvent = uiEvents[uiEvents.length - 1]

  function handleEmitUIEvent(event: AgenticUIEvent) {
    setUiEvents((previous) => [...previous, event])
  }

  function updateActiveProposal(update: (previous: ProposalSummary) => ProposalSummary) {
    setProposalsById((previous) => ({ ...previous, [activeId]: update(previous[activeId]) }))
  }

  function handleDecision(action: DecisionAction) {
    return (
      event: AgenticUIEvent<
        ProposalApplyRequestPayload | ProposalRefineRequestPayload | ProposalRejectRequestPayload | ProposalDeferRequestPayload
      >,
    ) => {
      handleEmitUIEvent(event)
      updateActiveProposal((previous) => ({ ...previous, pendingAction: action }))
      window.setTimeout(() => {
        updateActiveProposal((previous) => ({
          ...previous,
          pendingAction: undefined,
          status:
            action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "defer" ? "deferred" : "decision_pending",
          decisionHistory: [
            ...(previous.decisionHistory ?? []),
            {
              id: `proposal-review-decision-${(previous.decisionHistory?.length ?? 0) + 1}`,
              action,
              decidedBy: { id: "user-jamie", kind: "human", displayName: "Jamie Chen" },
              decidedAt: new Date().toISOString(),
              note: "reason" in event.payload ? event.payload.reason : undefined,
            },
          ],
        }))
      }, 700)
    }
  }

  function handleOverrideSubmit(event: AgenticUIEvent<ProposalOverrideSubmitPayload>) {
    handleEmitUIEvent(event)
    updateActiveProposal((previous) => ({ ...previous, pendingAction: "override" }))
    window.setTimeout(() => {
      updateActiveProposal((previous) => ({
        ...previous,
        pendingAction: undefined,
        status: "overridden",
        decisionHistory: [
          ...(previous.decisionHistory ?? []),
          {
            id: `proposal-review-decision-${(previous.decisionHistory?.length ?? 0) + 1}`,
            action: "override",
            decidedBy: { id: "user-jamie", kind: "human", displayName: "Jamie Chen" },
            decidedAt: new Date().toISOString(),
            note: event.payload.justification,
          },
        ],
      }))
      setOverrideOpen(false)
    }, 700)
  }

  function handleConflictResolve(event: AgenticUIEvent<ProposalConflictResolvePayload>) {
    handleEmitUIEvent(event)
    updateActiveProposal((previous) => {
      const conflicts: readonly ConflictSummary[] = (previous.conflicts ?? []).map((conflict) =>
        conflict.id === event.payload.conflictId ? { ...conflict, resolved: true, resolution: event.payload.resolution } : conflict,
      )
      const allResolved = conflicts.every((conflict) => conflict.resolved)
      return {
        ...previous,
        conflicts,
        decisionPermissions: allResolved ? heroProposalDecisionPermissionsAfterConflictResolved : previous.decisionPermissions,
        status: allResolved && previous.status === "conflicted" ? "decision_pending" : previous.status,
      }
    })
  }

  if (!activeProposal) {
    return null
  }

  const riskLevel = highestRiskLevel(activeProposal.riskFindings)
  const canOverride = Boolean(activeProposal.overrideRequirement?.required)

  const tabs: Array<{ readonly value: string; readonly label: string }> = [{ value: "evidence", label: "Evidence" }, { value: "risk", label: "Risks & policy" }]
  if ((activeProposal.conflicts ?? []).length > 0) tabs.push({ value: "conflicts", label: "Conflicts" })
  if (isHero) {
    tabs.push({ value: "trace", label: "Trace" }, { value: "provenance", label: "Provenance" })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--neoarc-color-background)] text-[var(--neoarc-color-foreground)]">
      <header className="flex flex-col gap-3 border-b border-[var(--neoarc-color-border)] px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)]"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Overview
            </Link>
            <span className="h-4 w-px bg-[var(--neoarc-color-border)]" aria-hidden="true" />
            <h1 className="text-base font-semibold">Proposal Review Workspace</h1>
            <Badge tone="outline">Reference experience — showcase only</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/mission-center"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)]"
            >
              <ArrowRight className="size-3.5 rotate-180" aria-hidden="true" />
              Mission Center
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-6">
        <InlineNotice
          tone="info"
          title="Business decision, not execution permission"
          description="Approving, refining, rejecting, or deferring here answers 'should this proposal become authoritative?' — a strictly different question from an execution-permission gate."
        />

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <Surface className="flex h-fit flex-col gap-2 p-3">
            <span className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">
              Proposals
            </span>
            {proposalReviewSidebarItems.map((seed) => {
              const proposal = proposalsById[seed.id]
              return (
                <button
                  key={seed.id}
                  type="button"
                  onClick={() => setActiveId(seed.id)}
                  aria-pressed={activeId === seed.id}
                  className={`flex flex-col gap-1.5 rounded-[var(--neoarc-radius-md)] border px-3 py-2.5 text-left transition-colors ${
                    activeId === seed.id
                      ? "border-[var(--neoarc-color-accent)] bg-[var(--neoarc-color-accent-muted)]"
                      : "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] hover:bg-[var(--neoarc-color-surface-muted)]"
                  } focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]`}
                >
                  <span className="truncate text-sm font-medium text-[var(--neoarc-color-foreground)]">{proposal.title}</span>
                  <ProposalStatusBadge status={proposal.status} className="w-fit" />
                </button>
              )
            })}
          </Surface>

          <div className="flex min-h-0 flex-col gap-4">
            <Surface className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-[var(--neoarc-color-foreground)]">{activeProposal.title}</h2>
                  <p className="text-sm leading-relaxed text-[var(--neoarc-color-foreground-muted)]">{activeProposal.summary}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <ProposalStatusBadge status={activeProposal.status} />
                  {riskLevel ? <RiskBadge level={riskLevel as never} /> : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--neoarc-color-foreground-subtle)]">
                <span>
                  Revision {activeProposal.revision.revision} &middot; <Timestamp value={activeProposal.revision.createdAt} variant="relative" />
                </span>
                {activeProposal.revision.summary ? <span>{activeProposal.revision.summary}</span> : null}
                {canOverride ? (
                  <span className="inline-flex items-center gap-1 text-[var(--neoarc-color-warning)]">
                    <ShieldAlert className="size-3.5" aria-hidden="true" />
                    Override required to proceed outside policy
                  </span>
                ) : null}
              </div>
            </Surface>

            <Surface className="flex flex-col gap-3 p-4">
              <SectionHeader title="Proposed changes" description="Every before/after change this proposal supplies." />
              {activeProposal.sections.length > 0 ? (
                <ChangeDiffViewer proposalId={activeProposal.id} sections={activeProposal.sections} />
              ) : (
                <EmptyState title="No changes supplied" />
              )}
            </Surface>

            <Surface className="flex flex-col gap-3 p-4">
              <Tabs defaultValue={tabs[0]?.value ?? "evidence"}>
                <TabsList>
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="evidence" className="flex flex-col gap-2">
                  {isHero && heroProposalEvidenceLineage.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {heroProposalEvidenceLineage.map((entry) => (
                        <ProvenanceEvidenceEntry key={entry.evidence.id} entry={entry} />
                      ))}
                    </div>
                  ) : activeProposal.evidence && activeProposal.evidence.length > 0 ? (
                    <ul className="flex flex-col gap-1.5">
                      {activeProposal.evidence.map((item) => (
                        <li key={item.id} className="flex items-center gap-1.5 text-sm text-[var(--neoarc-color-foreground-muted)]">
                          <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noreferrer" className="underline">
                              {item.label}
                            </a>
                          ) : (
                            <span>{item.label}</span>
                          )}
                          {item.sourceLabel ? <span className="text-[var(--neoarc-color-foreground-subtle)]">— {item.sourceLabel}</span> : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState title="No evidence supplied" description="This proposal did not supply any evidence references." />
                  )}
                </TabsContent>

                <TabsContent value="risk" className="flex flex-col gap-3">
                  {(activeProposal.riskFindings?.length ?? 0) > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">Risk findings</span>
                      {activeProposal.riskFindings!.map((finding) => (
                        <InlineNotice key={finding.id} tone={finding.level === "low" || finding.level === "none" ? "info" : "warning"} title={finding.summary} />
                      ))}
                    </div>
                  ) : null}
                  {(activeProposal.policyFindings?.length ?? 0) > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">Policy findings</span>
                      {activeProposal.policyFindings!.map((finding) => (
                        <InlineNotice key={finding.id} tone={policyOutcomeTone[finding.outcome]} title={finding.policyName} description={finding.summary} />
                      ))}
                    </div>
                  ) : null}
                  {(activeProposal.riskFindings?.length ?? 0) === 0 && (activeProposal.policyFindings?.length ?? 0) === 0 ? (
                    <EmptyState title="No risk or policy findings supplied" />
                  ) : null}
                </TabsContent>

                <TabsContent value="conflicts" className="flex flex-col gap-2">
                  {(activeProposal.conflicts?.length ?? 0) > 0 ? (
                    <ConflictResolutionPanel proposalId={activeProposal.id} conflicts={activeProposal.conflicts!} onEmitResolve={handleConflictResolve} />
                  ) : (
                    <EmptyState title="No conflicts" />
                  )}
                </TabsContent>

                <TabsContent value="trace" className="flex flex-col gap-2">
                  {isHero ? <TraceExplorer events={heroProposalTraceEvents} /> : <EmptyState title="No trace supplied for this proposal" />}
                </TabsContent>

                <TabsContent value="provenance" className="flex flex-col gap-2">
                  {isHero ? <ProvenanceExplorer lineage={heroProposalLineage} /> : <EmptyState title="No lineage supplied for this proposal" />}
                </TabsContent>
              </Tabs>
            </Surface>

            <Surface className="flex flex-col gap-3 p-4">
              <SectionHeader title="Decision" description="Only the actions this proposal's decisionPermissions currently allow render as clickable." />
              {activeProposal.lastActionFailed ? (
                <InlineNotice
                  tone="danger"
                  title={`Could not ${activeProposal.lastActionFailed.action} this proposal`}
                  description={activeProposal.lastActionFailed.reason}
                />
              ) : null}
              <DecisionBar
                proposalId={activeProposal.id}
                decisionPermissions={activeProposal.decisionPermissions}
                pendingAction={activeProposal.pendingAction}
                onEmitApply={handleDecision("approve")}
                onEmitRefine={handleDecision("refine")}
                onEmitReject={handleDecision("reject")}
                onEmitDefer={handleDecision("defer")}
                onRequestOverride={canOverride ? () => setOverrideOpen(true) : undefined}
              />
              {activeProposal.overrideRequirement ? (
                <HumanOverrideDialog
                  proposalId={activeProposal.id}
                  overrideRequirement={activeProposal.overrideRequirement}
                  open={overrideOpen}
                  onOpenChange={setOverrideOpen}
                  submitting={activeProposal.pendingAction === "override"}
                  onEmitSubmit={handleOverrideSubmit}
                />
              ) : null}
            </Surface>

            <Surface className="flex flex-col gap-3 p-4">
              <SectionHeader title="Revision & decision history" />
              <ProposalStatusTimeline proposal={activeProposal} />
              {activeProposal.decisionHistory && activeProposal.decisionHistory.length > 0 ? (
                <DecisionHistory proposalId={activeProposal.id} decisions={activeProposal.decisionHistory} />
              ) : null}
            </Surface>

            <Surface className="flex flex-col gap-3 p-4">
              <SectionHeader title="Integration seam" description="Direct DTO -> adapter -> view model path — no event projection on this page." />
              <IntegrationInspector
                normalizedEvent={activeProposal}
                latestUiEvent={latestUiEvent}
                handlerNote="Decisions, conflict resolution, and override submission update local React state in this page (proposal-review-experience.tsx) after a short simulated delay — never a real backend call."
                boundaryNote="ChangeDiffViewer, ConflictResolutionPanel, DecisionBar, HumanOverrideDialog, DecisionHistory, ProposalStatusTimeline, ProvenanceEvidenceEntry, TraceExplorer, and ProvenanceExplorer all ship from neoarc-agentic-ui. The fixtures and this composition are showcase-only."
              />
            </Surface>
          </div>
        </div>
      </main>
    </div>
  )
}
