/**
 * lib/showcase/registry-bootstrap
 *
 * SHOWCASE-ONLY singleton registry instances for the Execution Lab. A real
 * product would create/own its own `RendererRegistry`/`SurfaceRegistry`
 * instances in its own app code — the kit does not create or export a
 * global singleton itself (see docs/RENDERER_REGISTRY.md,
 * docs/SURFACE_REGISTRY.md). This module exists only to give the Execution
 * Lab something concrete to register into and inspect.
 */

import type { ComponentType } from "react"
import { createRendererRegistry, type RendererRegistry } from "../../src/neoarc-agentic-projection/renderer-registry"
import { createSurfaceRegistry, type SurfaceRegistry } from "../../src/neoarc-agentic-projection/surface-registry"
import type { AgenticViewNode } from "../../src/neoarc-agentic-projection/types"
import type { ConversationUIEventPayload } from "../../src/neoarc-agentic-contracts/conversation-ui-events"
import type { RuntimeUIEventPayload } from "../../src/neoarc-agentic-contracts/runtime-ui-events"
import type { AgenticUIEvent } from "../../src/neoarc-agentic-contracts/ui-events"
import { GenericFallbackRenderer, type GenericFallbackRendererProps } from "../../components/showcase/execution-lab/generic-fallback-renderer"
import { ConversationNodeRenderer } from "../../components/showcase/execution-lab/conversation-node-renderer"
import { RuntimeNodeRenderer } from "../../components/showcase/execution-lab/runtime-node-renderer"
import { TraceNodeRenderer } from "../../components/showcase/execution-lab/trace-node-renderer"
import { ProvenanceNodeRenderer } from "../../components/showcase/execution-lab/provenance-node-renderer"
import { ActivityNodeRenderer } from "../../components/showcase/execution-lab/activity-node-renderer"
import { conversationNodeDefinitions } from "../../src/neoarc-agentic-projection/conversation-node-definitions"
import { runtimeNodeDefinitions } from "../../src/neoarc-agentic-projection/runtime-node-definitions"
import { traceNodeDefinitions } from "../../src/neoarc-agentic-projection/trace-node-definitions"
import { provenanceNodeDefinitions } from "../../src/neoarc-agentic-projection/provenance-node-definitions"
import { activityNodeDefinitions } from "../../src/neoarc-agentic-projection/activity-node-definitions"

export type NodeRenderer = ComponentType<{
  readonly node: AgenticViewNode
  readonly onSelect?: (node: AgenticViewNode) => void
  readonly selected?: boolean
  /** Forwards semantic UI events (citation.open, toolActivity.toggle, ...) emitted by a rendered conversation node. Ignored by renderers that have none to emit. */
  readonly onEmitConversationEvent?: (event: AgenticUIEvent<ConversationUIEventPayload>) => void
  /** Forwards semantic UI events (run.cancel.request, run.retry.request, ...) emitted by a rendered runtime node. Ignored by renderers that have none to emit. */
  readonly onEmitRuntimeEvent?: (event: AgenticUIEvent<RuntimeUIEventPayload>) => void
}>

export const executionLabRendererRegistry: RendererRegistry<NodeRenderer> = createRendererRegistry<NodeRenderer>()
executionLabRendererRegistry.registerFallback(GenericFallbackRenderer as NodeRenderer)

// Slice 2 — register every built-in `conversation.*` node kind through the
// renderer registry, exactly the mechanism docs/RENDERER_REGISTRY.md
// describes: register by (target, kind), never edit a central switch.
// `conversationNodeDefinitions` is the single source of truth for which
// kinds exist; iterating it means a new built-in kind added there is
// automatically wired here too.
for (const definition of conversationNodeDefinitions) {
  executionLabRendererRegistry.register(definition.target, definition.kind, ConversationNodeRenderer as NodeRenderer)
}
// The shared message definition's own `.kind` ("conversation.message") is
// its match-time identity, not a node kind it ever actually produces — see
// `conversationMessageNodeDefinition.project()`, which always resolves the
// final node to one of these two kinds. Register both explicitly.
executionLabRendererRegistry.register("conversation", "conversation.user-message", ConversationNodeRenderer as NodeRenderer)
executionLabRendererRegistry.register("conversation", "conversation.agent-message", ConversationNodeRenderer as NodeRenderer)

// Slice 4 — register every built-in `mission.*` node kind the same way:
// iterate `runtimeNodeDefinitions` (the single source of truth) rather than
// hardcoding "mission.mission" / "mission.run" / "mission.task" here.
for (const definition of runtimeNodeDefinitions) {
  executionLabRendererRegistry.register(definition.target, definition.kind, RuntimeNodeRenderer as NodeRenderer)
}

// Slice 5 — register the Trace, Provenance, and Activity families the same
// way: iterate each family's own node-definitions module rather than
// hardcoding kind strings here.
for (const definition of traceNodeDefinitions) {
  executionLabRendererRegistry.register(definition.target, definition.kind, TraceNodeRenderer as NodeRenderer)
}
for (const definition of provenanceNodeDefinitions) {
  executionLabRendererRegistry.register(definition.target, definition.kind, ProvenanceNodeRenderer as NodeRenderer)
}
for (const definition of activityNodeDefinitions) {
  executionLabRendererRegistry.register(definition.target, definition.kind, ActivityNodeRenderer as NodeRenderer)
}

export interface WorkspaceActionExtension {
  readonly id: string
  readonly label: string
}

export const executionLabSurfaceRegistry: SurfaceRegistry<WorkspaceActionExtension> =
  createSurfaceRegistry<WorkspaceActionExtension>()

executionLabSurfaceRegistry.register({
  surface: "workspace.actions",
  id: "execution-lab-demo-action",
  extension: { id: "execution-lab-demo-action", label: "Export scenario JSON" },
})

export type { GenericFallbackRendererProps }
