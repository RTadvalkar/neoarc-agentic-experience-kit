/**
 * neoarc-agentic-ui / runtime / AgentTaskRow
 *
 * Purpose: one compact, selectable row for a single `AgentTask` — used
 * standalone and as the leaf row `WorkflowRunTree` renders under each
 * phase. Never renders task detail itself; selecting a row is how a
 * caller opens `AgentTaskInspector` for it.
 *
 * Semantic UI events: emits `"run.task.open"` (`RunTaskOpenPayload`) when selected.
 */

import type { AgentTask } from "../../neoarc-agentic-contracts/runtime"
import type { RunTaskOpenPayload } from "../../neoarc-agentic-contracts/runtime-ui-events"
import { createUIEvent, type AgenticUIEvent } from "../../neoarc-agentic-contracts/ui-events"
import { AgentAvatar } from "../foundation/agent-avatar"
import { RuntimeStatusBadge } from "../foundation/runtime-status-badge"
import { cn } from "../lib/cn"

export interface AgentTaskRowProps {
  readonly task: AgentTask
  readonly selected?: boolean
  readonly onSelect?: (task: AgentTask) => void
  readonly onEmitEvent?: (event: AgenticUIEvent<RunTaskOpenPayload>) => void
  readonly className?: string
}

export function AgentTaskRow({ task, selected, onSelect, onEmitEvent, className }: AgentTaskRowProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => {
        onSelect?.(task)
        onEmitEvent?.(
          createUIEvent({
            type: "run.task.open",
            sourceComponent: "AgentTaskRow",
            correlation: task.correlation,
            payload: { taskId: task.taskId },
          }),
        )
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-[var(--neoarc-radius-md)] border px-2.5 py-2 text-left transition-colors",
        selected
          ? "border-[var(--neoarc-color-accent)] bg-[var(--neoarc-color-accent-muted)]"
          : "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] hover:bg-[var(--neoarc-color-surface-muted)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
        className,
      )}
    >
      {task.producedBy ? (
        <AgentAvatar displayName={task.producedBy.displayName} avatarUrl={task.producedBy.avatarUrl} initials={task.producedBy.initials} size="sm" />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-sm text-[var(--neoarc-color-foreground)]">{task.title}</span>
      {task.progress ? (
        <span className="shrink-0 text-xs text-[var(--neoarc-color-foreground-subtle)]">
          {task.progress.completedSteps}
          {task.progress.totalSteps !== undefined ? `/${task.progress.totalSteps}` : ""}
        </span>
      ) : null}
      <RuntimeStatusBadge status={task.status} />
    </button>
  )
}
