"use client"

/**
 * components/showcase/reference-experiences/agent-workspace-experience
 *
 * SHOWCASE-ONLY reference experience (Slice 7-style deliverable): "what a
 * product actually building an agent workspace on top of the kit would
 * assemble." Composes existing `neoarc-agentic-ui` components only — no
 * new visual primitives are introduced here — driven by the same
 * "Architecture Agent Run" normalized event stream the Execution Lab's
 * Trace scenario already replays (`lib/showcase/trace-fixtures.ts`), plus
 * a small set of showcase-only fixtures
 * (`lib/showcase/agent-workspace-fixtures.ts`) for the fuller pending
 * human-interaction detail the trace vocabulary intentionally keeps
 * shallow.
 *
 * Two integration modes side by side, both real (never simulated):
 * - Chat + pending human work is rendered straight from `AgentConversation`
 *   / `ClarificationCard` / `ExecutionPermissionCard` / `ProposalViewer` —
 *   the "DTO -> adapter -> view model -> controlled component" path, using
 *   this page's own local mock state as the "backend."
 * - Mission/Run/Task status is rendered from `neoarc-agentic-projection`
 *   output (`projectScenarioNodes` over `runtimeNodeDefinitions`) — the
 *   "event -> projector -> view node -> component" path.
 *
 * The shared `IntegrationInspector` demonstrates exactly this seam for
 * whichever task is currently selected, so the boundary between reusable
 * kit code and this page's showcase glue stays visible rather than
 * implied.
 */

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { AgenticUIEvent } from "../../../src/neoarc-agentic-contracts/ui-events"
import type { AgentTask, MissionSummary } from "../../../src/neoarc-agentic-contracts/runtime"
import type { ClarificationRequest } from "../../../src/neoarc-agentic-contracts/conversation"
import type { ExecutionPermissionRequest } from "../../../src/neoarc-agentic-contracts/human-interaction"
import type { ProposalSummary } from "../../../src/neoarc-agentic-contracts/proposal"
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
import { AgentConversation } from "../../../src/neoarc-agentic-ui/conversation/agent-conversation"
import { ClarificationCard } from "../../../src/neoarc-agentic-ui/conversation/clarification-card"
import { ExecutionPermissionCard } from "../../../src/neoarc-agentic-ui/human-interaction/execution-permission-card"
import { ProposalViewer } from "../../../src/neoarc-agentic-ui/human-interaction/proposal-viewer"
import { runtimeNodeDefinitions, type RunProjection } from "../../../src/neoarc-agentic-projection/runtime-node-definitions"
import { conversationNodeDefinitions } from "../../../src/neoarc-agentic-projection/conversation-node-definitions"
import type { ConversationTimelineItem } from "../../../src/neoarc-agentic-contracts/conversation"
import { architectureAgentRunScenario } from "../../../lib/showcase/trace-fixtures"
import {
  deriveWorkspaceStageIndex,
  workspaceClarification,
  workspaceExecutionPermission,
  workspaceJourneyStages,
  workspaceProposal,
} from "../../../lib/showcase/agent-workspace-fixtures"
import { useEventReplay } from "../execution-lab/use-event-replay"
import { ReplayControls } from "../execution-lab/replay-controls"
import { ThemeToggle } from "../execution-lab/theme-toggle"
import { projectScenarioNodes } from "./project-scenario-nodes"
import { IntegrationInspector } from "./integration-inspector"

const scenario = architectureAgentRunScenario

export function AgentWorkspaceExperience() {
  const replay = useEventReplay(scenario.events.length)
  const visibleEvents = React.useMemo(() => scenario.events.slice(0, replay.currentIndex), [replay.currentIndex])

  const missionNodes = React.useMemo(
    () => projectScenarioNodes(visibleEvents, runtimeNodeDefinitions, "mission"),
    [visibleEvents],
  )
  const conversationItems = React.useMemo(
    () =>
      projectScenarioNodes(visibleEvents, conversationNodeDefinitions, "conversation").map(
        (node) => node.data as ConversationTimelineItem,
      ),
    [visibleEvents],
  )

  const mission = missionNodes.find((node) => node.kind === "mission.mission")?.data as MissionSummary | undefined
  const runProjection = missionNodes.find((node) => node.kind === "mission.run")?.data as RunProjection | undefined
  const taskNodes = missionNodes.filter((node) => node.kind === "mission.task")
  const tasks = React.useMemo(() => {
    const map = new Map<string, AgentTask>()
    for (const node of taskNodes) {
      const task = node.data as AgentTask
      map.set(task.taskId, task)
    }
    return map
  }, [taskNodes])

  const [selectedTaskId, setSelectedTaskId] = React.useState<string | undefined>(undefined)
  const selectedTask = selectedTaskId ? tasks.get(selectedTaskId) : undefined

  const [uiEvents, setUiEvents] = React.useState<readonly AgenticUIEvent[]>([])
  const latestUiEvent = uiEvents[uiEvents.length - 1]

  function handleEmitUIEvent(event: AgenticUIEvent) {
    setUiEvents((previous) => [...previous, event])
  }

  // Local mock "backend" state for the three pending human-interaction
  // fixtures — this is the showcase-only handler boundary the
  // IntegrationInspector below calls out; a real product would instead
  // await a backend confirmation before feeding an updated prop back down.
  const [clarification, setClarification] = React.useState<ClarificationRequest>(workspaceClarification)
  const [permission, setPermission] = React.useState<ExecutionPermissionRequest>(workspaceExecutionPermission)
  const [proposal, setProposal] = React.useState<ProposalSummary>(workspaceProposal)

  const stageIndex = deriveWorkspaceStageIndex(replay.currentIndex)
  const clarificationStage = workspaceJourneyStages.findIndex((stage) => stage.id === "clarification")
  const permissionStage = workspaceJourneyStages.findIndex((stage) => stage.id === "permission")
  const proposalStage = workspaceJourneyStages.findIndex((stage) => stage.id === "proposal")

  const showClarification = stageIndex >= clarificationStage && !clarification.resolved
  const showPermission = stageIndex >= permissionStage && permission.status !== "resolved"
  const showProposal = stageIndex >= proposalStage && proposal.status === "ready_for_review"

  function handleClarificationEvent(event: AgenticUIEvent<{ readonly clarificationId: string; readonly resolution: string }>) {
    handleEmitUIEvent(event)
    setClarification((previous) => ({ ...previous, resolved: true, resolution: event.payload.resolution }))
  }

  function handlePermissionOutcome(outcome: "allowed_once" | "rejected" | "cancelled") {
    return (event: AgenticUIEvent<{ readonly requestId: string }>) => {
      handleEmitUIEvent(event)
      setPermission((previous) => ({ ...previous, status: "submitted" }))
      window.setTimeout(() => {
        setPermission({ ...workspaceExecutionPermission, status: "resolved", outcome })
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
              id: `workspace-decision-${(previous.decisionHistory?.length ?? 0) + 1}`,
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

  const selectedTaskNode = selectedTask ? taskNodes.find((node) => (node.data as AgentTask).taskId === selectedTask.taskId) : undefined

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
            <h1 className="text-base font-semibold">Agent Workspace</h1>
            <Badge tone="outline">Reference experience — showcase only</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/execution-investigation"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)]"
            >
              Execution Investigation
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <ReplayControls replay={replay} />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <AgentIdentity agent={scenario.agent} size="sm" />
          <ContextBreadcrumb context={scenario.context} />
        </div>
        <ol className="flex flex-wrap items-center gap-1.5" aria-label="Session progress">
          {workspaceJourneyStages.map((stage, index) => (
            <li key={stage.id}>
              <Badge tone={index <= stageIndex ? "accent" : "neutral"}>{stage.label}</Badge>
            </li>
          ))}
        </ol>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-6">
        <InlineNotice tone="info" title={scenario.label} description={scenario.description} />

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex min-h-0 flex-col gap-4">
            <Surface className="flex flex-col gap-4 p-4">
              {mission ? (
                <MissionHeader mission={mission} run={runProjection?.run} />
              ) : (
                <EmptyState title="No mission yet" description="Press Play or Step Forward to start the session." />
              )}

              {showClarification ? (
                <ClarificationCard clarification={clarification} onEmitEvent={handleClarificationEvent} />
              ) : null}
              {showPermission ? (
                <ExecutionPermissionCard
                  request={permission}
                  onEmitAllowOnce={handlePermissionOutcome("allowed_once")}
                  onEmitReject={handlePermissionOutcome("rejected")}
                  onEmitCancel={handlePermissionOutcome("cancelled")}
                />
              ) : null}
            </Surface>

            <Surface className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <SectionHeader title="Conversation" description="Rendered directly from projected conversation.* events." />
              <div className="min-h-0 flex-1 overflow-auto">
                <AgentConversation items={conversationItems} onEmitEvent={handleEmitUIEvent} />
              </div>
            </Surface>

            {showProposal ? (
              <Surface className="flex flex-col gap-3 p-4">
                <SectionHeader title="Proposal review" description="A business decision — separate from the execution-permission gate above." />
                <ProposalViewer
                  proposal={proposal}
                  onEmitApply={handleProposalDecision("approve")}
                  onEmitRefine={handleProposalDecision("refine")}
                  onEmitReject={handleProposalDecision("reject")}
                  onEmitDefer={handleProposalDecision("defer")}
                />
              </Surface>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col gap-4">
            <Surface className="flex flex-col gap-3 p-4">
              {runProjection ? (
                <>
                  <RunStatusPanel run={runProjection.run} />
                  <RunActions run={runProjection.run} />
                </>
              ) : (
                <EmptyState title="No run yet" description="The run panel populates once the session starts." />
              )}
            </Surface>

            <Surface className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <SectionHeader title="Workflow" description="Structural view of the run's phases and tasks." />
              <div className="min-h-0 flex-1 overflow-auto">
                <WorkflowRunTree
                  groups={runProjection?.workflow ?? []}
                  tasks={tasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={(task) => setSelectedTaskId(task.taskId)}
                />
              </div>
            </Surface>

            <Surface className="flex flex-col gap-3 p-4">
              <SectionHeader title="Task inspector" />
              <AgentTaskInspector task={selectedTask} />
            </Surface>

            <IntegrationInspector
              normalizedEvent={visibleEvents[visibleEvents.length - 1]}
              projectedNode={selectedTaskNode ?? runProjection}
              latestUiEvent={latestUiEvent}
              handlerNote="Clarification/permission/proposal decisions update local React state in this page (agent-workspace-experience.tsx) after a short simulated delay — never a real backend call."
              boundaryNote="AgentConversation, ClarificationCard, ExecutionPermissionCard, ProposalViewer, MissionHeader, RunStatusPanel, RunActions, WorkflowRunTree, and AgentTaskInspector all ship from neoarc-agentic-ui; the replay engine, event fixtures, and this composition are showcase-only."
            />
          </div>
        </div>
      </main>
    </div>
  )
}
