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
import { GalleryEntry, GalleryVariantRow } from "./gallery-entry"

export interface ComponentGalleryProps {
  readonly onEmitUIEvent: (event: AgenticUIEvent) => void
}

export function ComponentGallery({ onEmitUIEvent }: ComponentGalleryProps) {
  const [activeEntityId, setActiveEntityId] = useState(gallerySectionContext.id)

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

      <p className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
        Toggle theme with the control in the header above to inspect light/dark behavior across every
        component in this gallery.
      </p>
    </div>
  )
}
