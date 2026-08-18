"use client"

/**
 * components/showcase/reference-experiences/execution-investigation-experience
 *
 * SHOWCASE-ONLY reference experience. Demonstrates docs/07's "Alternate
 * execution views" contract directly: the Conversation, Activity, Trace,
 * and Provenance tabs below are NOT four independently hand-authored
 * fixture sets — they are the same "Architecture Agent Run" normalized
 * event stream (`lib/showcase/trace-fixtures.ts`, shared with the
 * Execution Lab's Trace scenario and the Agent Workspace experience),
 * projected through each target's own built-in `neoarc-agentic-projection`
 * node definitions (`conversationNodeDefinitions`, `activityNodeDefinitions`,
 * `traceNodeDefinitions`, `provenanceNodeDefinitions`). Scrubbing the
 * shared replay control changes what every tab shows in lockstep, because
 * they all read from the same sliced event window — proving the same
 * underlying facts really do get a different renderer per target, rather
 * than four screens that merely look related.
 *
 * `IntegrationInspector` (shared with the Agent Workspace experience)
 * shows this exact seam for whichever trace event is currently selected.
 */

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { ConversationTimelineItem, ActivitySummary } from "../../../src/neoarc-agentic-contracts/conversation"
import type { ExecutionTraceSummary, TraceEvent } from "../../../src/neoarc-agentic-contracts/trace"
import type { ProvenanceEdge, ProvenanceLineage, ProvenanceNode } from "../../../src/neoarc-agentic-contracts/provenance"
import type { TraceEventSelectPayload, TraceUIEventPayload } from "../../../src/neoarc-agentic-contracts/trace-ui-events"
import type { AgenticUIEvent } from "../../../src/neoarc-agentic-contracts/ui-events"
import { AgentIdentity } from "../../../src/neoarc-agentic-ui/foundation/agent-identity"
import { ContextBreadcrumb } from "../../../src/neoarc-agentic-ui/foundation/context-breadcrumb"
import { SectionHeader } from "../../../src/neoarc-agentic-ui/foundation/section-header"
import { InlineNotice } from "../../../src/neoarc-agentic-ui/foundation/inline-notice"
import { EmptyState } from "../../../src/neoarc-agentic-ui/foundation/empty-state"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { RuntimeStatusBadge } from "../../../src/neoarc-agentic-ui/foundation/runtime-status-badge"
import { MissionHeader } from "../../../src/neoarc-agentic-ui/runtime/mission-header"
import { AgentConversation } from "../../../src/neoarc-agentic-ui/conversation/agent-conversation"
import { ActivitySummaryList } from "../../../src/neoarc-agentic-ui/conversation/activity-summary-list"
import { TraceExplorer } from "../../../src/neoarc-agentic-ui/trace/trace-explorer"
import { TraceUsageSummary } from "../../../src/neoarc-agentic-ui/trace/trace-usage-summary"
import { TraceTimingSummary } from "../../../src/neoarc-agentic-ui/trace/trace-timing-summary"
import { ProvenanceExplorer } from "../../../src/neoarc-agentic-ui/provenance/provenance-explorer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { conversationNodeDefinitions } from "../../../src/neoarc-agentic-projection/conversation-node-definitions"
import { activityNodeDefinitions } from "../../../src/neoarc-agentic-projection/activity-node-definitions"
import { traceNodeDefinitions } from "../../../src/neoarc-agentic-projection/trace-node-definitions"
import { provenanceNodeDefinitions } from "../../../src/neoarc-agentic-projection/provenance-node-definitions"
import { architectureAgentRunScenario } from "../../../lib/showcase/trace-fixtures"
import { investigationMission } from "../../../lib/showcase/execution-investigation-fixtures"
import { useEventReplay } from "../execution-lab/use-event-replay"
import { ReplayControls } from "../execution-lab/replay-controls"
import { ThemeToggle } from "../execution-lab/theme-toggle"
import { projectScenarioNodes } from "./project-scenario-nodes"
import { IntegrationInspector } from "./integration-inspector"

const scenario = architectureAgentRunScenario

function sortByField<T>(items: readonly T[], field: (item: T) => string): readonly T[] {
  return items.slice().sort((a, b) => field(a).localeCompare(field(b)))
}

export function ExecutionInvestigationExperience() {
  const replay = useEventReplay(scenario.events.length)
  const visibleEvents = React.useMemo(() => scenario.events.slice(0, replay.currentIndex), [replay.currentIndex])
  const [selectedEventId, setSelectedEventId] = React.useState<string | undefined>(undefined)

  const conversationItems = React.useMemo<readonly ConversationTimelineItem[]>(
    () =>
      sortByField(
        projectScenarioNodes(visibleEvents, conversationNodeDefinitions, "conversation").map(
          (node) => node.data as ConversationTimelineItem,
        ),
        (item) => item.createdAt,
      ),
    [visibleEvents],
  )

  const activitySummaries = React.useMemo<readonly ActivitySummary[]>(
    () =>
      sortByField(
        projectScenarioNodes(visibleEvents, activityNodeDefinitions, "activity").map(
          (node) => node.data as ActivitySummary,
        ),
        (item) => item.occurredAt,
      ),
    [visibleEvents],
  )

  const traceNodes = React.useMemo(
    () => projectScenarioNodes(visibleEvents, traceNodeDefinitions, "trace"),
    [visibleEvents],
  )
  const traceEvents = React.useMemo<readonly TraceEvent[]>(
    () =>
      sortByField(
        traceNodes.filter((node) => node.kind === "trace.event").map((node) => node.data as TraceEvent),
        (event) => event.occurredAt,
      ),
    [traceNodes],
  )
  const traceSummary = traceNodes.find((node) => node.kind === "trace.summary")?.data as ExecutionTraceSummary | undefined
  const selectedTraceNode = traceNodes.find(
    (node) => node.kind === "trace.event" && (node.data as TraceEvent).id === selectedEventId,
  )

  const provenanceLineage = React.useMemo<ProvenanceLineage>(() => {
    const nodes = projectScenarioNodes(visibleEvents, provenanceNodeDefinitions, "provenance")
    return {
      nodes: nodes.filter((node) => node.kind === "provenance.node").map((node) => node.data as ProvenanceNode),
      edges: nodes.filter((node) => node.kind === "provenance.edge").map((node) => node.data as ProvenanceEdge),
    }
  }, [visibleEvents])

  const latestEvent = visibleEvents[visibleEvents.length - 1]

  function handleTraceEmitEvent(event: AgenticUIEvent<TraceUIEventPayload>) {
    if (event.type === "trace.event.select") {
      setSelectedEventId((event.payload as TraceEventSelectPayload).eventId)
    }
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
            <h1 className="text-base font-semibold">Execution Investigation</h1>
            <Badge tone="outline">Reference experience — showcase only</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/agent-workspace"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)]"
            >
              <ArrowRight className="size-3.5 rotate-180" aria-hidden="true" />
              Agent Workspace
            </Link>
            <ReplayControls replay={replay} />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <AgentIdentity agent={scenario.agent} size="sm" />
          <ContextBreadcrumb context={scenario.context} />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-6">
        <InlineNotice
          tone="info"
          title="One event log, four renderers"
          description="Conversation, Activity, Trace, and Provenance below all read the same sliced window of the Architecture Agent Run event stream — scrub the shared replay control and watch every tab move together."
        />

        <Surface className="flex flex-col gap-3 p-4">
          <MissionHeader mission={investigationMission} />
        </Surface>

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Surface className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <Tabs defaultValue="conversation">
              <TabsList>
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="trace">Trace</TabsTrigger>
                <TabsTrigger value="provenance">Provenance</TabsTrigger>
              </TabsList>

              <TabsContent value="conversation" className="flex flex-col gap-3">
                <SectionHeader
                  title="Conversation"
                  description="Human-facing interaction — projected via conversationNodeDefinitions."
                />
                {conversationItems.length > 0 ? (
                  <AgentConversation items={conversationItems} />
                ) : (
                  <EmptyState title="No conversation yet" description="Press Play or Step Forward to start the session." />
                )}
              </TabsContent>

              <TabsContent value="activity" className="flex flex-col gap-3">
                <SectionHeader
                  title="Activity"
                  description="Concise, always-safe progress entries — projected via activityNodeDefinitions from the same broad event set Trace also reads."
                />
                {activitySummaries.length > 0 ? (
                  <ActivitySummaryList items={activitySummaries} />
                ) : (
                  <EmptyState title="No activity yet" description="Press Play or Step Forward to start the session." />
                )}
              </TabsContent>

              <TabsContent value="trace" className="flex flex-col gap-3">
                <SectionHeader
                  title="Trace"
                  description="Chronological forensic execution log — projected via traceNodeDefinitions."
                />
                {traceSummary ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <RuntimeStatusBadge status={traceSummary.status} />
                    {traceSummary.usage ? <TraceUsageSummary usage={traceSummary.usage} /> : null}
                    {traceSummary.timing ? <TraceTimingSummary timing={traceSummary.timing} /> : null}
                  </div>
                ) : null}
                {traceEvents.length > 0 ? (
                  <TraceExplorer events={traceEvents} />
                ) : (
                  <EmptyState title="No trace events yet" description="Press Play or Step Forward to start the session." />
                )}
              </TabsContent>

              <TabsContent value="provenance" className="flex flex-col gap-3">
                <SectionHeader
                  title="Provenance"
                  description="Information/decision lineage — projected via provenanceNodeDefinitions. Edges only appear when the source event supplied a producer reference."
                />
                {provenanceLineage.nodes.length > 0 ? (
                  <ProvenanceExplorer lineage={provenanceLineage} />
                ) : (
                  <EmptyState title="No lineage yet" description="Press Play or Step Forward to start the session." />
                )}
              </TabsContent>
            </Tabs>
          </Surface>

          <div className="flex min-h-0 flex-col gap-4">
            <Surface className="flex flex-col gap-3 p-4">
              <SectionHeader title="Trace events" description="Select a row in the Trace tab to inspect its normalized event." />
              <div className="max-h-72 overflow-auto">
                {traceEvents.length === 0 ? (
                  <EmptyState title="Nothing to inspect" />
                ) : (
                  <ul className="flex flex-col gap-1">
                    {traceEvents.map((event) => {
                      const node = traceNodes.find((candidate) => candidate.kind === "trace.event" && (candidate.data as TraceEvent).id === event.id)
                      const isSelected = selectedNode?.key === node?.key
                      return (
                        <li key={event.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedNode(node)}
                            aria-pressed={isSelected}
                            className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-[var(--neoarc-color-surface-muted)] aria-pressed:bg-[var(--neoarc-color-surface-muted)]"
                          >
                            <span className="truncate text-[var(--neoarc-color-foreground-muted)]">{event.detail.kind}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </Surface>

            <IntegrationInspector
              normalizedEvent={latestEvent}
              projectedNode={selectedNode}
              handlerNote="This page owns no pending human-interaction state — see the Agent Workspace experience for the ClarificationCard / ExecutionPermissionCard / ProposalViewer handler boundary."
              boundaryNote="AgentConversation, ActivitySummaryList, TraceExplorer, TraceUsageSummary, TraceTimingSummary, ProvenanceExplorer, and MissionHeader all ship from neoarc-agentic-ui; the four node-definition modules ship from neoarc-agentic-projection. The replay engine, event fixtures, and this composition are showcase-only."
            />
          </div>
        </div>
      </main>
    </div>
  )
}
