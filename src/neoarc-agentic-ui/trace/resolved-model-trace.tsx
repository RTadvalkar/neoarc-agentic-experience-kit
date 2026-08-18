/**
 * neoarc-agentic-ui / trace / ResolvedModelTrace
 *
 * Purpose: render the model actually resolved/targeted for a turn.
 * Deliberately `AvailableOr`-wrapped since whether this is shown at all is
 * permission-aware — an adapter may withhold it (e.g.
 * `insufficient_access`) — so this never fabricates a model name when
 * withheld. Composes `TraceRedactedValue` rather than checking
 * `.available` a second time inline.
 *
 * Input model: `resolvedModel: AvailableOr<TraceModelRoute>`.
 */

import type { TraceModelRoute } from "../../neoarc-agentic-contracts/trace"
import type { AvailableOr } from "../../neoarc-agentic-contracts/shared"
import { MetadataList, type MetadataListItem } from "../foundation/metadata-list"
import { TraceRedactedValue } from "./trace-redacted-value"
import { cn } from "../lib/cn"

export interface ResolvedModelTraceProps {
  readonly resolvedModel: AvailableOr<TraceModelRoute>
  readonly className?: string
}

export function ResolvedModelTrace({ resolvedModel, className }: ResolvedModelTraceProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-[var(--neoarc-color-foreground)]">Resolved model</span>
      <TraceRedactedValue
        value={resolvedModel}
        render={(route: TraceModelRoute) => {
          const items: MetadataListItem[] = [{ key: "model", label: "Model", value: <code className="text-xs">{route.modelId}</code> }]
          if (route.provider) items.push({ key: "provider", label: "Provider", value: route.provider })
          if (route.version) items.push({ key: "version", label: "Version", value: route.version })
          return <MetadataList items={items} />
        }}
      />
    </div>
  )
}
