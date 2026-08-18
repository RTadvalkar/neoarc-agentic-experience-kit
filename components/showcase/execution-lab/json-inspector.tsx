"use client"

/**
 * components/showcase/execution-lab/json-inspector
 *
 * SHOWCASE-ONLY. Generic pretty-printed JSON viewer used for both the
 * "normalized input JSON inspector" and the "projected-node inspector"
 * required by docs/03_BOOTSTRAP...prompt.md §10.
 */

import { SectionHeader } from "../../../src/neoarc-agentic-ui/foundation/section-header"
import { EmptyState } from "../../../src/neoarc-agentic-ui/foundation/empty-state"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"

export interface JsonInspectorProps {
  readonly title: string
  readonly description?: string
  readonly value: unknown
  readonly emptyLabel: string
}

export function JsonInspector({ title, description, value, emptyLabel }: JsonInspectorProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <SectionHeader title={title} description={description} />
      {value === undefined ? (
        <EmptyState title={emptyLabel} />
      ) : (
        <Surface variant="muted" className="min-h-0 flex-1 overflow-auto p-3">
          <pre className="text-xs leading-relaxed text-[var(--neoarc-color-foreground)]">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        </Surface>
      )}
    </div>
  )
}
