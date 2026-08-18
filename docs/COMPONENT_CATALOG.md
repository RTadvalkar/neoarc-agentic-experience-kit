# Component Catalog

Status: Slice 1 (Foundation) + Slice 2 (Conversation & Replay). Updated by
every later slice — see `docs/implementation/EXECUTION_STATUS.md` for what
slice this repo is currently on.

This catalog documents every component in `src/neoarc-agentic-ui`. For each
component: purpose, input model, supported states, semantic events (if any),
trace visibility notes, and where to find its fixture/usage example.

## Foundation family

The components below live in `src/neoarc-agentic-ui/foundation/` and are
exported from `src/neoarc-agentic-ui` (barrel) and
`src/neoarc-agentic-ui/foundation` (family barrel). All are pure, controlled,
framework-neutral React components — no networking, no Next.js APIs, no
projection dependency.

---

## AgentAvatar

**Purpose:** Render a human/agent/system/service identity as a compact avatar
with an optional lifecycle-status dot.

**Input model:** `displayName` (required), optional `avatarUrl`, `initials`,
`kind: ActorKind`, `statusIndicator: AgentLifecycleStatus`, `size`.

**States:** image loads; image fails to load (falls back to initials);
initials not supplied (falls back to first/last-name initials, or first two
letters of a single name).

**Semantic events:** none — pure display.

**Trace visibility:** none. Never renders redacted data itself.

**Example:** `lib/showcase/fixtures.ts` → `architectureAgent`/`researchAgent`,
rendered via `AgentIdentity` in the Execution Lab header.

---

## AgentIdentity

**Purpose:** Standard "who is this" block — avatar + name + description +
optional lifecycle badge. Composes `AgentAvatar` + `AgentStatusBadge`.

**Input model:** `agent: AgentSummary`, optional `showStatus` (default true),
`size`.

**States:** with/without `description`; `showStatus` on/off.

**Semantic events:** none.

**Trace visibility:** none.

**Example:** Execution Lab header (`app/execution-lab/page.tsx`).

---

## AgentStatusBadge

**Purpose:** Render `AgentLifecycleStatus` (idle/active/waiting_for_human/
degraded/unavailable) as a compact, honest badge.

**Input model:** `status: AgentLifecycleStatus`.

**States:** one per lifecycle status (closed union — no "unknown" fallback
needed).

**Semantic events:** none.

**Trace visibility:** none — status is a supplied fact, never inferred.

**Example:** Execution Lab "Agent lifecycle" scenario.

---

## RuntimeStatusBadge

**Purpose:** Render `RuntimeStatus` — the shared status vocabulary later
slices reuse across agents, runs, and tasks.

**Input model:** `status: RuntimeStatus`.

**States:** idle/queued/running/waiting_for_human/completed/failed/
cancelled/retrying. Vocabulary is aligned with normalized runtime events
(`run.completed`, `task.completed`); a richer `RunStatus` may still be
introduced in Slice 4.

**Semantic events:** none.

**Trace visibility:** none.

**Example:** Execution Lab "Runtime lifecycle" scenario.

---

## CapabilityBadge

**Purpose:** Render one supplied agent capability string as a neutral badge.
Never infers or ranks capabilities.

**Input model:** `capability: string`, optional `icon` override.

**States:** n/a (single value display).

**Semantic events:** none.

**Trace visibility:** none.

---

## RiskBadge

**Purpose:** Render a supplied `RiskLevel`. Never computes or infers risk.

**Input model:** `level: RiskLevel`.

**States:** none/low/medium/high/critical.

**Semantic events:** none.

**Trace visibility:** none — the kit never invents a risk score.

**Example:** Execution Lab "Risk & trace visibility" scenario.

---

## ContextBreadcrumb

**Purpose:** Render a `ContextRef` parent chain (workspace/project/section…)
as a breadcrumb, root first.

**Input model:** `context: ContextRef` (its `.parent` chain is walked).

**States:** single-level context; deep chain; truncation on narrow widths.

**Semantic events:** none — pure display (no navigation is performed by
this component).

**Trace visibility:** none.

**Example:** Execution Lab header (workspace/project/section fixture chain).

---

## EntitySwitcher

**Purpose:** Fully controlled listbox for switching which `ContextRef`
entity is active. Built on `@base-ui/react`'s `Select` parts rather than a
hand-rolled disclosure, so opening/focus, keyboard navigation, selection,
Escape/close, focus restoration, and ARIA semantics are provided by the
primitive rather than reimplemented — see `docs/ACCESSIBILITY.md`.

**Input model:** `entities: ContextRef[]`, `activeId: OpaqueId`,
`onSelect(id)`, optional `label`. Open/close state is managed internally by
`Select.Root`; the product adapter still only ever controls `activeId`.

**States:** closed/open, entity list rendering, active-entity check mark,
keyboard-highlighted item.

**Semantic events:** none in Slice 1. `onSelect` is a plain callback; a
future slice may add an `AgenticUIEventHandler`-shaped variant if a product
needs the full envelope for this interaction — see
`docs/EVENT_MODEL.md`.

**Trace visibility:** none.

---

## SectionHeader

**Purpose:** Consistent title + optional description + optional trailing
actions row, reused as the header for panels/cards across every family.

**Input model:** `title`, optional `description`, optional `actions` slot.

**States:** with/without description; with/without actions.

**Semantic events:** none (a pure layout primitive).

**Trace visibility:** none.

---

## InlineNotice

**Purpose:** Calm, explicit inline banner for status/consequence messaging.
Never decorative.

**Input model:** `tone: "info" | "success" | "warning" | "danger"`, `title`,
optional `description`, optional `actions` slot.

**States:** one per tone.

**Semantic events:** none (any actions in the `actions` slot are the
caller's own components/events).

**Trace visibility:** none.

**Example:** Execution Lab scenario description banner.

---

## EmptyState

**Purpose:** Calm "nothing here yet" state, distinct from `LoadingState`
(in progress) and `PermissionBlockedState` (denied).

**Input model:** `title`, optional `description`, `icon`, `action` slot.

**States:** with/without description/action.

**Semantic events:** none.

**Trace visibility:** none.

---

## LoadingState

**Purpose:** Restrained in-progress indicator with an accessible live
region.

**Input model:** optional `label` (default "Loading").

**States:** single state (loading).

**Semantic events:** none.

**Trace visibility:** none.

---

## PermissionBlockedState

**Purpose:** Distinct, explicit "you cannot see/do this" state so
permission-denied never looks like an empty list or a stuck spinner. See
`docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md`.

**Input model:** `availability: ActionAvailability`, optional `action` slot
(e.g. "Request access").

**States:** one per `ActionUnavailableReason` (permission_denied,
not_supported, requires_human_review, runtime_unavailable, plus the four
`UnavailableReason` values).

**Semantic events:** none — any "Request access" action is the caller's own
button/event.

**Trace visibility:** this is the primary honest-blocked-state component;
distinct from `ExecutionPermissionCard` (Slice 3), which represents an
active, resolvable request rather than a static blocked state.

---

## Timestamp

**Purpose:** Render an ISO-8601 timestamp consistently via an accessible
`<time>` element, with absolute or relative display.

**Input model:** `value: ISOTimestamp`, optional `variant`
("absolute" | "relative"), optional `now` override for deterministic
tests/fixtures/replay.

**States:** valid timestamp (absolute/relative); invalid/unparseable
timestamp (renders the raw string with an accessible note rather than
throwing or fabricating a date).

**Semantic events:** none.

**Trace visibility:** none.

**Note:** pass an explicit `now` in tests/fixtures/replay contexts —
otherwise relative labels are computed against `Date.now()` and are not
deterministic between server and client renders.

---

## MetadataList

**Purpose:** Label/value list for inspector panels, trace detail rows,
proposal metadata, etc.

**Input model:** `items: { key, label, value }[]`.

**States:** any number of items (including zero, which renders an empty
`<dl>` — callers should wrap with `EmptyState` if zero items should look
like "nothing here").

**Semantic events:** none.

**Trace visibility:** none directly — values are typically wrapped in
`RedactedValue` upstream by the caller when appropriate.

---

## RedactedValue

**Purpose:** Render a field that may be withheld by a product/backend
adapter, using an explicit state instead of ever fabricating or silently
hiding a value.

**Input model:** `state: RedactionState`, `children` (the real value, only
rendered when `state.redacted` is false).

**States:** visible value; redacted (with reason: not_supplied,
not_available, redacted, insufficient_access); optional `note` shown as a
title/sr-only detail.

**Semantic events:** none.

**Trace visibility:** this IS the trace-visibility/redaction primitive — see
`docs/TRACE_ACCESS_AND_REDACTION.md` (introduced in Slice 5) for the full
policy this component participates in.

---

## TraceVisibilityBadge

**Purpose:** Display which supplied `TraceAccessLevel` a piece of trace
content is scoped to. Labels only — never enforces access.

**Input model:** `level: TraceAccessLevel`.

**States:** USER / OPERATOR / DEVELOPER / PLATFORM_ADMIN.

**Semantic events:** none.

**Trace visibility:** this IS a trace-visibility component — it is not
security-authoritative (see `docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md`
§Trace access and redaction).

---

## Conversation family

The components below live in `src/neoarc-agentic-ui/conversation/` and are
exported from `src/neoarc-agentic-ui` (barrel) and
`src/neoarc-agentic-ui/conversation` (family barrel). All are pure,
controlled, framework-neutral React components — no networking, no Next.js
APIs. `neoarc-agentic-ui` remains usable without `neoarc-agentic-projection`:
every component here renders from the normalized `ConversationTimelineItem`/
`ConversationMessage` models in `neoarc-agentic-contracts/conversation.ts`
directly, with one deliberate exception noted on `GenericAgenticNodeFallback`
below. A product adapter may build these models straight from its own DTOs,
or unwrap them from `AgenticViewNode.data` via
`neoarc-agentic-projection`'s built-in `conversationNodeDefinitions` — either
path hands this family the identical shape (docs/02A §Integration modes).
See `docs/04_CONVERSATION_PROJECTION_REPLAY.prompt.md` for the full model
this family renders, and `app/execution-lab` (Scenario Replay mode) for
every component composed together against real fixture data.

---

### AgentConversation

**Purpose:** the controlled root of a conversation — renders an ordered
`ConversationTimelineItem[]` and is the one component both integration
modes (direct view model, or projected via `neoarc-agentic-projection`)
converge on.

**Input model:** `items: ConversationTimelineItem[]`, optional
`onEmitEvent`, `emptyState` (defaults to `ConversationEmptyState`),
`className`.

**States:** empty (`items.length === 0`, renders `emptyState`); populated,
dispatching each item to its own presentational component by `item.kind`.

**Semantic events:** forwards every conversation UI event a child component
emits (`citation.open`, `artifact.open`, `attachment.open`, `handoff.open`,
`toolActivity.toggle`, `clarification.submit`, `conversation.stop.request`,
`conversation.retry.request`) through the single `onEmitEvent` callback —
the product adapter wires up one dispatcher, not nine props.

**Trace visibility:** none directly — see individual item components.

**Note:** the internal `switch (item.kind)` is a closed, ten-case dispatch
owned entirely by this one component for its own known item kinds. It is
not the kit-wide "central mega-switch" the architecture rules forbid — that
anti-pattern is a single switch spanning unrelated feature-owned node
families across the whole kit. Registering a new, unrelated node family
elsewhere never requires touching this file. The dispatch logic is also
exported standalone as `renderConversationTimelineItem` so a
`RendererRegistry` adapter can render one `AgenticViewNode` identically to
how this component renders the same item inside a full array.

**Example:** `app/execution-lab` Scenario Replay mode, every fixture in
`lib/showcase/conversation-fixtures.ts`.

---

### ConversationMessage

**Purpose:** route one `ConversationMessage` to `HumanMessage` or
`AgentResponse` based on `author.kind`, so neither of those components has
to branch on author internally.

**Input model:** `message: ConversationMessage`, plus every event callback
`AgentResponse` accepts (forwarded as-is; unused when the author is human).

**States:** human author; agent author.

**Semantic events:** forwarded from `AgentResponse` when the author is an
agent; none when the author is human.

**Trace visibility:** none directly.

---

### HumanMessage

**Purpose:** render one human-authored message — right-aligned, no
citations/tool/handoff chrome, since a human message never carries
agent-only fields.

**Input model:** `message: ConversationMessage` (`author.kind === "human"`).

**States:** with/without attachments.

**Semantic events:** none — a human message never emits an event itself.

**Trace visibility:** none.

---

### AgentResponse

**Purpose:** render one agent-authored message, including its streaming
state, citations, attachments, artifacts, and stop/retry actions. The single
place all agent-message chrome composes.

**Input model:** `message: ConversationMessage` (`author.kind !== "human"`),
`onEmitCitationEvent`, `onEmitAttachmentEvent`, `onEmitArtifactEvent`,
`onEmitStopEvent`, `onEmitRetryEvent` (all optional).

**States:** streaming (`message.streaming === true`, shows a spinner);
terminal completed/failed/cancelled (via `message.status`); with/without
citations/attachments/artifacts.

**Semantic events:** forwards `"citation.open"`, `"attachment.open"`,
`"artifact.open"` from its child components, and
`"conversation.stop.request"` / `"conversation.retry.request"` from
`ResponseActions`.

**Trace visibility:** none directly — never fabricates a citation or
confidence score; only ever displays what `message` supplies.

**Example:** `conversation-streaming-assistant` and
`conversation-ordinary-exchange` fixtures.

---

### MessageContentRenderer

**Purpose:** render a message's `content` block list (`TextBlock` /
`MarkdownBlock`) safely, using a minimal dependency-free inline formatter
(bold, italic, inline code, links) rather than a full CommonMark
dependency.

**Input model:** `blocks: MessageContentBlock[]`.

**States:** text block; markdown block with any combination of inline
formatting.

**Semantic events:** none.

**Trace visibility:** none.

**Security note:** never uses `dangerouslySetInnerHTML` — inline formatting
is parsed into a plain React node tree, so arbitrary HTML in supplied
content renders as literal text, never executes.

---

### AgentComposer

**Purpose:** the message input for `AgentConversation`. Manages its own
draft text as ephemeral internal UI state (never a normalized model a
product adapter needs to control) and emits typed events for send/stop.

**Input model:** optional `disabled`, `placeholder`, `isResponding`,
`respondingMessageId`, `onEmitSendEvent`, `onEmitStopEvent`.

**States:** idle; disabled; responding (renders a Stop control in place of
Send).

**Semantic events:** emits `"conversation.message.send"` and, while
`isResponding`, `"conversation.stop.request"` — this is the
conversation-level "stop the current turn" control; per-message stop lives
on `ResponseActions` instead.

**Trace visibility:** none.

**Accessibility note:** Enter submits, Shift+Enter inserts a newline, and
the submit guard checks `event.nativeEvent.isComposing` (plus Safari's
unreliable keyCode 229) so confirming CJK IME composition never submits
early.

---

### ClarificationCard

**Purpose:** render one pending-or-resolved clarification request. Pending
clarifications with supplied `options` render a choice list; without
options, a free-text field is offered. Resolved clarifications render the
supplied resolution and never re-offer input.

**Input model:** `clarification: ClarificationRequest`, optional
`onEmitEvent`.

**States:** pending with options; pending free-text; resolved.

**Semantic events:** emits `"clarification.submit"`. Submitting is a
request only — the product adapter owns whether the backend records the
resolution and must feed it back through `clarification.resolved`.

**Trace visibility:** none directly — this is one of the "human
interaction" presentation intents from `02B §Human interaction`.

**Example:** `conversation-clarification` fixture.

---

### ActivitySummaryList

**Purpose:** render one or more safe "what is the agent doing right now"
summaries — never a chain-of-thought fragment (see
`docs/TRACEABILITY_PRINCIPLES.md` §1). Used both as the renderer for a
single `conversation.activity` projected node and standalone for showing
several activity summaries at once.

**Input model:** `items: ActivitySummary[]`.

**States:** running (spinner); any other status (static dot).

**Semantic events:** none — pure display.

**Trace visibility:** this IS a trace-visibility-conscious component in the
sense that it only ever shows supplied safe summaries, never raw model
reasoning.

---

### ToolActivityDisclosure

**Purpose:** render one supplied tool activity summary as a collapsible
disclosure — collapsed by default, expandable to show the supplied summary
text. Never assumes raw tool input/output is safe to render; only ever
shows the product-supplied safe summary string.

**Input model:** `tool: ToolActivitySummary`, optional controlled `open`
(uncontrolled internal state when omitted), optional `onEmitEvent`.

**States:** collapsed; expanded; running/completed/failed (via the composed
`RuntimeStatusBadge`).

**Semantic events:** emits `"toolActivity.toggle"` on every expand/collapse.

**Trace visibility:** never renders raw tool payloads — only the supplied
safe `summary` string.

**Example:** `conversation-tool-activity` fixture.

---

### CitationGroup

**Purpose:** render a message's supplied citations as a compact group of
chips. Never fabricates a citation, never shows a confidence/score unless
one is supplied elsewhere.

**Input model:** `citations: CitationRef[]`, optional `onEmitEvent`.

**States:** any number of citations (zero renders nothing).

**Semantic events:** emits `"citation.open"` when a citation is opened.

**Trace visibility:** displays only what it is given — see
`docs/08_EVIDENCE_CITATIONS_AND_ARTIFACTS.prompt.md` for the fuller Slice 6
evidence model this composes into.

**Example:** `conversation-ordinary-exchange` fixture.

---

### AttachmentList

**Purpose:** render a message's supplied attachment references. Never
assumes file content is safe to preview inline — only shows name/type/size
and defers to the product adapter, via the emitted event, to decide how
opening is handled.

**Input model:** `attachments: AttachmentRef[]`, optional `onEmitEvent`.

**States:** any number of attachments (zero renders nothing); with/without
a supplied size.

**Semantic events:** emits `"attachment.open"`.

**Trace visibility:** none — attachment metadata only, never inline
content.

---

### ArtifactReferenceCard

**Purpose:** render a single supplied artifact reference (document,
diagram, code change, ...). Reused both inline on `AgentResponse`
(`message.artifacts`) and as the renderer for the standalone
`conversation.artifact` projected node kind — same component, same data
shape either way.

**Input model:** `artifact: ArtifactRef`, optional `onEmitEvent`.

**States:** with/without `status`; with/without `version`.

**Semantic events:** emits `"artifact.open"`.

**Trace visibility:** none directly.

**Example:** `conversation-async-work` fixture.

---

### AgentHandoffCard

**Purpose:** render a supplied agent-to-agent handoff summary — who handed
off to whom, why (if supplied), and current status. Never infers a reason
or fabricates the receiving agent.

**Input model:** `handoff: HandoffSummary`, optional `onEmitEvent`.

**States:** with/without a supplied `reason`; running/completed status via
`RuntimeStatusBadge`.

**Semantic events:** emits `"handoff.open"`.

**Trace visibility:** none directly — every field shown is supplied, never
inferred.

**Example:** `conversation-handoff` fixture.

---

### AsyncWorkCard

**Purpose:** render a supplied async-work summary — work proceeding outside
the current turn (e.g. a long-running background job). Direct-view-model
only: there is no built-in `conversation.async-work` projected node kind in
Slice 2's ten kinds, so this component is always driven from a supplied
`AsyncWorkSummary` directly, never unwrapped from a projected node.

**Input model:** `work: AsyncWorkSummary`.

**States:** with/without a supplied `etaLabel`; any `RuntimeStatus`.

**Semantic events:** none — a pure status display. A product wanting a
"view details" action wraps this component with its own control.

**Trace visibility:** none.

---

### ResponseActions

**Purpose:** the small action row under an in-progress or failed agent
response — "Stop" while running/queued, "Retry" while failed. Renders
nothing for any other status; the kit never shows an action the current
state does not honestly support.

**Input model:** `messageId: OpaqueId`, optional `status: RuntimeStatus`,
`onEmitStopEvent`, `onEmitRetryEvent`.

**States:** running/queued (Stop); failed (Retry); any other status
(renders nothing).

**Semantic events:** emits `"conversation.stop.request"` /
`"conversation.retry.request"`. Emitting either is a request only — the
product adapter owns whether the backend actually stops/retries and must
feed the authoritative result back through `status`.

**Trace visibility:** none.

---

### ConversationEmptyState

**Purpose:** the "nothing here yet" state for an empty `AgentConversation`
— composes the foundation `EmptyState` rather than duplicating its layout,
differing only in default copy/icon.

**Input model:** optional `title`/`description` overrides.

**States:** default copy; overridden copy.

**Semantic events:** none.

**Trace visibility:** none.

**Example:** `conversation-empty` fixture.

---

### GenericAgenticNodeFallback

**Purpose:** the reusable, kit-owned fallback renderer for any
`AgenticViewNode` whose `(target, kind)` has no specific registration in a
`RendererRegistry` — registering this via `registry.registerFallback(...)`
is what lets an unknown node kind render safely instead of throwing or
disappearing. See `docs/RENDERER_REGISTRY.md`.

**Input model:** `node: AgenticViewNode`, optional `onSelect`, `selected`.

**States:** selected/unselected; underlying `data` looks like an
`AgenticEventEnvelope` (shows its type + timestamp) or does not (shows the
node's own `key`).

**Semantic events:** none — `onSelect` is a plain callback, not a semantic
UI event, matching the Execution Lab's node-inspection use case.

**Trace visibility:** must stay correct for any node shape; only ever shows
identity fields (`key`/`kind`/`target`) plus, when present, the envelope's
own type/timestamp — never assumes a specific payload shape.

**Portability note:** the one deliberate exception in this family — every
other conversation component has zero dependency on
`neoarc-agentic-projection`, but this component's entire purpose is to
render an `AgenticViewNode`, so it imports that one type from the
projection package. `neoarc-agentic-ui` remains usable without
`neoarc-agentic-projection` for every other component; a consumer who never
uses projection simply never imports this file.

---

## Primitives (not part of the public foundation catalog)

`src/neoarc-agentic-ui/primitives/` (`Badge`, `Surface`, `Spinner`,
`VisuallyHidden`) are NeoArc-owned adapted primitives that the foundation
family composes. They are exported for convenience but are not "foundation
components" in the sense of appearing in
`docs/15_DESIRED_COMPONENT_SURFACE.json` — they are the substrate underneath.

## Showcase-only components (not reusable, not in this catalog's scope)

`components/showcase/**` (theme provider, Execution Lab shell,
scenario/tab/renderer/inspector/event-log/replay-control UI) are Next.js
app code, not part of `neoarc-agentic-ui`. See
`docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` §7 for the boundary.
