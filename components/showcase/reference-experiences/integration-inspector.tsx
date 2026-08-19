"use client"

/**
 * components/showcase/reference-experiences/integration-inspector
 *
 * SHOWCASE-ONLY. One shared, collapsible "how would a product wire this
 * up" panel used by both the Agent Workspace and Execution Investigation
 * reference experiences instead of a bespoke inspector duplicated in every
 * panel (per the brief's "do not replicate an inspector separately in
 * every panel" instruction). It demonstrates, side by side:
 *
 * - the raw normalized input event currently in view;
 * - the projected view-node that event produced (`neoarc-agentic-
 *   projection`'s output — the same shape a `RendererRegistry` adapter
 *   would receive);
 * - the latest semantic UI event a reusable component emitted upward;
 * - a one-line note on the mock showcase handler wired to that event in
 *   this reference page (never a real backend call);
 * - a one-line note on the reusable-vs-showcase-only boundary, i.e. which
 *   half of what's on screen ships in `neoarc-agentic-ui`/`-projection`/
 *   `-contracts` versus which half is this page's own showcase glue.
 *
 * Renders nothing product-specific — every value is handed in by the
 * calling reference page, which owns its own scenario/fixtures.
 */

import { ChevronDown, Plug } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { JsonInspector } from "../execution-lab/json-inspector"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"

export interface IntegrationInspectorProps {
  readonly normalizedEvent?: unknown
  readonly projectedNode?: unknown
  readonly latestUiEvent?: unknown
  readonly handlerNote: string
  readonly boundaryNote: string
  readonly defaultOpen?: boolean
}

export function IntegrationInspector({
  normalizedEvent,
  projectedNode,
  latestUiEvent,
  handlerNote,
  boundaryNote,
  defaultOpen = false,
}: IntegrationInspectorProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <Surface variant="muted" className="flex flex-col gap-0 overflow-hidden">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]">
          <span className="flex items-center gap-2">
            <Plug aria-hidden="true" className="size-4 shrink-0 text-[var(--neoarc-color-accent)]" />
            <span className="text-sm font-medium text-[var(--neoarc-color-foreground)]">Integration inspector</span>
            <Badge tone="outline">showcase-only</Badge>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-[var(--neoarc-color-foreground-subtle)] transition-transform group-data-[panel-open]:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 border-t border-[var(--neoarc-color-border)] p-3">
            <p className="text-xs leading-relaxed text-[var(--neoarc-color-foreground-muted)]">
              How a real product would wire this moment up: the normalized fact that arrived, the view-node the
              reusable projection layer derived from it, and the last semantic UI event a reusable component emitted
              back upward.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <JsonInspector
                title="Normalized event"
                description="What a backend/runtime would emit"
                value={normalizedEvent}
                emptyLabel="No event selected yet."
              />
              <JsonInspector
                title="Projected node"
                description="neoarc-agentic-projection output"
                value={projectedNode}
                emptyLabel="Nothing projected for this selection."
              />
              <JsonInspector
                title="Latest UI event"
                description="Emitted by a reusable component"
                value={latestUiEvent}
                emptyLabel="No semantic UI event emitted yet."
              />
            </div>
            <div className="flex flex-col gap-2 border-t border-[var(--neoarc-color-border-muted)] pt-3">
              <p className="text-xs leading-relaxed text-[var(--neoarc-color-foreground-muted)]">
                <span className="font-medium text-[var(--neoarc-color-foreground)]">Mock handler: </span>
                {handlerNote}
              </p>
              <p className="text-xs leading-relaxed text-[var(--neoarc-color-foreground-muted)]">
                <span className="font-medium text-[var(--neoarc-color-foreground)]">Reusable vs. showcase-only: </span>
                {boundaryNote}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Surface>
    </Collapsible>
  )
}
