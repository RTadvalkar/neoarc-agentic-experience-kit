/**
 * neoarc-agentic-ui / trace / SystemInstructionTrace
 *
 * Purpose: render the identity/version facts for a system instruction in
 * effect during a turn (`TraceInspector`'s `"system-instruction"` case).
 * Never the instruction's actual text/content — only supplied identity
 * facts, per docs/07 §"Execution provenance, not private reasoning".
 *
 * Input model: `detail: SystemInstructionTraceDetail`.
 */

import type { SystemInstructionTraceDetail } from "../../neoarc-agentic-contracts/trace"
import { MetadataList, type MetadataListItem } from "../foundation/metadata-list"
import { cn } from "../lib/cn"

export interface SystemInstructionTraceProps {
  readonly detail: SystemInstructionTraceDetail
  readonly className?: string
}

export function SystemInstructionTrace({ detail, className }: SystemInstructionTraceProps) {
  const items: MetadataListItem[] = []
  if (detail.instructionId) items.push({ key: "id", label: "Instruction", value: <code className="text-xs">{detail.instructionId}</code> })
  if (detail.version) items.push({ key: "version", label: "Version", value: detail.version })

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-[var(--neoarc-color-foreground)]">{detail.label ?? "System instruction"}</span>
      {items.length > 0 ? <MetadataList items={items} /> : null}
    </div>
  )
}
