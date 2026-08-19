"use client"

/**
 * components/showcase/reference-experiences/mission-center-experience
 *
 * SHOWCASE-ONLY reference experience: an operational control surface for
 * asynchronous agent work — "what is running, what is queued, what needs
 * me, what failed, what completed" at a glance. Unlike the Agent
 * Workspace / Execution Investigation experiences, this page demonstrates
 * the "direct" integration path only (product adapter -> normalized view
 * model -> controlled component, no event replay/projection) using eight
 * static fixtures (`lib/showcase/mission-center-fixtures.ts`) covering
 * queued, running, three distinct "needs you" presentation intents
 * (clarification, execution permission, proposal review), a retryable
 * failure, a plain completion, and a completion with produced outputs.
 *
 * Composes only existing `neoarc-agentic-ui` components for mission/run/
 * task detail and for the three pending-human-interaction presentations —
 * no parallel runtime or inspector component family is introduced. The
 * one showcase-only layout helper (`MissionCenterRow`) exists purely to
 * keep the scan-oriented list calm: pending human work is visually
 * distinguished once, consistently, rather than with per-intent alert
 * styling.
 */

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { AgentTask, RunError, RunOutput, RunSummary } from "../../../src/neoarc-agentic-contracts/runtime"
import type { ClarificationRequest } from "../../../src/neoarc-agentic-contracts/conversation"
import type { ExecutionPermissionRequest } from "../../../src/neoarc-agentic-contracts/human-interaction"
import type { ProposalSummary } from "../../../src/neoarc-agentic-contracts/proposal"
import type { AgenticUIEvent } from "../../../src/neoarc-agentic-contracts/ui-events"
import { AgentIdentity } from "../../../src/neoarc-agentic-ui/foundation/agent-identity"
import { ContextBreadcrumb } from "../../../src/neoarc-agentic-ui/foundation/context-breadcrumb"
import { SectionHeader } from "../../../src/neoarc-agentic-ui/foundation/section-header"
import { InlineNotice } from "../../../src/neoarc-agentic-ui/foundation/inline-notice"
import { EmptyState } from "../../../src/neoarc-agentic-ui/foundation/empty-state"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { MissionHeader } from "../../../src/neoarc-agentic-ui/runtime/mission-header"
import { RunStatusPanel } from "../../../src/neoarc-agentic-ui/runtime/run-status-panel"
import { RunActions } from "../../../src/neoarc-agentic-ui/runtime/run-actions"
import { WorkflowRunTree } from "../../../src/neoarc-agentic-ui/runtime/workflow-run-tree"
import { AgentTaskInspector } from "../../../src/neoarc-agentic-ui/runtime/agent-task-inspector"
import { WaitingForHumanBanner } from "../../../src/neoarc-agentic-ui/runtime/waiting-for-human-banner"
import { RunErrorPanel } from "../../../src/neoarc-agentic-ui/runtime/run-error-panel"
import { RunOutputs } from "../../../src/neoarc-agentic-ui/runtime/run-outputs"
import { ClarificationCard } from "../../../src/neoarc-agentic-ui/conversation/clarification-card"
import { ExecutionPermissionCard } from "../../../src/neoarc-agentic-ui/human-interaction/execution-permission-card"
import { ProposalViewer } from "../../../src/neoarc-agentic-ui/human-interaction/proposal-viewer"
import {
  missionCenterClarification,
  missionCenterContext,
  missionCenterItems,
  missionCenterPermission,
  missionCenterProposal,
  type MissionCenterItem,
} from "../../../lib/showcase/mission-center-fixtures"
import { ThemeToggle } from "../execution-lab/theme-toggle"
import { IntegrationInspector } from "./integration-inspector"
import { MissionCenterRow } from "./mission-center-row"

type MissionCenterGroup = "needs_you" | "active" | "history"

function groupFor(run: RunSummary): MissionCenterGroup {
  if (run.status === "waiting_for_human") return "needs_you"
  if (run.status === "completed" || run.status === "failed" || run.status === "cancelled") return "history"
  return "active"
}

const groupMeta: Record<MissionCenterGroup, { label: string; description: string }> = {
  needs_you: { label: "Needs you", description: "Runs blocked on a human decision." },
  active: { label: "Active", description: "Queued or in-progress runs." },
  history: { label: "History", description: "Completed, failed, or cancelled runs." },
}

const orchestratorAgent = { id: "agent-mission-center-viewer", displayName: "Mission Center", description: "Operational control surface", lifecycleStatus: "active" as const }

export function MissionCenterExperience() {
  const [selectedId, setSelectedId] = React.useState<string>(missionCenterItems[0].id)
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | undefined>(undefined)

  const [runOverrides, setRunOverrides] = React.useState<Record<string, RunSummary>>({})
  const [errorOverrides, setErrorOverrides] = React.useState<Record<string, RunError | undefined>>({})
  const [pendingRunAction, setPendingRunAction] = React.useState<{ readonly itemId: string; readonly action: "cancel" | "retry" } | undefined>(undefined)

  const [clarification, setClarification] = React.useState<ClarificationRequest>(missionCenterClarification)
  const [permission, setPermission] = React.useState<ExecutionPermissionRequest>(missionCenterPermission)
  const [proposal, setProposal] = React.useState<ProposalSummary>(missionCenterProposal)

  const [uiEvents, setUiEvents] = React.useState<readonly AgenticUIEvent[]>([])
  const latestUiEvent = uiEvents[uiEvents.length - 1]
  function handleEmitUIEvent(event: AgenticUIEvent) {
    setUiEvents((previous) => [...previous, event])
  }

  const groups: Record<MissionCenterGroup, readonly MissionCenterItem[]> = { needs_you: [], active: [], history: [] }
  for (const item of missionCenterItems) {
    const run = runOverrides[item.id] ?? item.run
    groups[groupFor(run)].push(item)
  }

  const selectedItem = missionCenterItems.find((item) => item.id === selectedId)
  const selectedRun = selectedItem ? runOverrides[selectedItem.id] ?? selectedItem.run : undefined
  const selectedError = selectedItem ? (errorOverrides[selectedItem.id] ?? selectedItem.error) : undefined
  const selectedTask = selectedTaskId ? selectedItem?.tasks.get(selectedTaskId) : undefined

  function selectItem(id: string) {
    setSelectedId(id)
    setSelectedTaskId(undefined)
  }

  function handleCancel(run: RunSummary, itemId: string) {
    return (event: AgenticUIEvent<{ readonly runId: string }>) => {
      handleEmitUIEvent(event)
      setPendingRunAction({ itemId, action: "cancel" })
      setRunOverrides((previous) => ({ ...previous, [itemId]: { ...run, cancellation: "requested" } }))
      window.setTimeout(() => {
        setRunOverrides((previous) => ({ ...previous, [itemId]: { ...run, status: "cancelled", cancellation: "cancelled" } }))
        setPendingRunAction(undefined)
      }, 700)
    }
  }

  function handleRetry(run: RunSummary, itemId: string) {
    return (event: AgenticUIEvent<{ readonly runId: string }>) => {
      handleEmitUIEvent(event)
      setPendingRunAction({ itemId, action: "retry" })
      window.setTimeout(() => {
        setRunOverrides((previous) => ({ ...previous, [itemId]: { ...run, status: "running", cancellation: "none", retryability: undefined } }))
        setErrorOverrides((previous) => ({ ...previous, [itemId]: undefined }))
        setPendingRunAction(undefined)
      }, 700)
    }
  }

  function handleClarificationEvent(event: AgenticUIEvent<{ readonly clarificationId: string; readonly resolution: string }>) {
    handleEmitUIEvent(event)
    setClarification((previous) => ({ ...previous, resolved: true, resolution: event.payload.resolution }))
  }

  function handlePermissionOutcome(outcome: "allowed_once" | "rejected" | "cancelled") {
    return (event: AgenticUIEvent<{ readonly requestId: string }>) => {
      handleEmitUIEvent(event)
      setPermission((previous) => ({ ...previous, status: "submitted" }))
      window.setTimeout(() => {
        setPermission({ ...missionCenterPermission, status: "resolved", outcome })
      }, 700)
    }
  }

  function handleProposalDecision(action: "approve" | "refine" | "reject" | "defer") {
    return (event: AgenticUIEvent<{ readonly proposalId: string; readonly reason?: string; readonly note?: string }>) => {
      handleEmitUIEvent(event)
      setProposal((previous) => ({ ...previous, pendingAction: action }))
      window.setTimeout(() => {
        setProposal((previous) => ({
          ...previous,
          pendingAction: undefined,
          status: action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "defer" ? "deferred" : "decision_pending",
          decisionHistory: [
            ...(previous.decisionHistory ?? []),
            {
              id: `mission-center-decision-${(previous.decisionHistory?.length ?? 0) + 1}`,
              action,
              decidedBy: { id: "user-jamie", kind: "human", displayName: "Jamie Chen" },
              decidedAt: new Date().toISOString(),
              note: event.payload.reason ?? event.payload.note,
            },
          ],
        }))
      }, 700)
    }
  }

  function renderPendingWork(item: MissionCenterItem) {
    if (item.id === missionCenterItems.find((i) => i.pendingInteraction?.presentationIntent === "clarification")?.id) {
      return <ClarificationCard clarification={clarification} onEmitEvent={handleClarificationEvent} />
    }
    if (item.id === missionCenterItems.find((i) => i.pendingInteraction?.presentationIntent === "execution-permission")?.id) {
      return (
        <ExecutionPermissionCard
          request={permission}
          onEmitAllowOnce={handlePermissionOutcome("allowed_once")}
          onEmitReject={handlePermissionOutcome("rejected")}
          onEmitCancel={handlePermissionOutcome("cancelled")}
        />
      )
    }
    if (item.id === missionCenterItems.find((i) => i.pendingInteraction?.presentationIntent === "proposal-review")?.id) {
      return (
        <ProposalViewer
          proposal={proposal}
          onEmitApply={handleProposalDecision("approve")}
          onEmitRefine={handleProposalDecision("refine")}
          onEmitReject={handleProposalDecision("reject")}
          onEmitDefer={handleProposalDecision("defer")}
        />
      )
    }
    return null
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
            <h1 className="text-base font-semibold">Async Mission Center</h1>
            <Badge tone="outline">Reference experience — showcase only</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/proposal-review"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)]"
            >
              Proposal Review
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <AgentIdentity agent={orchestratorAgent} size="sm" showStatus={false} />
          <ContextBreadcrumb context={missionCenterContext} />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-6">
        <InlineNotice
          tone="info"
          title="Eight representative runs"
          description="A static snapshot — no replay control here. Pending human work is grouped first and marked once, consistently, rather than with a different bright alert per kind of decision."
        />

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
          <Surface className="flex min-h-0 flex-col gap-4 overflow-auto p-3">
            {(["needs_you", "active", "history"] as const).map((groupKey) => {
              const items = groups[groupKey]
              if (items.length === 0) return null
              return (
                <div key={groupKey} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between px-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">
                      {groupMeta[groupKey].label}
                    </span>
                    <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">{items.length}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {items.map((item) => {
                      const run = runOverrides[item.id] ?? item.run
                      return (
                        <MissionCenterRow
                          key={item.id}
                          title={item.mission.title}
                          run={run}
                          riskLevel={item.mission.riskLevel}
                          pendingInteraction={run.status === "waiting_for_human" ? item.pendingInteraction : undefined}
                          selected={item.id === selectedId}
                          onSelect={() => selectItem(item.id)}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </Surface>

          <div className="flex min-h-0 flex-col gap-4 overflow-auto">
            {selectedItem && selectedRun ? (
              <>
                <Surface className="flex flex-col gap-4 p-4">
                  <MissionHeader mission={selectedItem.mission} run={selectedRun} />

                  {selectedItem.humanWaitReason && selectedItem.pendingInteraction && selectedRun.status === "waiting_for_human" ? (
                    <WaitingForHumanBanner reason={selectedItem.humanWaitReason} interaction={selectedItem.pendingInteraction} />
                  ) : null}
                  {renderPendingWork(selectedItem)}

                  {selectedError ? (
                    <RunErrorPanel
                      runId={selectedRun.id}
                      error={selectedError}
                      retrying={pendingRunAction?.itemId === selectedItem.id && pendingRunAction.action === "retry"}
                      onEmitRetry={handleRetry(selectedRun, selectedItem.id)}
                    />
                  ) : null}
                </Surface>

                <Surface className="flex flex-col gap-3 p-4">
                  <RunStatusPanel run={selectedRun} />
                  <RunActions
                    run={selectedRun}
                    pendingAction={pendingRunAction?.itemId === selectedItem.id ? pendingRunAction.action : undefined}
                    onEmitCancel={handleCancel(selectedRun, selectedItem.id)}
                    onEmitRetry={handleRetry(selectedRun, selectedItem.id)}
                  />
                </Surface>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Surface className="flex min-h-0 flex-col gap-3 p-4">
                    <SectionHeader title="Workflow" description="Structural view of this run's phases and tasks." />
                    <WorkflowRunTree
                      groups={selectedItem.workflow}
                      tasks={selectedItem.tasks}
                      selectedTaskId={selectedTaskId}
                      onSelectTask={(task: AgentTask) => setSelectedTaskId(task.taskId)}
                    />
                  </Surface>
                  <Surface className="flex flex-col gap-3 p-4">
                    <SectionHeader title="Task inspector" />
                    <AgentTaskInspector task={selectedTask} />
                  </Surface>
                </div>

                {selectedItem.outputs && selectedItem.outputs.length > 0 ? (
                  <Surface className="flex flex-col gap-3 p-4">
                    <SectionHeader title="Outputs" description="Artifacts this run produced." />
                    <RunOutputs outputs={selectedItem.outputs as readonly RunOutput[]} />
                  </Surface>
                ) : null}

                <Surface className="flex flex-col gap-3 p-4">
                  <SectionHeader title="Integration seam" description="This experience uses the direct DTO -> adapter -> view model path — no event projection." />
                  <IntegrationInspector
                    normalizedEvent={{ mission: selectedItem.mission, run: selectedRun }}
                    latestUiEvent={latestUiEvent}
                    handlerNote="Cancel/retry and clarification/permission/proposal decisions update local React state in this page (mission-center-experience.tsx) after a short simulated delay — never a real backend call."
                    boundaryNote="MissionHeader, RunStatusPanel, RunActions, WorkflowRunTree, AgentTaskInspector, WaitingForHumanBanner, RunErrorPanel, RunOutputs, ClarificationCard, ExecutionPermissionCard, and ProposalViewer all ship from neoarc-agentic-ui. The eight fixtures and this composition are showcase-only — there is no projection step on this page's integration path."
                  />
                </Surface>
              </>
            ) : (
              <EmptyState title="No mission selected" description="Select a mission from the list to inspect it." />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
