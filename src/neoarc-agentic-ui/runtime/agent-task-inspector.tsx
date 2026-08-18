/**
 * neoarc-agentic-ui / runtime / AgentTaskInspector
 *
 * Purpose: detail view for one selected `AgentTask`, including its
 * traceable reference lists (`inputRefs`/`knowledgeRefs`/`relationshipRefs`/
 * `toolCallRefs`/`outputRefs`). These are references only — this component
 * never fetches or fabricates the referenced content itself; a missing or
 * empty list renders as an explicit "none supplied" line, never silently
 * hidden and never invented. Full Trace/Provenance visualization of what
 * these references actually point to is deferred to Slice 5.
 */

import type { AgentTask } from "../../neoarc-agentic-contracts/runtime"
import { AgentIdentity } from "../foundation/agent-identity"
import { EmptyState } from "../foundation/empty-state"
import { MetadataList, type MetadataListItem } from "../foundation/metadata-list"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { SectionHeader } from "../foundation/section-header"
import { Timestamp } from "../foundation/timestamp"
import { cn } from "../lib/cn"

export interface AgentTaskInspectorProps {
  readonly task: AgentTask | undefined
  readonly className?: string
}

function refList(label: string, refs: readonly string[] | undefined) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[var(--neoarc-color-foreground-subtle)]">{label}</span>
      {refs && refs.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {refs.map((ref) => (
            <code
              key={ref}
              className="rounded-[var(--neoarc-radius-sm)] border border-[var(--neoarc-color-border-muted)] bg-[var(--neoarc-color-surface-muted)] px-1.5 py-0.5 text-xs text-[var(--neoarc-color-foreground-muted)]"
            >
              {ref}
            </code>
          ))}
        </div>
      ) : (
        <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">None supplied</span>
      )}
    </div>
  )
}

export function AgentTaskInspector({ task, className }: AgentTaskInspectorProps) {
  if (!task) {
    return <EmptyState title="No task selected" description="Select a task in the workflow tree to inspect it." />
  }

  const items: MetadataListItem[] = []
  if (task.startedAt) items.push({ key: "started", label: "Started", value: <Timestamp value={task.startedAt} variant="relative" /> })
  if (task.completedAt) items.push({ key: "completed", label: "Completed", value: <Timestamp value={task.completedAt} variant="relative" /> })
  if (task.missionId) items.push({ key: "mission", label: "Mission", value: <code className="text-xs">{task.missionId}</code> })
  if (task.runId) items.push({ key: "run", label: "Run", value: <code className="text-xs">{task.runId}</code> })

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <SectionHeader title={task.title} actions={<RuntimeStatusBadge status={task.status} />} />
      {task.producedBy ? <AgentIdentity agent={{ ...task.producedBy, lifecycleStatus: "active" }} size="sm" showStatus={false} /> : null}
      {items.length > 0 ? <MetadataList items={items} /> : null}
      <div className="flex flex-col gap-3 border-t border-[var(--neoarc-color-border-muted)] pt-3">
        {refList("Input references", task.inputRefs)}
        {refList("Knowledge references", task.knowledgeRefs)}
        {refList("Relationship references", task.relationshipRefs)}
        {refList("Tool call references", task.toolCallRefs)}
        {refList("Output references", task.outputRefs)}
      </div>
    </div>
  )
}
