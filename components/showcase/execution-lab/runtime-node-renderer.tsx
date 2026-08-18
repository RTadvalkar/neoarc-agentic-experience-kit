"use client"

/**
 * components/showcase/execution-lab/runtime-node-renderer
 *
 * SHOWCASE-ONLY. The React renderer registered against every built-in
 * `mission.*` (target, kind) pair in `executionLabRendererRegistry`
 * (lib/showcase/registry-bootstrap.ts). Unwraps the `AgenticViewNode` data
 * produced by `runtimeNodeDefinitions` and composes the matching
 * `src/neoarc-agentic-ui/runtime` components — `MissionHeader` for
 * `mission.mission`, `RunStatusPanel` + `RunActions` +
 * `WaitingForHumanBanner`/`RunErrorPanel`/`RunOutputs` for `mission.run`,
 * `AgentTaskRow` for `mission.task`. `WorkflowRunTree` and
 * `ExecutionTimeline` need sibling task lookups the flat render canvas
 * does not provide, so they are exercised in the Component Gallery instead
 * (see docs/implementation/EXECUTION_STATUS.md for what is deferred).
 */

import type { AgenticViewNode } from "../../../src/neoarc-agentic-projection/types"
import type { RunProjection } from "../../../src/neoarc-agentic-projection/runtime-node-definitions"
import type { MissionSummary, AgentTask } from "../../../src/neoarc-agentic-contracts/runtime"
import type { RuntimeUIEventPayload } from "../../../src/neoarc-agentic-contracts/runtime-ui-events"
import type { AgenticUIEvent } from "../../../src/neoarc-agentic-contracts/ui-events"
import { MissionHeader } from "../../../src/neoarc-agentic-ui/runtime/mission-header"
import { RunStatusPanel } from "../../../src/neoarc-agentic-ui/runtime/run-status-panel"
import { RunActions } from "../../../src/neoarc-agentic-ui/runtime/run-actions"
import { WaitingForHumanBanner } from "../../../src/neoarc-agentic-ui/runtime/waiting-for-human-banner"
import { RunErrorPanel } from "../../../src/neoarc-agentic-ui/runtime/run-error-panel"
import { RunOutputs } from "../../../src/neoarc-agentic-ui/runtime/run-outputs"
import { AgentTaskRow } from "../../../src/neoarc-agentic-ui/runtime/agent-task-row"
import { Surface } from "../../../src/neoarc-agentic-ui/primitives/surface"
import { Badge } from "../../../src/neoarc-agentic-ui/primitives/badge"

export interface RuntimeNodeRendererProps {
  readonly node: AgenticViewNode
  readonly onSelect?: (node: AgenticViewNode) => void
  readonly selected?: boolean
  readonly onEmitRuntimeEvent?: (event: AgenticUIEvent<RuntimeUIEventPayload>) => void
}

function isMissionSummary(value: unknown): value is MissionSummary {
  return typeof value === "object" && value !== null && "title" in value && "status" in value
}

function isRunProjection(value: unknown): value is RunProjection {
  return typeof value === "object" && value !== null && "run" in value && "workflow" in value
}

function isAgentTask(value: unknown): value is AgentTask {
  return typeof value === "object" && value !== null && "taskId" in value && "title" in value
}

export function RuntimeNodeRenderer({ node, onSelect, selected, onEmitRuntimeEvent }: RuntimeNodeRendererProps) {
  const emit = (event: AgenticUIEvent<RuntimeUIEventPayload>) => onEmitRuntimeEvent?.(event)

  if (node.kind === "mission.mission" && isMissionSummary(node.data)) {
    return (
      <Surface variant={selected ? "raised" : "base"} className="flex w-full flex-col gap-2 p-3">
        <button type="button" onClick={() => onSelect?.(node)} className="flex w-full items-center justify-between gap-2 text-left" aria-pressed={selected}>
          <Badge tone="outline">{node.kind}</Badge>
        </button>
        <MissionHeader mission={node.data} />
      </Surface>
    )
  }

  if (node.kind === "mission.run" && isRunProjection(node.data)) {
    const { run, pendingInteraction, error, outputs } = node.data
    return (
      <Surface variant={selected ? "raised" : "base"} className="flex w-full flex-col gap-3 p-3">
        <button type="button" onClick={() => onSelect?.(node)} className="flex w-full items-center justify-between gap-2 text-left" aria-pressed={selected}>
          <Badge tone="outline">{node.kind}</Badge>
        </button>
        <RunStatusPanel run={run} />
        <RunActions run={run} onEmitCancel={emit} onEmitRetry={emit} onEmitResume={emit} />
        {pendingInteraction && run.humanWaitReason ? (
          <WaitingForHumanBanner reason={run.humanWaitReason} interaction={pendingInteraction} onEmitOpen={emit} />
        ) : null}
        {error ? <RunErrorPanel runId={run.id} error={error} onEmitRetry={emit} /> : null}
        {outputs && outputs.length > 0 ? <RunOutputs outputs={outputs} onEmitOpen={emit} /> : null}
      </Surface>
    )
  }

  if (node.kind === "mission.task" && isAgentTask(node.data)) {
    return <AgentTaskRow task={node.data} selected={selected} onSelect={() => onSelect?.(node)} onEmitEvent={emit} />
  }

  return (
    <Surface variant={selected ? "raised" : "base"} className="p-3 text-xs text-[var(--neoarc-color-foreground-subtle)]">
      Unrecognized runtime node payload for key {node.key}.
    </Surface>
  )
}
