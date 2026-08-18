/**
 * neoarc-agentic-ui / runtime / WorkflowRunTree
 *
 * Purpose: the structural, hierarchical view of a run's `WorkflowGroup[]`
 * — phases containing `AgentTask`s, expandable/collapsible per phase.
 * Distinct from `ExecutionTimeline` (flat, chronological). The critical
 * UX guarantee this component exists to enforce — a running, failed,
 * waiting-for-human, or cancelled phase must never disappear behind a
 * collapse regardless of the human's last manual toggle — is delegated
 * entirely to the pure, independently-tested `workflow-tree-logic.ts`;
 * this file only wires that logic to markup and local expand-state.
 *
 * A `WorkflowMember` is a thin `{ id, taskId }` pointer (`runtime.ts`) —
 * the full `AgentTask` is looked up from the caller-supplied `tasks` map
 * by `taskId`, never duplicated onto the group itself.
 *
 * Semantic UI events: `run.task.open` (bubbled up from `AgentTaskRow`).
 */

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { AgentTask, WorkflowGroup } from "../../neoarc-agentic-contracts/runtime"
import type { RunTaskOpenPayload } from "../../neoarc-agentic-contracts/runtime-ui-events"
import type { AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { EmptyState } from "../foundation/empty-state"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { cn } from "../lib/cn"
import { AgentTaskRow } from "./agent-task-row"
import { isGroupToggleable, resolveGroupExpanded } from "./workflow-tree-logic"

export interface WorkflowRunTreeProps {
  readonly groups: readonly WorkflowGroup[]
  /** Lookup for the full `AgentTask` behind each `WorkflowMember.taskId`. A member with no matching entry renders its id as a fallback label rather than being silently dropped. */
  readonly tasks: ReadonlyMap<string, AgentTask>
  readonly selectedTaskId?: string
  readonly onSelectTask?: (task: AgentTask) => void
  readonly onEmitEvent?: (event: AgenticUIEvent<RunTaskOpenPayload>) => void
  readonly className?: string
}

export function WorkflowRunTree({ groups, tasks, selectedTaskId, onSelectTask, onEmitEvent, className }: WorkflowRunTreeProps) {
  const [userExpanded, setUserExpanded] = React.useState<Record<string, boolean>>({})

  if (groups.length === 0) {
    return <EmptyState title="No workflow structure yet" description="Phases and tasks will appear here once the run starts." />
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} role="tree" aria-label="Workflow run tree">
      {groups.map((group) => {
        const expanded = resolveGroupExpanded(group.status, userExpanded[group.id])
        const toggleable = isGroupToggleable(group.status)
        return (
          <div key={group.id} role="group" className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!toggleable}
                aria-expanded={expanded}
                onClick={() => setUserExpanded((prev) => ({ ...prev, [group.id]: !expanded }))}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--neoarc-radius-sm)] px-1 py-0.5 text-sm font-medium text-[var(--neoarc-color-foreground)]",
                  toggleable ? "hover:bg-[var(--neoarc-color-surface-muted)]" : "cursor-default",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
                )}
              >
                {toggleable ? (
                  expanded ? (
                    <ChevronDown aria-hidden="true" className="size-3.5 shrink-0" />
                  ) : (
                    <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
                  )
                ) : (
                  <span className="size-3.5 shrink-0" aria-hidden="true" />
                )}
                {group.label}
              </button>
              <RuntimeStatusBadge status={group.status} />
            </div>
            {expanded ? (
              <div className="flex flex-col gap-1.5 pl-5">
                {group.members.map((member) => {
                  const task = tasks.get(member.taskId)
                  if (!task) {
                    return (
                      <span key={member.id} className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
                        Task {member.taskId} (not supplied)
                      </span>
                    )
                  }
                  return (
                    <AgentTaskRow
                      key={member.id}
                      task={task}
                      selected={selectedTaskId === task.taskId}
                      onSelect={onSelectTask}
                      onEmitEvent={onEmitEvent}
                    />
                  )
                })}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
