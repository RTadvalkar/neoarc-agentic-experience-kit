"use client"

/**
 * components/showcase/execution-lab/component-gallery/component-gallery
 *
 * SHOWCASE-ONLY. Foundation Component Gallery required by the Gate 1
 * human-review hardening pass: every reusable visual component in
 * `src/neoarc-agentic-ui` must be inspectable in the running Execution Lab,
 * not just provable through the event -> projection -> renderer path. This
 * is a separate inspection area alongside (not replacing) the Chat /
 * Activity / Trace / Provenance tabs — see `LabTabBar`.
 *
 * Fixtures live in `lib/showcase/gallery-fixtures.ts`, kept out of
 * `src/neoarc-agentic-ui` per docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md
 * ("keep mock data outside reusable components").
 */

import { useState } from "react"
import { AgentAvatar } from "../../../../src/neoarc-agentic-ui/foundation/agent-avatar"
import { AgentIdentity } from "../../../../src/neoarc-agentic-ui/foundation/agent-identity"
import { AgentStatusBadge } from "../../../../src/neoarc-agentic-ui/foundation/agent-status-badge"
import { RuntimeStatusBadge } from "../../../../src/neoarc-agentic-ui/foundation/runtime-status-badge"
import { CapabilityBadge } from "../../../../src/neoarc-agentic-ui/foundation/capability-badge"
import { RiskBadge } from "../../../../src/neoarc-agentic-ui/foundation/risk-badge"
import { ContextBreadcrumb } from "../../../../src/neoarc-agentic-ui/foundation/context-breadcrumb"
import { EntitySwitcher } from "../../../../src/neoarc-agentic-ui/foundation/entity-switcher"
import { SectionHeader } from "../../../../src/neoarc-agentic-ui/foundation/section-header"
import { InlineNotice } from "../../../../src/neoarc-agentic-ui/foundation/inline-notice"
import { EmptyState } from "../../../../src/neoarc-agentic-ui/foundation/empty-state"
import { LoadingState } from "../../../../src/neoarc-agentic-ui/foundation/loading-state"
import { PermissionBlockedState } from "../../../../src/neoarc-agentic-ui/foundation/permission-blocked-state"
import { Timestamp } from "../../../../src/neoarc-agentic-ui/foundation/timestamp"
import { MetadataList } from "../../../../src/neoarc-agentic-ui/foundation/metadata-list"
import { RedactedValue } from "../../../../src/neoarc-agentic-ui/foundation/redacted-value"
import { TraceVisibilityBadge } from "../../../../src/neoarc-agentic-ui/foundation/trace-visibility-badge"
import { Badge } from "../../../../src/neoarc-agentic-ui/primitives/badge"
import { Surface } from "../../../../src/neoarc-agentic-ui/primitives/surface"
import { Spinner } from "../../../../src/neoarc-agentic-ui/primitives/spinner"
import { createUIEvent, type AgenticUIEvent } from "../../../../src/neoarc-agentic-contracts/ui-events"
import { AgentConversation } from "../../../../src/neoarc-agentic-ui/conversation/agent-conversation"
import { HumanMessage } from "../../../../src/neoarc-agentic-ui/conversation/human-message"
import { AgentResponse } from "../../../../src/neoarc-agentic-ui/conversation/agent-response"
import { MessageContentRenderer } from "../../../../src/neoarc-agentic-ui/conversation/message-content-renderer"
import { AgentComposer } from "../../../../src/neoarc-agentic-ui/conversation/agent-composer"
import { ClarificationCard } from "../../../../src/neoarc-agentic-ui/conversation/clarification-card"
import { ActivitySummaryList } from "../../../../src/neoarc-agentic-ui/conversation/activity-summary-list"
import { ToolActivityDisclosure } from "../../../../src/neoarc-agentic-ui/conversation/tool-activity-disclosure"
import { CitationGroup } from "../../../../src/neoarc-agentic-ui/conversation/citation-group"
import { AttachmentList } from "../../../../src/neoarc-agentic-ui/conversation/attachment-list"
import { ArtifactReferenceCard } from "../../../../src/neoarc-agentic-ui/conversation/artifact-reference-card"
import { AgentHandoffCard } from "../../../../src/neoarc-agentic-ui/conversation/agent-handoff-card"
import { AsyncWorkCard } from "../../../../src/neoarc-agentic-ui/conversation/async-work-card"
import { ResponseActions } from "../../../../src/neoarc-agentic-ui/conversation/response-actions"
import { ConversationEmptyState } from "../../../../src/neoarc-agentic-ui/conversation/conversation-empty-state"
import { GenericAgenticNodeFallback } from "../../../../src/neoarc-agentic-ui/conversation/generic-agentic-node-fallback"
import { ExecutionPermissionCard } from "../../../../src/neoarc-agentic-ui/human-interaction/execution-permission-card"
import { ExecutionPermissionDialog } from "../../../../src/neoarc-agentic-ui/human-interaction/execution-permission-dialog"
import { PermissionOutcomeBadge } from "../../../../src/neoarc-agentic-ui/human-interaction/permission-outcome-badge"
import { ProposalCard } from "../../../../src/neoarc-agentic-ui/human-interaction/proposal-card"
import { ProposalViewer } from "../../../../src/neoarc-agentic-ui/human-interaction/proposal-viewer"
import { ProposalStatusBadge } from "../../../../src/neoarc-agentic-ui/human-interaction/proposal-status-badge"
import { ProposalStatusTimeline } from "../../../../src/neoarc-agentic-ui/human-interaction/proposal-status-timeline"
import { DecisionHistory } from "../../../../src/neoarc-agentic-ui/human-interaction/decision-history"
import { PendingHumanInteractionSummary } from "../../../../src/neoarc-agentic-ui/human-interaction/pending-human-interaction-summary"
import { MissionHeader } from "../../../../src/neoarc-agentic-ui/runtime/mission-header"
import { RunStatusBadge } from "../../../../src/neoarc-agentic-ui/runtime/run-status-badge"
import { RunStatusPanel } from "../../../../src/neoarc-agentic-ui/runtime/run-status-panel"
import { RunActions } from "../../../../src/neoarc-agentic-ui/runtime/run-actions"
import { WaitingForHumanBanner } from "../../../../src/neoarc-agentic-ui/runtime/waiting-for-human-banner"
import { RunErrorPanel } from "../../../../src/neoarc-agentic-ui/runtime/run-error-panel"
import { RunOutputs } from "../../../../src/neoarc-agentic-ui/runtime/run-outputs"
import { AgentTaskRow } from "../../../../src/neoarc-agentic-ui/runtime/agent-task-row"
import { AgentTaskInspector } from "../../../../src/neoarc-agentic-ui/runtime/agent-task-inspector"
import { WorkflowRunTree } from "../../../../src/neoarc-agentic-ui/runtime/workflow-run-tree"
import { ExecutionTimeline } from "../../../../src/neoarc-agentic-ui/runtime/execution-timeline"
import {
  galleryActionAvailabilities,
  galleryAgent,
  galleryAgentLifecycleStatuses,
  galleryCapabilities,
  galleryEntities,
  gallerySectionContext,
  galleryMetadataItems,
  galleryRedactionStates,
  galleryRiskLevels,
  galleryRuntimeStatuses,
  galleryTimestampInvalid,
  galleryTimestampNow,
  galleryTimestampOlder,
  galleryTimestampRecent,
  galleryTraceAccessLevels,
  galleryWorkspaceContext,
} from "../../../../lib/showcase/gallery-fixtures"
import {
  galleryActivitySummaries,
  galleryAgentMessage,
  galleryArtifact,
  galleryAsyncWork,
  galleryAttachments,
  galleryCitations,
  galleryClarificationPending,
  galleryClarificationResolved,
  galleryConversationThread,
  galleryHandoffCompleted,
  galleryHandoffRunning,
  galleryHumanMessage,
  galleryStreamingAgentMessage,
  galleryToolCompleted,
  galleryToolRunning,
} from "../../../../lib/showcase/conversation-gallery-fixtures"
import {
  galleryActionFailedProposal,
  galleryActionPendingProposal,
  galleryCleanProposal,
  galleryConflictProposal,
  galleryFinalizedProposal,
  galleryOverrideRequiredProposal,
  galleryPendingInteractions,
  galleryPermissionPending,
  galleryPolicyWarningProposal,
  galleryProposalWithEvidence,
  galleryResolvedPermission,
  gallerySubmittedPermission,
  galleryStaleProposal,
  galleryUnavailablePermission,
} from "../../../../lib/showcase/human-interaction-gallery-fixtures"
import {
  galleryExecutionSteps,
  galleryMission,
  galleryPendingInteraction,
  galleryRunCancelRequested,
  galleryRunCompleted,
  galleryRunError,
  galleryRunFailedNotRetryable,
  galleryRunFailedRetryable,
  galleryRunOutputs,
  galleryRunPaused,
  galleryRunRunning,
  galleryRunStatuses,
  galleryTaskCompleted,
  galleryTaskFailed,
  galleryTaskRunning,
  galleryWorkflowGroups,
  galleryWorkflowTasks,
} from "../../../../lib/showcase/runtime-gallery-fixtures"
import { GalleryEntry, GalleryVariantRow } from "./gallery-entry"

export interface ComponentGalleryProps {
  readonly onEmitUIEvent: (event: AgenticUIEvent) => void
}

export function ComponentGallery({ onEmitUIEvent }: ComponentGalleryProps) {
  const [activeEntityId, setActiveEntityId] = useState(gallerySectionContext.id)
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  const [selectedGalleryTaskId, setSelectedGalleryTaskId] = useState(galleryTaskRunning.taskId)

  return (
    <div className="flex flex-col gap-8 pb-4" aria-label="Foundation component gallery">
      <InlineNotice
        tone="info"
        title="Every reusable Slice 1 visual component, inspectable"
        description="This gallery exercises props/states directly against src/neoarc-agentic-ui, separate from the event -> projection -> renderer path proven by the Chat/Activity/Trace/Provenance tabs. Fixtures are showcase-only and never live inside a reusable component."
      />

      <GalleryEntry
        id="agent-avatar"
        name="AgentAvatar"
        description="Compact avatar with initials fallback and optional lifecycle-status dot."
        inputModel="displayName, avatarUrl?, initials?, kind?, statusIndicator?, size?"
      >
        <GalleryVariantRow label="Sizes">
          <AgentAvatar displayName="Ava" size="sm" />
          <AgentAvatar displayName="Ava" size="md" />
          <AgentAvatar displayName="Ava" size="lg" />
        </GalleryVariantRow>
        <GalleryVariantRow label="Initials fallback (single name vs. full name)">
          <AgentAvatar displayName="Ava" />
          <AgentAvatar displayName="Priya Shah" />
          <AgentAvatar displayName="Priya Shah" initials="PS" kind="human" />
        </GalleryVariantRow>
        <GalleryVariantRow label="With lifecycle status indicator">
          {galleryAgentLifecycleStatuses.map((status) => (
            <AgentAvatar key={status} displayName="Ava" statusIndicator={status} />
          ))}
        </GalleryVariantRow>
        <GalleryVariantRow label="Image load failure (falls back to initials)">
          <AgentAvatar displayName="Ava" avatarUrl="https://example.invalid/broken-avatar.png" />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="agent-identity"
        name="AgentIdentity"
        description="Composed avatar + name + description + optional lifecycle badge."
        inputModel="agent: AgentSummary, showStatus?, size?"
      >
        <GalleryVariantRow label="Default (with status)">
          <AgentIdentity agent={galleryAgent} />
        </GalleryVariantRow>
        <GalleryVariantRow label="Without status badge">
          <AgentIdentity agent={galleryAgent} showStatus={false} />
        </GalleryVariantRow>
        <GalleryVariantRow label="Without description, small size">
          <AgentIdentity agent={{ ...galleryAgent, description: undefined }} size="sm" />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="agent-status-badge"
        name="AgentStatusBadge"
        description="Compact, honest badge for AgentLifecycleStatus."
        inputModel="status: AgentLifecycleStatus"
      >
        <GalleryVariantRow label="All states">
          {galleryAgentLifecycleStatuses.map((status) => (
            <AgentStatusBadge key={status} status={status} />
          ))}
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="runtime-status-badge"
        name="RuntimeStatusBadge"
        description="Shared status vocabulary reused across agents, runs, and tasks."
        inputModel="status: RuntimeStatus"
      >
        <GalleryVariantRow label="All states">
          {galleryRuntimeStatuses.map((status) => (
            <RuntimeStatusBadge key={status} status={status} />
          ))}
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="capability-badge"
        name="CapabilityBadge"
        description="Neutral, non-judgmental badge for one supplied capability string."
        inputModel="capability: string, icon?"
      >
        <GalleryVariantRow label="Supplied capabilities">
          {galleryCapabilities.map((capability) => (
            <CapabilityBadge key={capability} capability={capability} />
          ))}
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="risk-badge"
        name="RiskBadge"
        description="Supplied RiskLevel, never computed or inferred by the kit."
        inputModel="level: RiskLevel"
      >
        <GalleryVariantRow label="All levels">
          {galleryRiskLevels.map((level) => (
            <RiskBadge key={level} level={level} />
          ))}
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="context-breadcrumb"
        name="ContextBreadcrumb"
        description="Renders a ContextRef parent chain, root first."
        inputModel="context: ContextRef"
      >
        <GalleryVariantRow label="Single level">
          <ContextBreadcrumb context={galleryWorkspaceContext} />
        </GalleryVariantRow>
        <GalleryVariantRow label="Deep chain (workspace -> project -> section)">
          <ContextBreadcrumb context={gallerySectionContext} />
        </GalleryVariantRow>
        <GalleryVariantRow label="Narrow container (truncation)">
          <div className="w-40 overflow-hidden">
            <ContextBreadcrumb context={gallerySectionContext} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="entity-switcher"
        name="EntitySwitcher"
        description="Controlled entity switcher built on @base-ui/react's Select — keyboard navigation, Escape/close, and focus restoration come from the primitive. Try Tab, Enter/Space to open, Arrow keys + Enter to select, and Escape to close."
        inputModel="entities: ContextRef[], activeId: OpaqueId, onSelect(id)"
      >
        <GalleryVariantRow label="Interactive — selection reported below">
          <EntitySwitcher
            entities={galleryEntities}
            activeId={activeEntityId}
            onSelect={(id) => {
              setActiveEntityId(id)
              onEmitUIEvent(
                createUIEvent({
                  type: "gallery.entity_switcher.select",
                  sourceComponent: "EntitySwitcher",
                  payload: { id },
                }),
              )
            }}
          />
          <span className="text-xs text-[var(--neoarc-color-foreground-muted)]">
            Active: <code className="font-mono">{activeEntityId}</code>
          </span>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="section-header"
        name="SectionHeader"
        description="Title + optional description + optional trailing actions row."
        inputModel="title, description?, actions?"
      >
        <GalleryVariantRow label="Title only">
          <SectionHeader title="Panel title" />
        </GalleryVariantRow>
        <GalleryVariantRow label="With description and actions">
          <SectionHeader
            title="Panel title"
            description="A supporting description of what this panel shows."
            actions={<Badge tone="outline">Action</Badge>}
          />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="inline-notice"
        name="InlineNotice"
        description="Calm, explicit inline banner for status/consequence messaging."
        inputModel='tone: "info" | "success" | "warning" | "danger", title, description?, actions?'
      >
        <div className="flex flex-col gap-2">
          <InlineNotice tone="info" title="Informational notice" description="Supplied context, not a warning." />
          <InlineNotice tone="success" title="Success notice" description="An action completed as expected." />
          <InlineNotice tone="warning" title="Warning notice" description="Something needs attention." />
          <InlineNotice tone="danger" title="Danger notice" description="An action failed or is blocked." />
        </div>
      </GalleryEntry>

      <GalleryEntry
        id="empty-state"
        name="EmptyState"
        description='Calm "nothing here yet" state, distinct from LoadingState and PermissionBlockedState.'
        inputModel="title, description?, icon?, action?"
      >
        <GalleryVariantRow label="Default">
          <EmptyState title="No items yet" description="Items you create will appear here." />
        </GalleryVariantRow>
        <GalleryVariantRow label="With action slot">
          <EmptyState
            title="No items yet"
            description="Items you create will appear here."
            action={<Badge tone="accent">Create item</Badge>}
          />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="loading-state"
        name="LoadingState"
        description="Restrained in-progress indicator with an accessible live region."
        inputModel="label?"
      >
        <GalleryVariantRow label="Default label">
          <LoadingState />
        </GalleryVariantRow>
        <GalleryVariantRow label="Custom label">
          <LoadingState label="Gathering citations" />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="permission-blocked-state"
        name="PermissionBlockedState"
        description='Explicit "you cannot see/do this" state, distinct from empty or loading.'
        inputModel="availability: ActionAvailability, action?"
      >
        <div className="flex flex-col gap-3">
          {galleryActionAvailabilities.map((availability) => (
            <PermissionBlockedState key={availability.actionId} availability={availability} />
          ))}
        </div>
      </GalleryEntry>

      <GalleryEntry
        id="timestamp"
        name="Timestamp"
        description="Accessible <time> element rendering an ISO-8601 timestamp, absolute or relative."
        inputModel="value: ISOTimestamp, variant?, now?"
      >
        <GalleryVariantRow label="Absolute">
          <Timestamp value={galleryTimestampRecent} variant="absolute" />
        </GalleryVariantRow>
        <GalleryVariantRow label="Relative (deterministic `now` fixture)">
          <Timestamp value={galleryTimestampRecent} variant="relative" now={galleryTimestampNow} />
          <Timestamp value={galleryTimestampOlder} variant="relative" now={galleryTimestampNow} />
        </GalleryVariantRow>
        <GalleryVariantRow label="Invalid timestamp (renders raw string, not a fabricated date)">
          <Timestamp value={galleryTimestampInvalid} />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="metadata-list"
        name="MetadataList"
        description="Label/value list for inspector panels, trace detail rows, proposal metadata."
        inputModel="items: { key, label, value }[]"
      >
        <GalleryVariantRow label="Populated">
          <MetadataList items={galleryMetadataItems} />
        </GalleryVariantRow>
        <GalleryVariantRow label="Zero items (caller should wrap with EmptyState if that reads as 'nothing here')">
          <MetadataList items={[]} />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="redacted-value"
        name="RedactedValue"
        description="Renders a withheld field with an explicit reason, never fabricating or silently hiding it."
        inputModel="state: RedactionState, children"
      >
        <GalleryVariantRow label="All states">
          {galleryRedactionStates.map(({ label, state }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">{label}:</span>
              <RedactedValue state={state}>customer@example.com</RedactedValue>
            </div>
          ))}
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="trace-visibility-badge"
        name="TraceVisibilityBadge"
        description="Labels which supplied TraceAccessLevel a piece of trace content is scoped to. Never enforces access."
        inputModel="level: TraceAccessLevel"
      >
        <GalleryVariantRow label="All levels">
          {galleryTraceAccessLevels.map((level) => (
            <TraceVisibilityBadge key={level} level={level} />
          ))}
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="primitives"
        name="Primitives (Badge, Surface, Spinner)"
        description="NeoArc-owned adapted primitives underneath the foundation family — not foundation components themselves, but exposed here since they are load-bearing for the design system. VisuallyHidden is text-only and has no visual demonstration."
        inputModel="Badge: tone; Surface: variant; Spinner: size"
      >
        <GalleryVariantRow label="Badge tones">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="info">Info</Badge>
          <Badge tone="outline">Outline</Badge>
        </GalleryVariantRow>
        <GalleryVariantRow label="Surface variants">
          <Surface variant="base" className="p-3 text-xs">
            base
          </Surface>
          <Surface variant="muted" className="p-3 text-xs">
            muted
          </Surface>
          <Surface variant="raised" className="p-3 text-xs">
            raised
          </Surface>
        </GalleryVariantRow>
        <GalleryVariantRow label="Spinner sizes">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </GalleryVariantRow>
      </GalleryEntry>

      <InlineNotice
        tone="info"
        title="Slice 2 — Conversation family, direct view-model path"
        description="Every component below is given a ConversationMessage/ConversationTimelineItem value directly — no AgenticEventEnvelope, no projection. The Scenario Replay tab's Chat view proves the same components render identically from the projected path."
      />

      <GalleryEntry
        id="agent-conversation"
        name="AgentConversation"
        description="Renders an ordered ConversationTimelineItem[] — the single component both integration modes converge on."
        inputModel="items: ConversationTimelineItem[], onEmitEvent?, emptyState?"
      >
        <GalleryVariantRow label="Direct ConversationThread.items (human message -> activity -> agent reply)">
          <div className="w-full max-w-xl">
            <AgentConversation items={galleryConversationThread.items} onEmitEvent={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Empty">
          <div className="w-full max-w-xl">
            <AgentConversation items={[]} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="conversation-message"
        name="HumanMessage / AgentResponse"
        description="ConversationMessage renders as HumanMessage or AgentResponse depending on author.kind; AgentResponse also surfaces citations/attachments/artifacts and streaming state."
        inputModel="message: ConversationMessage"
      >
        <GalleryVariantRow label="HumanMessage">
          <div className="w-full max-w-xl">
            <HumanMessage message={galleryHumanMessage} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="AgentResponse (completed, with citations/attachments/artifacts)">
          <div className="w-full max-w-xl">
            <AgentResponse
              message={galleryAgentMessage}
              onEmitCitationEvent={onEmitUIEvent}
              onEmitAttachmentEvent={onEmitUIEvent}
              onEmitArtifactEvent={onEmitUIEvent}
              onEmitStopEvent={onEmitUIEvent}
              onEmitRetryEvent={onEmitUIEvent}
            />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="AgentResponse (streaming)">
          <div className="w-full max-w-xl">
            <AgentResponse message={galleryStreamingAgentMessage} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="message-content-renderer"
        name="MessageContentRenderer"
        description="Renders MessageContentBlock[] — plain text blocks as-is, markdown blocks through a minimal dependency-free formatter (bold/italic/inline code/links)."
        inputModel="blocks: MessageContentBlock[]"
      >
        <GalleryVariantRow label="Text block">
          <MessageContentRenderer blocks={[{ kind: "text", text: "Plain text content, rendered as-is." }]} />
        </GalleryVariantRow>
        <GalleryVariantRow label="Markdown block">
          <MessageContentRenderer
            blocks={[{ kind: "markdown", markdown: "Supports **bold**, _italic_, `inline code`, and [links](https://example.com)." }]}
          />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="agent-composer"
        name="AgentComposer"
        description="Controlled message composer. Emits conversation.message.send on submit and conversation.stop.request when a response is in progress."
        inputModel="disabled?, isResponding?, respondingMessageId?, onEmitSendEvent?, onEmitStopEvent?"
      >
        <GalleryVariantRow label="Idle">
          <div className="w-full max-w-xl">
            <AgentComposer onEmitSendEvent={onEmitUIEvent} onEmitStopEvent={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Response in progress (shows Stop instead of Send)">
          <div className="w-full max-w-xl">
            <AgentComposer
              isResponding
              respondingMessageId="gallery-msg-streaming"
              onEmitSendEvent={onEmitUIEvent}
              onEmitStopEvent={onEmitUIEvent}
            />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="clarification-card"
        name="ClarificationCard"
        description="Pending clarification with option buttons or free-text submit; resolved clarifications render their resolution instead of the form."
        inputModel="clarification: ClarificationRequest, onEmitEvent?"
      >
        <GalleryVariantRow label="Pending (with options)">
          <div className="w-full max-w-xl">
            <ClarificationCard clarification={galleryClarificationPending} onEmitEvent={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Resolved">
          <div className="w-full max-w-xl">
            <ClarificationCard clarification={galleryClarificationResolved} onEmitEvent={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="activity-summary-list"
        name="ActivitySummaryList"
        description="Safe, observable activity lines only — never chain-of-thought. Shows a running indicator on the current item."
        inputModel="items: ActivitySummary[]"
      >
        <GalleryVariantRow label="Reviewing -> retrieving (running) -> preparing (queued)">
          <div className="w-full max-w-xl">
            <ActivitySummaryList items={galleryActivitySummaries} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="tool-activity-disclosure"
        name="ToolActivityDisclosure"
        description="Collapsible tool-invocation summary. Emits toolActivity.toggle on expand/collapse; never assumes raw tool I/O."
        inputModel="tool: ToolActivitySummary, onEmitEvent?"
      >
        <GalleryVariantRow label="Running">
          <div className="w-full max-w-md">
            <ToolActivityDisclosure tool={galleryToolRunning} onEmitEvent={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Completed (with summary)">
          <div className="w-full max-w-md">
            <ToolActivityDisclosure tool={galleryToolCompleted} onEmitEvent={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="citation-group"
        name="CitationGroup"
        description="Supplied citations only — the kit never fabricates a source. Emits citation.open on click."
        inputModel="citations: CitationRef[], onEmitEvent?"
      >
        <GalleryVariantRow label="Two citations">
          <CitationGroup citations={galleryCitations} onEmitEvent={onEmitUIEvent} />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="attachment-list"
        name="AttachmentList"
        description="Supplied file attachments with name/size/mime-type. Emits attachment.open on click."
        inputModel="attachments: AttachmentRef[], onEmitEvent?"
      >
        <GalleryVariantRow label="Two attachments">
          <AttachmentList attachments={galleryAttachments} onEmitEvent={onEmitUIEvent} />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="artifact-reference-card"
        name="ArtifactReferenceCard"
        description="Reference to a produced artifact (document, diagram, code change). Emits artifact.open on click."
        inputModel="artifact: ArtifactRef, onEmitEvent?"
      >
        <GalleryVariantRow label="Completed diagram artifact">
          <div className="w-full max-w-md">
            <ArtifactReferenceCard artifact={galleryArtifact} onEmitEvent={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="agent-handoff-card"
        name="AgentHandoffCard"
        description="Agent-to-agent handoff summary with from/to identities, reason, and status. Emits handoff.open on click."
        inputModel="handoff: HandoffSummary, onEmitEvent?"
      >
        <GalleryVariantRow label="Running">
          <div className="w-full max-w-lg">
            <AgentHandoffCard handoff={galleryHandoffRunning} onEmitEvent={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Completed">
          <div className="w-full max-w-lg">
            <AgentHandoffCard handoff={galleryHandoffCompleted} onEmitEvent={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="async-work-card"
        name="AsyncWorkCard"
        description="Work continuing outside the current turn, with an optional supplied ETA label. Not one of the ten projected node kinds — always used via the direct view-model path."
        inputModel="work: AsyncWorkSummary"
      >
        <GalleryVariantRow label="Running with ETA">
          <div className="w-full max-w-md">
            <AsyncWorkCard work={galleryAsyncWork} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="response-actions"
        name="ResponseActions"
        description="Action row for an in-progress (Stop) or failed (Retry) agent response. Renders nothing for a terminal completed/cancelled status."
        inputModel="messageId, status: RuntimeStatus, onEmitStopEvent?, onEmitRetryEvent?"
      >
        <GalleryVariantRow label="Running (Stop) / Failed (Retry) / Completed (nothing)">
          <ResponseActions
            messageId="gallery-msg-running"
            status="running"
            onEmitStopEvent={onEmitUIEvent}
            onEmitRetryEvent={onEmitUIEvent}
          />
          <ResponseActions
            messageId="gallery-msg-failed"
            status="failed"
            onEmitStopEvent={onEmitUIEvent}
            onEmitRetryEvent={onEmitUIEvent}
          />
          <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
            (completed renders nothing — see empty space to the right)
          </span>
          <ResponseActions
            messageId="gallery-msg-completed"
            status="completed"
            onEmitStopEvent={onEmitUIEvent}
            onEmitRetryEvent={onEmitUIEvent}
          />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="conversation-empty-state"
        name="ConversationEmptyState"
        description="AgentConversation's default emptyState, overridable via the emptyState prop."
        inputModel="(no props)"
      >
        <GalleryVariantRow label="Default">
          <div className="w-full max-w-xl">
            <ConversationEmptyState />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="generic-agentic-node-fallback"
        name="GenericAgenticNodeFallback"
        description="Safe fallback for any AgenticViewNode whose (target, kind) has no specific renderer registration — mirrors the Execution Lab's own generic fallback, but as a reusable src/neoarc-agentic-ui component."
        inputModel="node: AgenticViewNode"
      >
        <GalleryVariantRow label="Unrecognized node kind">
          <div className="w-full max-w-md">
            <GenericAgenticNodeFallback
              node={{ key: "gallery-unknown-node", kind: "mission.unrecognized-kind", target: "mission", data: { note: "example payload" }, visibility: "visible" }}
            />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="execution-permission-card"
        name="ExecutionPermissionCard / ExecutionPermissionDialog / PermissionOutcomeBadge"
        description="'May this specific tool/action proceed?' — a strictly different question from any proposal/business-decision component below. pending shows Allow once/Reject/Cancel; submitted disables them with an explicit pending indicator; resolved shows PermissionOutcomeBadge instead of buttons; unavailable renders PermissionBlockedState."
        inputModel="request: ExecutionPermissionRequest, onEmitAllowOnce?, onEmitReject?, onEmitCancel?"
      >
        <GalleryVariantRow label="Pending">
          <div className="w-full max-w-lg">
            <ExecutionPermissionCard
              request={galleryPermissionPending}
              onEmitAllowOnce={onEmitUIEvent}
              onEmitReject={onEmitUIEvent}
              onEmitCancel={onEmitUIEvent}
            />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Submitted (awaiting confirmation)">
          <div className="w-full max-w-lg">
            <ExecutionPermissionCard request={gallerySubmittedPermission} onEmitAllowOnce={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Resolved">
          <div className="w-full max-w-lg">
            <ExecutionPermissionCard request={galleryResolvedPermission} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Unavailable (renders PermissionBlockedState, not a resolved outcome)">
          <div className="w-full max-w-lg">
            <ExecutionPermissionCard request={galleryUnavailablePermission} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="As a modal (ExecutionPermissionDialog)">
          <button
            type="button"
            onClick={() => setPermissionDialogOpen(true)}
            className="rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--neoarc-color-foreground)]"
          >
            Open permission dialog
          </button>
          <ExecutionPermissionDialog
            request={galleryPermissionPending}
            open={permissionDialogOpen}
            onOpenChange={setPermissionDialogOpen}
            onEmitAllowOnce={onEmitUIEvent}
            onEmitReject={onEmitUIEvent}
            onEmitCancel={onEmitUIEvent}
          />
        </GalleryVariantRow>
        <GalleryVariantRow label="PermissionOutcomeBadge — all four outcomes">
          <PermissionOutcomeBadge outcome="allowed_once" />
          <PermissionOutcomeBadge outcome="rejected" />
          <PermissionOutcomeBadge outcome="cancelled" />
          <PermissionOutcomeBadge outcome="unavailable" />
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="proposal-card"
        name="ProposalCard"
        description="Compact conversation-inline proposal summary — 'should this become authoritative?', never an execution-permission question. Renders only the supplied decisionPermissions, plus an honest InlineNotice explaining why an action is unavailable (never a mysteriously grayed-out button with no reason)."
        inputModel="proposal: ProposalSummary, onEmitOpen?, onEmitApply?, onEmitRefine?, onEmitReject?, onEmitDefer?"
      >
        <GalleryVariantRow label="Clean (ready for review)">
          <div className="w-full max-w-xl">
            <ProposalCard proposal={galleryCleanProposal} onEmitOpen={onEmitUIEvent} onEmitApply={onEmitUIEvent} onEmitReject={onEmitUIEvent} onEmitDefer={onEmitUIEvent} onRequestRefine={() => onEmitUIEvent(createUIEvent({ type: "proposal.refine.request", sourceComponent: "gallery", payload: { proposalId: galleryCleanProposal.id, note: "(gallery) refine requested" } }))} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Stale">
          <div className="w-full max-w-xl">
            <ProposalCard proposal={galleryStaleProposal} onEmitOpen={onEmitUIEvent} onEmitApply={onEmitUIEvent} onEmitReject={onEmitUIEvent} onEmitDefer={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Conflicted (unresolved conflict blocks approve, with an honest reason)">
          <div className="w-full max-w-xl">
            <ProposalCard proposal={galleryConflictProposal} onEmitOpen={onEmitUIEvent} onEmitReject={onEmitUIEvent} onEmitDefer={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Action pending (approve emitted, awaiting backend confirmation)">
          <div className="w-full max-w-xl">
            <ProposalCard proposal={galleryActionPendingProposal} onEmitOpen={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Action failed (last decision attempt was rejected by the backend)">
          <div className="w-full max-w-xl">
            <ProposalCard proposal={galleryActionFailedProposal} onEmitOpen={onEmitUIEvent} onEmitApply={onEmitUIEvent} onEmitReject={onEmitUIEvent} onEmitDefer={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Finalized (approved, decisionPermissions empty — no further decision available)">
          <div className="w-full max-w-xl">
            <ProposalCard proposal={galleryFinalizedProposal} onEmitOpen={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="proposal-viewer"
        name="ProposalViewer"
        description="Full-detail review surface composing ChangeDiffViewer, risk/policy findings, ConflictResolutionPanel, evidence, DecisionHistory, DecisionBar, and HumanOverrideDialog. Intended for a dedicated review surface (inspector/drawer), not conversation-inline."
        inputModel="proposal: ProposalSummary, onEmitApply?, onEmitRefine?, onEmitReject?, onEmitDefer?, onEmitOverrideSubmit?, onEmitChangeOpen?, onEmitConflictResolve?, onEmitHistoryOpen?"
      >
        <GalleryVariantRow label="Proposal with evidence and an expandable text diff">
          <div className="w-full max-w-2xl">
            <ProposalViewer
              proposal={galleryProposalWithEvidence}
              onEmitApply={onEmitUIEvent}
              onEmitReject={onEmitUIEvent}
              onEmitDefer={onEmitUIEvent}
              onEmitChangeOpen={onEmitUIEvent}
            />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Policy warning + risk finding">
          <div className="w-full max-w-2xl">
            <ProposalViewer
              proposal={galleryPolicyWarningProposal}
              onEmitApply={onEmitUIEvent}
              onEmitReject={onEmitUIEvent}
              onEmitDefer={onEmitUIEvent}
            />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Unresolved conflict (ConflictResolutionPanel resolution input)">
          <div className="w-full max-w-2xl">
            <ProposalViewer proposal={galleryConflictProposal} onEmitReject={onEmitUIEvent} onEmitDefer={onEmitUIEvent} onEmitConflictResolve={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Override required (opens HumanOverrideDialog from DecisionBar)">
          <div className="w-full max-w-2xl">
            <ProposalViewer
              proposal={galleryOverrideRequiredProposal}
              onEmitReject={onEmitUIEvent}
              onEmitDefer={onEmitUIEvent}
              onEmitOverrideSubmit={onEmitUIEvent}
            />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Finalized, with decision history and a ProposalStatusTimeline (Trace-shaped alternate view of the same facts)">
          <div className="w-full max-w-2xl">
            <ProposalViewer proposal={galleryFinalizedProposal} onEmitHistoryOpen={onEmitUIEvent} />
            <div className="mt-3 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] p-3">
              <ProposalStatusTimeline proposal={galleryFinalizedProposal} onEmitHistoryOpen={onEmitUIEvent} />
            </div>
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="proposal-status-badge"
        name="ProposalStatusBadge / DecisionHistory"
        description="ProposalStatusBadge renders every ProposalStatus value; DecisionHistory is the compact, collapsed-by-default audit list of already-recorded HumanDecision entries (emits proposal.history.open once on first expand)."
        inputModel="status: ProposalStatus  |  proposalId, decisions: HumanDecision[]"
      >
        <GalleryVariantRow label="Every ProposalStatus value">
          <ProposalStatusBadge status="draft" />
          <ProposalStatusBadge status="ready_for_review" />
          <ProposalStatusBadge status="stale" />
          <ProposalStatusBadge status="conflicted" />
          <ProposalStatusBadge status="decision_pending" />
          <ProposalStatusBadge status="approved" />
          <ProposalStatusBadge status="rejected" />
          <ProposalStatusBadge status="deferred" />
          <ProposalStatusBadge status="overridden" />
        </GalleryVariantRow>
        <GalleryVariantRow label="DecisionHistory (collapsed by default)">
          <div className="w-full max-w-md">
            <DecisionHistory
              proposalId={galleryFinalizedProposal.id}
              decisions={galleryFinalizedProposal.decisionHistory ?? []}
              onEmitHistoryOpen={onEmitUIEvent}
            />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="pending-human-interaction-summary"
        name="PendingHumanInteractionSummary"
        description="Compact entry point for the shallow PendingInteraction summary contract — for composing into a list of things waiting on a human (e.g. a Mission Center panel). Never renders the full detail itself; routes to the concrete component via onOpen."
        inputModel="interaction: PendingInteraction, onOpen?"
      >
        <GalleryVariantRow label="Execution permission + proposal review, both pending">
          <div className="flex w-full max-w-md flex-col gap-2">
            {galleryPendingInteractions.map((interaction) => (
              <PendingHumanInteractionSummary key={interaction.id} interaction={interaction} />
            ))}
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="mission-header"
        name="MissionHeader"
        description="Identifies the mission a run belongs to — title, supplied risk level, creation time, and the current run's label."
        inputModel="mission: MissionSummary, run?: RunSummary"
      >
        <GalleryVariantRow label="With current run">
          <div className="w-full max-w-xl">
            <MissionHeader mission={galleryMission} run={galleryRunRunning} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="run-status-badge"
        name="RunStatusBadge"
        description="Richer, run-specific status vocabulary — a sibling of RuntimeStatusBadge, never a replacement for it."
        inputModel="status: RunStatus"
      >
        <GalleryVariantRow label="All states">
          {galleryRunStatuses.map((status) => (
            <RunStatusBadge key={status} status={status} />
          ))}
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="run-status-panel-actions"
        name="RunStatusPanel / RunActions"
        description="RunStatusPanel is the compact 'how is this run doing' summary; RunActions renders only the lifecycle controls valid for the run's current status (never both cancel and resume at once)."
        inputModel="RunStatusPanel: run: RunSummary  |  RunActions: run: RunSummary, pendingAction?, onEmitCancel?, onEmitRetry?, onEmitResume?"
      >
        <GalleryVariantRow label="Running (cancellable)">
          <div className="flex w-full max-w-md flex-col gap-2">
            <RunStatusPanel run={galleryRunRunning} />
            <RunActions run={galleryRunRunning} onEmitCancel={onEmitUIEvent} onEmitRetry={onEmitUIEvent} onEmitResume={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Cancellation requested (in flight)">
          <div className="flex w-full max-w-md flex-col gap-2">
            <RunStatusPanel run={galleryRunCancelRequested} />
            <RunActions run={galleryRunCancelRequested} onEmitCancel={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Paused (resumable)">
          <div className="flex w-full max-w-md flex-col gap-2">
            <RunStatusPanel run={galleryRunPaused} />
            <RunActions run={galleryRunPaused} onEmitResume={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Failed, retryable">
          <div className="flex w-full max-w-md flex-col gap-2">
            <RunStatusPanel run={galleryRunFailedRetryable} />
            <RunActions run={galleryRunFailedRetryable} onEmitRetry={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Failed, not retryable (reason shown, no button)">
          <div className="flex w-full max-w-md flex-col gap-2">
            <RunStatusPanel run={galleryRunFailedNotRetryable} />
            <RunActions run={galleryRunFailedNotRetryable} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Completed (no actions render)">
          <div className="w-full max-w-md">
            <RunStatusPanel run={galleryRunCompleted} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="run-detail-panels"
        name="WaitingForHumanBanner / RunErrorPanel / RunOutputs"
        description="Terminal/blocking run detail: WaitingForHumanBanner reuses PendingInteraction, RunErrorPanel shows only a supplied RunError with a conditional retry, RunOutputs lists produced artifacts (or an explicit empty state)."
        inputModel="WaitingForHumanBanner: reason, interaction, onEmitOpen?  |  RunErrorPanel: runId, error, onEmitRetry?  |  RunOutputs: outputs, onEmitOpen?"
      >
        <GalleryVariantRow label="Waiting for human (execution permission)">
          <div className="w-full max-w-xl">
            <WaitingForHumanBanner reason="execution-permission" interaction={galleryPendingInteraction} onEmitOpen={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Retryable error">
          <div className="w-full max-w-xl">
            <RunErrorPanel runId={galleryRunFailedRetryable.id} error={galleryRunError} onEmitRetry={onEmitUIEvent} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Outputs (two artifacts) and empty state">
          <div className="flex w-full max-w-xl flex-col gap-3">
            <RunOutputs outputs={galleryRunOutputs} onEmitOpen={onEmitUIEvent} />
            <RunOutputs outputs={[]} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="agent-task-row-inspector"
        name="AgentTaskRow / AgentTaskInspector"
        description="AgentTaskRow is the compact, selectable row for one AgentTask; AgentTaskInspector is its detail view, listing every reference list as an explicit 'none supplied' when empty — never fabricated."
        inputModel="AgentTaskRow: task: AgentTask, selected?, onSelect?  |  AgentTaskInspector: task: AgentTask | undefined"
      >
        <GalleryVariantRow label="Rows (running, completed, failed)">
          <div className="flex w-full max-w-md flex-col gap-2">
            {[galleryTaskRunning, galleryTaskCompleted, galleryTaskFailed].map((task) => (
              <AgentTaskRow
                key={task.taskId}
                task={task}
                selected={task.taskId === selectedGalleryTaskId}
                onSelect={(selected) => setSelectedGalleryTaskId(selected.taskId)}
                onEmitEvent={onEmitUIEvent}
              />
            ))}
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Inspector for the selected row above">
          <div className="w-full max-w-md">
            <AgentTaskInspector task={[galleryTaskRunning, galleryTaskCompleted, galleryTaskFailed].find((t) => t.taskId === selectedGalleryTaskId)} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="No task selected">
          <div className="w-full max-w-md">
            <AgentTaskInspector task={undefined} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <GalleryEntry
        id="workflow-run-tree-execution-timeline"
        name="WorkflowRunTree / ExecutionTimeline"
        description="WorkflowRunTree is the structural, expandable phase/task hierarchy — a running/failed/waiting phase can never be collapsed away. ExecutionTimeline is the flat, chronological sibling view of the same kind of facts."
        inputModel="WorkflowRunTree: groups: WorkflowGroup[], tasks: Map<id, AgentTask>  |  ExecutionTimeline: steps: ExecutionStep[]"
      >
        <GalleryVariantRow label="Workflow tree (a failed/running phase stays expanded)">
          <div className="w-full max-w-md">
            <WorkflowRunTree
              groups={galleryWorkflowGroups}
              tasks={galleryWorkflowTasks}
              selectedTaskId={selectedGalleryTaskId}
              onSelectTask={(task) => setSelectedGalleryTaskId(task.taskId)}
              onEmitEvent={onEmitUIEvent}
            />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Execution timeline (flat, chronological)">
          <div className="w-full max-w-md">
            <ExecutionTimeline steps={galleryExecutionSteps} />
          </div>
        </GalleryVariantRow>
        <GalleryVariantRow label="Empty states">
          <div className="flex w-full max-w-md flex-col gap-3">
            <WorkflowRunTree groups={[]} tasks={new Map()} />
            <ExecutionTimeline steps={[]} />
          </div>
        </GalleryVariantRow>
      </GalleryEntry>

      <p className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
        Toggle theme with the control in the header above to inspect light/dark behavior across every
        component in this gallery.
      </p>
    </div>
  )
}
