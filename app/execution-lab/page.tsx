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

import { useMemo, useState } from "react"
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
import { executionLabScenarios } from "../../lib/showcase/fixtures"
import { executionLabRendererRegistry, executionLabSurfaceRegistry } from "../../lib/showcase/registry-bootstrap"
import { ScenarioSelector } from "../../components/showcase/execution-lab/scenario-selector"
import { LabTabBar } from "../../components/showcase/execution-lab/lab-tab-bar"
import { RenderCanvas } from "../../components/showcase/execution-lab/render-canvas"
import { JsonInspector } from "../../components/showcase/execution-lab/json-inspector"
import { EventLog } from "../../components/showcase/execution-lab/event-log"
import { ReplayControls } from "../../components/showcase/execution-lab/replay-controls"
import { ThemeToggle } from "../../components/showcase/execution-lab/theme-toggle"

export default function ExecutionLabPage() {
  const [activeScenarioId, setActiveScenarioId] = useState(executionLabScenarios[0].id)
  const [activeTarget, setActiveTarget] = useState<AgenticViewTarget>("conversation")
  const [selectedNode, setSelectedNode] = useState<AgenticViewNode | undefined>(undefined)
  const [uiEvents, setUiEvents] = useState<readonly AgenticUIEvent[]>([])

  const scenario = useMemo(
    () => executionLabScenarios.find((s) => s.id === activeScenarioId) ?? executionLabScenarios[0],
    [activeScenarioId],
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
            <ReplayControls />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <AgentIdentity agent={scenario.agent} size="sm" />
            <ContextBreadcrumb context={scenario.context} />
          </div>
          <ScenarioSelector
            scenarios={executionLabScenarios}
            activeScenarioId={activeScenarioId}
            onSelect={handleScenarioSelect}
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-6">
        <InlineNotice
          tone="info"
          title={scenario.label}
          description={scenario.description}
        />

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Surface className="flex min-h-0 flex-col gap-3 p-4">
            <LabTabBar activeTarget={activeTarget} onSelect={setActiveTarget} />
            <div className="min-h-0 flex-1 overflow-auto py-2">
              <RenderCanvas
                target={activeTarget}
                events={scenario.events}
                selectedNodeKey={selectedNode?.key}
                onSelectNode={setSelectedNode}
                onEmitUIEvent={handleEmitUIEvent}
              />
            </div>
          </Surface>

          <div className="flex min-h-0 flex-col gap-4">
            <Surface className="flex min-h-0 flex-1 flex-col gap-4 p-4">
              <SectionHeader
                title="Inspectors"
                description="Selecting a rendered node fills both inspectors below with that node's data."
              />
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                <JsonInspector
                  title="Normalized input"
                  description="AgenticEventEnvelope"
                  value={selectedEvent}
                  emptyLabel="Select a node to inspect its source envelope"
                />
                <JsonInspector
                  title="Projected node"
                  description="AgenticViewNode"
                  value={selectedNode}
                  emptyLabel="Select a node to inspect its projected shape"
                />
              </div>
            </Surface>
            <Surface className="flex min-h-0 flex-1 flex-col p-4">
              <EventLog events={uiEvents} />
            </Surface>
          </div>
        </div>

        <Surface variant="muted" className="p-3 text-xs text-[var(--neoarc-color-foreground-muted)]">
          Renderer registry: {executionLabRendererRegistry.listRegistrations().length} specific registration(s), fallback
          registered: {String(executionLabRendererRegistry.hasFallback())}. Surface registry active surfaces:{" "}
          {executionLabSurfaceRegistry.listSurfaces().join(", ") || "none"}.
        </Surface>
      </main>
    </div>
  )
}
