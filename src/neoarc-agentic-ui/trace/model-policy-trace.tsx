/**
 * neoarc-agentic-ui / trace / ModelPolicyTrace
 *
 * Purpose: render the identity/version facts for the model policy in
 * effect for a turn. Distinct from `ResolvedModelTrace`, which renders the
 * actual model *route* resolved under this policy — the policy identity
 * itself is never permission-aware (unlike the resolved model).
 *
 * Input model: `detail: ModelPolicyTraceDetail`.
 */

import type { ModelPolicyTraceDetail } from "../../neoarc-agentic-contracts/trace"
import { MetadataList, type MetadataListItem } from "../foundation/metadata-list"
import { cn } from "../lib/cn"

export interface ModelPolicyTraceProps {
  readonly detail: ModelPolicyTraceDetail
  readonly className?: string
}

export function ModelPolicyTrace({ detail, className }: ModelPolicyTraceProps) {
  const items: MetadataListItem[] = []
  if (detail.policyId) items.push({ key: "id", label: "Policy", value: <code className="text-xs">{detail.policyId}</code> })
  if (detail.version) items.push({ key: "version", label: "Version", value: detail.version })

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-[var(--neoarc-color-foreground)]">{detail.label ?? "Model policy"}</span>
      {items.length > 0 ? <MetadataList items={items} /> : null}
    </div>
  )
}
