# Component Catalog

Status: Slice 1 (Foundation). Updated by every later slice — see
`docs/implementation/EXECUTION_STATUS.md` for what slice this repo is
currently on.

This catalog documents every component in `src/neoarc-agentic-ui`. For each
component: purpose, input model, supported states, semantic events (if any),
trace visibility notes, and where to find its fixture/usage example.

All components below live in `src/neoarc-agentic-ui/foundation/` and are
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

**States:** idle/queued/running/waiting_for_human/succeeded/failed/
cancelled/retrying.

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
entity is active.

**Input model:** `entities: ContextRef[]`, `activeId: OpaqueId`,
`onSelect(id)`, optional `label`.

**States:** closed/open, entity list rendering, active-entity check mark.

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
