"use client"

/**
 * app/execution-lab/page
 *
 * SHOWCASE-ONLY development/inspection surface for the NeoArc Agentic
 * Experience Kit, required by docs/03_BOOTSTRAP...prompt.md §10. Not part
 * of any product; not a reference experience (those arrive in Slice 7).
 * Composes `src/neoarc-agentic-ui` foundation components and the Slice 1
 * projection seam over showcase-only fixtures — see lib/showcase/.
 */

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { AgenticUIEvent } from "../../src/neoarc-agentic-contracts/ui-events"
import type { AgenticViewNode, AgenticViewTarget } from "../../src/neoarc-agentic-projection/types"
import { AgentIdentity } from "../../src/neoarc-agentic-ui/foundation/agent-identity"
import { ContextBreadcrumb } from "../../src/neoarc-agentic-ui/foundation/context-breadcrumb"
import { SectionHeader } from "../../src/neoarc-agentic-ui/foundation/section-header"
import { InlineNotice } from "../../src/neoarc-agentic-ui/foundation/inline-notice"
import { Badge } from "../../src/neoarc-agentic-ui/primitives/badge"
import { Surface } from "../../src/neoarc-agentic-ui/primitives/surface"
import { allExecutionLabScenarios } from "../../lib/showcase/all-scenarios"
import { executionLabRendererRegistry, executionLabSurfaceRegistry } from "../../lib/showcase/registry-bootstrap"
import { ScenarioSelector } from "../../components/showcase/execution-lab/scenario-selector"
import { LabTabBar } from "../../components/showcase/execution-lab/lab-tab-bar"
import { LabModeSwitch, type LabMode } from "../../components/showcase/execution-lab/lab-mode-switch"
import { RenderCanvas } from "../../components/showcase/execution-lab/render-canvas"
import { JsonInspector } from "../../components/showcase/execution-lab/json-inspector"
import { EventLog } from "../../components/showcase/execution-lab/event-log"
import { ReplayControls } from "../../components/showcase/execution-lab/replay-controls"
import { ThemeToggle } from "../../components/showcase/execution-lab/theme-toggle"
import { ComponentGallery } from "../../components/showcase/execution-lab/component-gallery/component-gallery"
import { useEventReplay } from "../../components/showcase/execution-lab/use-event-replay"

export default function ExecutionLabPage() {
  const [activeMode, setActiveMode] = useState<LabMode>("scenario")
  const [activeScenarioId, setActiveScenarioId] = useState(allExecutionLabScenarios[0].id)
  const [activeTarget, setActiveTarget] = useState<AgenticViewTarget>("conversation")
  const [selectedNode, setSelectedNode] = useState<AgenticViewNode | undefined>(undefined)
  const [uiEvents, setUiEvents] = useState<readonly AgenticUIEvent[]>([])

  const scenario = useMemo(
    () => allExecutionLabScenarios.find((s) => s.id === activeScenarioId) ?? allExecutionLabScenarios[0],
    [activeScenarioId],
  )

  const replay = useEventReplay(scenario.events.length)

  // A newly selected scenario always starts its replay from index 0 and
  // clears the inspector selection — see docs/04 §8 "Reset" semantics.
  useEffect(() => {
    setSelectedNode(undefined)
  }, [activeScenarioId])

  const currentEvent = useMemo(
    () => (replay.currentIndex > 0 ? scenario.events[replay.currentIndex - 1] : undefined),
    [scenario, replay.currentIndex],
  )

  const selectedEvent = useMemo(() => {
    if (!selectedNode) return undefined
    return scenario.events.find((event) => event.id === selectedNode.key)
  }, [scenario, selectedNode])

  const workspaceActions = executionLabSurfaceRegistry.list("workspace.actions")

  function handleScenarioSelect(id: string) {
    setActiveScenarioId(id)
    setSelectedNode(undefined)
  }

  function handleEmitUIEvent(event: AgenticUIEvent) {
    setUiEvents((previous) => [...previous, event])
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
            <h1 className="text-base font-semibold">Execution Lab</h1>
            <Badge tone="warning">Development / showcase only — not a product surface</Badge>
          </div>
          <div className="flex items-center gap-2">
            {workspaceActions.map((action) => (
              <Badge key={action.id} tone="outline">
                {action.label}
              </Badge>
            ))}
            {activeMode === "scenario" ? <ReplayControls replay={replay} /> : null}
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <LabModeSwitch activeMode={activeMode} onSelect={setActiveMode} />
            {activeMode === "scenario" ? (
              <>
                <AgentIdentity agent={scenario.agent} size="sm" />
                <ContextBreadcrumb context={scenario.context} />
              </>
            ) : null}
          </div>
          {activeMode === "scenario" ? (
            <ScenarioSelector
              scenarios={allExecutionLabScenarios}
              activeScenarioId={activeScenarioId}
              onSelect={handleScenarioSelect}
            />
          ) : null}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-6">
        {activeMode === "scenario" ? (
          <InlineNotice tone="info" title={scenario.label} description={scenario.description} />
        ) : null}

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          {activeMode === "gallery" ? (
            <Surface className="min-h-0 overflow-auto p-4">
              <ComponentGallery onEmitUIEvent={handleEmitUIEvent} />
            </Surface>
          ) : (
            <Surface className="flex min-h-0 flex-col gap-3 p-4">
              <LabTabBar activeTarget={activeTarget} onSelect={setActiveTarget} />
              <div className="min-h-0 flex-1 overflow-auto py-2">
                <RenderCanvas
                  target={activeTarget}
                  scenario={scenario}
                  visibleEventCount={replay.currentIndex}
                  selectedNodeKey={selectedNode?.key}
                  onSelectNode={setSelectedNode}
                  onEmitUIEvent={handleEmitUIEvent}
                />
              </div>
            </Surface>
          )}

          <div className="flex min-h-0 flex-col gap-4">
            {activeMode === "scenario" ? (
              <Surface className="flex min-h-0 flex-1 flex-col gap-4 p-4">
                <SectionHeader
                  title="Inspectors"
                  description="\u201cCurrent event\u201d always tracks the replay position. Selecting a rendered node instead fills the input/projected-node pair with that node's own source envelope."
                />
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <JsonInspector
                    title="Current event"
                    description={`Event ${replay.currentIndex} of ${replay.totalEvents}`}
                    value={currentEvent}
                    emptyLabel="Press Play or Step Forward to apply the first event"
                  />
                  <JsonInspector
                    title={selectedNode ? "Selected node's source envelope" : "Normalized input"}
                    description="AgenticEventEnvelope"
                    value={selectedEvent}
                    emptyLabel="Select a rendered node to inspect its source envelope"
                  />
                  <JsonInspector
                    title="Selected node"
                    description="AgenticViewNode"
                    value={selectedNode}
                    emptyLabel="Select a node to inspect its projected shape"
                  />
                </div>
              </Surface>
            ) : (
              <Surface className="flex min-h-0 flex-1 flex-col gap-2 p-4">
                <SectionHeader
                  title="Gallery events"
                  description="Interactions in the gallery (e.g. EntitySwitcher selection) emit real AgenticUIEvent payloads, logged below."
                />
              </Surface>
            )}
            <Surface className="flex min-h-0 flex-1 flex-col p-4">
              <EventLog events={uiEvents} />
            </Surface>
          </div>
        </div>

        {activeMode === "scenario" ? (
          <Surface variant="muted" className="p-3 text-xs text-[var(--neoarc-color-foreground-muted)]">
            Renderer registry: {executionLabRendererRegistry.listRegistrations().length} specific registration(s),
            fallback registered: {String(executionLabRendererRegistry.hasFallback())}. Surface registry active
            surfaces: {executionLabSurfaceRegistry.listSurfaces().join(", ") || "none"}.
          </Surface>
        ) : null}
      </main>
    </div>
  )
}
