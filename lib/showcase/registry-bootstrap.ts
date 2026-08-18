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
import { GenericFallbackRenderer, type GenericFallbackRendererProps } from "../../components/showcase/execution-lab/generic-fallback-renderer"

export type NodeRenderer = ComponentType<{
  readonly node: AgenticViewNode
  readonly onSelect?: (node: AgenticViewNode) => void
  readonly selected?: boolean
}>

export const executionLabRendererRegistry: RendererRegistry<NodeRenderer> = createRendererRegistry<NodeRenderer>()
executionLabRendererRegistry.registerFallback(GenericFallbackRenderer as NodeRenderer)

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
