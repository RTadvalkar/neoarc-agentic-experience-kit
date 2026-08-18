"use client"

/**
 * components/showcase/execution-lab/render-canvas
 *
 * SHOWCASE-ONLY. Projects the active scenario's fixture events into
 * `AgenticViewNode`s for the current tab's `AgenticViewTarget`, then resolves
 * and renders each one through `executionLabRendererRegistry` — the actual
 * renderer-registry lookup path a real feature would use, not a bespoke
 * switch statement. Selecting a node emits a real `AgenticUIEvent`.
 */

import { useMemo } from "react"
import type { AgenticEventEnvelope } from "../../../src/neoarc-agentic-contracts/events"
import { createUIEvent, type AgenticUIEvent } from "../../../src/neoarc-agentic-contracts/ui-events"
import type { AgenticViewNode, AgenticViewTarget } from "../../../src/neoarc-agentic-projection/types"
import { EmptyState } from "../../../src/neoarc-agentic-ui/foundation/empty-state"
import { projectFoundationEvent } from "../../../lib/showcase/generic-projector"
import type { FoundationScenarioPayload } from "../../../lib/showcase/fixtures"
import { executionLabRendererRegistry } from "../../../lib/showcase/registry-bootstrap"

export interface RenderCanvasProps {
  readonly target: AgenticViewTarget
  readonly events: readonly AgenticEventEnvelope<FoundationScenarioPayload>[]
  readonly selectedNodeKey: string | undefined
  readonly onSelectNode: (node: AgenticViewNode) => void
  readonly onEmitUIEvent: (event: AgenticUIEvent) => void
}

export function RenderCanvas({ target, events, selectedNodeKey, onSelectNode, onEmitUIEvent }: RenderCanvasProps) {
  const nodes = useMemo(
    () => events.map((event) => projectFoundationEvent(event, target)),
    [events, target],
  )

  if (nodes.length === 0) {
    return <EmptyState title="No projected nodes" description="This scenario has no events for this view." />
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
