"use client"

import { TraceActor } from "./trace-actor"
import { Timestamp } from "../foundation/timestamp"
import { EmptyState } from "../foundation/empty-state"
import { SystemInstructionTrace } from "./system-instruction-trace"
import { UserInputTrace } from "./user-input-trace"
import { ContextTrace } from "./context-trace"
import { RuntimeRecipeTrace } from "./runtime-recipe-trace"
import { ModelPolicyTrace } from "./model-policy-trace"
import { ResolvedModelTrace } from "./resolved-model-trace"
import { KnowledgeTrace } from "./knowledge-trace"
import { RelationshipTrace } from "./relationship-trace"
import { ToolTrace } from "./tool-trace"
import { AgentActivityTrace } from "./agent-activity-trace"
import { HumanInteractionTrace } from "./human-interaction-trace"
import { ProposalTrace } from "./proposal-trace"
import { ArtifactTrace } from "./artifact-trace"
import { ErrorTrace } from "./error-trace"
import { RetryTrace } from "./retry-trace"
import type { TraceEvent } from "../../neoarc-agentic-contracts/trace"

/**
 * Detail panel for one selected `TraceEvent`. Dispatches on `detail.kind`
 * through a closed switch — same pattern as `AgentConversation`'s node
 * dispatch — so an unhandled `TraceEventKind` is a compile error, never a
 * silent fallback that guesses shape. Renders the shared actor/timestamp
 * header once, then the per-kind body.
 */
export function TraceInspector({ event }: { readonly event: TraceEvent | undefined }) {
  if (!event) {
    return <EmptyState title="No event selected" description="Select an event from the timeline to inspect it." />
  }

  const { detail } = event

  const body = (() => {
    switch (detail.kind) {
      case "system-instruction":
        return <SystemInstructionTrace detail={detail.value} />
      case "user-input":
        return <UserInputTrace detail={detail.value} />
      case "context":
        return <ContextTrace detail={detail.value} />
      case "runtime-recipe":
        return <RuntimeRecipeTrace detail={detail.value} />
      case "model-policy":
        return <ModelPolicyTrace detail={detail.value} />
      case "resolved-model":
        return <ResolvedModelTrace resolvedModel={detail.value} />
      case "knowledge":
        return <KnowledgeTrace usage={detail.value} />
      case "relationship":
        return <RelationshipTrace detail={detail.value} />
      case "tool":
        return <ToolTrace detail={detail.value} />
      case "agent-activity":
        return <AgentActivityTrace detail={detail.value} />
      case "human-interaction":
        return <HumanInteractionTrace detail={detail.value} />
      case "proposal":
        return <ProposalTrace detail={detail.value} />
      case "artifact":
        return <ArtifactTrace detail={detail.value} />
      case "error":
        return <ErrorTrace detail={detail.value} />
      case "retry":
        return <RetryTrace detail={detail.value} />
      default:
        return detail satisfies never
    }
  })()

  return (
    <div className="flex flex-col gap-4 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {event.actor ? <TraceActor actor={event.actor} /> : <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">Actor not supplied</span>}
        <Timestamp value={event.occurredAt} variant="absolute" />
      </div>
      {body}
    </div>
  )
}
