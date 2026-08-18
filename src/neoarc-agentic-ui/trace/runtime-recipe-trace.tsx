/**
 * neoarc-agentic-ui / trace / RuntimeRecipeTrace
 *
 * Purpose: render the identity/version facts for the semantic runtime
 * recipe in effect for a turn.
 *
 * Input model: `detail: RuntimeRecipeTraceDetail`.
 */

import type { RuntimeRecipeTraceDetail } from "../../neoarc-agentic-contracts/trace"
import { MetadataList, type MetadataListItem } from "../foundation/metadata-list"
import { cn } from "../lib/cn"

export interface RuntimeRecipeTraceProps {
  readonly detail: RuntimeRecipeTraceDetail
  readonly className?: string
}

export function RuntimeRecipeTrace({ detail, className }: RuntimeRecipeTraceProps) {
  const items: MetadataListItem[] = []
  if (detail.recipeId) items.push({ key: "id", label: "Recipe", value: <code className="text-xs">{detail.recipeId}</code> })
  if (detail.version) items.push({ key: "version", label: "Version", value: detail.version })

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-[var(--neoarc-color-foreground)]">{detail.label ?? "Runtime recipe"}</span>
      {items.length > 0 ? <MetadataList items={items} /> : null}
    </div>
  )
}
