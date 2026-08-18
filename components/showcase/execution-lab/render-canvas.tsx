"use client"

/**
 * components/showcase/execution-lab/render-canvas
 *
 * SHOWCASE-ONLY. Projects a scenario's events — up to `visibleEventCount`,
 * driven by the Reset/Replay/Pause/Step replay engine
 * (`use-event-replay.ts`) — into `AgenticViewNode`s for the current tab's
 * `AgenticViewTarget`, then resolves and renders each one through
 * `executionLabRendererRegistry`.
 *
 * Scenario families, each selecting which node-definition modules feed
 * `applyEvents`:
 * - "foundation" (Slice 1): each event maps 1:1 to a `"foundation.event"`
 *   node via the demo `projectFoundationEvent`, which has no specific
 *   registration and always falls back to `GenericFallbackRenderer`.
 * - "conversation" (Slice 2): `conversationNodeDefinitions` only.
 * - "runtime" (Slice 4): `runtimeNodeDefinitions` only.
 * - "trace" (Slice 5): the union of `traceNodeDefinitions`,
 *   `provenanceNodeDefinitions`, `activityNodeDefinitions`,
 *   `runtimeNodeDefinitions`, and `conversationNodeDefinitions` — a trace
 *   scenario's single event stream can carry `mission.*`/`conversation.*`
 *   events alongside its trace/provenance/activity ones, so the Mission and
 *   Chat tabs render real content for it too (not just Trace/Provenance/
 *   Activity), matching Gate 5's "Architecture Agent Run replays across all
 *   four views" (docs/11_V0_GATE_CHECKLIST.md).
 */

import { useMemo } from "react"
import type { AgenticEventEnvelope } from "../../../src/neoarc-agentic-contracts/events"
import type { ConversationUIEventPayload } from "../../../src/neoarc-agentic-contracts/conversation-ui-events"
import type { RuntimeUIEventPayload } from "../../../src/neoarc-agentic-contracts/runtime-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../../src/neoarc-agentic-contracts/ui-events"
import type { AgenticViewNode, AgenticViewTarget } from "../../../src/neoarc-agentic-projection/types"
import { applyEvents, createProjectionStore, selectNodes } from "../../../src/neoarc-agentic-projection/projection-store"
import { conversationNodeDefinitions } from "../../../src/neoarc-agentic-projection/conversation-node-definitions"
import { runtimeNodeDefinitions } from "../../../src/neoarc-agentic-projection/runtime-node-definitions"
import { traceNodeDefinitions } from "../../../src/neoarc-agentic-projection/trace-node-definitions"
import { provenanceNodeDefinitions } from "../../../src/neoarc-agentic-projection/provenance-node-definitions"
import { activityNodeDefinitions } from "../../../src/neoarc-agentic-projection/activity-node-definitions"
import type { AgenticNodeDefinition } from "../../../src/neoarc-agentic-projection/types"
import { EmptyState } from "../../../src/neoarc-agentic-ui/foundation/empty-state"
import { projectFoundationEvent } from "../../../lib/showcase/generic-projector"
import type { AnyExecutionLabScenario } from "../../../lib/showcase/all-scenarios"
import { executionLabRendererRegistry } from "../../../lib/showcase/registry-bootstrap"

export interface RenderCanvasProps {
  readonly target: AgenticViewTarget
  readonly scenario: AnyExecutionLabScenario
  readonly visibleEventCount: number
  readonly selectedNodeKey: string | undefined
  readonly onSelectNode: (node: AgenticViewNode) => void
  readonly onEmitUIEvent: (event: AgenticUIEvent) => void
}

export function RenderCanvas({
  target,
  scenario,
  visibleEventCount,
  selectedNodeKey,
  onSelectNode,
  onEmitUIEvent,
}: RenderCanvasProps) {
  const visibleEvents = useMemo(() => scenario.events.slice(0, visibleEventCount), [scenario, visibleEventCount])

  const nodes = useMemo(() => {
    if (scenario.family === "foundation") {
      return (visibleEvents as readonly AgenticEventEnvelope[]).map((event) => projectFoundationEvent(event, target))
    }
    const definitions: readonly AgenticNodeDefinition<unknown, unknown>[] =
      scenario.family === "runtime"
        ? runtimeNodeDefinitions
        : scenario.family === "trace"
          ? [
              ...traceNodeDefinitions,
              ...provenanceNodeDefinitions,
              ...activityNodeDefinitions,
              ...runtimeNodeDefinitions,
              ...conversationNodeDefinitions,
            ]
          : conversationNodeDefinitions
    const store = applyEvents(createProjectionStore(), visibleEvents as readonly AgenticEventEnvelope[], definitions)
    return selectNodes(store).filter((node) => node.target === target)
  }, [scenario, visibleEvents, target])

  function handleConversationEvent(event: AgenticUIEvent<ConversationUIEventPayload>) {
    onEmitUIEvent(event)
  }

  function handleRuntimeEvent(event: AgenticUIEvent<RuntimeUIEventPayload>) {
    onEmitUIEvent(event)
  }

  if (nodes.length === 0) {
    return (
      <EmptyState
        title="No projected nodes"
        description={
          visibleEventCount === 0
            ? "No events have been replayed yet — press Play or Step Forward."
            : "This scenario has no events for this view."
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-2" role="list" aria-label={`${target} render canvas`}>
      {nodes.map((node) => {
        const Renderer = executionLabRendererRegistry.resolve(target, node.kind)
        if (!Renderer) return null
        return (
          <div key={node.key} role="listitem">
            <Renderer
              node={node}
              selected={node.key === selectedNodeKey}
              onEmitConversationEvent={handleConversationEvent}
              onEmitRuntimeEvent={handleRuntimeEvent}
              onSelect={(selected) => {
                onSelectNode(selected)
                onEmitUIEvent(
                  createUIEvent({
                    type: "inspector.node.select",
                    sourceComponent: "GenericFallbackRenderer",
                    correlation: selected.correlation,
                    payload: { key: selected.key, kind: selected.kind, target: selected.target },
                  }),
                )
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
